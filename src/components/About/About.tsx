import React from 'react';

const PHASES = [
  {
    phase: 'Pilot',
    period: 'Fall 2018',
    location: 'Maricopa County, AZ (Phoenix area)',
    n: '262 responses',
    notes: 'Tested both paper and online formats. Online format yielded more complete responses, so full deployment moved to online-only.',
  },
  {
    phase: 'Full Deployment',
    period: 'Late 2019',
    location: 'Phoenix · Atlanta · Austin · Tampa',
    n: '3,465 valid responses',
    notes: 'Address-based random sampling. Online questionnaire only. Four geographically and demographically diverse U.S. cities.',
  },
];

const MODULES = [
  { label: 'General Lifestyle Attitudes', detail: '28 Likert-scale statements on technology, environment, privacy, and transit orientation' },
  { label: 'Current Travel Behavior', detail: 'Commute mode, frequency, long-distance trips, telework, and delivery service usage' },
  { label: 'Residential Choice Preferences', detail: 'Neighborhood type preferences, proximity to transit, and urban vs. suburban tradeoffs' },
  { label: 'Vehicle Ownership & ADAS', detail: 'Household vehicle count, driver licensing, and ADAS feature adoption (lane-keep, adaptive cruise, etc.)' },
  { label: 'Ridehailing & Shared Mobility', detail: 'Uber/Lyft usage, carsharing, bikesharing, e-scooter familiarity, barriers to adoption' },
  { label: 'Autonomous Vehicle Attitudes', detail: 'AV awareness, comfort, safety perceptions, willingness to pay, and lifestyle impact expectations' },
  { label: 'Stated Preference Experiments', detail: 'Four designed choice experiments: private vs. shared ride, AV adoption modality, in-vehicle activities, mode ranking for social trips' },
  { label: 'Demographic Background', detail: 'Age, gender, income, education, employment, household size, and home ownership' },
];

const TEAM_MEMBERS = [
  { initials: 'SK', name: 'Sara Khoeini',            role: 'Project Director',   university: 'ASU' },
  { initials: 'IB', name: 'Irfan Batur',             role: 'Faculty',            university: 'ASU' },
  { initials: 'RP', name: 'Ram M. Pendyala',          role: 'Faculty',            university: 'ASU' },
  { initials: 'DS', name: 'Deborah Salon',            role: 'Faculty',            university: 'ASU' },
  { initials: 'GC', name: 'Giovanni Circella',        role: 'Faculty',            university: 'Georgia Tech' },
  { initials: 'PM', name: 'Patricia L. Mokhtarian',   role: 'Faculty',            university: 'Georgia Tech' },
  { initials: 'CB', name: 'Chandra R. Bhat',          role: 'Faculty',            university: 'UT Austin' },
  { initials: 'MM', name: 'Michael Maness',           role: 'Faculty',            university: 'USF' },
  { initials: 'NM', name: 'Nikhil Mennon',            role: 'Faculty',            university: 'USF' },
];

const OUTPUT = [
  { value: '3',   label: 'Annual Project Reports', detail: 'Years 1–3 documenting survey design, data collection, and preliminary findings' },
  { value: '11',  label: 'Webinar Episodes',        detail: '"The ABCs of Future Mobility" — public series for practitioners and policymakers' },
  { value: '13+', label: 'Conference Papers',       detail: 'TRB 2021, ARTS 2021, AVS, WIIT, EHMI, AASHTO, and more' },
];

const LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: '#9ca3af',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 10,
};

const About: React.FC = () => (
  <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 28px 60px' }}>

    {/* Hero */}
    <div style={{
      background: '#005f9e',
      borderRadius: 14,
      padding: '28px 32px',
      marginBottom: 12,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', right: -40, top: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
        About the T4 Survey
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: '0 0 14px' }}>
        The <strong style={{ color: '#fff' }}>TOMNET Transformative Transportation Technologies (T4) Survey</strong> is
        a multi-city study exploring public attitudes, perceptions, and choices toward new mobility services and
        autonomous vehicles. Conducted by Arizona State University under <strong style={{ color: '#fff' }}>TOMNET</strong> —
        a USDOT Tier 1 University Transportation Center — the survey spans four geographically diverse U.S.
        cities and two data collection phases from 2018 to 2019.
      </p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, margin: 0 }}>
        The study's core goal is to understand what drives or hinders adoption of ridehailing, carsharing, and
        autonomous vehicles, so that transportation planners and policymakers can build accurate demand models
        and design programs that reflect real public preferences.
      </p>
    </div>

    {/* Survey Phases */}
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 12,
      padding: '16px 18px',
      marginBottom: 12,
    }}>
      <div style={LABEL}>Survey Phases</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PHASES.map((p, i) => (
          <div key={p.phase} style={{
            display: 'flex',
            gap: 14,
            paddingBottom: i < PHASES.length - 1 ? 10 : 0,
            borderBottom: i < PHASES.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
          }}>
            <div style={{
              width: 52,
              flexShrink: 0,
              paddingTop: 2,
            }}>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#005f9e',
                background: '#eef5fb',
                borderRadius: 4,
                padding: '2px 6px',
                display: 'inline-block',
              }}>
                {p.phase}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1a2744' }}>{p.period}</span>
                <span style={{ fontSize: 12, color: '#4a7fa8' }}>{p.location}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#005f9e' }}>{p.n}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{p.notes}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Survey Modules */}
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 12,
      padding: '16px 18px',
      marginBottom: 12,
    }}>
      <div style={LABEL}>Survey Modules</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {MODULES.map((m, i) => (
          <div key={m.label} style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            padding: '8px 0',
            borderBottom: i < MODULES.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
          }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#eef5fb',
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 700,
              color: '#005f9e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 1,
            }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a2744', marginBottom: 1 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>{m.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Research Output */}
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 12,
      padding: '16px 18px',
      marginBottom: 12,
    }}>
      <div style={LABEL}>Research Output</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {OUTPUT.map((o, i) => (
          <div key={o.label} style={{
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            paddingBottom: i < OUTPUT.length - 1 ? 10 : 0,
            borderBottom: i < OUTPUT.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
          }}>
            <div style={{
              minWidth: 40,
              fontSize: 22,
              fontWeight: 700,
              color: '#005f9e',
              lineHeight: 1,
            }}>
              {o.value}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a2744', marginBottom: 2 }}>{o.label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>{o.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Team */}
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 12,
      padding: '16px 18px',
      marginBottom: 12,
    }}>
      <div style={LABEL}>Research Team · Faculty</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {TEAM_MEMBERS.map(member => (
          <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#eef5fb',
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 700,
              color: '#005f9e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {member.initials}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#1a2744', fontWeight: 600 }}>{member.name}</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>{member.role} · {member.university}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 12,
        paddingTop: 10,
        borderTop: '0.5px solid var(--color-border-tertiary)',
        fontSize: 11,
        color: 'var(--color-text-secondary)',
        lineHeight: 1.5,
      }}>
        The project also includes graduate student researchers across ASU, Georgia Tech, UT Austin, and USF
        who contributed to survey design, data collection, analysis, and publications.
      </div>
    </div>

    {/* Data Download */}
    <div
      style={{
        background: '#005f9e',
        borderRadius: 12,
        padding: '16px 18px',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
      }}
      onClick={() => window.open('https://doi.org/10.48349/ASU/XUP56G', '_blank')}
    >
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>
          Download T4 Survey Dataset
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
          Full dataset, codebook, and documentation available via ASU Research Dataverse · DOI: 10.48349/ASU/XUP56G
        </div>
      </div>
      <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', flexShrink: 0 }}>›</div>
    </div>

    {/* Contact */}
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 12,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: '#eef5fb',
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 700,
        color: '#005f9e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        IB
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2744' }}>Dr. Irfan Batur</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Faculty Researcher · Arizona State University</div>
        <a
          href="mailto:ibatur@asu.edu"
          style={{ fontSize: 11, color: '#005f9e', textDecoration: 'none' }}
        >
          ibatur@asu.edu
        </a>
      </div>
    </div>

  </div>
);

export default About;
