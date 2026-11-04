import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, FileText, X, Loader2 } from 'lucide-react';
import { validateBackupJson, restoreMemoriesBackup } from '../../services/backupService';

export default function ImportMemories({ onImportSuccess }) {
  const [isReading, setIsReading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewPayload, setPreviewPayload] = useState(null);
  const [restoreMode, setRestoreMode] = useState('merge'); // 'merge' | 'replace'

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setIsReading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setIsReading(false);
      const text = event.target.result;
      const validation = validateBackupJson(text);

      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid backup file.');
        setPreviewPayload(null);
      } else {
        setPreviewPayload(validation.payload);
      }
    };

    reader.onerror = () => {
      setIsReading(false);
      setErrorMessage('Failed to read the selected file.');
    };

    reader.readAsText(file);
    // Reset input so the same file can be picked again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmRestore = async () => {
    if (!previewPayload || isRestoring) return;
    setIsRestoring(true);

    try {
      const res = await restoreMemoriesBackup(previewPayload, { mode: restoreMode });
      setPreviewPayload(null);
      if (onImportSuccess) onImportSuccess(res);
    } catch (err) {
      console.error('[ImportMemories] Error restoring backup:', err);
      setErrorMessage('Failed to restore memories: ' + err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="import-memories-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden-file-input"
        id="import-backup-file-input"
      />

      <label
        htmlFor="import-backup-file-input"
        className="import-memories-btn"
        title="Restore memories from a JSON backup file"
      >
        {isReading ? (
          <>
            <Loader2 size={16} className="btn-spin-icon" />
            <span>Reading File...</span>
          </>
        ) : (
          <>
            <Upload size={16} />
            <span>Import Memories (.json)</span>
          </>
        )}
      </label>

      {/* Error Message */}
      {errorMessage && (
        <div className="backup-error-banner" role="alert">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
          <button
            type="button"
            className="error-dismiss-btn"
            onClick={() => setErrorMessage('')}
          >
            ×
          </button>
        </div>
      )}

      {/* Confirmation & Preview Dialog */}
      {previewPayload && (
        <div
          className="import-confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-confirm-title"
        >
          <div className="import-confirm-card">
            <div className="import-confirm-header">
              <div className="import-icon-badge">
                <FileText size={20} />
              </div>
              <h3 id="import-confirm-title" className="import-confirm-title">
                Restore Memories
              </h3>
              <button
                type="button"
                className="import-close-btn"
                onClick={() => setPreviewPayload(null)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="import-confirm-desc">
              Found <strong>{previewPayload.memoryCount} memories</strong> in this backup
              {previewPayload.exportedAt ? ` (created on ${new Date(previewPayload.exportedAt).toLocaleDateString()})` : ''}.
            </p>

            <div className="import-mode-selection">
              <label className={`import-mode-option ${restoreMode === 'merge' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="restoreMode"
                  value="merge"
                  checked={restoreMode === 'merge'}
                  onChange={() => setRestoreMode('merge')}
                />
                <div className="mode-text-group">
                  <span className="mode-title">Merge with Current Memories (Recommended)</span>
                  <span className="mode-desc">Adds new memories and preserves your existing jar contents.</span>
                </div>
              </label>

              <label className={`import-mode-option ${restoreMode === 'replace' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="restoreMode"
                  value="replace"
                  checked={restoreMode === 'replace'}
                  onChange={() => setRestoreMode('replace')}
                />
                <div className="mode-text-group">
                  <span className="mode-title">Replace All Memories</span>
                  <span className="mode-desc">Overwrites existing jar contents with this backup.</span>
                </div>
              </label>
            </div>

            <div className="import-actions-row">
              <button
                type="button"
                className="import-cancel-btn"
                onClick={() => setPreviewPayload(null)}
                disabled={isRestoring}
              >
                Cancel
              </button>

              <button
                type="button"
                className="import-submit-btn"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <>
                    <Loader2 size={16} className="btn-spin-icon" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Restore {previewPayload.memoryCount} Memories</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

