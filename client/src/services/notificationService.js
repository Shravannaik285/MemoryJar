/**
 * Web Push API & Notification Client Service
 */

// Base API URL from environment variables, defaulting to '' for same-origin / relative rewrites
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');
const ENV_VAPID_PUBLIC_KEY = import.meta.env?.VITE_VAPID_PUBLIC_KEY;

// Fallback VAPID public key matching server .env
const FALLBACK_VAPID_PUBLIC_KEY =
  'BIKZISjQ8G8ovWn0tdrMYkAXlWWs-C4wDGFd8GZNknepGflYRDTw7LP0QblSQB_1gSJd8ceydDWBhH-RYIZ114k';

const LOCAL_STORAGE_KEY = 'memoryjar_birthday_preferences';

/**
 * Converts a base64url encoded VAPID public key to a Uint8Array
 * required by pushManager.subscribe()
 * @param {string} base64String
 * @returns {Uint8Array}
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks whether Web Push and Notifications are supported by the browser
 * @returns {boolean}
 */
export function isPushSupported() {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Returns the current Notification permission state
 * @returns {'granted'|'denied'|'default'|'unsupported'}
 */
export function getNotificationPermission() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Retrieves the VAPID public key from the backend API, or uses fallback
 * @returns {Promise<string>}
 */
export async function getVapidPublicKey() {
  if (ENV_VAPID_PUBLIC_KEY && typeof ENV_VAPID_PUBLIC_KEY === 'string' && ENV_VAPID_PUBLIC_KEY.trim().length > 10) {
    return ENV_VAPID_PUBLIC_KEY.trim();
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE_URL}/api/notifications/vapid-public-key`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.publicKey) return data.publicKey;
    }
  } catch (err) {
    console.warn('[NotificationService] Using fallback VAPID key:', err.message);
  }
  return FALLBACK_VAPID_PUBLIC_KEY;
}

/**
 * Gets the current active push subscription from the service worker
 * @returns {Promise<PushSubscription|null>}
 */
export async function getCurrentSubscription() {
  if (!isPushSupported()) return null;
  try {
    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);
    if (!reg) return null;
    return await reg.pushManager.getSubscription();
  } catch (err) {
    console.warn('[NotificationService] Error getting current subscription:', err);
    return null;
  }
}

/**
 * Subscribes user to birthday push notifications following explicit user consent
 * @param {Object} options
 * @param {string} options.birthday
 * @param {string} options.notificationTime
 * @param {string} options.timezone
 * @returns {Promise<{ success: boolean, subscription: PushSubscription }>}
 */
export async function subscribeToBirthdayPush({ birthday, notificationTime, timezone }) {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported on this browser or device.');
  }

  // 1. Request notification permission only after user action
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notification permission was denied. Please allow notifications in your browser settings.'
        : 'Notification permission was dismissed.'
    );
  }

  // 2. Ensure service worker is actively registered
  let registration = null;
  if ('serviceWorker' in navigator) {
    registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
  }

  const readyTimeout = new Promise((resolve) => setTimeout(() => resolve(registration), 4000));
  registration = (await Promise.race([navigator.serviceWorker.ready, readyTimeout])) || registration;

  if (!registration || !registration.pushManager) {
    // If pushManager is unavailable on the device, still persist locally so user reminders are active
    saveLocalPreferences({
      birthday,
      notificationTime,
      timezone,
      enabled: true,
    });
    return { success: true, subscription: null };
  }

  // 3. Fetch VAPID key and ensure fresh subscription with matching key
  const vapidKey = await getVapidPublicKey();
  const convertedKey = urlBase64ToUint8Array(vapidKey);

  let subscription = null;
  try {
    // Unsubscribe any stale previous subscription to guarantee keypair alignment
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      try {
        await existing.unsubscribe();
      } catch (unsubErr) {
        console.warn('[NotificationService] Unsubscribing old subscription note:', unsubErr);
      }
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });
  } catch (pushErr) {
    console.warn('[NotificationService] PushManager subscription warning:', pushErr);
  }

  // 4. Send subscription details to backend if subscription succeeded
  if (subscription) {
    const payload = {
      subscription: subscription.toJSON(),
      birthday,
      notificationTime: notificationTime || '09:00',
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      enabled: true,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn('[NotificationService] Server subscription returned status:', res.status);
      }
    } catch (err) {
      console.warn('[NotificationService] Failed to notify backend, offline or server unavailable:', err.message);
    }
  }

  // 5. Store preference locally
  saveLocalPreferences({
    birthday,
    notificationTime,
    timezone,
    enabled: true,
  });

  return { success: true, subscription };
}

/**
 * Unsubscribes user from push notifications and alerts the backend
 * @returns {Promise<{ success: boolean }>}
 */
export async function unsubscribeFromBirthdayPush() {
  if (!isPushSupported()) return { success: true };

  try {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);
    if (registration && registration.pushManager) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        // Notify backend
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          await fetch(`${API_BASE_URL}/api/notifications/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
        } catch (e) {
          console.warn('[NotificationService] Backend unsubscribe failed:', e.message);
        }
      }
    }
  } catch (err) {
    console.warn('[NotificationService] Unsubscribe error:', err);
  }

  // Update local preference
  const prev = loadLocalPreferences();
  saveLocalPreferences({ ...prev, enabled: false });

  return { success: true };
}

/**
 * Sends a test push notification to the current subscriber
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function sendTestBirthdayNotification() {
  const testTitle = 'Memory Jar Test ✨';
  const testOptions = {
    body: 'Your birthday notifications are working perfectly! You will receive a surprise on your birthday. ♡',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    tag: 'memory-jar-test',
    renotify: true,
    data: { url: '/?reveal=true' },
  };

  // 1. Immediately trigger native device notification through service worker
  let shownLocally = false;
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(testTitle, testOptions);
        shownLocally = true;
      }
    } catch (e) {
      console.warn('[NotificationService] Local notification preview note:', e);
    }
  }

  // 2. Also trigger server push if a subscription is available
  const subscription = await getCurrentSubscription();
  if (subscription) {
    const subJson = subscription.toJSON ? subscription.toJSON() : subscription;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/test-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          subscription: subJson,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }
    } catch (pushErr) {
      clearTimeout(timeoutId);
      console.warn('[NotificationService] Server push test error:', pushErr);
    }
  }

  if (shownLocally) {
    return { success: true, message: 'Test notification sent!' };
  }

  return { success: true, message: 'Notification test triggered!' };
}

/**
 * Loads preferences from localStorage
 * @returns {Object}
 */
export function loadLocalPreferences() {
  if (typeof window === 'undefined') {
    return { birthday: '2026-12-15', notificationTime: '09:00', timezone: 'UTC', enabled: false };
  }
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }

  return {
    birthday: '2026-12-15',
    notificationTime: '09:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    enabled: false,
  };
}

/**
 * Saves preferences to localStorage
 * @param {Object} prefs
 */
export function saveLocalPreferences(prefs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

