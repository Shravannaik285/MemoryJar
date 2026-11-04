import React from 'react';
import './ActionButtons.css';

export default function ActionButtons({ onAddChit, onViewChits, chitCount = 0 }) {
  return (
    <div className="action-buttons-grid">
      {/* Add Chit Card */}
      <button
        type="button"
        className="action-card card-add-chit"
        onClick={onAddChit}
        aria-label="Write a new memory and drop it in your jar"
      >
        <div className="action-card-sheen"></div>
        <div className="action-icon-container icon-pink">
          <svg
            className="action-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <div className="action-text-group">
          <h2 className="action-title">Add Chit</h2>
          <p className="action-subtitle">
            Write a new memory and drop it in your jar
          </p>
        </div>
      </button>

      {/* View Chits Card */}
      <button
        type="button"
        className="action-card card-view-chits"
        onClick={onViewChits}
        aria-label="Explore all your saved memories"
      >
        <div className="action-card-sheen"></div>
        <div className="action-icon-container icon-lavender">
          <svg
            className="action-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div className="action-text-group">
          <div className="action-title-row">
            <h2 className="action-title">View Chits</h2>
            {chitCount > 0 && (
              <span className="chit-counter-pill">{chitCount}</span>
            )}
          </div>
          <p className="action-subtitle">
            Explore all your saved memories
          </p>
        </div>
      </button>
    </div>
  );
}
