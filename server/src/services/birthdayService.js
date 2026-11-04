import {
  loadSubscriptions,
  findSubscription,
  upsertSubscription,
  removeSubscription,
  saveSubscriptions,
} from '../utils/storage.js';
import { shouldSendBirthdayNotification } from '../utils/timezone.js';
import { sendPushNotification } from './pushService.js';

/**
 * Registers or updates a client push subscription and birthday reminder preferences
 * @param {Object} data
 * @returns {Object}
 */
export function registerOrUpdateSubscription(data) {
  const { subscription, birthday, notificationTime, timezone, enabled } = data;

  if (!subscription || !subscription.endpoint) {
    throw new Error('Valid push subscription object is required.');
  }

  return upsertSubscription({
    endpoint: subscription.endpoint,
    keys: subscription.keys || {},
    birthday: birthday || '2026-12-15',
    notificationTime: notificationTime || '09:00',
    timezone: timezone || 'UTC',
    enabled: enabled !== false,
  });
}

/**
 * Unsubscribes a user and removes their subscription record
 * @param {string} endpoint
 * @returns {boolean}
 */
export function unregisterSubscription(endpoint) {
  if (!endpoint) return false;
  return removeSubscription(endpoint);
}

/**
 * Updates notification enabled status
 * @param {string} endpoint
 * @param {boolean} enabled
 * @returns {Object|null}
 */
export function setReminderEnabled(endpoint, enabled) {
  const existing = findSubscription(endpoint);
  if (!existing) return null;

  return upsertSubscription({
    ...existing,
    enabled: Boolean(enabled),
  });
}

/**
 * Iterates through all subscriptions, checks timezone and birthday matches,
 * and delivers push notifications to eligible users.
 * @returns {Promise<{ checked: number, sent: number, failed: number }>}
 */
export async function processBirthdayReminders() {
  const subscriptions = loadSubscriptions();
  let sentCount = 0;
  let failedCount = 0;
  let updatedAny = false;

  for (const sub of subscriptions) {
    const { shouldNotify, localYear } = shouldSendBirthdayNotification(sub);

    if (shouldNotify) {
      console.log(`[BirthdayService] Triggering birthday push for ${sub.endpoint.slice(0, 36)}... (Year: ${localYear})`);

      const result = await sendPushNotification(sub);

      if (result.success) {
        sub.lastNotifiedYear = localYear;
        sub.lastNotifiedAt = new Date().toISOString();
        sentCount++;
        updatedAny = true;
      } else {
        failedCount++;
      }
    }
  }

  if (updatedAny) {
    saveSubscriptions(subscriptions);
  }

  return {
    checked: subscriptions.length,
    sent: sentCount,
    failed: failedCount,
  };
}

