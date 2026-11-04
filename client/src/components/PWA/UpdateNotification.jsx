import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import './PWA.css';

export default function UpdateNotification({
  isUpdateAvailable,
  onUpdate,
  onDismiss,
}) {
  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div
      className="pwa-update-bar"
      role="alert"
      aria-live="polite"
    >
      <div className="pwa-update-icon-wrapper">
        <Sparkles size={20} />
      </div>

      <p className="pwa-update-text">
        A fresh update for Memory Jar is ready! 🌸
      </p>

      <div className="pwa-update-actions">
        <button
          type="button"
          className="pwa-update-dismiss-btn"
          onClick={onDismiss}
          title="Update later"
        >
          Later
        </button>

        <button
          type="button"
          className="pwa-update-refresh-btn"
          onClick={onUpdate}
          title="Refresh and apply update"
        >
          <RefreshCw size={14} />
          Update Now
        </button>
      </div>
    </div>
  );
}
