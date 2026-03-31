/* ── Section 5: Current Travel Patterns — all data definitions ── */

export interface VarDef {
  key: string;
  shortLabel: string;
  fullQuestion?: string;
}

// ── Sidebar navigation ────────────────────────────────────────
export const TRAVEL_NAV = [
  { id: 'commute-patterns',          label: 'Commute Patterns',           path: '/travel/commute-patterns' },
  { id: 'commute-mode-frequency',    label: 'Commute Mode Frequency',     path: '/travel/commute-mode-frequency' },
  { id: 'noncommute-mode-frequency', label: 'Non-Commute Mode Frequency', path: '/travel/noncommute-mode-frequency' },
  { id: 'conditions-miles',          label: 'Conditions & Miles Driven',  path: '/travel/conditions-miles' },
  { id: 'deliveries',                label: 'Deliveries to Home',         path: '/travel/deliveries' },
  { id: 'long-distance',             label: 'Long-Distance Travel',       path: '/travel/long-distance' },
];

// ── [1] Employment ────────────────────────────────────────────
export const EMPLOYMENT_CATS = [
  'A worker (part-time or full-time)',
  'A student (part-time or full-time)',
  'Both a worker and a student',
  'Neither a worker nor a student',
];
export const EMPLOYMENT_SHORT: Record<string, string> = {
  'A worker (part-time or full-time)':  'Worker',
  'A student (part-time or full-time)': 'Student',
  'Both a worker and a student':        'Both worker & student',
  'Neither a worker nor a student':     'Neither',
};

// ── [2] Commute Frequency (days per week, 0–7) ────────────────
export const COMFREQ_CATS  = ['0', '1', '2', '3', '4', '5', '6', '7'];
export const COMFREQ_SHORT = ['0 days', '1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days'];
export const COMFREQ_COLORS = [
  '#dce9f7', '#b3cfe9', '#88b4da', '#5e9acb', '#3a81bc',
  '#226aaa', '#125496', '#083e7a',
];
export const COM_FREQ_VARIABLES: VarDef[] = [
  { key: 'com_daystowork',   shortLabel: 'Days to work/school',  fullQuestion: 'Days per week traveling to work or school' },
  { key: 'com_daystoschool', shortLabel: 'Days to school only',  fullQuestion: 'Days per week traveling to school' },
  { key: 'com_telecommute',  shortLabel: 'Days telecommuting',   fullQuestion: 'Days per week telecommuting (working from home)' },
];

// ── [3] Commute Distance & Time (binned) ──────────────────────
export const DISTANCE_BINS = [
  { label: '0 mi',     min: 0,   max: 0.1 },
  { label: '< 2 mi',   min: 0.1, max: 2 },
  { label: '2–5 mi',   min: 2,   max: 5 },
  { label: '5–10 mi',  min: 5,   max: 10 },
  { label: '10–25 mi', min: 10,  max: 25 },
  { label: '25–50 mi', min: 25,  max: 50 },
  { label: '> 50 mi',  min: 50,  max: Infinity },
];
export const TIME_BINS = [
  { label: '< 5 min',   min: 0,   max: 5 },
  { label: '5–10 min',  min: 5,   max: 10 },
  { label: '10–20 min', min: 10,  max: 20 },
  { label: '20–30 min', min: 20,  max: 30 },
  { label: '30–45 min', min: 30,  max: 45 },
  { label: '45–60 min', min: 45,  max: 60 },
  { label: '> 60 min',  min: 60,  max: Infinity },
];

// ── [4] Primary Commute Mode ──────────────────────────────────
export const COM_MODE_CATS = [
  'Private vehicle, driving alone',
  'Private vehicle, driving with passengers',
  'Private vehicle, riding with others',
  'Carsharing services (e.g., Zipcar)',
  'Bus',
  'Light rail',
  'Uber/Lyft/other ridehailing services',
  'Bicycle (including bikesharing)',
  'E-scooter sharing service (e.g., Bird, Lime)',
  'Walk',
  'Other mode',
];
export const COM_MODE_SHORT: Record<string, string> = {
  'Private vehicle, driving alone':                     'Drive alone',
  'Private vehicle, driving with passengers':           'Drive w/ passengers',
  'Private vehicle, riding with others':                'Ride w/ others',
  'Carsharing services (e.g., Zipcar)':                 'Carsharing',
  'Bus':                                                'Bus',
  'Light rail':                                         'Light rail',
  'Uber/Lyft/other ridehailing services':               'Ridehailing',
  'Bicycle (including bikesharing)':                    'Bike',
  'E-scooter sharing service (e.g., Bird, Lime)':       'E-scooter',
  'Walk':                                               'Walk',
  'Other mode':                                         'Other',
};

// ── [5] & [6] Mode Frequency (6-pt scale) ────────────────────
export const MODEFREQ_CATS = [
  'Not available',
  'Available but I never use it',
  'I use it less than one day a month',
  'I use it 1-3 days a month',
  'I use it 1-2 days a week',
  'I use it 3 or more days a week',
];
export const MODEFREQ_SHORT = [
  'Not available',
  'Never use',
  '< 1/month',
  '1–3/month',
  '1–2/week',
  '3+/week',
];
export const MODEFREQ_COLORS = ['#888888', '#c5c5c5', '#f5d0c8', '#ead97c', '#93c4b9', '#2ba88c'];

export const COM_FRQ_VARIABLES: VarDef[] = [
  { key: 'com_frq_sov',        shortLabel: 'Drive alone',          fullQuestion: 'Single occupancy vehicle (drive alone)' },
  { key: 'com_frq_hovdriver',  shortLabel: 'Drive w/ passengers',  fullQuestion: 'High-occupancy vehicle (drive with passengers)' },
  { key: 'com_frq_hovpass',    shortLabel: 'Ride w/ others',       fullQuestion: 'High-occupancy vehicle (ride with others)' },
  { key: 'com_frq_carshare',   shortLabel: 'Carsharing',           fullQuestion: 'Carsharing (e.g., Zipcar)' },
  { key: 'com_frq_bus',        shortLabel: 'Bus',                  fullQuestion: 'Bus' },
  { key: 'com_frq_lightrail',  shortLabel: 'Light rail',           fullQuestion: 'Light rail' },
  { key: 'com_frq_ridehailing',shortLabel: 'Ridehailing',          fullQuestion: 'Ridehailing (e.g., Uber, Lyft)' },
  { key: 'com_frq_taxi',       shortLabel: 'Taxi',                 fullQuestion: 'Taxi' },
  { key: 'com_frq_bike',       shortLabel: 'Bike',                 fullQuestion: 'Bicycle (including bikesharing)' },
  { key: 'com_frq_escooter',   shortLabel: 'E-scooter',            fullQuestion: 'E-scooter sharing service' },
  { key: 'com_frq_walk',       shortLabel: 'Walk',                 fullQuestion: 'Walking' },
  { key: 'com_frq_other',      shortLabel: 'Other',                fullQuestion: 'Other mode' },
];

export const NCOM_FRQ_VARIABLES: VarDef[] = [
  { key: 'ncom_frq_sov',        shortLabel: 'Drive alone',          fullQuestion: 'Single occupancy vehicle (drive alone)' },
  { key: 'ncom_frq_hovdriver',  shortLabel: 'Drive w/ passengers',  fullQuestion: 'High-occupancy vehicle (drive with passengers)' },
  { key: 'ncom_frq_hovpass',    shortLabel: 'Ride w/ others',       fullQuestion: 'High-occupancy vehicle (ride with others)' },
  { key: 'ncom_frq_carshare',   shortLabel: 'Carsharing',           fullQuestion: 'Carsharing (e.g., Zipcar)' },
  { key: 'ncom_frq_bus',        shortLabel: 'Bus',                  fullQuestion: 'Bus' },
  { key: 'ncom_frq_lightrail',  shortLabel: 'Light rail',           fullQuestion: 'Light rail' },
  { key: 'ncom_frq_ridehailing',shortLabel: 'Ridehailing',          fullQuestion: 'Ridehailing (e.g., Uber, Lyft)' },
  { key: 'ncom_frq_taxi',       shortLabel: 'Taxi',                 fullQuestion: 'Taxi' },
  { key: 'ncom_frq_bike',       shortLabel: 'Bike',                 fullQuestion: 'Bicycle (including bikesharing)' },
  { key: 'ncom_frq_escooter',   shortLabel: 'E-scooter',            fullQuestion: 'E-scooter sharing service' },
  { key: 'ncom_frq_walk',       shortLabel: 'Walk',                 fullQuestion: 'Walking' },
  { key: 'ncom_frq_other',      shortLabel: 'Other',                fullQuestion: 'Other mode' },
];

// ── [7] Conditions Limiting Travel ───────────────────────────
export const CONDITIONS_CATS   = ['Yes', 'To some extent', 'No'];
export const CONDITIONS_SHORT  = ['Yes', 'To some extent', 'No'];
export const CONDITIONS_COLORS = ['#e25b61', '#ead97c', '#2ba88c'];

export const CONDITIONS_VARIABLES: VarDef[] = [
  { key: 'cond_drivegeneral', shortLabel: 'Driving (general)',     fullQuestion: 'Do you have a condition that prevents or limits your driving in general?' },
  { key: 'cond_drivenight',   shortLabel: 'Driving at night',     fullQuestion: 'Do you have a condition that prevents or limits your driving at night?' },
  { key: 'cond_pubtransit',   shortLabel: 'Using public transit', fullQuestion: 'Do you have a condition that prevents or limits your use of public transit?' },
  { key: 'cond_bike',         shortLabel: 'Biking',               fullQuestion: 'Do you have a condition that prevents or limits your ability to ride a bicycle?' },
  { key: 'cond_walk',         shortLabel: 'Walking',              fullQuestion: 'Do you have a condition that prevents or limits your ability to walk?' },
];

// ── [8] Average Miles Driven ──────────────────────────────────
export const MILES_CATS = [
  'Zero',
  '1-25 miles',
  '26-50 miles',
  '51-75 miles',
  '76-100 miles',
  '101-200 miles',
  '201-300 miles',
  '301-500 miles',
  'More than 500 miles',
];
export const MILES_SHORT: Record<string, string> = {
  'Zero':              '0 mi',
  '1-25 miles':        '1–25 mi',
  '26-50 miles':       '26–50 mi',
  '51-75 miles':       '51–75 mi',
  '76-100 miles':      '76–100 mi',
  '101-200 miles':     '101–200 mi',
  '201-300 miles':     '201–300 mi',
  '301-500 miles':     '301–500 mi',
  'More than 500 miles': '> 500 mi',
};

// ── [10] Delivery Frequency ───────────────────────────────────
// Note: '3-Feb', '6-Apr', '10-Jul' are Excel-corrupted date strings
// representing ranges '2-3', '4-6', '7-10' respectively
export const DELIVERY_CATS   = ['0', '1', '3-Feb', '6-Apr', '10-Jul', '>10'];
export const DELIVERY_SHORT  = ['0', '1', '2–3', '4–6', '7–10', '>10'];
export const DELIVERY_COLORS = ['#cfe2f3', '#96c0e0', '#5a9fd4', '#2c7bc0', '#0d5daa', '#063d8a'];

export const DELIVERY_VARIABLES: VarDef[] = [
  { key: 'del_purchitem', shortLabel: 'Purchased items',  fullQuestion: 'Purchased items (clothing, electronics, etc.) delivered to home' },
  { key: 'del_prepmeal',  shortLabel: 'Prepared meals',   fullQuestion: 'Prepared meals (e.g., DoorDash, GrubHub) delivered to home' },
  { key: 'del_grocery',   shortLabel: 'Grocery delivery', fullQuestion: 'Grocery delivery to home' },
];

// ── [11] Long-Distance Trips ──────────────────────────────────
export const LD_LEISURE_VARS: VarDef[] = [
  { key: 'ld_leisure_car',   shortLabel: 'Car',   fullQuestion: 'Leisure trips by car (75+ miles one-way)' },
  { key: 'ld_leisure_plane', shortLabel: 'Plane', fullQuestion: 'Leisure trips by plane (75+ miles one-way)' },
  { key: 'ld_leisure_other', shortLabel: 'Other', fullQuestion: 'Leisure trips by other mode (75+ miles one-way)' },
];
export const LD_BIZ_VARS: VarDef[] = [
  { key: 'ld_biz_car',   shortLabel: 'Car',   fullQuestion: 'Business trips by car (75+ miles one-way)' },
  { key: 'ld_biz_plane', shortLabel: 'Plane', fullQuestion: 'Business trips by plane (75+ miles one-way)' },
  { key: 'ld_biz_other', shortLabel: 'Other', fullQuestion: 'Business trips by other mode (75+ miles one-way)' },
];

export const LD_SERIES = [
  { label: 'Leisure', color: '#3580b8' },
  { label: 'Business', color: '#e87d2e' },
];
