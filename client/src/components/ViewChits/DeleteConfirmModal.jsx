import React, { useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  chit,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !chit) return null;

  return (
    <div
      className="delete-modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div className="delete-modal-card">
        <div className="delete-icon-wrapper">
          <AlertTriangle size={24} className="delete-warning-icon" />
        </div>

        <h3 id="delete-dialog-title" className="delete-dialog-title">
          Let this memory go?
        </h3>

        <p id="delete-dialog-desc" className="delete-dialog-desc">
          Are you sure you want to remove this memory from your jar?
        </p>

        <div className="delete-preview-quote">
          “{chit.text.length > 80 ? `${chit.text.substring(0, 80)}...` : chit.text}”
        </div>

        <div className="delete-actions-row">
          <button
            type="button"
            className="delete-btn-cancel"
            onClick={onCancel}
          >
            Keep It ♡
          </button>

          <button
            type="button"
            className="delete-btn-confirm"
            onClick={() => onConfirm(chit.id)}
          >
            <Trash2 size={16} />
            <span>Delete Memory</span>
          </button>
        </div>
      </div>
    </div>
  );
}
