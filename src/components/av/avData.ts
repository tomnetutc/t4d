/* ── Section 3: Autonomous Vehicles — all data definitions ── */

export interface VarDef {
  key: string;
  shortLabel: string;
  fullQuestion?: string;
  selectedValue?: string;
}

// ── Sidebar navigation ───────────────────────────────────────
export const AV_NAV = [
  { id: 'familiarity',          label: 'Familiarity',                        path: '/av/familiarity' },
  { id: 'purchase-wtp',         label: 'AV Purchase & WTP',                  path: '/av/purchase-wtp' },
  { id: 'attitudes',            label: 'Attitudes & Perceptions',             path: '/av/attitudes' },
  { id: 'safety-policy',        label: 'Safety & Policy Related Attitudes',   path: '/av/safety-policy' },
  { id: 'ridehailing-attitudes',label: 'AV Ridehailing Attitudes',            path: '/av/ridehailing-attitudes' },
  { id: 'vehicle-ownership',    label: 'AV Impact on Vehicle Ownership',      path: '/av/vehicle-ownership' },
  { id: 'mode-choice',          label: 'AV Impact on Mode Choice',            path: '/av/mode-choice' },
  { id: 'commute',              label: 'AV & Commute',                        path: '/av/commute' },
  { id: 'travel-experiences',   label: 'Expected Travel Experiences',         path: '/av/travel-experiences' },
  { id: 'lifestyle-changes',    label: 'Anticipated Changes in Lifestyles',   path: '/av/lifestyle-changes' },
];

// ── E1: AV Familiarity (categorical) ────────────────────────
export const AV_FAMILIARITY_CATS = [
  'I had never heard of AVs before taking this survey.',
  "I have heard of AVs, but don't know much about them.",
  'I am somewhat familiar with AVs.',
  'I am very familiar with AVs.',
  'I have actually taken a ride in an AV.',
];
export const AV_FAMILIARITY_SHORT: Record<string, string> = {
  'I had never heard of AVs before taking this survey.':    'Never heard of AVs',
  "I have heard of AVs, but don't know much about them.":   "Heard, don't know much",
  'I am somewhat familiar with AVs.':                        'Somewhat familiar',
  'I am very familiar with AVs.':                            'Very familiar',
  'I have actually taken a ride in an AV.':                  'Have ridden in one',
};

// ── E5: Purchase Intentions (categorical) ───────────────────
export const AV_TIMEPURCHASE_CATS = [
  'I will be one of the first people to buy an AV.',
  'I will eventually buy an AV, but only after these vehicles are in common use.',
  'I will never buy an AV.',
];

// ── E6: Willingness to Pay (categorical) ────────────────────
export const AV_WILLPAY_CATS = [
  'I would NOT be willing to pay any additional amount for the autonomous version of the vehicle',
  'Up to $1,000 more',
  'Between $1,000 and $3,000 more',
  'Between $3,000 and $5,000 more',
  'Between $5,000 and $8,000 more',
  'Greater than $8,000 more',
];

// ── E2: General AV Attitudes (standard 5-pt Likert) ─────────
export const AV_ATT_VARIABLES: VarDef[] = [
  { key: 'av_att_avimpaired',  shortLabel: 'Use AV when impaired',       fullQuestion: 'I would use an AV to avoid driving when impaired.' },
  { key: 'av_att_joydriving',  shortLabel: 'Enjoy driving too much',      fullQuestion: 'I enjoy driving too much to ever give it up to an AV.' },
  { key: 'av_att_saferped',    shortLabel: 'Safer for pedestrians',       fullQuestion: 'AVs will be safer for pedestrians than human-driven vehicles.' },
  { key: 'av_att_children',    shortLabel: 'Comfortable with children',   fullQuestion: 'I would be comfortable sending my children in an AV without an adult present.' },
  { key: 'av_att_equipfail',   shortLabel: 'Concerned about equipment',   fullQuestion: 'I am concerned about AV equipment failures.' },
  { key: 'av_att_carstress',   shortLabel: 'Reduce driving stress',       fullQuestion: 'An AV would reduce the stress of my car trips.' },
  { key: 'av_att_sleep',       shortLabel: 'Could sleep in AV',           fullQuestion: 'I could sleep while an AV drives me to my destination.' },
  { key: 'av_att_longdist',    shortLabel: 'Good for long distance',      fullQuestion: 'I would use an AV for long-distance trips.' },
  { key: 'av_att_dataleak',    shortLabel: 'Concerned about data/privacy',fullQuestion: 'I am concerned about data leaks from AVs.' },
  { key: 'av_att_errands',     shortLabel: 'Run errands without me',      fullQuestion: 'An AV could run errands for me without me being in the vehicle.' },
  { key: 'av_att_neverride',   shortLabel: 'Would never ride in AV',      fullQuestion: 'I would never ride in an AV.' },
  { key: 'av_att_takecontrol', shortLabel: 'Want to take control',        fullQuestion: 'I want the ability to take control of an AV at any time.' },
  { key: 'av_att_hhshare',     shortLabel: 'Household could share one AV',fullQuestion: 'My household could share one AV among all members.' },
  { key: 'av_att_savetime',    shortLabel: 'AV would save time',          fullQuestion: 'Having an AV would save me time.' },
];

// ── E10: Safety & Policy Attitudes (standard 5-pt Likert) ───
export const AV_POLICY_VARIABLES: VarDef[] = [
  { key: 'av_att_saferhuman',      shortLabel: 'Should be safer than humans',      fullQuestion: 'AVs should be required to be safer than human drivers before being sold.' },
  { key: 'av_att_safepriorpedest', shortLabel: 'Prioritize pedestrian safety',     fullQuestion: 'AVs should prioritize pedestrian safety above vehicle occupant safety.' },
  { key: 'av_att_safepriorchoice', shortLabel: 'Owner programs safety choices',    fullQuestion: 'AV owners should be able to program their own safety priorities.' },
  { key: 'av_att_speedlaw',        shortLabel: 'Always follow speed laws',         fullQuestion: 'AVs should always be required to follow speed laws.' },
  { key: 'av_att_liability',       shortLabel: 'Manufacturer liability',           fullQuestion: 'Manufacturers should be liable for crashes caused by AV technology.' },
  { key: 'av_att_dedicatedlane',   shortLabel: 'Dedicated AV lanes',              fullQuestion: 'AVs should have dedicated lanes on roads and highways.' },
];

// ── E7: AV Ridehailing Attitudes (standard 5-pt Likert) ─────
export const AV_RH_VARIABLES: VarDef[] = [
  { key: 'av_rh_privateride',  shortLabel: 'Use AV ridehailing alone',       fullQuestion: 'I would use an AV ridehailing service for private rides (alone or with people I know).' },
  { key: 'av_rh_sharedride',   shortLabel: 'Use shared AV ridehailing',      fullQuestion: 'I would use a shared AV ridehailing service (matched with strangers).' },
  { key: 'av_rh_backupdriver', shortLabel: 'Prefer backup driver',           fullQuestion: 'AV ridehailing vehicles should always have a backup driver present.' },
  { key: 'av_rh_lease',        shortLabel: 'Lease personal AV to fleet',     fullQuestion: 'I would lease my personal AV to a ridehailing fleet when I am not using it.' },
];

// ── E8: Vehicle Ownership Change (categorical) ───────────────
export const AV_CHANGE_OWN_CATS = [
  'Likely own fewer cars than today',
  'Likely own the same number of cars as today',
  'Likely own more cars than today',
];

// ── E9: Mode Choice Impact (3-pt change scale) ───────────────
export const AV_MODECHANGE_CATS = ['Use Less', 'Use the Same', 'Use More'];
export const AV_MODECHANGE_COLORS = ['#e25b61', '#ead97c', '#2ba88c'];
export const AV_MODECHANGE_SHORT = ['Use Less', 'Use the Same', 'Use More']; // already full labels

export const AV_MODECHANGE_VARIABLES: VarDef[] = [
  { key: 'av_change_privateveh', shortLabel: 'Private vehicle',         fullQuestion: 'Private vehicle (drive yourself)' },
  { key: 'av_change_humrh',      shortLabel: 'Human-driven ridehailing', fullQuestion: 'Human-driven ridehailing (e.g., Uber, Lyft)' },
  { key: 'av_change_bus',        shortLabel: 'Bus',                     fullQuestion: 'Riding the bus' },
  { key: 'av_change_lightrail',  shortLabel: 'Light rail',              fullQuestion: 'Riding light rail' },
  { key: 'av_change_walk',       shortLabel: 'Walking',                 fullQuestion: 'Walking' },
  { key: 'av_change_bikescoot',  shortLabel: 'Bike / scooter',          fullQuestion: 'Riding a bike or scooter' },
  { key: 'av_change_plane',      shortLabel: 'Airplane',                fullQuestion: 'Flying (airplane)' },
];

// ── E3: Commute Time Tolerance (categorical) ─────────────────
export const AV_COMMUTE_CATS = [
  'I would not accept a longer commute even when I have access to an AV',
  'Up to 5 additional minutes (one way)',
  'Between 5 and 15 additional minutes (one way)',
  'Between 15 and 30 additional minutes (one way)',
  'More than 30 additional minutes (one way)',
];
export const AV_COMMUTE_SHORT: Record<string, string> = {
  'I would not accept a longer commute even when I have access to an AV': 'No additional time',
  'Up to 5 additional minutes (one way)':                                  'Up to 5 min',
  'Between 5 and 15 additional minutes (one way)':                         '5–15 min',
  'Between 15 and 30 additional minutes (one way)':                        '15–30 min',
  'More than 30 additional minutes (one way)':                             '30+ min',
};

// ── E12: Multitasking / Activities (binary multi-select) ─────
export const AV_MULTI_VARIABLES: VarDef[] = [
  { key: 'av_multi_work',      shortLabel: 'Work / study',                   selectedValue: 'Work, or study' },
  { key: 'av_multi_phone',     shortLabel: 'Phone / text / teleconference',   selectedValue: 'Talk on the phone/ send or read text messages/teleconference' },
  { key: 'av_multi_read',      shortLabel: 'Read',                            selectedValue: 'Read' },
  { key: 'av_multi_sleep',     shortLabel: 'Sleep',                           selectedValue: 'Sleep' },
  { key: 'av_multi_tv',        shortLabel: 'Watch movies / TV',               selectedValue: 'Watch movies/ TV/ other entertainment' },
  { key: 'av_multi_games',     shortLabel: 'Play games',                      selectedValue: 'Play games' },
  { key: 'av_multi_eatdrink',  shortLabel: 'Eat / drink',                     selectedValue: 'Eat and drink' },
  { key: 'av_multi_interpass', shortLabel: 'Interact with passengers',         selectedValue: 'Interact with other passengers' },
  { key: 'av_multi_scenery',   shortLabel: 'Enjoy scenery',                   selectedValue: 'Enjoy the scenery' },
  { key: 'av_multi_watchroad', shortLabel: 'Watch the road',                  selectedValue: 'Watch the road, even though I would not be driving' },
  { key: 'av_multi_noav',      shortLabel: 'Would not ride in AV',            selectedValue: 'I would not ride in an AV' },
];

// ── E4: Anticipated Lifestyle Changes (5-pt likelihood) ──────
export const AV_LIFESTYLE_CATS = [
  'Very unlikely', 'Somewhat unlikely', 'Neutral', 'Somewhat likely', 'Very likely',
];
export const AV_LIFESTYLE_COLORS = ['#e25b61', '#f0b3ba', '#ead97c', '#93c4b9', '#2ba88c'];
export const AV_LIFESTYLE_SHORT = ['Very unlikely', 'Somewhat unlikely', 'Neutral', 'Somewhat likely', 'Very likely'];

export const AV_LIFESTYLE_VARIABLES: VarDef[] = [
  { key: 'av_change_makemoretrips',    shortLabel: 'Make more trips',                fullQuestion: 'I would make more trips overall.' },
  { key: 'av_change_travfar_eatshop',  shortLabel: 'Travel farther (eating/shopping)',fullQuestion: 'I would travel farther for eating/shopping destinations.' },
  { key: 'av_change_travfar_social',   shortLabel: 'Travel farther (social/rec.)',    fullQuestion: 'I would travel farther for social/recreational activities.' },
  { key: 'av_change_travaftdark',      shortLabel: 'Travel more after dark',          fullQuestion: 'I would travel more after dark.' },
  { key: 'av_change_longdist',         shortLabel: 'More long-distance trips',        fullQuestion: 'I would take more long-distance trips.' },
  { key: 'av_change_travpeakhr',       shortLabel: 'Travel more at peak hours',       fullQuestion: 'I would travel more during peak hours.' },
  { key: 'av_change_homeloc',          shortLabel: 'Consider relocating home',        fullQuestion: 'I would consider changing where I live.' },
  { key: 'av_change_wrkloc',           shortLabel: 'Consider relocating work',        fullQuestion: 'I would consider changing where I work.' },
  { key: 'av_change_congtol',          shortLabel: 'Tolerate more congestion',        fullQuestion: 'I would tolerate more traffic congestion.' },
];
