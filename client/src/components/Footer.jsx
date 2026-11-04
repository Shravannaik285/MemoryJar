import React from 'react';
import './Footer.css';

export default function Footer({
  onSimulateBirthday,
  onOpenBackup,
  canInstallApp,
  onInstallApp,
  onOpenPrivacy,
  onOpenContact,
}) {
  return (
    <footer className="footer-container">
      <div className="footer-stitch-line"></div>
      
      <div className="footer-quote-box">
        <span className="quote-mark left">“</span>
        <p className="footer-quote-text">
          Even when you forget how beautiful your year was, your Memory Jar remembers.
        </p>
        <span className="quote-mark right">”</span>
        <span className="footer-heart">❤️</span>
      </div>

      <div className="footer-subtext-row">
        <span>Crafted with love for cherished moments</span>
        <span className="bullet-dot">•</span>
        <button
          type="button"
          className="quick-demo-btn"
          onClick={onOpenPrivacy}
          title="Privacy Policy, Local Storage Notice & Terms"
        >
          🔒 Privacy & Trust
        </button>
        <span className="bullet-dot">•</span>
        <button
          type="button"
          className="quick-demo-btn"
          onClick={onOpenContact}
          title="Feedback & Support"
        >
          💌 Feedback
        </button>
        {onOpenBackup && (
          <>
            <span className="bullet-dot">•</span>
            <button
              type="button"
              className="quick-demo-btn"
              onClick={onOpenBackup}
              title="Backup & Restore Memories"
            >
              💾 Backup & Restore
            </button>
          </>
        )}
        {canInstallApp && (
          <>
            <span className="bullet-dot">•</span>
            <button
              type="button"
              className="quick-demo-btn"
              onClick={onInstallApp}
              title="Install Memory Jar to Home Screen or Desktop"
            >
              📲 Install App
            </button>
          </>
        )}
        {onSimulateBirthday && (
          <>
            <span className="bullet-dot">•</span>
            <button
              type="button"
              className="quick-demo-btn"
              onClick={onSimulateBirthday}
              title="Test Birthday Reveal Mode"
            >
              🎂 Test Birthday
            </button>
          </>
        )}
      </div>
    </footer>
  );
}
