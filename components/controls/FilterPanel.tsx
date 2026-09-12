'use client';

import React from 'react';
import { useData } from '@/components/providers/DataProvider';

// Filter panel — category toggle chips
const FilterPanel = React.memo(function FilterPanel() {
  const { categories, filterState, setSelectedCategories } = useData();
  const selected = filterState.categories;

  function toggleCategory(cat: string) {
    const isSelected = selected.includes(cat);
    if (isSelected) {
      // Don't allow deselecting all
      if (selected.length <= 1) return;
      setSelectedCategories(selected.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selected, cat]);
    }
  }

  function selectAll() {
    setSelectedCategories([...categories]);
  }

  return (
    <div className="filter-panel">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`filter-chip ${selected.includes(cat) ? 'selected' : ''}`}
          onClick={() => toggleCategory(cat)}
        >
          {cat}
        </button>
      ))}
      {selected.length < categories.length && (
        <button className="filter-chip" onClick={selectAll} style={{ fontStyle: 'italic' }}>
          all
        </button>
      )}
    </div>
  );
});

export default FilterPanel;
