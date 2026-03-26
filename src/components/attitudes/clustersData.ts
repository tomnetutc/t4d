export interface VariableDef {
  key: string;
  shortLabel: string;
  fullQuestion: string;
}

export interface ClusterDef {
  id: string;
  name: string;
  variables: VariableDef[];
}

export const CLUSTERS: ClusterDef[] = [
  {
    id: 'environmental',
    name: 'Environmental Attitudes',
    variables: [
      {
        key: 'att_gastax',
        shortLabel: 'Raise gas tax for environment',
        fullQuestion: 'The government should raise the gas tax to help reduce the negative impacts of transportation on the environment.',
      },
      {
        key: 'att_lesspol',
        shortLabel: 'Use less polluting transport',
        fullQuestion: 'I am committed to using a less polluting means of transportation (e.g., walking, biking, and public transit) as much as possible.',
      },
      {
        key: 'att_environfriend',
        shortLabel: 'Environmentally-friendly lifestyle',
        fullQuestion: 'I am committed to an environmentally-friendly lifestyle.',
      },
    ],
  },
  {
    id: 'residential',
    name: 'Residential Preferences',
    variables: [
      {
        key: 'att_mixuse',
        shortLabel: 'Mixed-use neighborhood',
        fullQuestion: 'I like the idea of having stores, restaurants, and offices mixed among the homes in my neighborhood.',
      },
      {
        key: 'att_closetransit',
        shortLabel: 'Live close to transit',
        fullQuestion: "I prefer to live close to transit, even if it means I'll have a smaller home and live in a more densely populated area.",
      },
      {
        key: 'att_spachome',
        shortLabel: 'Spacious home over transit access',
        fullQuestion: 'I prefer to live in a spacious home, even if it is farther from public transportation or many places I go.',
      },
    ],
  },
  {
    id: 'personality',
    name: 'Personality & Social Comfort',
    variables: [
      {
        key: 'att_shopstore',
        shortLabel: 'Shop in-store over online',
        fullQuestion: 'I prefer to shop in a store rather than online.',
      },
      {
        key: 'att_onething',
        shortLabel: 'Prefer one task at a time',
        fullQuestion: 'I prefer to do one thing at a time.',
      },
      {
        key: 'att_newanddif',
        shortLabel: 'Like new and different things',
        fullQuestion: 'I like trying things that are new and different.',
      },
      {
        key: 'att_uncomf',
        shortLabel: 'Uncomfortable around strangers',
        fullQuestion: 'I feel uncomfortable around people I do not know.',
      },
    ],
  },
  {
    id: 'technology',
    name: 'Technology Savviness & Connectivity',
    variables: [
      {
        key: 'att_firsttech',
        shortLabel: 'Early technology adopter',
        fullQuestion: 'I like to be among the first people to have the latest technology.',
      },
      {
        key: 'att_techfrus',
        shortLabel: 'Frustrated by new technology',
        fullQuestion: 'Learning how to use new technologies is often frustrating for me.',
      },
      {
        key: 'att_intercon',
        shortLabel: 'Internet connectivity important',
        fullQuestion: 'Having internet connectivity everywhere I go is important to me.',
      },
      {
        key: 'att_sharperinfo',
        shortLabel: 'Concerned about data privacy',
        fullQuestion: 'Sharing my personal information or location via internet-enabled devices concerns me a lot.',
      },
    ],
  },
  {
    id: 'transportation',
    name: 'General Transportation Attitudes',
    variables: [
      {
        key: 'att_pubtrans',
        shortLabel: 'Public transit is reliable',
        fullQuestion: 'Public transit is a reliable means of transportation for my daily travel needs.',
      },
      {
        key: 'att_travrout',
        shortLabel: 'Satisfied with travel routine',
        fullQuestion: 'My daily travel routine is generally satisfactory.',
      },
      {
        key: 'att_congest',
        shortLabel: 'Congestion bothers me',
        fullQuestion: 'The level of congestion during my daily travel bothers me.',
      },
      {
        key: 'att_alterdrive',
        shortLabel: 'No alternatives to driving',
        fullQuestion: 'Most of the time, I have no reasonable alternatives to driving.',
      },
      {
        key: 'att_motsick',
        shortLabel: 'Motion sickness while reading',
        fullQuestion: 'I tend to feel sick if I read while in a moving vehicle.',
      },
      {
        key: 'att_carcrash',
        shortLabel: 'Car crashes are unavoidable',
        fullQuestion: 'Car crash deaths are an unfortunate but unavoidable part of a modern, efficient transportation system.',
      },
    ],
  },
  {
    id: 'driving',
    name: 'Driving & Car Ownership',
    variables: [
      {
        key: 'att_carown',
        shortLabel: 'Like owning my own car',
        fullQuestion: 'I definitely like the idea of owning my own car.',
      },
      {
        key: 'att_carquality',
        shortLabel: 'Quality over brand for cars',
        fullQuestion: 'The reliability and quality of a car are more important than its brand.',
      },
      {
        key: 'att_prefdriv',
        shortLabel: 'Prefer driving over being passenger',
        fullQuestion: 'When traveling in a vehicle, I prefer to be a driver rather than a passenger.',
      },
      {
        key: 'att_rentcar',
        shortLabel: 'Fine renting car to strangers',
        fullQuestion: 'I would be fine with renting out my car to people I do not know.',
      },
    ],
  },
  {
    id: 'time',
    name: 'Time Sensitivity',
    variables: [
      {
        key: 'att_timeuse',
        shortLabel: 'Make good use of travel time',
        fullQuestion: 'I try to make good use of the time I spend traveling.',
      },
      {
        key: 'att_transtime',
        shortLabel: 'Travel time as useful transition',
        fullQuestion: 'The time spent traveling to places provides a useful transition between activities.',
      },
      {
        key: 'att_busy',
        shortLabel: 'Too busy for leisure',
        fullQuestion: 'I am too busy to do many of the things I like to do.',
      },
      {
        key: 'att_wait',
        shortLabel: 'Waiting as useful pause',
        fullQuestion: 'Having to wait can be a useful pause in a busy day.',
      },
    ],
  },
];

export const CLUSTER_BY_ID: Record<string, ClusterDef> = Object.fromEntries(
  CLUSTERS.map(c => [c.id, c])
);
