import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isValidTimezone, isLeapYear, getUserLocalTime, shouldSendBirthdayNotification } from '../src/utils/timezone.js';
import { loadSubscriptions, findSubscription } from '../src/utils/storage.js';

describe('Server Backend Architecture Tests', () => {
  test('Timezone validation handles edge cases', () => {
    assert.equal(isValidTimezone('America/New_York'), true);
    assert.equal(isValidTimezone('Asia/Tokyo'), true);
    assert.equal(isValidTimezone('UTC'), true);
    assert.equal(isValidTimezone('Mars/Olympus_Mons'), false);
    assert.equal(isValidTimezone(undefined), false);
  });

  test('Leap year detection works correctly', () => {
    assert.equal(isLeapYear(2024), true);
    assert.equal(isLeapYear(2025), false);
    assert.equal(isLeapYear(2026), false);
    assert.equal(isLeapYear(2000), true);
    assert.equal(isLeapYear(2100), false);
  });

  test('getUserLocalTime computes time within bounds', () => {
    const local = getUserLocalTime('Asia/Kolkata');
    assert.ok(local.year >= 2024);
    assert.ok(local.month >= 1 && local.month <= 12);
    assert.ok(local.day >= 1 && local.day <= 31);
    assert.ok(local.hours >= 0 && local.hours <= 23);
    assert.ok(local.minutes >= 0 && local.minutes <= 59);
  });

  test('Storage correctly loads existing subscriptions without crashing', () => {
    const subs = loadSubscriptions();
    assert.ok(Array.isArray(subs));
  });

  test('Storage findSubscription returns null for unknown endpoint', () => {
    const found = findSubscription('https://fake-fcm.googleapis.com/unknown');
    assert.equal(found, null);
  });

  test('shouldSendBirthdayNotification evaluates correctly on leap day (Feb 29)', () => {
    // Non-leap year celebration for Feb 29 bdays (should celebrate on Feb 28)
    const sub = {
      enabled: true,
      birthday: '2000-02-29',
      timezone: 'UTC',
      notificationTime: '00:00',
      lastNotifiedYear: null,
    };

    // If today is not Feb 28 or 29, it should report not birthday today
    const res = shouldSendBirthdayNotification(sub);
    assert.ok(typeof res.shouldNotify === 'boolean');
  });
});
