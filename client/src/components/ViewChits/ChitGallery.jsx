import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Plus } from 'lucide-react';
import ChitCard from './ChitCard';
import { CHIT_PALETTE } from '../../hooks/useChits';

export default function ChitGallery({
  chits = [],
  onOpenDetail,
  onEditChit,
  onDeleteChit,
  onAddNewChit,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first, 'asc' = oldest first

  // Filter and sort memories
  const filteredChits = useMemo(() => {
    let list = [...chits];

    // 1. Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.text.toLowerCase().includes(q) ||
          c.date.toLowerCase().includes(q)
      );
    }

    // 2. Color filter
    if (selectedColorFilter !== 'all') {
      list = list.filter(
        (c) => c.colorId === selectedColorFilter || c.color === selectedColorFilter
      );
    }

    // 3. Chronological sort by date
    list.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || a.createdAt || 0;
      const dateB = new Date(b.date).getTime() || b.createdAt || 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [chits, searchQuery, selectedColorFilter, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="chit-gallery-container">
      {/* Search and Filters Bar */}
      <div className="gallery-toolbar-row">
        {/* Search Input */}
        <div className="gallery-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="search"
            className="gallery-search-input"
            placeholder="Search memories by keyword or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search memories"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Sort Button */}
        <button
          type="button"
          className="gallery-sort-btn"
          onClick={toggleSort}
          title={`Sort: ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
        >
          <ArrowUpDown size={15} />
          <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
        </button>
      </div>

      {/* Pastel Color Filter Chips */}
      <div className="gallery-filter-chips-row" role="tablist" aria-label="Filter by color">
        <button
          type="button"
          className={`filter-chip-btn ${selectedColorFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedColorFilter('all')}
        >
          <span>All</span>
          <span className="filter-count-badge">{chits.length}</span>
        </button>

        {CHIT_PALETTE.map((c) => {
          const count = chits.filter(
            (item) => item.colorId === c.id || item.color === c.bg
          ).length;
          const isActive = selectedColorFilter === c.id;

          return (
            <button
              key={c.id}
              type="button"
              className={`filter-chip-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedColorFilter(c.id)}
              style={{
                '--chip-color': c.bg,
                '--chip-text': c.text,
              }}
            >
              <span
                className="chip-color-swatch"
                style={{ backgroundColor: c.bg }}
              ></span>
              <span>{c.name}</span>
              {count > 0 && <span className="filter-count-badge">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Gallery Content State */}
      {chits.length === 0 ? (
        /* Empty State: Completely no memories yet */
        <div className="gallery-empty-state">
          <div className="empty-state-jar-illustration" aria-hidden="true">
            <span className="empty-jar-emoji">🫙</span>
            <span className="empty-sparkle s1">✨</span>
            <span className="empty-sparkle s2">🌸</span>
          </div>

          <h3 className="empty-state-title">Your Memory Jar is Empty</h3>
          <p className="empty-state-subtitle">
            Every lifetime of memories starts with a single precious moment.
            Write your very first memory and tuck it safely inside!
          </p>

          <button
            type="button"
            className="empty-state-add-btn"
            onClick={onAddNewChit}
          >
            <Plus size={18} />
            <span>Write First Memory</span>
          </button>
        </div>
      ) : filteredChits.length === 0 ? (
        /* Empty Search Results */
        <div className="gallery-no-results">
          <span className="no-results-emoji">🔍</span>
          <h4 className="no-results-title">No memories found</h4>
          <p className="no-results-text">
            We couldn't find any memories matching your current filter. Try searching for something else or clearing your filters.
          </p>
          <button
            type="button"
            className="no-results-reset-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedColorFilter('all');
            }}
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        /* Chronological Grid of Memory Cards */
        <div className="gallery-cards-grid">
          {filteredChits.map((chit) => (
            <ChitCard
              key={chit.id}
              chit={chit}
              onOpenDetail={onOpenDetail}
              onEdit={onEditChit}
              onDelete={onDeleteChit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
