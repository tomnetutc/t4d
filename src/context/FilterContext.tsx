import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SurveyRow, MISSING } from '../utils/dataLoader';

// T4 filter dimensions
export const ALL_METROS    = ['ASU', 'GT', 'USF', 'UT'];
export const ALL_GENDERS   = ['Female', 'Male', 'Other', 'Prefer not to answer'];
export const ALL_AGE_GROUPS = ['18-30 years','31-40 years','41-50 years','51-60 years','61-70 years','71+ years'];

export const METRO_LABELS: Record<string, string> = {
  ASU: 'ASU (Phoenix)', GT: 'GT (Atlanta)', USF: 'USF (Tampa)', UT: 'UT (Austin)',
};

// A single active filter: which field + which value is selected
export interface ActiveFilter { field: 'metro' | 'gender' | 'age'; value: string; }

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
    setFilters(prev => [...prev.filter(x => x.field !== f.field || x.value !== f.value), f]);

  const removeFilter = (field: ActiveFilter['field'], value: string) =>
    setFilters(prev => prev.filter(x => !(x.field === field && x.value === value)));

  const clearFilters = () => setFilters([]);

  const applyFilters = (data: SurveyRow[]): SurveyRow[] => {
    if (!filters.length) return data;
    return data.filter(row => {
      for (const f of filters) {
        if (f.field === 'metro'  && row.SurveyInstitution !== f.value) return false;
        if (f.field === 'gender' && row.gender !== MISSING && row.gender !== f.value) return false;
        if (f.field === 'age'    && row.AgeGroup1 !== MISSING && row.AgeGroup1 !== f.value) return false;
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
