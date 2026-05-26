import React, { useState, useEffect, useRef } from 'react';
import { useFilters } from '../../context/FilterContext';
import { loadSurveyData } from '../../utils/dataLoader';
import './TopMenu.css';

// ── Dimension definitions ─────────────────────────────────────
// Values must match exactly what FilterContext's applyFilters expects.

interface DimOption { value: string; label: string; }
interface Dimension { label: string; field: string; options: DimOption[]; }

const DIMENSIONS: Dimension[] = [
  {
    label: 'Metro Area',
    field: 'metro',
    options: [
      { value: 'ASU', label: 'Phoenix' },
      { value: 'GT',  label: 'Atlanta' },
      { value: 'USF', label: 'Tampa' },
      { value: 'UT',  label: 'Austin' },
    ],
  },
  {
    label: 'Home State',
    field: 'state',
    options: [
      { value: 'Arizona', label: 'Arizona' },
      { value: 'Florida', label: 'Florida' },
      { value: 'Georgia', label: 'Georgia' },
      { value: 'Texas',   label: 'Texas' },
    ],
  },
  {
    label: 'Gender',
    field: 'gender',
    options: [
      { value: 'Female',               label: 'Female' },
      { value: 'Male',                 label: 'Male' },
      { value: 'Other',                label: 'Other' },
      { value: 'Prefer not to answer', label: 'Prefer not to answer' },
    ],
  },
  {
    label: 'Age Group',
    field: 'age',
    options: [
      { value: '18-30 years', label: '18–30 years' },
      { value: '31-40 years', label: '31–40 years' },
      { value: '41-50 years', label: '41–50 years' },
      { value: '51-60 years', label: '51–60 years' },
      { value: '61-70 years', label: '61–70 years' },
      { value: '71+ years',   label: '71+ years' },
    ],
  },
  {
    label: 'Race',
    field: 'race',
    options: [
      { value: 'White or Caucasian',        label: 'White or Caucasian' },
      { value: 'Black or African American', label: 'Black or African American' },
      { value: 'Asian or Pacific Islander', label: 'Asian or Pacific Islander' },
      { value: 'Native American',           label: 'Native American' },
      { value: 'Other race',                label: 'Other race' },
    ],
  },
  {
    label: 'Ethnicity',
    field: 'ethnicity',
    options: [
      { value: 'Yes', label: 'Hispanic or Latino' },
      { value: 'No',  label: 'Non-Hispanic' },
    ],
  },
  {
    label: 'Place of Birth',
    field: 'placebirth',
    options: [
      { value: 'United States or U.S. territory', label: 'US / US Territory' },
      { value: 'Other country',                   label: 'Outside the US' },
    ],
  },
  {
    label: 'Education Level',
    field: 'education',
    options: [
      { value: 'Some grade/high school',                       label: 'Less than high school' },
      { value: 'Completed high school or GED',                 label: 'High school / GED' },
      { value: 'Some college or technical school',             label: 'Some college / Technical' },
      { value: "Bachelor's degree(s) or some graduate school", label: "Bachelor's degree" },
      { value: 'Completed graduate degree(s)',                  label: 'Graduate degree' },
    ],
  },
  {
    label: 'Employment',
    field: 'employment',
    options: [
      { value: 'A worker (part-time or full-time)',  label: 'Worker' },
      { value: 'A student (part-time or full-time)', label: 'Student' },
      { value: 'Both a worker and a student',        label: 'Worker & Student' },
      { value: 'Neither a worker nor a student',     label: 'Neither' },
    ],
  },
  {
    label: 'Household Income',
    field: 'income',
    options: [
      { value: 'Less than $25,000',    label: '< $25K' },
      { value: '$25,000 to $49,999',   label: '$25K–$49K' },
      { value: '$50,000 to $99,999',   label: '$50K–$99K' },
      { value: '$100,000 to $149,999', label: '$100K–$149K' },
      { value: '$150,000 to $249,999', label: '$150K–$249K' },
      { value: '$250,000 or more',     label: '$250K+' },
    ],
  },
  {
    label: 'Household Size',
    field: 'hhsize',
    options: [
      { value: '1',  label: '1 person' },
      { value: '2',  label: '2 people' },
      { value: '3',  label: '3 people' },
      { value: '4',  label: '4 people' },
      { value: '5',  label: '5 people' },
      { value: '6',  label: '6 people' },
      { value: '7+', label: '7 or more' },
    ],
  },
  {
    label: 'Housing Type',
    field: 'housunit',
    options: [
      { value: 'Stand-alone home',       label: 'Stand-alone home' },
      { value: 'Condo/apartment',        label: 'Condo / Apartment' },
      { value: 'Attached home/townhome', label: 'Attached / Townhome' },
      { value: 'Mobile home',            label: 'Mobile home' },
    ],
  },
  {
    label: 'Home Ownership',
    field: 'tenure',
    options: [
      { value: 'Own',  label: 'Own' },
      { value: 'Rent', label: 'Rent' },
      { value: 'Provided by somebody else (e.g., relative, employer)', label: 'Provided by others' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────

const TopMenu: React.FC = () => {
  const { filters, addFilter, removeFilter, clearFilters, applyFilters } = useFilters();

  // dimSelections: field → selected values.
  // A field ABSENT from this map means "all selected" (no filter active).
  // A field present with empty array means 0 selected (sentinel → 0 results).
  const [dimSelections, setDimSelections] = useState<Record<string, string[]>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Derived values ────────────────────────────────────────────

  const isAllDefault = Object.keys(dimSelections).length === 0;
  const activeDimCount = Object.keys(dimSelections).length;

  const getSelectedValues = (dim: Dimension): string[] =>
    dimSelections[dim.field] ?? dim.options.map(o => o.value);

  const isDimDefault = (dim: Dimension): boolean =>
    dimSelections[dim.field] === undefined;

  const isChecked = (dim: Dimension, value: string): boolean => {
    const sel = dimSelections[dim.field];
    if (sel === undefined) return true;
    return sel.includes(value);
  };

  // ── Filter sync ───────────────────────────────────────────────
  // Clears all values for the field, then re-adds selected ones.

  const syncDimToFilter = (field: string, newSelected: string[], totalOpts: number) => {
    removeFilter(field as any);
    if (newSelected.length === totalOpts) return; // all selected = no filter needed
    if (newSelected.length === 0) {
      addFilter({ field: field as any, value: '__no_match__' });
      return;
    }
    newSelected.forEach(val => addFilter({ field: field as any, value: val }));
  };

  // ── Event handlers ────────────────────────────────────────────

  const handleCheckboxChange = (dim: Dimension, value: string, checked: boolean) => {
    const current = getSelectedValues(dim);
    const newSelected = checked
      ? [...current, value]
      : current.filter(v => v !== value);

    if (newSelected.length === dim.options.length) {
      setDimSelections(prev => {
        const { [dim.field]: _removed, ...rest } = prev;
        return rest;
      });
    } else {
      setDimSelections(prev => ({ ...prev, [dim.field]: newSelected }));
    }
    syncDimToFilter(dim.field, newSelected, dim.options.length);
  };

  const handleDimAll = (dim: Dimension) => {
    setDimSelections(prev => {
      const { [dim.field]: _removed, ...rest } = prev;
      return rest;
    });
    removeFilter(dim.field as any);
  };

  const handleDimNone = (dim: Dimension) => {
    setDimSelections(prev => ({ ...prev, [dim.field]: [] }));
    removeFilter(dim.field as any);
    addFilter({ field: dim.field as any, value: '__no_match__' });
  };

  const handleResetAll = () => {
    setDimSelections({});
    clearFilters();
  };

  const handleChipRemove = (dim: Dimension) => {
    setDimSelections(prev => {
      const { [dim.field]: _removed, ...rest } = prev;
      return rest;
    });
    removeFilter(dim.field as any);
  };

  const handleAllCheckboxChange = () => {
    if (!isAllDefault) handleResetAll();
  };

  // ── Modal ──────────────────────────────────────────────────────

  const openModal = () => {
    setIsModalOpen(true);
    setSearchQuery('');
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) closeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isModalOpen]);

  // Adjust the CSS custom property so main content offsets correctly when chips wrap
  useEffect(() => {
    if (!menuRef.current) return;
    const update = () => {
      const h = menuRef.current?.offsetHeight ?? 65;
      document.documentElement.style.setProperty('--top-menu-height', `${h}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(menuRef.current);
    return () => ro.disconnect();
  }, []);

  // Live respondent count (loadSurveyData is module-level cached — no extra network request)
  useEffect(() => {
    loadSurveyData().then(data => {
      setTotalCount(data.length);
      setFilteredCount(applyFilters(data).length);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ── Search ────────────────────────────────────────────────────

  const getFilteredDimensions = (): Dimension[] => {
    if (!searchQuery.trim()) return DIMENSIONS;
    const q = searchQuery.toLowerCase();
    return DIMENSIONS.flatMap(dim => {
      if (dim.label.toLowerCase().includes(q)) return [dim];
      const matched = dim.options.filter(o => o.label.toLowerCase().includes(q));
      if (matched.length > 0) return [{ ...dim, options: matched }];
      return [];
    });
  };

  // ── Chip helpers ──────────────────────────────────────────────

  const activeChips = DIMENSIONS.filter(d => dimSelections[d.field] !== undefined);

  const getChipLabel = (dim: Dimension): string => {
    const sel = dimSelections[dim.field];
    if (!sel || sel.length === 0) return `${dim.label}: none selected`;
    return `${dim.label}: ${sel.length} of ${dim.options.length} selected`;
  };

  const isChipWarning = (dim: Dimension): boolean => {
    const sel = dimSelections[dim.field];
    return sel !== undefined && sel.length === 0;
  };

  // ── Render helpers ────────────────────────────────────────────

  const filteredDimensions = getFilteredDimensions();

  const respondentLabel = (() => {
    if (filteredCount === null) return 'Loading…';
    if (isAllDefault) return `Showing ${filteredCount.toLocaleString()} respondents`;
    return `Filtered: ${filteredCount.toLocaleString()} of ${totalCount?.toLocaleString() ?? '…'} respondents`;
  })();

  // ── JSX ───────────────────────────────────────────────────────

  return (
    <>
      {/* ── Top bar ── */}
      <div className="menu-container" ref={menuRef}>
        <div className="filter-bar">
          <label className="segment-label">Select Segment:</label>

          <div className="all-select-checkbox">
            <input
              type="checkbox"
              checked={isAllDefault}
              onChange={handleAllCheckboxChange}
              aria-label="All respondents (no segment filter)"
            />
            <span className="all-select-label">All</span>
          </div>

          <button
            className="filter-trigger-btn"
            onClick={openModal}
            aria-haspopup="dialog"
            aria-expanded={isModalOpen}
            title="Open filter palette"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
            <span>Filter segments…</span>
            {activeDimCount > 0 && (
              <span className="active-badge" aria-label={`${activeDimCount} filter dimensions active`}>
                {activeDimCount}
              </span>
            )}
            <span className="cmd-hint" aria-hidden="true">ESC to close</span>
          </button>

          {activeChips.length > 0 && (
            <div className="chip-strip" aria-label="Active filters">
              {activeChips.map(dim => (
                <span
                  key={dim.field}
                  className={`filter-chip${isChipWarning(dim) ? ' filter-chip--warning' : ''}`}
                  role="status"
                  aria-label={getChipLabel(dim)}
                >
                  <span className="chip-label">{getChipLabel(dim)}</span>
                  <button
                    className="chip-remove"
                    onClick={() => handleChipRemove(dim)}
                    aria-label={`Reset ${dim.label} to all selected`}
                    title={`Reset ${dim.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="button-container">
            <button
              className="reset-button"
              onClick={handleResetAll}
              disabled={isAllDefault}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div
          className="filter-modal-backdrop"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Filter segments"
        >
          <div className="filter-modal-card">

            <div className="modal-search-row">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="modal-search-icon">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="modal-search-input"
                placeholder="Search dimensions or options…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search filter dimensions and options"
              />
              <button className="modal-esc-btn" onClick={closeModal} aria-label="Close filter modal">
                ESC
              </button>
            </div>

            <div className="modal-grid-scroll">
              {filteredDimensions.length === 0 ? (
                <p className="modal-empty-state">
                  No dimensions or options match &ldquo;{searchQuery}&rdquo;
                </p>
              ) : (
                <div className="modal-grid">
                  {filteredDimensions.map(dim => {
                    const fullDim = DIMENSIONS.find(d => d.field === dim.field)!;
                    const isPartial = !isDimDefault(fullDim);
                    return (
                      <div
                        key={dim.field}
                        className={`dim-column${isPartial ? ' dim-column--active' : ''}`}
                      >
                        <div className="dim-header">
                          <span className="dim-label">{dim.label}</span>
                          <div className="dim-actions">
                            <button
                              className="dim-action-link"
                              onClick={() => handleDimAll(fullDim)}
                              title={`Select all ${dim.label}`}
                            >
                              All
                            </button>
                            <button
                              className="dim-action-link"
                              onClick={() => handleDimNone(fullDim)}
                              title={`Deselect all ${dim.label}`}
                            >
                              None
                            </button>
                          </div>
                        </div>
                        <div className="dim-options">
                          {dim.options.map(opt => (
                            <label key={opt.value} className="dim-option">
                              <input
                                type="checkbox"
                                checked={isChecked(fullDim, opt.value)}
                                onChange={e => handleCheckboxChange(fullDim, opt.value, e.target.checked)}
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <span className="modal-respondent-count">{respondentLabel}</span>
              <div className="modal-footer-actions">
                <button className="modal-reset-btn" onClick={handleResetAll}>Reset all</button>
                <button className="modal-done-btn" onClick={closeModal}>Done ✓</button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default TopMenu;
