import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

export default function ImagePreview({ file, previewUrl, onRemove }) {
  if (!previewUrl) return null;

  const fileSizeKb = file ? Math.round(file.size / 1024) : null;
  const fileSizeText = fileSizeKb
    ? fileSizeKb > 1024
      ? `${(fileSizeKb / 1024).toFixed(1)} MB`
      : `${fileSizeKb} KB`
    : null;

  return (
    <div className="image-preview-card" role="region" aria-label="Attached Memory Photo">
      <div className="preview-polaroid-frame">
        <img
          src={previewUrl}
          alt="Memory attachment preview"
          className="preview-img-element"
        />
        <div className="preview-tape-strip"></div>
      </div>

      <div className="preview-meta">
        <div className="preview-meta-info">
          <span className="preview-file-icon">
            <ImageIcon size={14} />
          </span>
          <span className="preview-file-name" title={file?.name || 'Attached photo'}>
            {file?.name || 'Attached photo'}
          </span>
          {fileSizeText && <span className="preview-file-size">({fileSizeText})</span>}
        </div>

        <button
          type="button"
          className="preview-remove-btn"
          onClick={onRemove}
          title="Remove photo"
          aria-label="Remove uploaded photo"
        >
          <X size={15} />
          <span>Remove</span>
        </button>
      </div>
    </div>
  );
}

