import React from 'react';

const About: React.FC = () => (
  <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#333', marginBottom: 12 }}>About This Dashboard</h1>
    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>
      The <strong>T4 Survey Dashboard</strong> presents results from a large-scale attitudinal survey
      conducted as part of the T4 (Transportation for Tomorrow) research project. The survey was
      administered at four universities across the United States: Arizona State University (Phoenix),
      Georgia Tech (Atlanta), University of South Florida (Tampa), and University of Texas at Austin.
    </p>
    <h2 style={{ fontSize: 17, fontWeight: 600, color: '#333', marginBottom: 8 }}>Data</h2>
    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>
      The dataset includes 3,465 respondents and covers 7 attitude clusters measured using 5-point
      Likert scales (1 = Strongly Disagree, 5 = Strongly Agree). Respondents can be filtered by metro
      area, gender, and age group.
    </p>
    <h2 style={{ fontSize: 17, fontWeight: 600, color: '#333', marginBottom: 8 }}>Visualization</h2>
    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>
      Charts use regular 0–100% stacked bar format with the following color scheme:
    </p>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
      {[
        { color: '#e25b61', label: 'Strongly Disagree' },
        { color: '#f0b3ba', label: 'Somewhat Disagree' },
        { color: '#ead97c', label: 'Neutral' },
        { color: '#93c4b9', label: 'Somewhat Agree' },
        { color: '#2ba88c', label: 'Strongly Agree' },
      ].map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, background: s.color, borderRadius: 3 }} />
          <span style={{ fontSize: 13, color: '#444' }}>{s.label}</span>
        </div>
      ))}
    </div>
    <h2 style={{ fontSize: 17, fontWeight: 600, color: '#333', marginBottom: 8 }}>Technical Notes</h2>
    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>
      Built with React 18, TypeScript, D3.js v7, react-select v5, and FontAwesome icons.
      Responses marked as "Seen but not answered" are excluded from calculations.
      All percentage calculations use only valid responses.
    </p>
  </div>
);

export default About;
