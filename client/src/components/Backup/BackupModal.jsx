import React, { useEffect } from 'react';
import { X, HardDrive, ShieldCheck, Heart } from 'lucide-react';
import ExportMemories from './ExportMemories';
import ImportMemories from './ImportMemories';
import './Backup.css';

export default function BackupModal({
  isOpen,
  onClose,
  chits = [],
  onImportSuccess,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="backup-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="backup-modal-card">
        {/* Header */}
        <div className="backup-modal-header">
          <div className="backup-badge-icon">
            <HardDrive size={22} />
          </div>
          <div className="backup-title-group">
            <h3 id="backup-modal-title" className="backup-title">
              Backup & Restore Memories
            </h3>
            <p className="backup-subtitle">
              Your memories are safely stored on your device in IndexedDB
            </p>
          </div>
          <button
            type="button"
            className="backup-close-btn"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="backup-privacy-badge">
          <ShieldCheck size={16} className="privacy-shield-icon" />
          <span>100% Private: All memories and photos remain local on your browser.</span>
        </div>

        {/* Action Sections */}
        <div className="backup-sections-grid">
          {/* Export Section */}
          <div className="backup-section-card">
            <div className="section-meta">
              <h4 className="section-title">Save Backup (Export)</h4>
              <p className="section-desc">
                Download a complete, offline JSON file of all your {chits.length} memories and attached photos.
              </p>
            </div>
            <ExportMemories chits={chits} />
          </div>

          {/* Import Section */}
          <div className="backup-section-card">
            <div className="section-meta">
              <h4 className="section-title">Restore Backup (Import)</h4>
              <p className="section-desc">
                Restore memories from a previously saved JSON backup file.
              </p>
            </div>
            <ImportMemories
              onImportSuccess={(res) => {
                if (onImportSuccess) onImportSuccess(res);
                onClose();
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="backup-modal-footer">
          <span className="backup-footer-text">
            Crafted for cherished moments <Heart size={12} className="heart-mini" />
          </span>
        </div>
      </div>
    </div>
  );
}

