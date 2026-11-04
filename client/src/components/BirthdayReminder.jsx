import React, { useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useBirthdayNotification } from '../hooks/useBirthdayNotification';
import './BirthdayReminder.css';

export default function BirthdayReminder({
  birthdayDate = '2026-12-15',
  onDateChange,
  onOpenJarToday,
}) {
  const {
    birthday,
    updateBirthday,
  } = useBirthdayNotification();

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
          {/* Date Selector Button */}
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
        </div>
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
