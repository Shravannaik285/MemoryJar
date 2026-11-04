import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  getCurrentSubscription,
  subscribeToBirthdayPush,
  unsubscribeFromBirthdayPush,
  sendTestBirthdayNotification,
  loadLocalPreferences,
  saveLocalPreferences,
} from '../services/notificationService';

export function useBirthdayNotification() {
  const initialPrefs = loadLocalPreferences();

  const [birthday, setBirthday] = useState(initialPrefs.birthday || '2026-12-15');
  const [notificationTime, setNotificationTime] = useState(
    initialPrefs.notificationTime || '09:00'
  );
  const [timezone, setTimezone] = useState(
    initialPrefs.timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC')
  );
  const [isReminderEnabled, setIsReminderEnabled] = useState(Boolean(initialPrefs.enabled));

  const [permission, setPermission] = useState(() => getNotificationPermission());
  const [isSupported] = useState(() => isPushSupported());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Sync state with existing push subscription on mount
  useEffect(() => {
    let isMounted = true;

    async function checkSubscription() {
      if (!isPushSupported()) return;

      const currentPermission = getNotificationPermission();
      if (isMounted) setPermission(currentPermission);

      if (currentPermission === 'granted') {
        const sub = await getCurrentSubscription();
        if (isMounted && sub) {
          setIsReminderEnabled(true);
        }
      } else if (currentPermission === 'denied') {
        if (isMounted) setIsReminderEnabled(false);
      }
    }

    checkSubscription();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update Birthday Date
  const updateBirthday = useCallback(
    async (newDate) => {
      setBirthday(newDate);
      saveLocalPreferences({
        birthday: newDate,
        notificationTime,
        timezone,
        enabled: isReminderEnabled,
      });

      // If already subscribed, update preference on backend
      if (isReminderEnabled) {
        try {
          await subscribeToBirthdayPush({
            birthday: newDate,
            notificationTime,
            timezone,
          });
        } catch (err) {
          console.warn('[useBirthdayNotification] Update preference failed:', err);
        }
      }
    },
    [isReminderEnabled, notificationTime, timezone]
  );

  // Update Notification Time
  const updateNotificationTime = useCallback(
    async (newTime) => {
      setNotificationTime(newTime);
      saveLocalPreferences({
        birthday,
        notificationTime: newTime,
        timezone,
        enabled: isReminderEnabled,
      });

      if (isReminderEnabled) {
        try {
          await subscribeToBirthdayPush({
            birthday,
            notificationTime: newTime,
            timezone,
          });
        } catch (err) {
          console.warn('[useBirthdayNotification] Update time failed:', err);
        }
      }
    },
    [birthday, isReminderEnabled, timezone]
  );

  // Update Timezone
  const updateTimezone = useCallback(
    async (newTz) => {
      setTimezone(newTz);
      saveLocalPreferences({
        birthday,
        notificationTime,
        timezone: newTz,
        enabled: isReminderEnabled,
      });

      if (isReminderEnabled) {
        try {
          await subscribeToBirthdayPush({
            birthday,
            notificationTime,
            timezone: newTz,
          });
        } catch (err) {
          console.warn('[useBirthdayNotification] Update timezone failed:', err);
        }
      }
    },
    [birthday, isReminderEnabled, notificationTime]
  );

  // Toggle Reminder: Subscribe or Unsubscribe
  const toggleReminder = useCallback(async () => {
    setError(null);
    setIsSaving(true);

    try {
      if (!isReminderEnabled) {
        // Enable reminders: request permission and subscribe
        const res = await subscribeToBirthdayPush({
          birthday,
          notificationTime,
          timezone,
        });

        if (res.success) {
          setIsReminderEnabled(true);
          setPermission('granted');
        }
      } else {
        // Disable reminders: unsubscribe
        await unsubscribeFromBirthdayPush();
        setIsReminderEnabled(false);
      }
    } catch (err) {
      console.error('[useBirthdayNotification] Toggle error:', err);
      setError(err.message || 'Failed to update reminder.');
      setPermission(getNotificationPermission());
    } finally {
      setIsSaving(false);
    }
  }, [birthday, isReminderEnabled, notificationTime, timezone]);

  // Send Immediate Test Notification
  const sendTestNotification = useCallback(async () => {
    setError(null);
    setIsSaving(true);
    try {
      return await sendTestBirthdayNotification();
    } catch (err) {
      console.error('[useBirthdayNotification] Test error:', err);
      setError(err.message || 'Failed to send test notification.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    birthday,
    notificationTime,
    timezone,
    isReminderEnabled,
    permission,
    isSupported,
    isSaving,
    error,
    clearError: () => setError(null),
    updateBirthday,
    updateNotificationTime,
    updateTimezone,
    toggleReminder,
    sendTestNotification,
  };
}

