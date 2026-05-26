import React from 'react';
import { useNavigate } from 'react-router-dom';

const AttitudesIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#005f9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a7 7 0 0 1 7 7c0 3-1.8 5.6-4.4 6.8V18h-2v2h2v2h-4v-2h2v-2h-.6C9.2 17.3 5 14.4 5 9a7 7 0 0 1 7-7z"/>
    <circle cx="15" cy="6" r="1" fill="#005f9e" stroke="none"/>
  </svg>
);

const HouseholdIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#005f9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const TravelIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#005f9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const MobilityIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#005f9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
    <path d="M9 6h6M9 10h6M9 14h4"/>
  </svg>
);

const AVIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#005f9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
    <circle cx="8.5" cy="10" r="1.5" fill="#005f9e" stroke="none"/>
    <circle cx="15.5" cy="10" r="1.5" fill="#005f9e" stroke="none"/>
  </svg>
);

const SPIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#005f9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const SECTIONS = [
  {
    id: 'attitudes',
    path: '/attitudes/environmental',
    icon: <AttitudesIcon />,
    title: 'General Attitudes & Preferences',
    desc: 'Lifestyle attitudes on technology, environment, privacy, and transit — 28 Likert-scale statements capturing how values shape travel choices.',
    tag: '28 attitude variables',
  },
  {
    id: 'household',
    path: '/household/licensing-ownership',
    icon: <HouseholdIcon />,
    title: 'Household Vehicles & Residential',
    desc: 'Vehicle ownership counts, ADAS feature adoption, driver license status, and residential location preferences relative to transit access.',
    tag: 'Vehicles · Housing',
  },
  {
    id: 'travel',
    path: '/travel/commute-patterns',
    icon: <TravelIcon />,
    title: 'Current Travel Patterns',
    desc: 'Commute mode and frequency, long-distance travel habits, telework adoption, and delivery service usage across all four cities.',
    tag: 'Commute · Modes',
  },
  {
    id: 'mobility',
    path: '/mobility/familiarity',
    icon: <MobilityIcon />,
    title: 'Mobility on Demand',
    desc: 'Ridehailing (Uber/Lyft), carsharing, bikesharing, and e-scooter familiarity, usage frequency, and adoption barriers.',
    tag: 'Ridehailing · Sharing',
  },
  {
    id: 'av',
    path: '/av/familiarity',
    icon: <AVIcon />,
    title: 'Autonomous Vehicles',
    desc: 'AV awareness, comfort levels, safety perceptions, willingness to pay, and expected lifestyle changes from full autonomy.',
    tag: 'AV · Autonomy',
  },
  {
    id: 'sp',
    path: '/sp/private-shared',
    icon: <SPIcon />,
    title: 'Stated Preference Experiments',
    desc: 'Four discrete choice experiments: private vs. shared ridehailing, AV adoption modality, in-vehicle activity preferences during AV rides, and mode ranking for social trips.',
    tag: '4 experiments',
  },
];

const STAT_CHIPS = [
  { value: '3,465', label: 'Valid Responses',   sub: 'Full deployment · 2019' },
  { value: '4',     label: 'U.S. Cities',       sub: 'Phoenix · Atlanta · Austin · Tampa' },
  { value: '262',   label: 'Pilot Responses',   sub: 'Phoenix · Fall 2018' },
];

const RidehailingGoalIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#005f9e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
    <rect x="9" y="11" width="14" height="10" rx="2"/>
    <circle cx="12" cy="21" r="1" fill="#005f9e" stroke="none"/>
    <circle cx="20" cy="21" r="1" fill="#005f9e" stroke="none"/>
    <path d="M9 15h2l1-3h5l1 3h2"/>
  </svg>
);

const AVGoalIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#005f9e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="3" x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="5" y2="12"/>
    <line x1="19" y1="12" x2="21" y2="12"/>
    <line x1="5.64" y1="5.64" x2="7.05" y2="7.05"/>
    <line x1="16.95" y1="16.95" x2="18.36" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="16.95" y2="7.05"/>
    <line x1="7.05" y1="16.95" x2="5.64" y2="18.36"/>
  </svg>
);

const SPGoalIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#005f9e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="M7 16l4-4 4 4 4-6"/>
    <circle cx="7" cy="16" r="1.2" fill="#005f9e" stroke="none"/>
    <circle cx="11" cy="12" r="1.2" fill="#005f9e" stroke="none"/>
    <circle cx="15" cy="16" r="1.2" fill="#005f9e" stroke="none"/>
    <circle cx="19" cy="10" r="1.2" fill="#005f9e" stroke="none"/>
  </svg>
);

const CityGoalIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#005f9e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="8" height="15" rx="1"/>
    <rect x="10" y="3" width="8" height="19" rx="1"/>
    <rect x="18" y="10" width="4" height="12" rx="1"/>
    <line x1="4" y1="10" x2="4" y2="10.01"/>
    <line x1="4" y1="13" x2="4" y2="13.01"/>
    <line x1="4" y1="16" x2="4" y2="16.01"/>
    <line x1="13" y1="7" x2="13" y2="7.01"/>
    <line x1="13" y1="11" x2="13" y2="11.01"/>
    <line x1="13" y1="15" x2="13" y2="15.01"/>
  </svg>
);

const GOALS = [
  {
    icon: <RidehailingGoalIcon />,
    title: 'Ridehailing & Shared Mobility',
    body: 'Understand who uses ridehailing services, how often, and what drives adoption or avoidance across demographic groups.',
  },
  {
    icon: <AVGoalIcon />,
    title: 'Autonomous Vehicle Readiness',
    body: 'Gauge public familiarity, safety perceptions, and willingness to adopt AVs across different ownership and usage scenarios.',
  },
  {
    icon: <SPGoalIcon />,
    title: 'Stated Preference Modeling',
    body: 'Elicit trade-off decisions through designed choice experiments to calibrate future demand models for new mobility options.',
  },
  {
    icon: <CityGoalIcon />,
    title: 'Cross-City Comparison',
    body: 'Compare attitudes and behaviors across four geographically and demographically diverse U.S. cities to find regional differences.',
  },
];

const IMPACT = [
  { value: '3',   label: 'Annual Reports' },
  { value: '13+', label: 'Conference Papers' },
  { value: '11',  label: 'Webinar Episodes' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 28px 60px' }}>

      {/* Hero band */}
      <div style={{
        background: '#005f9e',
        borderRadius: 14,
        padding: '32px 32px 28px',
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 40, bottom: -60,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.15)',
          border: '0.5px solid rgba(255,255,255,0.25)',
          borderRadius: 20,
          padding: '4px 12px',
          marginBottom: 14,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', opacity: 0.9, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
            TOMNET · University Transportation Center
          </span>
        </div>

        {/* Title */}
        <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: 10 }}>
          TOMNET Transformative Transportation Technologies (T4) Survey
        </div>

        {/* Description */}
        <p style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.82)',
          lineHeight: 1.7,
          margin: '0 0 22px',
          maxWidth: '92%',
        }}>
          A large-scale multi-city survey by Arizona State University designed to capture public attitudes,
          perceptions, and stated choices toward transformative mobility services — ridehailing, carsharing,
          and autonomous vehicles. Conducted across four U.S. cities in 2018–2019, the T4 data directly
          informs transportation demand models, policy design, and planning for future mobility.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10 }}>
          {STAT_CHIPS.map(chip => (
            <div key={chip.value} style={{
              flex: 1,
              background: 'rgba(255,255,255,0.12)',
              border: '0.5px solid rgba(255,255,255,0.2)',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>{chip.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 3, fontWeight: 500 }}>{chip.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{chip.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Research Goals */}
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 12,
        padding: '16px 18px',
        marginBottom: 12,
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#9ca3af',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Research Objectives
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {GOALS.map(g => (
            <div key={g.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#eef5fb',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {g.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1a2744', marginBottom: 2 }}>{g.title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{g.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research Impact row */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 12,
      }}>
        {IMPACT.map(item => (
          <div key={item.label} style={{
            flex: 1,
            background: '#eef5fb',
            border: '0.5px solid #c8ddf0',
            borderRadius: 10,
            padding: '12px 14px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#005f9e' }}>{item.value}</div>
            <div style={{ fontSize: 11, color: '#4a7fa8', marginTop: 3, fontWeight: 500 }}>{item.label}</div>
          </div>
        ))}
        <div style={{
          flex: 2,
          background: '#eef5fb',
          border: '0.5px solid #c8ddf0',
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1a2744', marginBottom: 3 }}>
              "The ABCs of Future Mobility" Webinar Series
            </div>
            <div style={{ fontSize: 10, color: '#4a7fa8', lineHeight: 1.45 }}>
              11-episode public series presenting T4 findings to practitioners, planners, and policymakers.
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0 10px' }}>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border-tertiary)' }} />
        <span style={{
          fontSize: 11,
          fontWeight: 500,
          color: '#9ca3af',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          margin: '0 12px',
        }}>
          Explore survey sections
        </span>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border-tertiary)' }} />
      </div>

      {/* Section cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SECTIONS.map(s => (
          <div
            key={s.id}
            onClick={() => navigate(s.path)}
            style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderLeft: '3px solid #005f9e',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.background = 'var(--color-background-secondary)';
              (e.currentTarget as HTMLDivElement).style.borderColor = '#b5d4f0';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.background = 'var(--color-background-primary)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-tertiary)';
            }}
          >
            {/* Icon box */}
            <div style={{
              width: 42,
              height: 42,
              flexShrink: 0,
              background: '#eef5fb',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {s.icon}
            </div>

            {/* Card content */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2744', marginBottom: 3 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {s.desc}
              </div>
              <span style={{
                display: 'inline-block',
                fontSize: 10,
                fontWeight: 500,
                color: '#005f9e',
                background: '#eef5fb',
                borderRadius: 4,
                padding: '2px 6px',
                marginTop: 4,
              }}>
                {s.tag}
              </span>
            </div>

            {/* Chevron */}
            <div style={{ fontSize: 18, color: '#9ca3af', flexShrink: 0 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
