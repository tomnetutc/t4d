import React from 'react';
import { useNavigate } from 'react-router-dom';

const CLUSTERS = [
  { id: 'environmental', name: 'Environmental Attitudes',              desc: 'Gas tax, pollution reduction, eco-friendly lifestyle' },
  { id: 'residential',   name: 'Residential Preferences',             desc: 'Mixed-use neighborhoods, transit proximity, housing tradeoffs' },
  { id: 'personality',   name: 'Personality & Social Comfort',        desc: 'Shopping preferences, task focus, openness to new things' },
  { id: 'technology',    name: 'Technology Savviness & Connectivity', desc: 'Early adoption, tech frustration, connectivity, privacy' },
  { id: 'transportation',name: 'General Transportation Attitudes',    desc: 'Public transit, congestion, driving alternatives' },
  { id: 'driving',       name: 'Driving & Car Ownership',             desc: 'Car ownership, driving preference, car sharing' },
  { id: 'time',          name: 'Time Sensitivity',                    desc: 'Travel time use, busyness, waiting as a transition' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#333', marginBottom: 8 }}>
        T4 Survey Dashboard
      </h1>
      <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, marginBottom: 36 }}>
        Explore attitudes, preferences, and travel behavior from the T4 survey — a multi-city study
        conducted across ASU (Phoenix), GT (Atlanta), USF (Tampa), and UT (Austin).
        This dashboard visualizes Likert-scale responses across 7 attitude clusters using
        CARE-style stacked bar charts with demographic filters.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 16 }}>
        Attitude Clusters
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {CLUSTERS.map(c => (
          <div
            key={c.id}
            onClick={() => navigate(`/attitudes/${c.id}`)}
            style={{
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              padding: '18px 20px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'box-shadow 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,123,255,0.12)';
              (e.currentTarget as HTMLDivElement).style.borderColor = '#007bff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
              (e.currentTarget as HTMLDivElement).style.borderColor = '#e0e0e0';
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#007bff', marginBottom: 6 }}>{c.name}</div>
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
