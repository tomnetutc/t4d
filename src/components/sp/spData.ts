/* ── Section 4: Stated Preference Experiments — all data definitions ── */

export interface VarDef {
  key: string;
  shortLabel: string;
  fullQuestion?: string;
}

// ── Sidebar navigation ────────────────────────────────────────
export const SP_NAV = [
  { id: 'private-shared', label: 'Private vs. Shared Choice',              path: '/sp/private-shared' },
  { id: 'av-purchase',    label: 'Buy Regular vs. AV vs. AV Ridehailing',  path: '/sp/av-purchase' },
  { id: 'mode-ranking',   label: '7-Mode Ranking',                          path: '/sp/mode-ranking' },
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

/** Combined across both scenarios A and B — each entry lists the two column keys to merge */
export const SP2_COMBINED_VARIABLES: Array<{ shortLabel: string; keys: [string, string] }> = [
  { shortLabel: 'Buy a regular vehicle',       keys: ['SP2_Scen1_Reg_Answer', 'SP2_Scen2_Reg_Answer'] },
  { shortLabel: 'Buy an autonomous vehicle',   keys: ['SP2_Scen1_AV_Answer',  'SP2_Scen2_AV_Answer']  },
  { shortLabel: 'Use AV ridehailing (no purchase)', keys: ['SP2_Scen1_RH_Answer',  'SP2_Scen2_RH_Answer']  },
];

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
