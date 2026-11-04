import express from 'express';
import { VAPID_PUBLIC_KEY } from '../config/vapid.js';
import {
  registerOrUpdateSubscription,
  unregisterSubscription,
  setReminderEnabled,
  processBirthdayReminders,
} from '../services/birthdayService.js';
import { sendPushNotification } from '../services/pushService.js';
import { findSubscription } from '../utils/storage.js';

const router = express.Router();

/**
 * GET /api/notifications/vapid-public-key
 * Returns the VAPID public key so client can generate a push subscription.
 */
router.get('/vapid-public-key', (req, res) => {
  if (!VAPID_PUBLIC_KEY) {
    return res.status(500).json({
      error: 'VAPID public key is not configured on server.',
    });
  }
  return res.json({ publicKey: VAPID_PUBLIC_KEY });
});

/**
 * POST /api/notifications/subscribe
 * Registers or updates a client push subscription and birthday reminder settings.
 */
router.post('/subscribe', (req, res) => {
  const { subscription, birthday, notificationTime, timezone, enabled } = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Push subscription endpoint is required.' });
  }

  try {
    const saved = registerOrUpdateSubscription({
      subscription,
      birthday,
      notificationTime,
      timezone,
      enabled,
    });

    return res.status(200).json({
      success: true,
      message: 'Birthday reminders enabled successfully.',
      subscription: {
        id: saved.id,
        birthday: saved.birthday,
        notificationTime: saved.notificationTime,
        timezone: saved.timezone,
        enabled: saved.enabled,
      },
    });
  } catch (err) {
    console.error('[API /subscribe] Error:', err);
    return res.status(500).json({ error: 'Failed to save subscription: ' + err.message });
  }
});

/**
 * POST /api/notifications/unsubscribe
 * Removes push subscription and disables reminders for that device.
 */
router.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Subscription endpoint is required.' });
  }

  try {
    const removed = unregisterSubscription(endpoint);
    return res.status(200).json({
      success: true,
      removed,
      message: 'Birthday reminders disabled successfully.',
    });
  } catch (err) {
    console.error('[API /unsubscribe] Error:', err);
    return res.status(500).json({ error: 'Failed to unsubscribe: ' + err.message });
  }
});

/**
 * POST /api/notifications/toggle
 * Enables or disables reminders without deleting the subscription.
 */
router.post('/toggle', (req, res) => {
  const { endpoint, enabled } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Subscription endpoint is required.' });
  }

  try {
    const updated = setReminderEnabled(endpoint, enabled);
    if (!updated) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }
    return res.status(200).json({ success: true, subscription: updated });
  } catch (err) {
    console.error('[API /toggle] Error:', err);
    return res.status(500).json({ error: 'Failed to update reminder status: ' + err.message });
  }
});

/**
 * POST /api/notifications/test-notification
 * Sends an immediate test notification to verify Web Push delivery.
 */
router.post('/test-notification', async (req, res) => {
  const { endpoint, customPayload } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Subscription endpoint is required.' });
  }

  const sub = findSubscription(endpoint);
  if (!sub) {
    return res.status(404).json({ error: 'Subscription not found on server.' });
  }

  try {
    const payload = customPayload || {
      title: 'Memory Jar Test ✨',
      body: 'Your birthday notifications are working perfectly! You will receive a surprise on your birthday. ♡',
      url: '/?reveal=true',
    };

    const result = await sendPushNotification(sub, payload);

    if (result.success) {
      return res.status(200).json({ success: true, message: 'Test notification sent!' });
    } else {
      return res.status(502).json({
        success: false,
        error: result.error || 'Failed to deliver push notification.',
        expired: result.expired,
      });
    }
  } catch (err) {
    console.error('[API /test-notification] Error:', err);
    return res.status(500).json({ error: 'Error sending test notification: ' + err.message });
  }
});

/**
 * GET /api/notifications/status
 * Checks if an endpoint has an active subscription registered on the server.
 */
router.get('/status', (req, res) => {
  const { endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint query parameter required.' });
  }

  const sub = findSubscription(endpoint);
  if (!sub) {
    return res.json({ isSubscribed: false });
  }

  return res.json({
    isSubscribed: true,
    enabled: sub.enabled,
    birthday: sub.birthday,
    notificationTime: sub.notificationTime,
    timezone: sub.timezone,
    lastNotifiedYear: sub.lastNotifiedYear,
  });
});

/**
 * GET or POST /api/notifications/check-cron
 * Endpoint for Vercel Cron or external schedulers to trigger birthday checks.
 */
router.all('/check-cron', async (req, res) => {
  try {
    const stats = await processBirthdayReminders();
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
    });
  } catch (err) {
    console.error('[API /check-cron] Error:', err);
    return res.status(500).json({ error: 'Failed to process reminders: ' + err.message });
  }
});

export default router;

