/**
 * Timezone and Birthday Date Matching Utilities
 */

/**
 * Checks if a given timezone identifier is valid
 * @param {string} tz
 * @returns {boolean}
 */
export function isValidTimezone(tz) {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Determines whether a given year is a leap year
 * @param {number} year
 * @returns {boolean}
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Retrieves the current local date and time components for a given timezone
 * @param {string} timezone
 * @returns {{ year: number, month: number, day: number, hours: number, minutes: number }}
 */
export function getUserLocalTime(timezone = 'UTC') {
  const safeTz = isValidTimezone(timezone) ? timezone : 'UTC';

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTz,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const map = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = parseInt(part.value, 10);
    }
  }

  // Handle midnight 24 hour wrap if formatter produces 24
  const hours = map.hour === 24 ? 0 : (map.hour || 0);

  return {
    year: map.year,
    month: map.month, // 1 to 12
    day: map.day,     // 1 to 31
    hours,            // 0 to 23
    minutes: map.minute || 0, // 0 to 59
  };
}

/**
 * Evaluates whether a push notification should be sent right now for a subscription
 * @param {Object} sub
 * @returns {{ shouldNotify: boolean, localYear: number, reason?: string }}
 */
export function shouldSendBirthdayNotification(sub) {
  if (!sub.enabled) {
    return { shouldNotify: false, reason: 'Notifications disabled' };
  }

  if (!sub.birthday) {
    return { shouldNotify: false, reason: 'No birthday configured' };
  }

  const localTime = getUserLocalTime(sub.timezone || 'UTC');

  // 1. Prevent duplicate notifications in the same calendar year
  if (sub.lastNotifiedYear === localTime.year) {
    return { shouldNotify: false, reason: 'Already notified this year' };
  }

  // 2. Parse target birthday (e.g. "2026-12-15" or "12-15")
  const dateParts = sub.birthday.split('-');
  let bMonth, bDay;

  if (dateParts.length === 3) {
    bMonth = parseInt(dateParts[1], 10);
    bDay = parseInt(dateParts[2], 10);
  } else if (dateParts.length === 2) {
    bMonth = parseInt(dateParts[0], 10);
    bDay = parseInt(dateParts[1], 10);
  } else {
    return { shouldNotify: false, reason: 'Invalid birthday date format' };
  }

  // 3. Leap Year Birthday Handling (Feb 29 on non-leap years)
  let isDateMatch = (localTime.month === bMonth && localTime.day === bDay);
  if (!isDateMatch && bMonth === 2 && bDay === 29) {
    if (!isLeapYear(localTime.year) && localTime.month === 2 && localTime.day === 28) {
      isDateMatch = true; // Celebrate on Feb 28 on non-leap years
    }
  }

  if (!isDateMatch) {
    return { shouldNotify: false, reason: 'Not birthday today' };
  }

  // 4. Preferred Notification Time Window
  // e.g. "09:00" -> targetHour: 9, targetMinute: 0
  const timeStr = sub.notificationTime || '09:00';
  const [targetHourStr] = timeStr.split(':');
  const targetHour = parseInt(targetHourStr, 10);

  // Send when local hours match or exceed targetHour on their birthday
  if (localTime.hours >= targetHour) {
    return {
      shouldNotify: true,
      localYear: localTime.year,
      reason: 'Birthday matched scheduled time',
    };
  }

  return {
    shouldNotify: false,
    reason: `Waiting for preferred hour ${targetHour}:00 (currently ${localTime.hours}:00 in ${sub.timezone})`,
  };
}

