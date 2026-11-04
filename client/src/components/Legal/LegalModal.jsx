import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Database, Heart, Mail, X, AlertTriangle } from 'lucide-react';
import './LegalModal.css';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="legal-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="legal-modal-title">
      <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="legal-modal-header">
          <div className="legal-title-group">
            <span className="legal-header-icon">🌸</span>
            <h2 id="legal-modal-title" className="legal-modal-title">Privacy, Terms & Trust</h2>
          </div>
          <button
            type="button"
            className="legal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="legal-tabs-row" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'privacy'}
            className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <ShieldCheck size={16} />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'storage'}
            className={`legal-tab-btn ${activeTab === 'storage' ? 'active' : ''}`}
            onClick={() => setActiveTab('storage')}
          >
            <Database size={16} />
            <span>Data Storage Notice</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'terms'}
            className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            <FileText size={16} />
            <span>Terms of Use</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'contact'}
            className={`legal-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <Mail size={16} />
            <span>Feedback & Support</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="legal-modal-body">
          {activeTab === 'privacy' && (
            <div className="legal-section">
              <h3 className="section-heading">Our Privacy Philosophy: Local-First by Design</h3>
              <p className="legal-lead">
                Memory Jar is built on the sacred principle that your personal memories, thoughts, and photographs belong solely to you. We believe private moments should remain private.
              </p>

              <div className="policy-block">
                <h4>1. No Personal Memories on Servers</h4>
                <p>
                  Every memory chit you write, the date you assign, the color you choose, and any photo you attach is saved <strong>strictly inside your browser's local IndexedDB database</strong> on this device. Your chits and photos are never uploaded to our servers, never analyzed by AI, and never shared with advertisers.
                </p>
              </div>

              <div className="policy-block">
                <h4>2. Birthday Push Notification Service</h4>
                <p>
                  If you opt in to birthday reminders, your browser creates a random, anonymous push subscription token. Only this token, your chosen reminder time, and your timezone are registered with our push scheduler so it can alert you on your birthday. <strong>Zero memory content is ever attached to notification requests.</strong>
                </p>
              </div>

              <div className="policy-block">
                <h4>3. No Third-Party Tracking or Cookies</h4>
                <p>
                  We do not use advertising trackers, analytics scripts, or behavioral surveillance cookies. Font assets are cached locally via standard browser mechanisms.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="legal-section">
              <h3 className="section-heading">Browser Storage Boundaries & Best Practices</h3>
              
              <div className="warning-callout">
                <AlertTriangle size={20} className="warning-icon" />
                <div>
                  <strong>Important Notice:</strong> Because Memory Jar is local-first, your data lives in your browser's local storage. Browser storage is persistent under normal conditions, but is <em>not permanently guaranteed</em> if browser site data is cleared.
                </div>
              </div>

              <div className="policy-block">
                <h4>1. No Cross-Device Synchronization</h4>
                <p>
                  Because memories are kept locally on this device, memories you write on your phone will not appear automatically on your desktop or tablet unless you transfer a backup file.
                </p>
              </div>

              <div className="policy-block">
                <h4>2. Safeguarding Your Memories (Backup & Restore)</h4>
                <p>
                  To protect your memories against accidental cache clearing, operating system storage cleanups, or browser profile changes, please use our built-in <strong>💾 Backup & Restore</strong> tool (found in the footer). It exports all your memories and images into an offline JSON backup file that you can save to Google Drive, iCloud, or a safe folder anytime.
                </p>
              </div>

              <div className="policy-block">
                <h4>3. Immediate Permanent Deletion</h4>
                <p>
                  When you delete a chit in the View Chits scrapbook, it is immediately and permanently purged from your browser's IndexedDB. We retain no lingering copies.
                </p>
              </div>

              <div className="policy-block">
                <h4>4. Private / Incognito Windows</h4>
                <p>
                  If you open Memory Jar in an Incognito or Private browsing window, the browser will destroy all IndexedDB records the moment you close the tab. Always use standard browsing or install the PWA for persistent storage.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="legal-section">
              <h3 className="section-heading">Terms of Use</h3>
              <p className="legal-lead">
                By enjoying Memory Jar, you agree to these simple and transparent community guidelines.
              </p>

              <div className="policy-block">
                <h4>1. Intended Purpose</h4>
                <p>
                  Memory Jar is provided free of charge for personal, heartwarming, non-commercial journaling, mindfulness, and annual birthday celebration.
                </p>
              </div>

              <div className="policy-block">
                <h4>2. Content Ownership</h4>
                <p>
                  You own 100% of the memories, reflections, and images you place in your jar. We claim no intellectual property or license over any user content.
                </p>
              </div>

              <div className="policy-block">
                <h4>3. As-Is Availability</h4>
                <p>
                  Memory Jar is provided on an "as is" and "as available" basis without warranties of any kind. You are solely responsible for keeping backup copies of your cherished memories using the provided export tool.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="legal-section">
              <h3 className="section-heading">Feedback, Support & Open Source</h3>
              <p className="legal-lead">
                We'd love to hear how Memory Jar made your birthday or special days warmer.
              </p>

              <div className="contact-card">
                <Heart size={28} className="contact-heart-icon" />
                <div className="contact-details">
                  <h4>Send Us a Note</h4>
                  <p>Have an idea, found a bug, or just want to share a heartwarming story?</p>
                  <a href="mailto:sn9188873@gmail.com?subject=Memory%20Jar%20Feedback" className="contact-email-link">
                    ✉️ sn9188873@gmail.com
                  </a>
                </div>
              </div>

              <div className="quick-faq">
                <h4>Frequently Asked Questions</h4>
                <div className="faq-item">
                  <strong>Q: How do I install Memory Jar on my phone?</strong>
                  <p>Tap "📲 Install App" in the footer, or open your browser menu (Safari on iOS: Share &gt; Add to Home Screen; Chrome on Android: Install App).</p>
                </div>
                <div className="faq-item">
                  <strong>Q: Does Memory Jar work without an internet connection?</strong>
                  <p>Yes! Memory Jar is a full Progressive Web App (PWA). You can write, read, and browse your memories even completely offline on a plane or in the woods.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="legal-modal-footer">
          <span className="footer-local-badge">🔒 100% On-Device Storage</span>
          <button type="button" className="legal-done-btn" onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

