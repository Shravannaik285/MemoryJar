import React, { useState } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { exportMemoriesBackup } from '../../services/backupService';

export default function ExportMemories({ chits = [], onExportComplete }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const res = await exportMemoriesBackup(chits);
      setExportSuccess(true);
      if (onExportComplete) onExportComplete(res);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('[ExportMemories] Error:', err);
      alert('Failed to export memories: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      className={`export-memories-btn ${exportSuccess ? 'success' : ''}`}
      onClick={handleExport}
      disabled={isExporting}
      title="Download complete JSON backup of all memories and photos"
      aria-label="Export memories backup"
    >
      {isExporting ? (
        <>
          <Loader2 size={16} className="btn-spin-icon" />
          <span>Preparing Backup...</span>
        </>
      ) : exportSuccess ? (
        <>
          <Check size={16} />
          <span>Backup Downloaded!</span>
        </>
      ) : (
        <>
          <Download size={16} />
          <span>Export Memories (.json)</span>
        </>
      )}
    </button>
  );
}
