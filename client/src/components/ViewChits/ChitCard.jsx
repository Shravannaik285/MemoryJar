import React from 'react';
import { Calendar, Image as ImageIcon, BookOpen, Edit3, Trash2 } from 'lucide-react';
import { CHIT_PALETTE } from '../../hooks/useChits';

export default function ChitCard({
  chit,
  onOpenDetail,
  onEdit,
  onDelete,
}) {
  const colorConfig =
    CHIT_PALETTE.find((c) => c.id === chit.colorId || c.bg === chit.color) ||
    CHIT_PALETTE[0];

  const handleCardClick = () => {
    if (onOpenDetail) onOpenDetail(chit);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(chit);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(chit);
  };

  return (
    <article
      className="scrapbook-chit-card"
      onClick={handleCardClick}
      style={{
        '--chit-card-bg': colorConfig.light,
        '--chit-card-accent': colorConfig.bg,
        '--chit-card-border': colorConfig.border,
        '--chit-card-text': colorConfig.text,
      }}
      tabIndex={0}
      role="button"
      aria-label={`Memory from ${chit.date}: ${chit.text.substring(0, 50)}...`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Decorative Washi Tape on Top */}
      <div className="card-washi-tape" aria-hidden="true"></div>

      {/* Card Header: Date & Color Indicator */}
      <div className="card-header-bar">
        <span className="card-date-badge">
          <Calendar size={13} className="card-calendar-icon" />
          <span>{chit.date}</span>
        </span>

        <span
          className="card-color-dot"
          style={{ backgroundColor: colorConfig.bg }}
          title={`Category: ${colorConfig.name}`}
          aria-label={colorConfig.name}
        ></span>
      </div>

      {/* Attached Photo Thumbnail (if exists) */}
      {chit.photo && (
        <div className="card-photo-thumbnail-wrapper">
          <img
            src={chit.photo}
            alt="Memory attachment"
            className="card-photo-img"
            loading="lazy"
          />
          <div className="card-photo-badge">
            <ImageIcon size={12} />
          </div>
        </div>
      )}

      {/* Memory Text Excerpt */}
      <p className="card-memory-text">{chit.text}</p>

      {/* Card Footer: Quick Actions */}
      <div className="card-footer-actions">
        <button
          type="button"
          className="card-read-btn"
          onClick={handleCardClick}
          title="Unfold and read memory"
          aria-label="Read full memory"
        >
          <BookOpen size={14} />
          <span>Read</span>
        </button>

        <div className="card-tools-group">
          <button
            type="button"
            className="card-tool-btn edit"
            onClick={handleEditClick}
            title="Edit this memory"
            aria-label="Edit memory"
          >
            <Edit3 size={14} />
          </button>

          <button
            type="button"
            className="card-tool-btn delete"
            onClick={handleDeleteClick}
            title="Delete this memory"
            aria-label="Delete memory"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

