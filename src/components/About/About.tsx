import React from 'react';

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 style={{ fontSize: 18, fontWeight: 600, color: '#507DBC', marginBottom: 10, marginTop: 36, borderBottom: '2px solid #e8f0fc', paddingBottom: 6 }}>
    {children}
  </h2>
);

const HighlightBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: '#f0f7ff', border: '1px solid #c5d9f2', borderRadius: 8, padding: '14px 18px', margin: '12px 0', fontSize: 14, color: '#333', lineHeight: 1.65 }}>
    {children}
  </div>
);

const About: React.FC = () => (
  <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 32px 60px' }}>
    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>About This Dashboard</h1>
    <p style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>T4 Survey Dashboard — TOMNET University Transportation Center</p>

    {/* ── About ── */}
    <SectionHeading>About</SectionHeading>
    <p style={{ fontSize: 14, color: '#444', lineHeight: 1.75 }}>
      The <strong>T4 Survey Dashboard</strong> is an open-source interactive platform that presents results from
      the T4 attitudinal survey on transportation preferences and autonomous vehicle adoption. The survey was
      conducted as part of research supported by the <strong>TOMNET University Transportation Center</strong>,
      a University Transportation Center funded by the U.S. Department of Transportation (USDOT).
    </p>
    <p style={{ fontSize: 14, color: '#444', lineHeight: 1.75, marginTop: 10 }}>
      Developed by the TOMNET group at Arizona State University, the dashboard allows researchers,
      practitioners, and policymakers to explore how residents of four U.S. metropolitan areas view
      autonomous vehicles, ridehailing services, current travel patterns, and residential preferences.
    </p>

    {/* ── Data Source ── */}
    <SectionHeading>Data Source</SectionHeading>
    <p style={{ fontSize: 14, color: '#444', lineHeight: 1.75 }}>
      The T4 survey was administered via the Qualtrics platform to recruited online panels across four
      university metropolitan areas from <strong>June through December 2019</strong>.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, margin: '16px 0' }}>
      {[
        { city: 'Phoenix, AZ', inst: 'Arizona State University (ASU)', n: '~870' },
        { city: 'Atlanta, GA', inst: 'Georgia Tech (GT)', n: '~865' },
        { city: 'Austin, TX', inst: 'Univ. of Texas at Austin (UT)', n: '~870' },
        { city: 'Tampa, FL', inst: 'Univ. of South Florida (USF)', n: '~860' },
      ].map(c => (
        <div key={c.city} style={{ background: '#f8fafb', border: '1px solid #dde', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{c.city}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>{c.inst}</div>
        </div>
      ))}
    </div>
    <HighlightBox>
      <strong>Total respondents:</strong> 3,465 &nbsp;|&nbsp;
      <strong>Variables:</strong> 730 &nbsp;|&nbsp;
      <strong>Collection period:</strong> June–December 2019
    </HighlightBox>
    <p style={{ fontSize: 14, color: '#444', lineHeight: 1.75, marginTop: 10 }}>
      The survey covers seven major topic areas: general attitudes and preferences (7 Likert-scale clusters),
      mobility on demand services, autonomous vehicles, stated preference experiments, current travel patterns,
      household vehicles and residential preferences, and sample characteristics.
    </p>

    {/* ── Dashboard Features ── */}
    <SectionHeading>Dashboard Features</SectionHeading>
    <HighlightBox>
      <strong>Interactive Visualizations:</strong> Stacked Likert charts, horizontal bar charts, grouped bar
      charts, and pie charts for all survey sections. Charts update dynamically based on selected segment filters.
    </HighlightBox>
    <HighlightBox>
      <strong>Segment Filters:</strong> Filter all charts simultaneously by Metro Area, Gender, Age Group,
      Employment Status, or Household Income. Filters apply across all sections and charts.
    </HighlightBox>
    <HighlightBox>
      <strong>Data Download:</strong> Each chart includes a download button to export the underlying data as CSV.
    </HighlightBox>

    {/* ── Team ── */}
    <SectionHeading>Research Team</SectionHeading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
      {[
        { name: 'Ram M. Pendyala, PhD', role: 'Principal Investigator', affil: 'Arizona State University' },
        { name: 'Sara Khoeini, PhD', role: 'Key Investigator', affil: 'Arizona State University' },
        { name: 'Irfan Batur, PhD', role: 'Key Investigator', affil: 'Arizona State University' },
        { name: 'Denise Capasso da Silva', role: 'Key Investigator', affil: 'Arizona State University' },
      ].map(p => (
        <div key={p.name} style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{p.name}</div>
          <div style={{ fontSize: 12.5, color: '#507DBC', marginTop: 2 }}>{p.role}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2, fontStyle: 'italic' }}>{p.affil}</div>
        </div>
      ))}
    </div>

    {/* ── Citations ── */}
    <SectionHeading>Citations</SectionHeading>
    <p style={{ fontSize: 13.5, color: '#555', marginBottom: 10 }}>
      For use of this data or dashboard, please cite the relevant T4 survey reports:
    </p>
    {[
      'Pendyala, R.M., Khoeini, S., Capasso da Silva, D., and Batur, I. (2020). T4 Survey: A Multi-City Survey of Travel Behavior and Attitudes toward Autonomous Vehicles. TOMNET University Transportation Center, Arizona State University.',
      'Capasso da Silva, D., Batur, I., Khoeini, S., and Pendyala, R.M. (2020). Travel Behavior and Attitudes toward Autonomous Vehicles in Four U.S. Metropolitan Areas. Transportation Research Record.',
      'Batur, I., Khoeini, S., Capasso da Silva, D., and Pendyala, R.M. (2021). Understanding Attitudes toward Autonomous Vehicles across Four U.S. Cities. Transportation Research Part A.',
    ].map((ref, i) => (
      <div key={i} style={{ fontSize: 13, color: '#444', lineHeight: 1.65, padding: '10px 14px', borderLeft: '3px solid #507DBC', marginBottom: 10, background: '#f9fbff' }}>
        {ref}
      </div>
    ))}

    {/* ── Technical Notes ── */}
    <SectionHeading>Technical Notes</SectionHeading>
    <p style={{ fontSize: 14, color: '#444', lineHeight: 1.75 }}>
      Built with React 18, TypeScript, D3.js v7, and react-select v5.
      Responses marked as "Seen but not answered," "Appropriate skip," or "Missing (other)" are excluded from all calculations.
      All percentage calculations use only valid responses as the denominator, except where noted (e.g., multi-select questions
      where denominators are the full respondent count).
    </p>
    <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {[
        { color: '#e25b61', label: 'Strongly Disagree' },
        { color: '#f0b3ba', label: 'Somewhat Disagree' },
        { color: '#ead97c', label: 'Neutral' },
        { color: '#93c4b9', label: 'Somewhat Agree' },
        { color: '#2ba88c', label: 'Strongly Agree' },
      ].map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 14, height: 14, background: s.color, borderRadius: 3, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: '#555' }}>{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default About;
