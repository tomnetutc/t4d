import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SurveyRow, MISSING } from '../utils/dataLoader';

// ── Filter field types ────────────────────────────────────────
export type FilterField =
  | 'metro' | 'gender' | 'age' | 'employment' | 'income'
  | 'race' | 'ethnicity' | 'education' | 'placebirth'
  | 'tenure' | 'housunit' | 'hhsize' | 'state';

export interface ActiveFilter { field: FilterField; value: string; }

// ── T4 filter dimension values ────────────────────────────────
export const ALL_METROS    = ['ASU', 'GT', 'USF', 'UT'];
export const ALL_GENDERS   = ['Female', 'Male', 'Other', 'Prefer not to answer'];
export const ALL_AGE_GROUPS = ['18-30 years','31-40 years','41-50 years','51-60 years','61-70 years','71+ years'];
export const ALL_EMPLOYMENT = [
  'A worker (part-time or full-time)',
  'A student (part-time or full-time)',
  'Both a worker and a student',
  'Neither a worker nor a student',
];
export const EMPLOYMENT_SHORT: Record<string, string> = {
  'A worker (part-time or full-time)':  'Worker',
  'A student (part-time or full-time)': 'Student',
  'Both a worker and a student':        'Worker & Student',
  'Neither a worker nor a student':     'Neither',
};
export const ALL_INCOMES = [
  'Less than $25,000',
  '$25,000 to $49,999',
  '$50,000 to $99,999',
  '$100,000 to $149,999',
  '$150,000 to $249,999',
  '$250,000 or more',
];
export const METRO_LABELS: Record<string, string> = {
  ASU: 'Phoenix', GT: 'Atlanta', USF: 'Tampa', UT: 'Austin',
};

// ── Race column → selected value mapping ─────────────────────
const RACE_COL: Record<string, string> = {
  'White or Caucasian':        'race_white',
  'Black or African American': 'race_black',
  'Asian or Pacific Islander': 'race_asian',
  'Native American':           'race_nativeamerican',
  'Other race':                'race_other',
};

// ── Home state FIPS mapping ───────────────────────────────────
const STATE_FIPS: Record<string, string> = {
  Arizona: '4', Florida: '12', Georgia: '13', Texas: '48',
};

const SKIP = new Set(['Seen but not answered', 'Missing (other)', 'Appropriate skip']);

// ── Context ───────────────────────────────────────────────────
interface FilterCtx {
  filters: ActiveFilter[];
  addFilter:    (f: ActiveFilter) => void;
  removeFilter: (field: FilterField, value: string) => void;
  clearFilters: () => void;
  applyFilters: (data: SurveyRow[]) => SurveyRow[];
}

const FilterContext = createContext<FilterCtx>({} as FilterCtx);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<ActiveFilter[]>([]);

  const addFilter = (f: ActiveFilter) =>
    setFilters(prev => [...prev.filter(x => x.field !== f.field), f]);

  const removeFilter = (field: FilterField, value: string) =>
    setFilters(prev => prev.filter(x => !(x.field === field && x.value === value)));

  const clearFilters = () => setFilters([]);

  const applyFilters = (data: SurveyRow[]): SurveyRow[] => {
    if (!filters.length) return data;
    return data.filter(row => {
      for (const f of filters) {
        // ── Existing filters ──────────────────────────────────
        if (f.field === 'metro'      && row['SurveyInstitution'] !== f.value) return false;
        if (f.field === 'gender'     && row['gender'] !== MISSING && row['gender'] !== f.value) return false;
        if (f.field === 'age'        && row['AgeGroup1'] !== MISSING && row['AgeGroup1'] !== f.value) return false;
        if (f.field === 'employment' && row['employment'] !== MISSING && row['employment'] !== f.value) return false;
        if (f.field === 'income'     && row['IncomeImputation'] !== MISSING && row['IncomeImputation'] !== f.value) return false;

        // ── Race (binary multi-select columns) ────────────────
        if (f.field === 'race') {
          const col = RACE_COL[f.value];
          if (!col || row[col] !== f.value) return false;
        }

        // ── Ethnicity ─────────────────────────────────────────
        if (f.field === 'ethnicity') {
          const v = row['hispaniclatin'];
          if (!v || SKIP.has(v) || v !== f.value) return false;
        }

        // ── Education ─────────────────────────────────────────
        if (f.field === 'education') {
          const v = row['education'];
          if (!v || SKIP.has(v) || v !== f.value) return false;
        }

        // ── Place of birth ────────────────────────────────────
        if (f.field === 'placebirth') {
          const v = row['placebirth'];
          if (!v || SKIP.has(v) || v !== f.value) return false;
        }

        // ── Home ownership / tenure ───────────────────────────
        if (f.field === 'tenure') {
          const v = row['tenure'];
          if (!v || SKIP.has(v) || v !== f.value) return false;
        }

        // ── Housing type ──────────────────────────────────────
        if (f.field === 'housunit') {
          const v = row['housunit'];
          if (!v || SKIP.has(v) || v !== f.value) return false;
        }

        // ── Household size ────────────────────────────────────
        if (f.field === 'hhsize') {
          const v = row['hh_size'];
          if (!v || SKIP.has(v)) return false;
          if (f.value === '7+') {
            const n = parseInt(v);
            const passes = v === '10 or more' || (!isNaN(n) && n >= 7);
            if (!passes) return false;
          } else {
            if (v !== f.value) return false;
          }
        }

        // ── Home state ────────────────────────────────────────
        if (f.field === 'state') {
          const fips = STATE_FIPS[f.value];
          if (!fips || row['HState2'] !== fips) return false;
        }
      }
      return true;
    });
  };

  return (
    <FilterContext.Provider value={{ filters, addFilter, removeFilter, clearFilters, applyFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
