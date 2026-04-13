import React, { useState } from 'react';
import Select from 'react-select';
import { useFilters, FilterField } from '../../context/FilterContext';
import './TopMenu.css';

interface OptionType { value: string; label: string; isDisabled?: boolean; }
interface GroupedOption { label: string; options: OptionType[]; }

/* ── All filter options grouped by demographic category ───────── */
const ALL_GROUPED_OPTIONS: GroupedOption[] = [
  {
    label: 'Metro Area',
    options: [
      { value: 'ASU', label: 'Phoenix' },
      { value: 'GT',  label: 'Atlanta' },
      { value: 'USF', label: 'Tampa' },
      { value: 'UT',  label: 'Austin' },
    ],
  },
  {
    label: 'Home State',
    options: [
      { value: 'Arizona', label: 'Arizona' },
      { value: 'Florida', label: 'Florida' },
      { value: 'Georgia', label: 'Georgia' },
      { value: 'Texas',   label: 'Texas' },
    ],
  },
  {
    label: 'Gender',
    options: [
      { value: 'Female',               label: 'Female' },
      { value: 'Male',                 label: 'Male' },
      { value: 'Other',                label: 'Other' },
      { value: 'Prefer not to answer', label: 'Prefer not to answer' },
    ],
  },
  {
    label: 'Age Group',
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
    options: [
      { value: 'Yes', label: 'Hispanic or Latino' },
      { value: 'No',  label: 'Non-Hispanic / Non-Latino' },
    ],
  },
  {
    label: 'Place of Birth',
    options: [
      { value: 'United States or U.S. territory', label: 'US / US Territory' },
      { value: 'Other country',                   label: 'Outside the US' },
    ],
  },
  {
    label: 'Education Level',
    options: [
      { value: 'Some grade/high school',                         label: 'Less than high school' },
      { value: 'Completed high school or GED',                   label: 'High school / GED' },
      { value: 'Some college or technical school',               label: 'Some college / Technical' },
      { value: "Bachelor's degree(s) or some graduate school",   label: "Bachelor's degree" },
      { value: 'Completed graduate degree(s)',                    label: 'Graduate degree' },
    ],
  },
  {
    label: 'Employment',
    options: [
      { value: 'A worker (part-time or full-time)',  label: 'Worker' },
      { value: 'A student (part-time or full-time)', label: 'Student' },
      { value: 'Both a worker and a student',        label: 'Worker & Student' },
      { value: 'Neither a worker nor a student',     label: 'Neither' },
    ],
  },
  {
    label: 'Household Income',
    options: [
      { value: 'Less than $25,000',    label: '< $25K' },
      { value: '$25,000 to $49,999',   label: '$25K – $49K' },
      { value: '$50,000 to $99,999',   label: '$50K – $99K' },
      { value: '$100,000 to $149,999', label: '$100K – $149K' },
      { value: '$150,000 to $249,999', label: '$150K – $249K' },
      { value: '$250,000 or more',     label: '$250K+' },
    ],
  },
  {
    label: 'Household Size',
    options: [
      { value: '1',  label: '1 person' },
      { value: '2',  label: '2 people' },
      { value: '3',  label: '3 people' },
      { value: '4',  label: '4 people' },
      { value: '5',  label: '5 people' },
      { value: '6',  label: '6 people' },
      { value: '7+', label: '7 or more people' },
    ],
  },
  {
    label: 'Housing Type',
    options: [
      { value: 'Stand-alone home',      label: 'Stand-alone home' },
      { value: 'Condo/apartment',       label: 'Condo / Apartment' },
      { value: 'Attached home/townhome',label: 'Attached / Townhome' },
      { value: 'Mobile home',           label: 'Mobile home' },
    ],
  },
  {
    label: 'Home Ownership',
    options: [
      { value: 'Own',  label: 'Own' },
      { value: 'Rent', label: 'Rent' },
      { value: 'Provided by somebody else (e.g., relative, employer)', label: 'Provided by others' },
    ],
  },
];

/* ── Map each option value → FilterContext field ──────────────── */
const OPTION_TO_FIELD: Record<string, FilterField> = {
  // Metro Area
  ASU: 'metro', GT: 'metro', USF: 'metro', UT: 'metro',
  // Home State
  Arizona: 'state', Florida: 'state', Georgia: 'state', Texas: 'state',
  // Gender
  Female: 'gender', Male: 'gender', Other: 'gender', 'Prefer not to answer': 'gender',
  // Age Group
  '18-30 years': 'age', '31-40 years': 'age', '41-50 years': 'age',
  '51-60 years': 'age', '61-70 years': 'age', '71+ years': 'age',
  // Race
  'White or Caucasian': 'race', 'Black or African American': 'race',
  'Asian or Pacific Islander': 'race', 'Native American': 'race', 'Other race': 'race',
  // Ethnicity
  Yes: 'ethnicity', No: 'ethnicity',
  // Place of Birth
  'United States or U.S. territory': 'placebirth', 'Other country': 'placebirth',
  // Education
  'Some grade/high school': 'education',
  'Completed high school or GED': 'education',
  'Some college or technical school': 'education',
  "Bachelor's degree(s) or some graduate school": 'education',
  'Completed graduate degree(s)': 'education',
  // Employment
  'A worker (part-time or full-time)':  'employment',
  'A student (part-time or full-time)': 'employment',
  'Both a worker and a student':        'employment',
  'Neither a worker nor a student':     'employment',
  // Household Income
  'Less than $25,000': 'income', '$25,000 to $49,999': 'income',
  '$50,000 to $99,999': 'income', '$100,000 to $149,999': 'income',
  '$150,000 to $249,999': 'income', '$250,000 or more': 'income',
  // Household Size
  '1': 'hhsize', '2': 'hhsize', '3': 'hhsize', '4': 'hhsize',
  '5': 'hhsize', '6': 'hhsize', '7+': 'hhsize',
  // Housing Type
  'Stand-alone home': 'housunit', 'Condo/apartment': 'housunit',
  'Attached home/townhome': 'housunit', 'Mobile home': 'housunit',
  // Home Ownership
  Own: 'tenure', Rent: 'tenure',
  'Provided by somebody else (e.g., relative, employer)': 'tenure',
};

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    border: `1px solid ${state.isFocused ? '#80bdff' : '#ced4da'}`,
    borderRadius: '0.25rem',
    minHeight: '36px',
    fontSize: '13.5px',
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
    cursor: 'pointer',
  }),
  placeholder: (base: any) => ({ ...base, color: '#6c757d' }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: '13.5px',
    backgroundColor: state.isSelected ? '#007bff' : state.isDisabled ? '#f8f9fa' : state.isFocused ? '#e8f0fe' : 'white',
    color: state.isSelected ? 'white' : state.isDisabled ? '#aaa' : '#333',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
  }),
  group: (base: any) => ({ ...base, padding: 0 }),
  groupHeading: (base: any) => ({
    ...base,
    fontSize: '11px',
    fontWeight: 700,
    color: '#6c757d',
    textTransform: 'uppercase' as const,
    backgroundColor: '#f8f9fa',
    paddingTop: '6px',
    paddingBottom: '6px',
    marginBottom: '4px',
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

const TopMenu: React.FC = () => {
  const { addFilter, removeFilter, clearFilters } = useFilters();
  const [dropdownValues, setDropdownValues] = useState<(OptionType | null)[]>([null, null, null]);
  const [isAllSelected, setIsAllSelected] = useState(true);

  const hasSelection = dropdownValues.some(v => v !== null);

  /* Build options for a given slot — disable entire group if that field is
     already selected in another slot, or if exact value is already selected. */
  const getOptionsForSlot = (slotIndex: number): GroupedOption[] => {
    const usedFields = new Set<FilterField>();
    const usedValues = new Set<string>();
    dropdownValues.forEach((v, i) => {
      if (i !== slotIndex && v) {
        usedFields.add(OPTION_TO_FIELD[v.value]);
        usedValues.add(v.value);
      }
    });
    return ALL_GROUPED_OPTIONS.map(group => {
      const field = OPTION_TO_FIELD[group.options[0].value];
      const groupUsed = usedFields.has(field);
      return {
        label: group.label,
        options: group.options.map(opt => ({
          ...opt,
          isDisabled: groupUsed || usedValues.has(opt.value),
        })),
      };
    });
  };

  const handleAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setDropdownValues([null, null, null]);
      setIsAllSelected(true);
      clearFilters();
    }
  };

  const handleDropdownChange = (index: number, selected: OptionType | null) => {
    const newValues = [...dropdownValues];
    const old = newValues[index];
    if (old) removeFilter(OPTION_TO_FIELD[old.value], old.value);

    newValues[index] = selected;
    setDropdownValues(newValues);

    if (selected) {
      setIsAllSelected(false);
      addFilter({ field: OPTION_TO_FIELD[selected.value], value: selected.value });
    } else if (!newValues.some(v => v !== null)) {
      setIsAllSelected(true);
      clearFilters();
    }
  };

  const handleReset = () => {
    setDropdownValues([null, null, null]);
    setIsAllSelected(true);
    clearFilters();
  };

  return (
    <div className="menu-container">
      <span className="segment-label">Select Segment:</span>

      <div className="all-checkbox">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={handleAllChange}
          disabled={hasSelection}
        />
        <span>All</span>
      </div>

      <div className="filter-dropdowns">
        {[0, 1, 2].map(i => (
          <div key={i} className="filter-select-wrapper">
            <Select
              className="filter-select"
              value={dropdownValues[i]}
              onChange={opt => handleDropdownChange(i, opt)}
              options={getOptionsForSlot(i)}
              placeholder="Select attribute"
              styles={customStyles}
              isClearable
              isSearchable
              menuPortalTarget={document.body}
              menuPosition="fixed"
              maxMenuHeight={240}
            />
          </div>
        ))}
      </div>

      <button
        className="reset-btn"
        onClick={handleReset}
        disabled={isAllSelected && !hasSelection}
      >
        Reset
      </button>
    </div>
  );
};

export default TopMenu;
