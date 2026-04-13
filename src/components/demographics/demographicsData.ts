/* ── Section 7: Sample Characteristics — all data definitions ── */

export interface RaceVar {
  key: string;
  shortLabel: string;
}

// ── Sidebar navigation ────────────────────────────────────────
export const DEMOGRAPHICS_NAV = [
  { id: 'individual',  label: 'Individual Attributes',  path: '/demographics/individual' },
  { id: 'household',   label: 'Household Composition',  path: '/demographics/household' },
  { id: 'economic',    label: 'Economic & Housing',     path: '/demographics/economic' },
  { id: 'geographic',  label: 'Geographic',             path: '/demographics/geographic' },
];

// ── [1] Gender — exact values from FilterContext ──────────────
export const GENDER_CATS = ['Female', 'Male', 'Other', 'Prefer not to answer'];

// ── [2] Age groups — exact values from FilterContext ─────────
export const AGEGROUP_CATS = [
  '18-30 years', '31-40 years', '41-50 years',
  '51-60 years', '61-70 years', '71+ years',
];

// ── [3] Race (binary multi-select columns) ───────────────────
export const RACE_VARIABLES: RaceVar[] = [
  { key: 'race_white',          shortLabel: 'White' },
  { key: 'race_black',          shortLabel: 'Black or African American' },
  { key: 'race_nativeamerican', shortLabel: 'Amer. Indian / Alaska Native' },
  { key: 'race_asian',          shortLabel: 'Asian' },
  { key: 'race_other',          shortLabel: 'Other race' },
  { key: 'race_prefnotanswer',  shortLabel: 'Prefer not to answer' },
];

// ── [7] Household size (capped at 7+) ────────────────────────
export const HH_SIZE_CATS = ['1', '2', '3', '4', '5', '6', '7+'];

// ── [11] Survey institution — exact values from FilterContext ─
export const INSTITUTION_CATS = ['ASU', 'GT', 'USF', 'UT'];
export const INSTITUTION_LABELS: Record<string, string> = {
  ASU: 'Phoenix',
  GT:  'Atlanta',
  USF: 'Tampa',
  UT:  'Austin',
};
