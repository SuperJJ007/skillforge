import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, resultCount, totalCount, scopeLabel = '' }) => {
  const isSearching = value.trim() !== '';

  return (
    <form className="search-bar-container" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="sr-only" htmlFor="resource-search">搜索科研资源</label>
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          id="resource-search"
          type="search"
          className="search-input"
          placeholder={scopeLabel
            ? `在${scopeLabel}中搜索 Skill、MCP 或 Plugin...`
            : '搜索科研 Skill、MCP 或 Plugin...'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
          aria-describedby="search-status"
        />
        {isSearching && (
          <button type="button" className="search-clear-btn" onClick={() => onChange('')} aria-label="清空搜索">
            清除
          </button>
        )}
      </div>
      <p id="search-status" className="search-status" aria-live="polite">
        {isSearching
          ? `找到 ${resultCount} 个匹配资源`
          : `${scopeLabel || '全部资源'}共收录 ${totalCount} 个科研资源`}
      </p>
    </form>
  );
};

export default SearchBar;
