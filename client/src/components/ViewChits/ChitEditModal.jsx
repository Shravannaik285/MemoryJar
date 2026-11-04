import React, { useState, useRef } from 'react';
import { X, Calendar, Image as ImageIcon, Check, AlertCircle, Save } from 'lucide-react';
import { CHIT_PALETTE } from '../../hooks/useChits';
import ImagePreview from '../AddChit/ImagePreview';

const MAX_CHAR_COUNT = 360;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ChitEditModal({
  chit,
  isOpen,
  onClose,
  onSave,
}) {
  const [text, setText] = useState(chit?.description || chit?.text || '');
  const [date, setDate] = useState(chit?.date || '');
  const [selectedColorId, setSelectedColorId] = useState(chit?.colorId || 'pink');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(chit?.photoUrl || chit?.photo || null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  const activeColorConfig =
    CHIT_PALETTE.find((c) => c.id === selectedColorId) || CHIT_PALETTE[0];

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage('Please upload a supported image (JPEG, PNG, WEBP, or GIF).');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrorMessage('Image size exceeds 5 MB. Please select a smaller photo.');
      return;
    }

    setErrorMessage('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setErrorMessage('Memory description cannot be empty.');
      return;
    }

    if (onSave) {
      onSave(chit.id, {
        text: text.trim(),
        description: text.trim(),
        date,
        color: activeColorConfig.bg,
        chitColor: activeColorConfig.bg,
        colorId: activeColorConfig.id,
        photo: imageFile ? imageFile : imagePreview,
        photoBlob: imageFile,
      });
    }

    onClose();
  };

  if (!isOpen || !chit) return null;

  return (
    <div
      className="chit-edit-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-heading"
    >
      <div className="chit-edit-container">
        <form
          className="chit-edit-form"
          onSubmit={handleSubmit}
          style={{
            '--edit-theme-bg': activeColorConfig.bg,
            '--edit-theme-light': activeColorConfig.light,
            '--edit-theme-border': activeColorConfig.border,
            '--edit-theme-text': activeColorConfig.text,
          }}
        >
          {/* Header */}
          <div className="edit-header-bar">
            <h3 id="edit-modal-heading" className="edit-modal-title">
              Edit Memory
            </h3>
            <button
              type="button"
              className="edit-close-btn"
              onClick={onClose}
              title="Close editor"
            >
              <X size={18} />
            </button>
          </div>

          {/* Date & Char Counter */}
          <div className="edit-date-row">
            <label className="paper-date-pill">
              <Calendar size={14} className="paper-date-icon" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="paper-date-input"
              />
              <span className="paper-date-text">{date}</span>
            </label>

            <span className="paper-char-counter">
              {text.length}/{MAX_CHAR_COUNT}
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="editor-error-banner" role="alert">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Textarea */}
          <textarea
            className="paper-textarea edit-mode"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            maxLength={MAX_CHAR_COUNT}
            placeholder="Edit your memory description..."
            required
            autoFocus
          />

          {/* Photo Preview */}
          {imagePreview && (
            <ImagePreview
              previewUrl={imagePreview}
              onRemove={handleRemoveImage}
            />
          )}

          {/* Color & Photo Controls */}
          <div className="paper-customization-row">
            <div className="color-selector-group">
              <span className="customizer-label">Paper Color:</span>
              <div className="color-palette-pills">
                {CHIT_PALETTE.map((c) => {
                  const isSelected = selectedColorId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      title={c.name}
                      onClick={() => setSelectedColorId(c.id)}
                      className={`color-pill-btn ${isSelected ? 'selected' : ''}`}
                      style={{ backgroundColor: c.bg }}
                    >
                      {isSelected && <Check size={12} className="color-check-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="photo-upload-group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden-file-input"
                id="edit-memory-photo-input"
              />
              <label htmlFor="edit-memory-photo-input" className="photo-attach-button">
                <ImageIcon size={15} />
                <span>{imagePreview ? 'Change Photo' : 'Add Photo'}</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="edit-footer-buttons">
            <button
              type="button"
              className="editor-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="editor-fold-btn"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
