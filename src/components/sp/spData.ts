/* ── Section 4: Stated Preference Experiments — all data definitions ── */

export interface VarDef {
  key: string;
  shortLabel: string;
  fullQuestion?: string;
}

// ── Sidebar navigation ────────────────────────────────────────
export const SP_NAV = [
  { id: 'private-shared', label: 'Private vs Shared Ridehailing',           path: '/sp/private-shared' },
  { id: 'av-purchase',    label: 'AV Adoption Modality',                    path: '/sp/av-purchase' },
  { id: 'mode-ranking',   label: 'Mode Ranking by Trip Purpose',            path: '/sp/mode-ranking' },
];

// ── SP1: Ridehailing SP — Private vs. Shared ─────────────────
export const SP1_CATS         = ['Option 1: Private ridehailing', 'Option 2: Shared ridehailing'];
export const SP1_COLORS       = ['#507DBC', '#93b5e1'];
export const SP1_SHORT_LABELS = ['Private ridehailing', 'Shared ridehailing'];
export const SP1_SHORT: Record<string, string> = {
  'Option 1: Private ridehailing': 'Private ridehailing',
  'Option 2: Shared ridehailing':  'Shared ridehailing',
};

/** Exact scenario values shown in the survey instrument (Section D, Q.7).
 *  The online survey randomized attributes; these are the paper-version example values. */
export const SP1_SCENARIOS = [
  {
    purpose:     'Social/Leisure',
    privateDesc: '$18.00 / 20 min / 0 co-passengers',
    sharedDesc:  '$16.25 / 25 min / 1 co-passenger',
  },
  {
    purpose:     'Shopping',
    privateDesc: '$13.00 / 10 min / 0 co-passengers',
    sharedDesc:  '$9.75 / 13 min / 2 co-passengers',
  },
  {
    purpose:     'Work/School',
    privateDesc: '$8.00 / 20 min / 0 co-passengers',
    sharedDesc:  '$6.00 / 25 min / 3 co-passengers',
  },
];

/** Motive values in the data → normalized display label */
export const SP1_PURPOSE_NORMALIZE: Record<string, string> = {
  'Social/Leisure': 'Social/Leisure',
  'Shopping':       'Shopping',
  'Work':           'Work/School',
  'Work/school':    'Work/School',
  'School':         'Work/School',
};

/** Ordered list of purposes shown in the chart */
export const SP1_PURPOSES = ['Social/Leisure', 'Shopping', 'Work/School'];

// ── SP2: AV Purchase SP — ranking (1 = most preferred) ───────
export const SP2_RANK_CATS   = ['1', '2', '3'];
export const SP2_RANK_COLORS = ['#2ba88c', '#ead97c', '#e25b61'];
export const SP2_RANK_SHORT  = ['1st (Most Preferred)', '2nd', '3rd (Least Preferred)'];

/** Combined across both scenarios A and B — kept for reference, no longer used in chart */
export const SP2_COMBINED_VARIABLES: Array<{ shortLabel: string; keys: [string, string] }> = [
  { shortLabel: 'Buy a regular vehicle',            keys: ['SP2_Scen1_Reg_Answer', 'SP2_Scen2_Reg_Answer'] },
  { shortLabel: 'Buy an autonomous vehicle',        keys: ['SP2_Scen1_AV_Answer',  'SP2_Scen2_AV_Answer']  },
  { shortLabel: 'Use AV ridehailing (no purchase)', keys: ['SP2_Scen1_RH_Answer',  'SP2_Scen2_RH_Answer']  },
];

/** Per-scenario definitions for the interactive AV Adoption Modality section */
export const SP2_SCENARIOS = [
  {
    key:   'A',
    label: 'Scenario A',
    rankCols: {
      reg: 'SP2_Scen1_Reg_Answer_REPAIRED',
      av:  'SP2_Scen1_AV_Answer_REPAIRED',
      rh:  'SP2_Scen1_RH_Answer_REPAIRED',
    },
    attrCols: {
      reg: { fc: 'SP2_Scen1_Reg_FC', vc: 'SP2_Scen1_Reg_VC', wait: 'SP2_Scen1_Reg_Wait' },
      av:  { fc: 'SP2_Scen1_AV_FC',  vc: 'SP2_Scen1_AV_VC',  wait: 'SP2_Scen1_AV_Wait'  },
      rh:  { fc: 'SP2_Scen1_RH_FC',  vc: 'SP2_Scen1_RH_VC',  wait: 'SP2_Scen1_RH_Wait'  },
    },
  },
  {
    key:   'B',
    label: 'Scenario B',
    rankCols: {
      reg: 'SP2_Scen2_Reg_Answer_REPAIRED',
      av:  'SP2_Scen2_AV_Answer_REPAIRED',
      rh:  'SP2_Scen2_RH_Answer_REPAIRED',
    },
    attrCols: {
      reg: { fc: 'SP2_Scen2_Reg_FC', vc: 'SP2_Scen2_Reg_VC', wait: 'SP2_Scen2_Reg_Wait' },
      av:  { fc: 'SP2_Scen2_AV_FC',  vc: 'SP2_Scen2_AV_VC',  wait: 'SP2_Scen2_AV_Wait'  },
      rh:  { fc: 'SP2_Scen2_RH_FC',  vc: 'SP2_Scen2_RH_VC',  wait: 'SP2_Scen2_RH_Wait'  },
    },
  },
] as const;

export type SP2ScenarioKey = typeof SP2_SCENARIOS[number]['key'];

/** Shared option labels for the AV adoption ranking chart */
export const SP2_OPTION_LABELS = {
  reg: 'Buy a regular vehicle',
  av:  'Buy an autonomous vehicle',
  rh:  'Use AV ridehailing (no purchase)',
} as const;

// ── SP-Rank: 7-Mode Ranking (1 = most preferred, 7 = least) ──
export const SP_RANK_CATS   = ['1', '2', '3', '4', '5', '6', '7'];
export const SP_RANK_COLORS = ['#2ba88c', '#7ec8a0', '#b8dfc5', '#ead97c', '#f5a36a', '#e87d6e', '#e25b61'];
export const SP_RANK_SHORT  = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];

export const SP_RANK_VARIABLES: VarDef[] = [
  { key: 'SP_Rank_Final_Car',          shortLabel: 'Regular car (drive yourself)',  fullQuestion: 'Regular car (drive yourself)' },
  { key: 'SP_Rank_Final_Bike',         shortLabel: 'Bike',                          fullQuestion: 'Bike' },
  { key: 'SP_Rank_Final_Transit',      shortLabel: 'Transit',                       fullQuestion: 'Transit' },
  { key: 'SP_Rank_Final_NoAV_Private', shortLabel: 'Non-AV ridehailing (private)',  fullQuestion: 'Non-AV ridehailing (private)' },
  { key: 'SP_Rank_Final_NoAV_Shared',  shortLabel: 'Non-AV ridehailing (shared)',   fullQuestion: 'Non-AV ridehailing (shared)' },
  { key: 'SP_Rank_Final_AV_Private',   shortLabel: 'AV ridehailing (private)',      fullQuestion: 'AV ridehailing (private)' },
  { key: 'SP_Rank_Final_AV_Shared',    shortLabel: 'AV ridehailing (shared)',       fullQuestion: 'AV ridehailing (shared)' },
];

/** Airport trips had only 6 alternatives — Bike was not offered */
export const SP_RANK_AIRPORT_VARIABLES = SP_RANK_VARIABLES.filter(v => v.key !== 'SP_Rank_Final_Bike');

/** The 4 trip purposes used in the mode-ranking experiment */
export const SP_RANK_PURPOSES = [
  { key: 'food',     match: 'food',    label: 'Going out to eat (restaurant/diner)' },
  { key: 'friends',  match: 'friends', label: 'Spending time with friends' },
  { key: 'shopping', match: 'mall',    label: 'Going to a mall (shopping)' },
  { key: 'airport',  match: 'airport', label: 'Going to the airport' },
];

/** Dropdown options for the interactive mode-ranking section.
 *  csvMatch is a lowercase substring present in SP_Rank_Purpose_str. */
export const SP_RANK_DROPDOWN_OPTIONS = [
  {
    key:       'dining',
    label:     'Dining',
    csvMatch:  'food',
    scenarioText: 'Suppose you are going out to get food (e.g., dinner at a restaurant or breakfast at a diner).',
    numAlts:   7,
  },
  {
    key:       'social',
    label:     'Social',
    csvMatch:  'friends',
    scenarioText: 'Suppose you are going out to spend some time with your friends (e.g., going to their house or to a bar).',
    numAlts:   7,
  },
  {
    key:       'shopping',
    label:     'Shopping',
    csvMatch:  'mall',
    scenarioText: 'Suppose you are going to a mall to do some shopping (e.g., to purchase clothes, books, etc).',
    numAlts:   7,
  },
  {
    key:       'airport',
    label:     'Airport',
    csvMatch:  'airport',
    scenarioText: 'Suppose you are going to the airport.',
    numAlts:   6,
  },
] as const;

export type RankPurposeKey = typeof SP_RANK_DROPDOWN_OPTIONS[number]['key'];

/** Attribute column definitions for the mode attribute table */
export const SP_RANK_ATTR_MODES = [
  {
    label:   'Regular car (drive yourself)',
    wtCol:   'SP_Rank_Final_CarWT',
    ivttCol: 'SP_Rank_Final_CarIVTT',
    costCol: 'SP_Rank_Final_CarCost',
    isBike:  false,
  },
  {
    label:   'Bike',
    wtCol:   'SP_Rank_Final_BikeWT',
    ivttCol: 'SP_Rank_Final_BikeIVTT',
    costCol: 'SP_Rank_Final_BikeCost',
    isBike:  true,
  },
  {
    label:   'Transit',
    wtCol:   'SP_Rank_Final_TransitWT',
    ivttCol: 'SP_Rank_Final_TransitIVTT',
    costCol: 'SP_Rank_Final_TransitCost',
    isBike:  false,
  },
  {
    label:   'Non-AV ridehailing (private)',
    wtCol:   'SP_Rank_Final_NoAV_Private_RH_WT',
    ivttCol: 'SP_Rank_Final_NoAV_Private_RH_IVTT',
    costCol: 'SP_Rank_Final_NoAV_Private_RH_Cost',
    isBike:  false,
  },
  {
    label:   'Non-AV ridehailing (shared)',
    wtCol:   'SP_Rank_Final_NoAV_Shared_RH_WT',
    ivttCol: 'SP_Rank_Final_NoAV_Shared_RH_IVTT',
    costCol: 'SP_Rank_Final_NoAV_Shared_RH_Cost',
    isBike:  false,
  },
  {
    label:   'AV ridehailing (private)',
    wtCol:   'SP_Rank_Final_AV_Private_RH_WT',
    ivttCol: 'SP_Rank_Final_AV_Private_RH_IVTT',
    costCol: 'SP_Rank_Final_AV_Private_RH_Cost',
    isBike:  false,
  },
  {
    label:   'AV ridehailing (shared)',
    wtCol:   'SP_Rank_Final_AV_Shared_RH_WT',
    ivttCol: 'SP_Rank_Final_AV_Shared_RH_IVTT',
    costCol: 'SP_Rank_Final_AV_Shared_RH_Cost',
    isBike:  false,
  },
];
