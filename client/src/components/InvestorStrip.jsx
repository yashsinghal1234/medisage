import React from 'react';

export const InvestorStrip = () => {
  const partners = [
    { name: 'KLEINER PERKINS', tag: 'VENTURE HEALTH' },
    { name: 'ANDREESSEN BIO', tag: 'HEALTHCARE' },
    { name: 'SEQUOIA HEALTH', tag: 'MEDTECH' },
    { name: 'MAY CLINICAL', tag: 'RESEARCH' },
    { name: 'JOHNS HOPKINS LAB', tag: 'ALLIANCE' },
  ];

  return (
    <div
      style={{
        paddingTop: '56px',
        paddingBottom: '56px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <span
        className="eyebrow-label"
        style={{
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: '#666666',
          marginBottom: '28px',
        }}
      >
        BACKED BY LEADING CLINICAL VENTURES & HEALTH RESEARCH NETWORKS
      </span>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1100px',
          gap: '28px',
          opacity: 0.85,
        }}
      >
        {partners.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: '15px',
                letterSpacing: '0.08em',
                color: 'var(--color-charcoal)',
                textTransform: 'uppercase',
              }}
            >
              {p.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '9px',
                letterSpacing: '0.1em',
                color: '#777777',
              }}
            >
              {p.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
