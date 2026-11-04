import React, { useState, useRef } from 'react';
import { Calendar, Image as ImageIcon, Sparkles, AlertCircle, Check } from 'lucide-react';
import ImagePreview from './ImagePreview';
import { CHIT_PALETTE } from '../../hooks/useChits';

const MAX_CHAR_COUNT = 360;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ChitEditor({
  initialValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  cardRef,
  topFlapRef,
  bottomFlapRef,
  formControlsRef,
  chitTokenRef,
}) {
  const [text, setText] = useState(initialValues.text || '');
  const [date, setDate] = useState(
    () => initialValues.date || new Date().toISOString().split('T')[0]
  );
  const [selectedColorId, setSelectedColorId] = useState(
    initialValues.colorId || 'pink'
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialValues.photo || null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  const activeColorConfig =
    CHIT_PALETTE.find((c) => c.id === selectedColorId) || CHIT_PALETTE[0];

  const handleTextChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHAR_COUNT) {
      setText(val);
      if (errorMessage) setErrorMessage('');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage(
        'Please upload a supported image format (JPEG, PNG, WEBP, or GIF).'
      );
      return;
    }

    // Validate size limit (5MB)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrorMessage(
        'This photo is a bit too large! Please choose an image under 5 MB.'
      );
      return;
    }

    setErrorMessage('');
    setImageFile(file);

    // Read preview as Base64 so it can be stored in state / exported
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setErrorMessage('Please write down your memory before folding!');
      return;
    }

    setErrorMessage('');

    if (onSubmit) {
      onSubmit({
        text: text.trim(),
        description: text.trim(),
        date,
        chitColor: activeColorConfig.bg,
        color: activeColorConfig.bg,
        colorId: activeColorConfig.id,
        photo: imageFile || imagePreview,
        photoBlob: imageFile,
      });
    }
  };

  return (
    <form
      className="chit-editor-form"
      onSubmit={handleSubmit}
      noValidate
      style={{
        '--chit-theme-bg': activeColorConfig.bg,
        '--chit-theme-light': activeColorConfig.light,
        '--chit-theme-border': activeColorConfig.border,
        '--chit-theme-text': activeColorConfig.text,
      }}
    >
      {/* Physical Paper Note Container with 3D progressive folding flaps */}
      <div className="paper-note-sheet" ref={cardRef}>
        {/* Top Fold Flap with Crease Line */}
        <div className="paper-top-fold" ref={topFlapRef}>
          <div className="fold-crease-shadow"></div>
          <div className="paper-pin-accent" aria-hidden="true">
            <span className="pin-dot">📌</span>
          </div>
        </div>

        {/* Paper Main Body with Lined Texture */}
        <div className="paper-main-body">
          {/* Header Controls: Date & Char Counter */}
          <div className="paper-header-row" ref={formControlsRef}>
            <label className="paper-date-pill" title="Memory Date">
              <Calendar size={14} className="paper-date-icon" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="paper-date-input"
                aria-label="Date of memory"
              />
              <span className="paper-date-text">{date}</span>
            </label>

            <div
              className={`paper-char-counter ${
                text.length > MAX_CHAR_COUNT - 30 ? 'warn' : ''
              }`}
              aria-live="polite"
            >
              {text.length}/{MAX_CHAR_COUNT}
            </div>
          </div>

          {/* Validation Error Banner */}
          {errorMessage && (
            <div className="editor-error-banner" role="alert">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Memory Text Area */}
          <div className="paper-textarea-wrapper">
            <textarea
              className="paper-textarea"
              placeholder="What made your heart smile today? Write your cherished memory here..."
              value={text}
              onChange={handleTextChange}
              rows={4}
              maxLength={MAX_CHAR_COUNT}
              disabled={isSubmitting}
              autoFocus
              aria-label="Memory text description"
            />
            {/* Lined notebook rule marks */}
            <div className="paper-ruled-lines" aria-hidden="true">
              <span className="rule-line"></span>
              <span className="rule-line"></span>
              <span className="rule-line"></span>
              <span className="rule-line"></span>
            </div>
          </div>

          {/* Attached Photo Preview */}
          {imagePreview && (
            <ImagePreview
              file={imageFile}
              previewUrl={imagePreview}
              onRemove={handleRemoveImage}
            />
          )}

          {/* Controls: Color Selector & Photo Upload Button */}
          <div className="paper-customization-row">
            {/* Pastel Color Selector */}
            <div className="color-selector-group">
              <span className="customizer-label">Paper Color:</span>
              <div className="color-palette-pills" role="radiogroup" aria-label="Paper color">
                {CHIT_PALETTE.map((c) => {
                  const isSelected = selectedColorId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
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

            {/* Photo Upload Attachment Button */}
            <div className="photo-upload-group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden-file-input"
                id="memory-photo-input"
              />
              <label
                htmlFor="memory-photo-input"
                className="photo-attach-button"
                title="Attach a photo memory (Optional)"
              >
                <ImageIcon size={15} />
                <span>{imagePreview ? 'Change Photo' : 'Add Photo'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Fold Flap */}
        <div className="paper-bottom-fold" ref={bottomFlapRef}>
          <div className="fold-crease-shadow bottom"></div>
        </div>

        {/* Authentic Folded Paper Note Token (revealed upon fold completion) */}
        <div
          className="folded-chit-token"
          ref={chitTokenRef}
          aria-hidden="true"
          style={{ backgroundColor: activeColorConfig.bg }}
        >
          <div className="folded-chit-crease"></div>
          <span className="folded-chit-heart">♡</span>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="editor-action-footer">
        <button
          type="button"
          className="editor-cancel-btn"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="editor-fold-btn"
          disabled={isSubmitting}
        >
          <Sparkles size={16} className="btn-sparkle-icon" />
          <span>Fold & Add to Jar</span>
        </button>
      </div>
    </form>
  );
}
