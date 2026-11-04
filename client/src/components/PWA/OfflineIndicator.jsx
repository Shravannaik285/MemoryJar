import React from 'react';
import { WifiOff, Wifi, Heart } from 'lucide-react';
import './PWA.css';

export default function OfflineIndicator({ isOnline, showBackOnlineToast }) {
  // If online and not showing the temporary "back online" confirmation, stay completely quiet
  if (isOnline && !showBackOnlineToast) {
    return null;
  }

  // Friendly message when connection drops
  if (!isOnline) {
    return (
      <div
        className="pwa-offline-indicator pwa-offline-mode"
        role="status"
        aria-live="polite"
      >
        <span className="pwa-indicator-icon">
          <WifiOff size={16} />
        </span>
        <span className="pwa-indicator-text">
          You're offline, but your memories are safe. <Heart size={13} fill="#E11D48" color="#E11D48" style={{ display: 'inline', verticalAlign: '-1px' }} />
        </span>
      </div>
    );
  }

  // Brief subtle toast when back online
  if (showBackOnlineToast) {
    return (
      <div
        className="pwa-offline-indicator pwa-online-mode"
        role="status"
        aria-live="polite"
      >
        <span className="pwa-indicator-icon">
          <Wifi size={16} />
        </span>
        <span className="pwa-indicator-text">
          You're back online! ✨
        </span>
      </div>
    );
  }

  return null;
}

