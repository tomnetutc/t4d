/* ── Section 2: Mobility on Demand — all data definitions ── */

export interface VarDef {
  key: string;
  shortLabel: string;
  fullQuestion?: string;
  selectedValue?: string; // for binary variables
}

// ── Familiarity scale ───────────────────────────────────────
export const FAMILIARITY_CATEGORIES = [
  'I am not familiar with it',
  'I am familiar but never used the service',
  'I use it rarely (e.g., less than once a month)',
  'I use it monthly',
  'I use it weekly',
];
export const FAMILIARITY_COLORS = ['#cccccc', '#a8d5e2', '#5b9fbf', '#2d7fa8', '#0d5f80'];
export const FAMILIARITY_SHORT = ['Not familiar', 'Familiar, never used', 'Use rarely', 'Use monthly', 'Use weekly'];

export const FAMILIARITY_VARIABLES: VarDef[] = [
  { key: 'pvtridehailing_famil', shortLabel: 'Private Ridehailing', fullQuestion: 'Private ridehailing (e.g., Uber, Lyft)' },
  { key: 'shdridehailing_famil', shortLabel: 'Shared Ridehailing',  fullQuestion: 'Shared ridehailing (e.g., uberPOOL, Lyft Share)' },
  { key: 'carsharing_famil',     shortLabel: 'Carsharing',          fullQuestion: 'Carsharing (e.g., Zipcar)' },
  { key: 'bikesharing_famil',    shortLabel: 'Bikesharing',         fullQuestion: 'Bikesharing (e.g., bike share programs)' },
  { key: 'escooter_famil',       shortLabel: 'E-Scooter Sharing',   fullQuestion: 'E-scooter sharing (e.g., Lime, Bird)' },
];

// ── Ridehailing attitudes (standard 5-pt Likert) ────────────
export const RH_ATTITUDE_VARIABLES: VarDef[] = [
  { key: 'rh_att_expensive',   shortLabel: 'Too expensive',            fullQuestion: 'Ridehailing services are too expensive.' },
  { key: 'rh_att_reliable',    shortLabel: 'Reliable',                 fullQuestion: 'Ridehailing services are reliable.' },
  { key: 'rh_att_savmonpark',  shortLabel: 'Saves money on parking',   fullQuestion: 'Using ridehailing saves me money on parking.' },
  { key: 'rh_att_avimpaired',  shortLabel: 'Avoid driving impaired',   fullQuestion: 'I use ridehailing to avoid driving when impaired.' },
  { key: 'rh_att_carunavail',  shortLabel: 'When car unavailable',     fullQuestion: 'I use ridehailing when my car is unavailable.' },
  { key: 'rh_att_awayhome',    shortLabel: 'When away from home',      fullQuestion: 'I use ridehailing when I am away from home.' },
  { key: 'rh_att_gettotransit',shortLabel: 'Get to transit',           fullQuestion: 'I use ridehailing to get to or from transit.' },
  { key: 'rh_att_transnotavl', shortLabel: 'Transit not available',    fullQuestion: 'I use ridehailing when transit is not available.' },
  { key: 'rh_att_fewcar',      shortLabel: 'Could own fewer cars',     fullQuestion: 'Using ridehailing could lead me to own fewer cars.' },
  { key: 'rh_att_drivuncomf',  shortLabel: 'Uncomfortable driving',    fullQuestion: 'I use ridehailing because I am uncomfortable driving.' },
  { key: 'rh_att_shareuncomf', shortLabel: 'Uncomfortable sharing',    fullQuestion: 'I am uncomfortable sharing a ridehailing vehicle with strangers.' },
  { key: 'rh_att_sharecost',   shortLabel: 'Would share to save cost', fullQuestion: 'I would share a ridehailing ride to reduce my cost.' },
  { key: 'rh_att_carseat',     shortLabel: 'Difficult with car seat',  fullQuestion: 'Ridehailing is difficult to use because of car seat requirements.' },
  { key: 'rh_att_ada',         shortLabel: 'ADA accessibility',        fullQuestion: 'Ridehailing services do not adequately serve people with disabilities.' },
  { key: 'rh_att_homeloc',     shortLabel: 'Influences home location', fullQuestion: 'Ridehailing availability influences my choice of where to live.' },
];

// ── Impact on other modes (4-category change scale) ─────────
export const CHANGE_CATEGORIES = [
  'I use it more often',
  'I use it about the same',
  'I use it less often',
  'I have changed usage, but not because of ridehailing',
];
export const CHANGE_COLORS = ['#2ba88c', '#ead97c', '#e25b61', '#b0b0b0'];

export const CHANGE_VARIABLES: VarDef[] = [
  { key: 'rh_change_sov',       shortLabel: 'Driving alone (SOV)',      fullQuestion: 'Driving alone (single occupancy vehicle)' },
  { key: 'rh_change_hovdriver', shortLabel: 'Carpooling as driver',     fullQuestion: 'Carpooling — as driver' },
  { key: 'rh_change_hovpass',   shortLabel: 'Carpooling as passenger',  fullQuestion: 'Carpooling — as passenger' },
  { key: 'rh_change_bus',       shortLabel: 'Bus',                      fullQuestion: 'Riding the bus' },
  { key: 'rh_change_lightrail', shortLabel: 'Light rail',               fullQuestion: 'Riding light rail' },
  { key: 'rh_change_taxi',      shortLabel: 'Taxi / cab',               fullQuestion: 'Taking a taxi or traditional cab' },
  { key: 'rh_change_bikescoot', shortLabel: 'Bike / scooter',           fullQuestion: 'Riding a bike or scooter' },
  { key: 'rh_change_walk',      shortLabel: 'Walking',                  fullQuestion: 'Walking' },
];

// ── Ridehailing usage — numeric bins ────────────────────────
export const RH_WAITTIME_BINS = [
  { label: '0–5 min',  min: 0,  max: 6 },
  { label: '6–10 min', min: 6,  max: 11 },
  { label: '11–15 min',min: 11, max: 16 },
  { label: '16–20 min',min: 16, max: 21 },
  { label: '21+ min',  min: 21, max: Infinity },
];
export const RH_DURATION_BINS = [
  { label: '<10 min',   min: 0,  max: 10 },
  { label: '10–20 min', min: 10, max: 21 },
  { label: '21–30 min', min: 21, max: 31 },
  { label: '31–45 min', min: 31, max: 46 },
  { label: '46–60 min', min: 46, max: 61 },
  { label: '60+ min',   min: 61, max: Infinity },
];
export const RH_TRIPCOST_BINS = [
  { label: '$1–$9',   min: 1,  max: 10 },
  { label: '$10–$19', min: 10, max: 20 },
  { label: '$20–$29', min: 20, max: 30 },
  { label: '$30–$49', min: 30, max: 50 },
  { label: '$50+',    min: 50, max: Infinity },
];

// Additional time willing to wait for shared ridehailing (50% discount)
export const RH_ADDTIME_CATS = [
  '1-5 more minutes',
  '6-10 more minutes',
  '11-15 more minutes',
  '16 or more minutes',
  'I would not have used shared ridehailing for the trip',
];
export const RH_ADDTIME_SHORT: Record<string, string> = {
  '1-5 more minutes':  '1–5 min',
  '6-10 more minutes': '6–10 min',
  '11-15 more minutes':'11–15 min',
  '16 or more minutes':'16+ min',
  'I would not have used shared ridehailing for the trip': 'Would not use shared',
};

// ── Ridehailing usage — categorical variables ────────────────
export const RH_SERVICETYPE_CATS = [
  'Private ridehailing (e.g., Uber, Lyft)',
  'Shared ridehailing (e.g., uberPOOL, Lyft Share)',
];
export const RH_TRIPTIME_CATS = [
  'Weekday daytime',
  'Weeknight (excluding Friday night)',
  'Weekend daytime',
  'Weekend night time (including Friday night)',
];
export const RH_TRIPPURP_CATS = [
  'Main commute location',
  'Going/returning home from another location',
  'Social/recreational',
  'Shopping/errands',
  'Eating/drinking',
  'To access airport',
  'To access public transit',
  'Medical/dental',
  'Other',
];
// Note: '$0 ' has a trailing space in the CSV as exported from Qualtrics
export const RH_MONTHEXPEND_CATS = ['$0 ','$1 - $9','$10 - $29','$30 - $49','$50 - $74','$75 - $100','More than $100'];

// Companions — binary (selectedValue = the "selected" string for each variable)
export const RH_COMPANION_VARIABLES: VarDef[] = [
  { key: 'rh_travelalone',      shortLabel: 'Alone',                             selectedValue: 'I was the only passenger' },
  { key: 'rh_travelwhfriends',  shortLabel: 'With friends/family/colleagues',    selectedValue: 'Family members, friends or colleagues' },
  { key: 'rh_travelwhshared',   shortLabel: 'With app-matched passengers',        selectedValue: 'Other passengers matched via the app (for shared hidehailing)' },
];
export const RH_ALTERNMODE_CATS = [
  'Drive private vehicle, alone',
  'Drive private vehicle, with passengers',
  'Ride private vehicle, with others',
  'Use taxi',
  'Ride the bus',
  'Ride the light rail',
  'Walk',
  'Use a bikesharing or e-scooter sharing service',
  'Ride my personal bicycle or scooter',
  'I would not have made this trip',
  'Other',
];

// ── Bike/scooter sharing ─────────────────────────────────────
export const BES_SERVICETYPE_CATS = ['Bikesharing', 'E-scooter sharing'];
export const BES_TRIPTIME_CATS = [
  'Weekday daytime',
  'Weeknight (excluding Friday night)',
  'Weekend daytime',
  'Weekend night time (including Friday night)',
];
export const BES_TRIPLENGTH_CATS = ['Less than a mile','1-2 miles','3-4 miles','5 miles or more'];
export const BES_PURPOSE_LABELS: Record<string, string> = {
  CommuteLocation: 'Main commute',
  'Going/returning home from another location': 'Going/returning home',
  'Social/recreational': 'Social/recreational',
  'Shopping/errands': 'Shopping/errands',
  'Eating/drinking': 'Eating/drinking',
  'Just to enjoy the ride/try the new service': 'Enjoyment/try service',
  'To access airport': 'To access airport',
  'To access public transit': 'To access transit',
  'Medical/dental': 'Medical/dental',
  Other: 'Other',
};
export const BES_PURPOSE_CATS = Object.keys(BES_PURPOSE_LABELS);

export const BES_REASONS: VarDef[] = [
  { key: 'bes_reas_nopark',   shortLabel: 'No/expensive parking',          selectedValue: 'No need to park/parking was expensive or scarce' },
  { key: 'bes_reas_exerc',    shortLabel: 'Physical exercise',             selectedValue: 'For more physical exercise' },
  { key: 'bes_reas_savetime', shortLabel: 'Save time',                     selectedValue: 'To save time' },
  { key: 'bes_reas_savemon',  shortLabel: 'Save money',                    selectedValue: 'To save money' },
  { key: 'bes_reas_ptnotavl', shortLabel: 'Transit not available',         selectedValue: 'Public transit was not available' },
  { key: 'bes_reas_ptnotconv',shortLabel: 'Transit not convenient',        selectedValue: 'Public transit was not convenient' },
  { key: 'bes_reas_vehnotavl',shortLabel: 'Vehicle not available',         selectedValue: 'Private vehicle was not available' },
  { key: 'bes_reas_joy',      shortLabel: 'Enjoyment',                     selectedValue: 'Just to enjoy the ride/try the new service' },
];
export const BES_ALTERNMODE_CATS = [
  'Walk',
  'Drive private vehicle, alone',
  'Use Uber/Lyft',
  'Drive private vehicle, with others',
  'I would not have made this trip',
  'Ride in private vehicle, with others',
  'Ride the bus',
  'Use my own bike or scooter',
  'Ride the light rail',
  'Use taxi',
];

// Sidebar nav items
export const MOBILITY_NAV = [
  { id: 'familiarity',            label: 'Familiarity & Adoption',      path: '/mobility/familiarity' },
  { id: 'ridehailing-attitudes',  label: 'Attitudes',                   path: '/mobility/ridehailing-attitudes' },
  { id: 'ridehailing-usage',      label: 'Usage Context (Trip Details)', path: '/mobility/ridehailing-usage' },
  { id: 'ridehailing-spending',   label: 'Monthly Expenditures',        path: '/mobility/ridehailing-spending' },
  { id: 'ridehailing-shared',     label: 'Shared Ridehailing Preference', path: '/mobility/ridehailing-shared' },
  { id: 'ridehailing-impact',     label: 'Impact on Other Modes',       path: '/mobility/ridehailing-impact' },
  { id: 'bikescooter-trips',      label: 'Last Trip Details',           path: '/mobility/bikescooter-trips' },
  { id: 'bikescooter-reasons',    label: 'Reasons for Using Service',   path: '/mobility/bikescooter-reasons' },
  { id: 'bikescooter-alternative',label: 'Alternative Mode',            path: '/mobility/bikescooter-alternative' },
];
