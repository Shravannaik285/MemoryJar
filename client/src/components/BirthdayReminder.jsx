import React, { useState, useEffect, useMemo } from 'react';
import { Bell, BellOff, Calendar, Clock, Globe, AlertCircle, Sparkles, Loader2, Check } from 'lucide-react';
import { useBirthdayNotification } from '../hooks/useBirthdayNotification';
import './BirthdayReminder.css';

const TIME_OPTIONS = [
  { value: '08:00', label: '8:00 AM (Morning)' },
  { value: '09:00', label: '9:00 AM (Breakfast)' },
  { value: '10:00', label: '10:00 AM (Mid-morning)' },
  { value: '12:00', label: '12:00 PM (Noon)' },
  { value: '15:00', label: '3:00 PM (Afternoon)' },
  { value: '18:00', label: '6:00 PM (Evening)' },
  { value: '20:00', label: '8:00 PM (Night)' },
];

export default function BirthdayReminder({
  birthdayDate = '2026-12-15',
  onDateChange,
  onOpenJarToday,
  onShowToast,
}) {
  const {
    birthday,
    notificationTime,
    timezone,
    isReminderEnabled,
    permission,
    isSupported,
    isSaving,
    error,
    updateBirthday,
    updateNotificationTime,
    toggleReminder,
    sendTestNotification,
    clearError,
  } = useBirthdayNotification();

  const [isTesting, setIsTesting] = useState(false);

  // Sync date changes with parent component
  useEffect(() => {
    if (birthday && onDateChange && birthday !== birthdayDate) {
      onDateChange(birthday);
    }
  }, [birthday, birthdayDate, onDateChange]);

  // Derive days left and formatted date synchronously to prevent cascading renders
  const { daysLeft, formattedDateString, isToday } = useMemo(() => {
    if (!birthday) {
      return { daysLeft: 42, formattedDateString: '15 Dec, 2026', isToday: false };
    }

    try {
      const now = new Date();
      const [, monthStr, dayStr] = birthday.split('-');
      const targetMonth = parseInt(monthStr, 10) - 1;
      const targetDay = parseInt(dayStr, 10);

      let nextBirthday = new Date(now.getFullYear(), targetMonth, targetDay);
      let isBdayToday = false;
      let diffDays = 0;

      if (
        nextBirthday.getMonth() === now.getMonth() &&
        nextBirthday.getDate() === now.getDate()
      ) {
        isBdayToday = true;
        diffDays = 0;
      } else {
        if (nextBirthday < now) {
          nextBirthday = new Date(now.getFullYear() + 1, targetMonth, targetDay);
        }
        isBdayToday = false;
        const diffTime = nextBirthday.getTime() - now.getTime();
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      const formatted = nextBirthday.toLocaleDateString('en-GB', options);

      return {
        daysLeft: diffDays,
        formattedDateString: formatted,
        isToday: isBdayToday,
      };
    } catch {
      return { daysLeft: 42, formattedDateString: '15 Dec, 2026', isToday: false };
    }
  }, [birthday]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    updateBirthday(newDate);
  };

  const handleTimeChange = (e) => {
    updateNotificationTime(e.target.value);
  };

  const handleToggleReminder = async () => {
    if (clearError) clearError();
    await toggleReminder();
    if (onShowToast && !isReminderEnabled) {
      onShowToast('🔔 Birthday reminder enabled successfully!');
    }
  };

  const handleTestNotification = async () => {
    if (isTesting) return;
    if (clearError) clearError();
    setIsTesting(true);
    try {
      await sendTestNotification();
      if (onShowToast) {
        onShowToast('✨ Test notification delivered to your screen!');
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast(`ℹ️ ${err.message || 'Test notification dispatched'}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <section className="birthday-card-container">
      {/* Card Header */}
      <div className="birthday-header-row">
        <div className="birthday-icon-badge">
          <Calendar className="bday-icon" />
        </div>
        <div className="birthday-header-text">
          <h2 className="birthday-title">Your Special Day</h2>
          <p className="birthday-subtitle">
            Set your birthday and let Memory Jar surprise you with your sweetest moments!
          </p>
          <span className="bday-explanation-note">
            Let your Memory Jar surprise you on your special day. ❤️
          </span>
        </div>
      </div>

      {/* Main Interactive Controls Grid */}
      <div className="birthday-controls-grid">
        <div className="birthday-controls-row">
          {/* 1. Date Selector Button */}
          <label className="date-picker-button" title="Change your birthday date">
            <span className="date-icon">🎂</span>
            <span className="date-display-text">{formattedDateString}</span>
            <span className="dropdown-arrow">▼</span>
            <input
              type="date"
              value={birthday}
              onChange={handleDateChange}
              className="hidden-date-input"
              aria-label="Select your birthday date"
            />
          </label>

          {/* 2. Preferred Time Selector */}
          <label className="time-picker-button" title="Select preferred notification delivery time">
            <Clock size={16} style={{ color: '#8E74B2', marginRight: '4px' }} />
            <select
              value={notificationTime}
              onChange={handleTimeChange}
              className="hidden-date-input"
              aria-label="Select notification time"
            >
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="time-display-text">{notificationTime}</span>
            <span className="dropdown-arrow">▼</span>
          </label>

          {/* 3. Reminder Enable / Disable Toggle Button */}
          <button
            type="button"
            onClick={handleToggleReminder}
            disabled={isSaving}
            className={`reminder-toggle-button ${isReminderEnabled ? 'active' : 'inactive'}`}
            aria-pressed={isReminderEnabled}
            title={isReminderEnabled ? 'Click to turn off birthday reminders' : 'Click to enable birthday push reminders'}
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isReminderEnabled ? (
              <Bell size={16} className="bell-icon" />
            ) : (
              <BellOff size={16} className="bell-icon" />
            )}
            <span className="reminder-text">
              {isSaving
                ? 'Saving...'
                : isReminderEnabled
                ? 'Reminder On'
                : 'Turn On Reminder'}
            </span>
            {isReminderEnabled && (
              <span className="check-badge">
                <Check size={11} strokeWidth={3} />
              </span>
            )}
          </button>
        </div>

        {/* Secondary Metadata Row: Timezone & Test Notification */}
        <div className="birthday-meta-row">
          <div className="timezone-pill" title={`Timezone: ${timezone}`}>
            <Globe size={13} />
            <span>{timezone.replace('_', ' ')}</span>
          </div>

          {/* Test Push Button (Available when reminders are enabled) */}
          {isReminderEnabled && (
            <button
              type="button"
              className="test-notification-btn"
              onClick={handleTestNotification}
              disabled={isTesting}
              title="Send a sample notification to this device right now"
            >
              {isTesting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>Test Push Notification</span>
            </button>
          )}
        </div>

        {/* Permission Denied Alert (Guidance for unblocking) */}
        {permission === 'denied' && (
          <div className="permission-denied-alert" role="alert">
            <AlertCircle size={18} className="permission-alert-icon" />
            <div>
              <strong>Notifications are blocked in your browser:</strong>
              <p style={{ margin: '2px 0 0 0' }}>
                To receive your birthday surprise, tap the tune/lock icon in your browser address bar and switch notifications to <strong>Allow</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Unsupported Browser Notice */}
        {!isSupported && (
          <div className="permission-denied-alert" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
            <AlertCircle size={18} className="permission-alert-icon" style={{ color: '#EA580C' }} />
            <span>
              Web Push is not supported in this browser. Your countdown remains fully active!
            </span>
          </div>
        )}

        {/* Transient Error Notice */}
        {error && (
          <div className="permission-denied-alert" style={{ background: '#FFF1F2', borderColor: '#FECDD3' }}>
            <AlertCircle size={18} className="permission-alert-icon" style={{ color: '#E11D48' }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Countdown or Today's Celebration Banner */}
      <div className={`countdown-banner ${isToday ? 'is-today' : ''}`}>
        {isToday ? (
          <div className="today-celebration" onClick={onOpenJarToday}>
            <span className="countdown-pill pulse">🎉 Open Your Jar!</span>
            <p className="countdown-message">
              Happy Birthday! Your year of memories is ready to reveal! ♡
            </p>
          </div>
        ) : (
          <>
            <div className="countdown-pill">
              <span className="calendar-mini-icon">📅</span>
              <span className="days-number">{daysLeft} Days Left</span>
            </div>
            <p className="countdown-message">
              Your jar will open on {formattedDateString}! ♡
            </p>
          </>
        )}
      </div>
    </section>
  );
}
