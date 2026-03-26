import React from 'react';
import Select, { StylesConfig, GroupBase } from 'react-select';
import { useFilters, ActiveFilter, ALL_METROS, ALL_GENDERS, ALL_AGE_GROUPS, METRO_LABELS } from '../../context/FilterContext';
import './TopMenu.css';

interface Option { value: string; label: string; }
type GroupedOption = GroupBase<Option>;

const metroOptions: GroupedOption[] = [{
  label: 'Metro Area',
  options: ALL_METROS.map(m => ({ value: m, label: METRO_LABELS[m] })),
}];

const genderOptions: GroupedOption[] = [{
  label: 'Gender',
  options: ALL_GENDERS.map(g => ({ value: g, label: g })),
}];

const ageOptions: GroupedOption[] = [{
  label: 'Age Group',
  options: ALL_AGE_GROUPS.map(a => ({ value: a, label: a })),
}];

const customStyles: StylesConfig<Option, false, GroupedOption> = {
  control: (base, state) => ({
    ...base,
    minHeight: '34px',
    height: '34px',
    fontSize: '13.5px',
    border: `1px solid ${state.isFocused ? '#80bdff' : '#ced4da'}`,
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,0.25)' : 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }),
  valueContainer: base => ({ ...base, padding: '0 8px' }),
  indicatorsContainer: base => ({ ...base, height: '34px' }),
  option: (base, state) => ({
    ...base,
    fontSize: '13.5px',
    backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#e8f0fe' : 'white',
    color: state.isSelected ? 'white' : '#333',
    cursor: 'pointer',
  }),
  groupHeading: base => ({ ...base, fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }),
  placeholder: base => ({ ...base, color: '#888', fontSize: '13.5px' }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
};

const TopMenu: React.FC = () => {
  const { filters, addFilter, removeFilter, clearFilters } = useFilters();

  const getVal = (field: ActiveFilter['field']): Option | null => {
    const f = filters.find(x => x.field === field);
    if (!f) return null;
    if (field === 'metro') return { value: f.value, label: METRO_LABELS[f.value] ?? f.value };
    return { value: f.value, label: f.value };
  };

  const allSelected = filters.length === 0;

  const handleAll = () => clearFilters();

  return (
    <div className="menu-container">
      <span className="segment-label">Select Segment:</span>

      <label className="all-checkbox">
        <input type="checkbox" checked={allSelected} onChange={handleAll} readOnly={false} />
        <span>All</span>
      </label>

      <div className="filter-dropdowns">
        <Select<Option, false, GroupedOption>
          options={metroOptions}
          value={getVal('metro')}
          onChange={opt => opt ? addFilter({ field: 'metro', value: opt.value }) : removeFilter('metro', getVal('metro')?.value ?? '')}
          isClearable
          placeholder="Metro Area"
          styles={customStyles}
          menuPortalTarget={document.body}
          className="filter-select"
        />
        <Select<Option, false, GroupedOption>
          options={genderOptions}
          value={getVal('gender')}
          onChange={opt => opt ? addFilter({ field: 'gender', value: opt.value }) : removeFilter('gender', getVal('gender')?.value ?? '')}
          isClearable
          placeholder="Gender"
          styles={customStyles}
          menuPortalTarget={document.body}
          className="filter-select"
        />
        <Select<Option, false, GroupedOption>
          options={ageOptions}
          value={getVal('age')}
          onChange={opt => opt ? addFilter({ field: 'age', value: opt.value }) : removeFilter('age', getVal('age')?.value ?? '')}
          isClearable
          placeholder="Age Group"
          styles={customStyles}
          menuPortalTarget={document.body}
          className="filter-select"
        />
      </div>

      <button className="reset-btn" onClick={clearFilters}>Reset</button>
    </div>
  );
};

export default TopMenu;
