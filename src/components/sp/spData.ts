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
export const SP1_CATS = ['Option 1: Private ridehailing', 'Option 2: Shared ridehailing'];
export const SP1_SHORT: Record<string, string> = {
  'Option 1: Private ridehailing': 'Private ridehailing',
  'Option 2: Shared ridehailing':  'Shared ridehailing',
};

export const SP1_SCENARIOS: VarDef[] = [
  { key: 'SP1_Scen1_Answer', shortLabel: 'Scenario 1', fullQuestion: 'Scenario 1' },
  { key: 'SP1_Scen2_Answer', shortLabel: 'Scenario 2', fullQuestion: 'Scenario 2' },
  { key: 'SP1_Scen3_Answer', shortLabel: 'Scenario 3', fullQuestion: 'Scenario 3' },
];

// ── SP2: AV Purchase SP — ranking (1 = most preferred) ───────
export const SP2_RANK_CATS   = ['1', '2', '3'];
export const SP2_RANK_COLORS = ['#2ba88c', '#ead97c', '#e25b61'];
export const SP2_RANK_SHORT  = ['1st (Most Preferred)', '2nd', '3rd (Least Preferred)'];

export const SP2_SCEN1_VARIABLES: VarDef[] = [
  { key: 'SP2_Scen1_Reg_Answer', shortLabel: 'Regular vehicle',   fullQuestion: 'Buy a regular vehicle (Scenario 1)' },
  { key: 'SP2_Scen1_AV_Answer',  shortLabel: 'Autonomous vehicle', fullQuestion: 'Buy an autonomous vehicle (Scenario 1)' },
  { key: 'SP2_Scen1_RH_Answer',  shortLabel: 'AV ridehailing',     fullQuestion: 'Use AV ridehailing (Scenario 1)' },
];

export const SP2_SCEN2_VARIABLES: VarDef[] = [
  { key: 'SP2_Scen2_Reg_Answer', shortLabel: 'Regular vehicle',   fullQuestion: 'Buy a regular vehicle (Scenario 2)' },
  { key: 'SP2_Scen2_AV_Answer',  shortLabel: 'Autonomous vehicle', fullQuestion: 'Buy an autonomous vehicle (Scenario 2)' },
  { key: 'SP2_Scen2_RH_Answer',  shortLabel: 'AV ridehailing',     fullQuestion: 'Use AV ridehailing (Scenario 2)' },
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
