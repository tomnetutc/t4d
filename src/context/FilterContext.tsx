import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SurveyRow, MISSING } from '../utils/dataLoader';

// T4 filter dimensions
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
  ASU: 'ASU (Phoenix)', GT: 'GT (Atlanta)', USF: 'USF (Tampa)', UT: 'UT (Austin)',
};

// A single active filter: which field + which value is selected
export interface ActiveFilter { field: 'metro' | 'gender' | 'age' | 'employment' | 'income'; value: string; }

interface FilterCtx {
  filters: ActiveFilter[];
  addFilter:    (f: ActiveFilter) => void;
  removeFilter: (field: ActiveFilter['field'], value: string) => void;
  clearFilters: () => void;
  applyFilters: (data: SurveyRow[]) => SurveyRow[];
}

const FilterContext = createContext<FilterCtx>({} as FilterCtx);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<ActiveFilter[]>([]);

  const addFilter = (f: ActiveFilter) =>
    setFilters(prev => [...prev.filter(x => x.field !== f.field), f]);

  const removeFilter = (field: ActiveFilter['field'], value: string) =>
    setFilters(prev => prev.filter(x => !(x.field === field && x.value === value)));

  const clearFilters = () => setFilters([]);

  const applyFilters = (data: SurveyRow[]): SurveyRow[] => {
    if (!filters.length) return data;
    return data.filter(row => {
      for (const f of filters) {
        if (f.field === 'metro'      && row.SurveyInstitution !== f.value) return false;
        if (f.field === 'gender'     && row.gender !== MISSING && row.gender !== f.value) return false;
        if (f.field === 'age'        && row.AgeGroup1 !== MISSING && row.AgeGroup1 !== f.value) return false;
        if (f.field === 'employment' && row.employment !== MISSING && row.employment !== f.value) return false;
        if (f.field === 'income'     && row.IncomeImputation !== MISSING && row.IncomeImputation !== f.value) return false;
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
