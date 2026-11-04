import React, { useState } from 'react';
import { Download, X, Sparkles, Share, PlusSquare } from 'lucide-react';
import './PWA.css';

export default function InstallPrompt({
  canInstall,
  onInstall,
  isInstalled,
  isIOS,
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed or dismissed, hide banner
  if (isInstalled || isDismissed) {
    return null;
  }

  // If browser supports native beforeinstallprompt
  if (canInstall) {
    return (
      <div className="pwa-install-banner" role="dialog" aria-labelledby="pwa-install-title">
        <div className="pwa-install-header">
          <div className="pwa-install-brand">
            <div className="pwa-install-icon-wrapper">
              <Sparkles size={20} />
            </div>
            <div className="pwa-install-title-group">
              <h4 id="pwa-install-title" className="pwa-install-title">
                Install Memory Jar
              </h4>
              <span className="pwa-install-tagline">Offline & app-like experience</span>
            </div>
          </div>
          <button
            type="button"
            className="pwa-install-close-btn"
            onClick={() => setIsDismissed(true)}
            title="Dismiss"
            aria-label="Dismiss install prompt"
          >
            <X size={16} />
          </button>
        </div>

        <p className="pwa-install-body">
          Keep your moments one tap away on your home screen or desktop. Works offline!
        </p>

        <div className="pwa-install-actions">
          <button
            type="button"
            className="pwa-install-dismiss-btn"
            onClick={() => setIsDismissed(true)}
          >
            Not now
          </button>
          <button
            type="button"
            className="pwa-install-confirm-btn"
            onClick={onInstall}
          >
            <Download size={15} />
            Install App
          </button>
        </div>
      </div>
    );
  }

  // If on iOS where beforeinstallprompt isn't supported, show gentle iOS install banner
  if (isIOS && !showIOSModal) {
    return (
      <div className="pwa-install-banner" role="dialog" aria-labelledby="pwa-install-title">
        <div className="pwa-install-header">
          <div className="pwa-install-brand">
            <div className="pwa-install-icon-wrapper">
              <Sparkles size={20} />
            </div>
            <div className="pwa-install-title-group">
              <h4 id="pwa-install-title" className="pwa-install-title">
                Install on Home Screen
              </h4>
              <span className="pwa-install-tagline">Quick access on iPhone & iPad</span>
            </div>
          </div>
          <button
            type="button"
            className="pwa-install-close-btn"
            onClick={() => setIsDismissed(true)}
            title="Dismiss"
            aria-label="Dismiss install prompt"
          >
            <X size={16} />
          </button>
        </div>

        <p className="pwa-install-body">
          Add Memory Jar to your home screen for a full screen, offline memory sanctuary.
        </p>

        <div className="pwa-install-actions">
          <button
            type="button"
            className="pwa-install-dismiss-btn"
            onClick={() => setIsDismissed(true)}
          >
            Not now
          </button>
          <button
            type="button"
            className="pwa-install-confirm-btn"
            onClick={() => setShowIOSModal(true)}
          >
            <Share size={15} />
            How to Install
          </button>
        </div>
      </div>
    );
  }

  // On iOS devices where beforeinstallprompt isn't fired, render if user opens iOS guide
  if (showIOSModal) {
    return (
      <div
        className="pwa-ios-modal-overlay"
        onClick={() => setShowIOSModal(false)}
        role="dialog"
        aria-modal="true"
      >
        <div className="pwa-ios-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="pwa-ios-header">
            <h3 className="pwa-ios-title">Install on iOS (iPhone / iPad)</h3>
            <button
              type="button"
              className="pwa-install-close-btn"
              onClick={() => setShowIOSModal(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="pwa-ios-steps">
            <div className="pwa-ios-step">
              <span className="pwa-step-badge">1</span>
              <span>
                Tap the <strong>Share</strong> button <Share size={15} style={{ verticalAlign: '-2px', display: 'inline' }} /> in Safari's toolbar.
              </span>
            </div>
            <div className="pwa-ios-step">
              <span className="pwa-step-badge">2</span>
              <span>
                Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={15} style={{ verticalAlign: '-2px', display: 'inline' }} />.
              </span>
            </div>
            <div className="pwa-ios-step">
              <span className="pwa-step-badge">3</span>
              <span>
                Tap <strong>Add</strong> at top right. Memory Jar will appear right on your home screen!
              </span>
            </div>
          </div>

          <button
            type="button"
            className="pwa-ios-done-btn"
            onClick={() => setShowIOSModal(false)}
          >
            Got it ♡
          </button>
        </div>
      </div>
    );
  }

  return null;
}
