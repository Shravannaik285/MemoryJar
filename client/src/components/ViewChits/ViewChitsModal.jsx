import React, { useState, useEffect } from 'react';
import { X, Plus, BookOpen, HardDrive } from 'lucide-react';
import ChitGallery from './ChitGallery';
import ChitDetailModal from './ChitDetailModal';
import ChitEditModal from './ChitEditModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import BackupModal from '../Backup/BackupModal';
import './ViewChits.css';

export default function ViewChitsModal({
  isOpen,
  onClose,
  chits = [],
  onEditChit,
  onDeleteChit,
  onAddNewChit,
  onRefreshMemories,
}) {
  const [detailChit, setDetailChit] = useState(null);
  const [editingChit, setEditingChit] = useState(null);
  const [deletingChit, setDeletingChit] = useState(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Close on Escape key if no inner sub-modals are open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (detailChit) setDetailChit(null);
        else if (editingChit) setEditingChit(null);
        else if (deletingChit) setDeletingChit(null);
        else if (isBackupModalOpen) setIsBackupModalOpen(false);
        else onClose();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, detailChit, editingChit, deletingChit, isBackupModalOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirmDelete = (id) => {
    if (onDeleteChit) onDeleteChit(id);
    setDeletingChit(null);
    if (detailChit?.id === id) setDetailChit(null);
  };

  return (
    <div
      className="view-chits-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-chits-title"
    >
      <div className="view-chits-container">
        {/* Scrapbook Modal Header */}
        <header className="view-chits-header">
          <div className="view-chits-header-left">
            <div className="scrapbook-badge-icon">
              <BookOpen size={20} />
            </div>
            <div className="scrapbook-title-meta">
              <div className="scrapbook-title-row">
                <h2 id="view-chits-title" className="scrapbook-title">
                  Memory Scrapbook
                </h2>
                <span className="scrapbook-count-pill">{chits.length} Memories</span>
              </div>
              <p className="scrapbook-tagline">
                Unfold your handwritten moments from this year ♡
              </p>
            </div>
          </div>

          <div className="view-chits-header-right">
            {/* Backup & Restore Button */}
            <button
              type="button"
              className="scrapbook-backup-quick-btn"
              onClick={() => setIsBackupModalOpen(true)}
              title="Backup & Restore memories (JSON)"
              aria-label="Backup and restore memories"
            >
              <HardDrive size={15} />
              <span className="quick-add-text">Backup</span>
            </button>

            {/* Add Memory Button */}
            <button
              type="button"
              className="scrapbook-add-quick-btn"
              onClick={() => {
                onClose();
                if (onAddNewChit) onAddNewChit();
              }}
              title="Add a new memory"
            >
              <Plus size={16} />
              <span className="quick-add-text">Add Memory</span>
            </button>

            <button
              type="button"
              className="view-chits-close-btn"
              onClick={onClose}
              title="Close gallery"
              aria-label="Close memory gallery"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Gallery Body */}
        <div className="view-chits-body">
          <ChitGallery
            chits={chits}
            onOpenDetail={(chit) => setDetailChit(chit)}
            onEditChit={(chit) => setEditingChit(chit)}
            onDeleteChit={(chit) => setDeletingChit(chit)}
            onAddNewChit={() => {
              onClose();
              if (onAddNewChit) onAddNewChit();
            }}
          />
        </div>
      </div>

      {/* Sub-modal: Unfolded Memory Detail Reader */}
      {detailChit && (
        <ChitDetailModal
          chit={detailChit}
          isOpen={Boolean(detailChit)}
          onClose={() => setDetailChit(null)}
          onEdit={(chit) => {
            setDetailChit(null);
            setEditingChit(chit);
          }}
          onDelete={(chit) => {
            setDetailChit(null);
            setDeletingChit(chit);
          }}
        />
      )}

      {/* Sub-modal: Edit Memory */}
      {editingChit && (
        <ChitEditModal
          key={editingChit.id}
          chit={editingChit}
          isOpen={Boolean(editingChit)}
          onClose={() => setEditingChit(null)}
          onSave={(id, updatedFields) => {
            if (onEditChit) onEditChit(id, updatedFields);
          }}
        />
      )}

      {/* Sub-modal: Confirm Deletion */}
      {deletingChit && (
        <DeleteConfirmModal
          chit={deletingChit}
          isOpen={Boolean(deletingChit)}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingChit(null)}
        />
      )}

      {/* Sub-modal: Backup & Restore */}
      {isBackupModalOpen && (
        <BackupModal
          isOpen={isBackupModalOpen}
          onClose={() => setIsBackupModalOpen(false)}
          chits={chits}
          onImportSuccess={() => {
            if (onRefreshMemories) onRefreshMemories();
          }}
        />
      )}
    </div>
  );
}
