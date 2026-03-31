/* ── Section 6: Household Vehicles & Residential Preferences — all data definitions ── */

export interface VarDef {
  key: string;
  shortLabel: string;
  fullQuestion?: string;
  selectedValue?: string;  // for binary/multi-select variables
}

// ── Sidebar navigation ────────────────────────────────────────
export const HOUSEHOLD_NAV = [
  { id: 'licensing-ownership', label: 'Licensing & Vehicle Ownership', path: '/household/licensing-ownership' },
  { id: 'vehicle-fleet',       label: 'Vehicle Fleet Details',         path: '/household/vehicle-fleet' },
  { id: 'housing-tenure',      label: 'Housing & Tenure',              path: '/household/housing-tenure' },
  { id: 'home-location',       label: 'Home Location Preferences',     path: '/household/home-location' },
];

// ── [1] Driver's license ──────────────────────────────────────
export const DRIVER_SLICES = [
  { value: 'Yes', label: 'Has a driver\'s license', color: '#2ba88c' },
  { value: 'No',  label: 'No driver\'s license',    color: '#e25b61' },
];

// ── [2] Household vehicles (capped at 5+) ────────────────────
export const HH_VEH_CATS = ['0', '1', '2', '3', '4', '5+'];

// ── [3] Household drivers (capped at 5+) ─────────────────────
export const HH_NDRIVERS_CATS = ['0', '1', '2', '3', '4', '5+'];

// ── [4] Vehicle 1 characteristics ────────────────────────────
export const VEHICLE_FUEL_CATS = ['Gasoline', 'Hybrid', 'Electric', 'Other'];
export const VEHICLE_FUEL_SHORT: Record<string, string> = {
  Gasoline: 'Gasoline', Hybrid: 'Hybrid', Electric: 'Electric', Other: 'Other',
};

export const VEHICLE_MILES_CATS = [
  'Less than 5,000 miles',
  '5,000 to 9,999 miles',
  '10,000 to 14,999 miles',
  '15,000 to 19,999 miles',
  '20,000 to 24,999 miles',
  '25,000 to 29,999 miles',
  '30,000 to 39,999 miles',
  '40,000 and above',
];
export const VEHICLE_MILES_SHORT: Record<string, string> = {
  'Less than 5,000 miles':   '< 5K mi',
  '5,000 to 9,999 miles':    '5K–10K mi',
  '10,000 to 14,999 miles':  '10K–15K mi',
  '15,000 to 19,999 miles':  '15K–20K mi',
  '20,000 to 24,999 miles':  '20K–25K mi',
  '25,000 to 29,999 miles':  '25K–30K mi',
  '30,000 to 39,999 miles':  '30K–40K mi',
  '40,000 and above':        '40K+ mi',
};

export const MODEL_YEAR_BINS = [
  { label: 'Before 1990', min: 0,    max: 1990 },
  { label: '1990–1999',   min: 1990, max: 2000 },
  { label: '2000–2004',   min: 2000, max: 2005 },
  { label: '2005–2009',   min: 2005, max: 2010 },
  { label: '2010–2014',   min: 2010, max: 2015 },
  { label: '2015–2019',   min: 2015, max: 2020 },
  { label: '2020+',       min: 2020, max: Infinity },
];

// Normalization map for title-cased vehicle makes
export const MAKE_NORM: Record<string, string> = {
  Chevy:       'Chevrolet',
  Bmw:         'BMW',
  Gmc:         'GMC',
  Vw:          'Volkswagen',
  Mercedes:    'Mercedes-Benz',
  'Mercedes-Benz': 'Mercedes-Benz',
  Accura:      'Acura',
  Infinity:    'Infiniti',
  Cadilac:     'Cadillac',
};
export const TOP_MAKES_COUNT = 15;

// ── [5] ADAS features (binary multi-select) ──────────────────
export const ADAS_CATS   = ['Has feature', 'Does not have'];
export const ADAS_COLORS = ['#2ba88c', '#e8e8e8'];
export const ADAS_VARIABLES: VarDef[] = [
  { key: 'adas_backcam',   shortLabel: 'Backup camera',                  selectedValue: 'Backup camera' },
  { key: 'adas_abs',       shortLabel: 'Automated braking system',        selectedValue: 'Automated braking system' },
  { key: 'adas_acc',       shortLabel: 'Adaptive Cruise Control (ACC)',   selectedValue: 'Adaptive Cruise Control (ACC)' },
  { key: 'adas_blindspot', shortLabel: 'Blind spot monitoring',           selectedValue: 'Blind spot monitoring' },
  { key: 'adas_lanekeep',  shortLabel: 'Lane keeping system',             selectedValue: 'Lane keeping system' },
  { key: 'adas_none',      shortLabel: 'None of the above',               selectedValue: 'None' },
  { key: 'adas_notsure',   shortLabel: 'Not sure',                        selectedValue: 'Not sure' },
];

// ── [6] Housing type ──────────────────────────────────────────
export const HOUSUNIT_SLICES = [
  { value: 'Stand-alone home',       label: 'Stand-alone home',    color: '#2d7fa8' },
  { value: 'Attached home/townhome', label: 'Townhome/attached',   color: '#5b9fbf' },
  { value: 'Condo/apartment',        label: 'Condo/apartment',     color: '#507DBC' },
  { value: 'Mobile home',            label: 'Mobile home',         color: '#ead97c' },
  { value: 'Other',                  label: 'Other',               color: '#c5c5c5' },
];

// ── [7] Tenure ────────────────────────────────────────────────
export const TENURE_CATS = [
  'Own',
  'Rent',
  'Provided by somebody else (e.g., relative, employer)',
  'Other',
];
export const TENURE_SHORT: Record<string, string> = {
  'Own':   'Own',
  'Rent':  'Rent',
  'Provided by somebody else (e.g., relative, employer)': 'Provided by someone',
  'Other': 'Other',
};

// ── [8] Year moved to current address ────────────────────────
export const HOME_YRMOVED_BINS = [
  { label: 'Before 1980', min: 0,    max: 1980 },
  { label: '1980–1989',   min: 1980, max: 1990 },
  { label: '1990–1999',   min: 1990, max: 2000 },
  { label: '2000–2004',   min: 2000, max: 2005 },
  { label: '2005–2009',   min: 2005, max: 2010 },
  { label: '2010–2014',   min: 2010, max: 2015 },
  { label: '2015–2019',   min: 2015, max: 2020 },
  { label: '2020+',       min: 2020, max: Infinity },
];

// ── [9] Home location preferences (4-pt preference scale) ────
export const HOMELOC_CATS   = ['Do not want', 'Do not care', 'Want', 'Must have'];
export const HOMELOC_SHORT  = ['Do not want', 'Do not care', 'Want', 'Must have'];
export const HOMELOC_COLORS = ['#e25b61', '#c5c5c5', '#93c4b9', '#2ba88c'];

export const HOMELOC_VARIABLES: VarDef[] = [
  { key: 'homeloc_largehome',     shortLabel: 'Large home',                  fullQuestion: 'A larger home' },
  { key: 'homeloc_backyard',      shortLabel: 'Backyard / outdoor space',    fullQuestion: 'A backyard or outdoor space' },
  { key: 'homeloc_singlefam',     shortLabel: 'Single-family neighborhood',  fullQuestion: 'A single-family neighborhood' },
  { key: 'homeloc_closework',     shortLabel: 'Close to work/school',        fullQuestion: 'Close to work or school' },
  { key: 'homeloc_closeshops',    shortLabel: 'Close to shops/restaurants',  fullQuestion: 'Close to shops and restaurants' },
  { key: 'homeloc_closenature',   shortLabel: 'Close to nature/parks',       fullQuestion: 'Close to nature or parks' },
  { key: 'homeloc_closefamfriend',shortLabel: 'Close to family/friends',     fullQuestion: 'Close to family or friends' },
  { key: 'homeloc_goodschool',    shortLabel: 'Good schools nearby',         fullQuestion: 'Good schools in the area' },
  { key: 'homeloc_walkbike',      shortLabel: 'Walkable/bikeable area',      fullQuestion: 'An area where I can walk or bike for daily needs' },
  { key: 'homeloc_transit',       shortLabel: 'Good transit access',         fullQuestion: 'Good public transit access' },
  { key: 'homeloc_lowcrime',      shortLabel: 'Low crime area',              fullQuestion: 'A low crime area' },
];
