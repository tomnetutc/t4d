import React from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  {
    id: 'attitudes',
    path: '/attitudes/environmental',
    icon: '🌱',
    title: 'General Attitudes & Preferences',
    desc: '7 attitude clusters: environmental, residential, personality, technology, transportation, driving, and time sensitivity.',
    color: '#e8f5e9',
    borderColor: '#4caf50',
  },
  {
    id: 'mobility',
    path: '/mobility/familiarity',
    icon: '🚗',
    title: 'Mobility on Demand',
    desc: 'Familiarity with ridehailing and bike/scooter sharing, attitudes, usage patterns, spending, and mode impacts.',
    color: '#e3f2fd',
    borderColor: '#2196f3',
  },
  {
    id: 'av',
    path: '/av/familiarity',
    icon: '🤖',
    title: 'Autonomous Vehicles',
    desc: 'AV familiarity, purchase intent, willingness to pay, safety & policy attitudes, mode choice impacts, and lifestyle changes.',
    color: '#f3e5f5',
    borderColor: '#9c27b0',
  },
  {
    id: 'sp',
    path: '/sp/private-shared',
    icon: '🧪',
    title: 'Stated Preference Experiments',
    desc: 'Three SP experiments: private vs. shared ridehailing choice, AV purchase ranking, and 7-mode ranking.',
    color: '#fff8e1',
    borderColor: '#ff9800',
  },
  {
    id: 'travel',
    path: '/travel/commute-patterns',
    icon: '🗺️',
    title: 'Current Travel Patterns',
    desc: 'Commute behavior, mode frequency, driving conditions, delivery adoption, and long-distance travel.',
    color: '#e0f7fa',
    borderColor: '#00bcd4',
  },
  {
    id: 'household',
    path: '/household/licensing-ownership',
    icon: '🏠',
    title: 'Household Vehicles & Residential',
    desc: 'Driver licensing, household vehicles and drivers, vehicle fleet details, ADAS features, housing type, and home location preferences.',
    color: '#fce4ec',
    borderColor: '#e91e63',
  },
  {
    id: 'demographics',
    path: '/demographics/individual',
    icon: '👤',
    title: 'Demographics',
    desc: 'Individual attributes (gender, age, race, education), household composition, economic characteristics, and geographic distribution.',
    color: '#f1f8e9',
    borderColor: '#8bc34a',
  },
];

const STATS = [
  { value: '3,465', label: 'Respondents' },
  { value: '4', label: 'Metro Areas' },
  { value: '730', label: 'Variables' },
  { value: '2019', label: 'Data Collection Year' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px 60px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#1a1a2e', margin: '0 0 12px' }}>
          T4 Survey Dashboard
        </h1>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 28px' }}>
          Explore attitudes, travel behavior, and preferences from the T4 survey — a multi-city study
          conducted across Phoenix AZ, Atlanta GA, Austin TX, and Tampa FL as part of the TOMNET
          University Transportation Center research program.
        </p>

        {/* Stats bar */}
        <div style={{
          display: 'inline-flex',
          border: '1px solid #e0e0e0',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 8,
          background: 'white',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '16px 28px',
              borderRight: i < STATS.length - 1 ? '1px solid #e0e0e0' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#507DBC' }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: '#777', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section cards */}
      <h2 style={{ fontSize: 17, fontWeight: 600, color: '#333', marginBottom: 16 }}>
        Explore Survey Sections
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {SECTIONS.map(s => (
          <div
            key={s.id}
            onClick={() => navigate(s.path)}
            style={{
              background: s.color,
              border: `1.5px solid ${s.borderColor}`,
              borderRadius: 10,
              padding: '18px 20px',
              cursor: 'pointer',
              transition: 'transform 0.12s, box-shadow 0.12s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'none';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 40 }}>
        Use the sidebar to navigate sections. Apply demographic filters via the segment bar at the top of each section.
      </p>
    </div>
  );
};

export default Home;
