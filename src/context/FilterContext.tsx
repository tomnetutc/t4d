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
  removeFilter: (field: FilterField) => void;
  clearFilters: () => void;
  applyFilters: (data: SurveyRow[]) => SurveyRow[];
}

const FilterContext = createContext<FilterCtx>({} as FilterCtx);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<ActiveFilter[]>([]);

  // Accumulate filters — multiple values per field are allowed (OR within field, AND across fields)
  const addFilter = (f: ActiveFilter) =>
    setFilters(prev => [...prev, f]);

  // Clear all filters for a given field
  const removeFilter = (field: FilterField) =>
    setFilters(prev => prev.filter(x => x.field !== field));

  const clearFilters = () => setFilters([]);

  const applyFilters = (data: SurveyRow[]): SurveyRow[] => {
    if (!filters.length) return data;

    // Group filter values by field
    const byField: Record<string, string[]> = {};
    for (const f of filters) {
      if (!byField[f.field]) byField[f.field] = [];
      byField[f.field].push(f.value);
    }

    return data.filter(row => {
      for (const [field, values] of Object.entries(byField)) {
        // Sentinel value used when a dimension has 0 options selected → no rows match
        if (values.includes('__no_match__')) return false;

        let passes = false;

        if (field === 'metro') {
          passes = values.includes(row['SurveyInstitution'] as string);

        } else if (field === 'gender') {
          // Rows with unknown gender pass through
          passes = row['gender'] === MISSING || values.includes(row['gender'] as string);

        } else if (field === 'age') {
          passes = row['AgeGroup1'] === MISSING || values.includes(row['AgeGroup1'] as string);

        } else if (field === 'employment') {
          passes = row['employment'] === MISSING || values.includes(row['employment'] as string);

        } else if (field === 'income') {
          passes = row['IncomeImputation'] === MISSING || values.includes(row['IncomeImputation'] as string);

        } else if (field === 'race') {
          // A respondent may have multiple races; match if any selected race column matches
          passes = values.some(v => {
            const col = RACE_COL[v];
            return !!col && row[col] === v;
          });

        } else if (field === 'ethnicity') {
          const v = row['hispaniclatin'] as string;
          passes = !!v && !SKIP.has(v) && values.includes(v);

        } else if (field === 'education') {
          const v = row['education'] as string;
          passes = !!v && !SKIP.has(v) && values.includes(v);

        } else if (field === 'placebirth') {
          const v = row['placebirth'] as string;
          passes = !!v && !SKIP.has(v) && values.includes(v);

        } else if (field === 'tenure') {
          const v = row['tenure'] as string;
          passes = !!v && !SKIP.has(v) && values.includes(v);

        } else if (field === 'housunit') {
          const v = row['housunit'] as string;
          passes = !!v && !SKIP.has(v) && values.includes(v);

        } else if (field === 'hhsize') {
          const v = row['hh_size'] as string;
          if (!v || SKIP.has(v)) {
            passes = false;
          } else {
            passes = values.some(sel => {
              if (sel === '7+') {
                const n = parseInt(v);
                return v === '10 or more' || (!isNaN(n) && n >= 7);
              }
              return v === sel;
            });
          }

        } else if (field === 'state') {
          passes = values.some(v => {
            const fips = STATE_FIPS[v];
            return !!fips && row['HState2'] === fips;
          });
        }

        if (!passes) return false;
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
