import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidTimezone,
  isLeapYear,
  getUserLocalTime,
  shouldSendBirthdayNotification,
} from '../../server/src/utils/timezone.js';

describe('Timezone & Birthday Logic Tests', () => {
  test('isValidTimezone correctly validates IANA timezones', () => {
    assert.equal(isValidTimezone('UTC'), true);
    assert.equal(isValidTimezone('America/New_York'), true);
    assert.equal(isValidTimezone('Asia/Kolkata'), true);
    assert.equal(isValidTimezone('Europe/London'), true);
    assert.equal(isValidTimezone('Invalid/Timezone_Name_123'), false);
    assert.equal(isValidTimezone(null), false);
    assert.equal(isValidTimezone(''), false);
  });

  test('isLeapYear accurately identifies leap years', () => {
    assert.equal(isLeapYear(2024), true); // Divisible by 4
    assert.equal(isLeapYear(2028), true);
    assert.equal(isLeapYear(2000), true); // Divisible by 400
    assert.equal(isLeapYear(1900), false); // Divisible by 100 but not 400
    assert.equal(isLeapYear(2025), false);
    assert.equal(isLeapYear(2026), false);
  });

  test('getUserLocalTime returns valid date and time components', () => {
    const time = getUserLocalTime('UTC');
    assert.ok(time.year >= 2024);
    assert.ok(time.month >= 1 && time.month <= 12);
    assert.ok(time.day >= 1 && time.day <= 31);
    assert.ok(time.hours >= 0 && time.hours <= 23);
    assert.ok(time.minutes >= 0 && time.minutes <= 59);
  });

  test('shouldSendBirthdayNotification blocks disabled subscriptions', () => {
    const sub = {
      enabled: false,
      birthday: '2026-12-15',
      timezone: 'UTC',
    };
    const result = shouldSendBirthdayNotification(sub);
    assert.equal(result.shouldNotify, false);
    assert.match(result.reason, /disabled/i);
  });

  test('shouldSendBirthdayNotification blocks duplicate notifications in same year', () => {
    const localTime = getUserLocalTime('UTC');
    const sub = {
      enabled: true,
      birthday: `${localTime.year}-${String(localTime.month).padStart(2, '0')}-${String(localTime.day).padStart(2, '0')}`,
      lastNotifiedYear: localTime.year,
      timezone: 'UTC',
    };
    const result = shouldSendBirthdayNotification(sub);
    assert.equal(result.shouldNotify, false);
    assert.match(result.reason, /Already notified/i);
  });

  test('shouldSendBirthdayNotification triggers when birthday matches today and time window reached', () => {
    const localTime = getUserLocalTime('UTC');
    const bMonth = String(localTime.month).padStart(2, '0');
    const bDay = String(localTime.day).padStart(2, '0');
    
    // Set notification time earlier than or equal to current hour
    const pastHour = Math.max(0, localTime.hours - 1);
    const sub = {
      enabled: true,
      birthday: `1995-${bMonth}-${bDay}`,
      notificationTime: `${String(pastHour).padStart(2, '0')}:00`,
      timezone: 'UTC',
      lastNotifiedYear: localTime.year - 1,
    };

    const result = shouldSendBirthdayNotification(sub);
    assert.equal(result.shouldNotify, true);
    assert.equal(result.localYear, localTime.year);
  });

  test('shouldSendBirthdayNotification postpones notification if preferred hour is in future', () => {
    const localTime = getUserLocalTime('UTC');
    const bMonth = String(localTime.month).padStart(2, '0');
    const bDay = String(localTime.day).padStart(2, '0');

    // Only test if not already 23:00 UTC
    if (localTime.hours < 23) {
      const futureHour = localTime.hours + 1;
      const sub = {
        enabled: true,
        birthday: `1995-${bMonth}-${bDay}`,
        notificationTime: `${String(futureHour).padStart(2, '0')}:00`,
        timezone: 'UTC',
        lastNotifiedYear: localTime.year - 1,
      };

      const result = shouldSendBirthdayNotification(sub);
      assert.equal(result.shouldNotify, false);
      assert.match(result.reason, /Waiting for preferred hour/i);
    }
  });
});

