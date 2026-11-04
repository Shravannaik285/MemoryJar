import webpush from '../config/vapid.js';
import { removeSubscription } from '../utils/storage.js';

export const DEFAULT_BIRTHDAY_PAYLOAD = {
  title: 'Memory Jar ❤️',
  body: "Your memories are waiting! Look how far you've come. Open your jar and relive your happiest moments.",
  icon: '/icons/icon-192.png',
  badge: '/icons/icon-192.png',
  vibrate: [100, 50, 100],
  tag: 'memory-jar-birthday',
  url: '/?reveal=true',
};

/**
 * Sends a web push notification to a specific subscription
 * @param {Object} subscription - The push subscription object
 * @param {Object} customPayload - Optional custom notification payload
 * @returns {Promise<{ success: boolean, expired?: boolean, error?: string }>}
 */
export async function sendPushNotification(subscription, customPayload = {}) {
  if (!subscription || !subscription.endpoint) {
    return { success: false, error: 'Invalid subscription object' };
  }

  const payload = JSON.stringify({
    ...DEFAULT_BIRTHDAY_PAYLOAD,
    ...customPayload,
  });

  try {
    const result = await webpush.sendNotification(subscription, payload);
    return {
      success: true,
      statusCode: result.statusCode,
    };
  } catch (err) {
    console.error(`[PushService] Failed to deliver push to ${subscription.endpoint.slice(0, 40)}...:`, err.message);

    // 410 (Gone) or 404 (Not Found) indicates user has revoked permission or browser unsubscribed
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log('[PushService] Subscription expired or unsubscribed by user. Purging from storage.');
      removeSubscription(subscription.endpoint);
      return { success: false, expired: true, error: 'Subscription expired or revoked' };
    }

    return {
      success: false,
      statusCode: err.statusCode,
      error: err.body || err.message,
    };
  }
}

