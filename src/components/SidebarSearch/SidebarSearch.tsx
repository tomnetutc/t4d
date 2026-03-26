import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SidebarSearch.css';

interface SearchResult {
  label: string;
  path: string;
  section: string;
}

const ALL_TOPICS: SearchResult[] = [
  { label: 'Environmental Attitudes', path: '/attitudes/environmental', section: 'General Attitudes & Preferences' },
  { label: 'Residential Preferences', path: '/attitudes/residential', section: 'General Attitudes & Preferences' },
  { label: 'Personality & Social Comfort', path: '/attitudes/personality', section: 'General Attitudes & Preferences' },
  { label: 'Technology Savviness & Connectivity', path: '/attitudes/technology', section: 'General Attitudes & Preferences' },
  { label: 'General Transportation Attitudes', path: '/attitudes/transportation', section: 'General Attitudes & Preferences' },
  { label: 'Driving & Car Ownership', path: '/attitudes/driving', section: 'General Attitudes & Preferences' },
  { label: 'Time Sensitivity', path: '/attitudes/time', section: 'General Attitudes & Preferences' },
];

const SidebarSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [focused, setFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(ALL_TOPICS.filter(t => t.label.toLowerCase().includes(q) || t.section.toLowerCase().includes(q)));
    setSelectedIdx(-1);
  }, [query]);

  const go = (path: string) => {
    setQuery('');
    setResults([]);
    navigate(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { setSelectedIdx(i => Math.min(i + 1, results.length - 1)); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { setSelectedIdx(i => Math.max(i - 1, 0)); e.preventDefault(); }
    else if (e.key === 'Enter' && selectedIdx >= 0) { go(results[selectedIdx].path); }
    else if (e.key === 'Escape') { setQuery(''); setResults([]); inputRef.current?.blur(); }
  };

  return (
    <div className="sidebar-search">
      <div className="search-input-wrapper">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search topics..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        {query && (
          <button className="search-clear" onClick={() => { setQuery(''); setResults([]); }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
      {focused && results.length > 0 && (
        <div className="search-results">
          {results.map((r, i) => (
            <div
              key={r.path}
              className={`search-result-item ${i === selectedIdx ? 'selected' : ''}`}
              onMouseDown={() => go(r.path)}
            >
              <span className="result-label">{r.label}</span>
              <span className="result-section">{r.section}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarSearch;
