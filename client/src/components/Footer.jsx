import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer = () => {
  const productsLinks = [
    { name: 'Universal Health Vault', path: '/dashboard' },
    { name: 'AI Biomarker Insights', path: '/ai-insights' },
    { name: 'Longitudinal Timeline', path: '/timeline' },
    { name: 'Insurance Matcher', path: '/insurance' },
    { name: 'Prescription OCR', path: '/upload' },
    { name: 'Emergency ICE Pass', path: '#emergency' },
  ];

  const medisageLinks = [
    { name: 'About MediSage', path: '#about' },
    { name: 'Case Studies', path: '#case-study' },
    { name: 'Clinical AI Model', path: '/ai-insights' },
    { name: 'DigiLocker FHIR Standard', path: '#features' },
    { name: 'HIPAA & Vault Security', path: '#compliance' },
    { name: 'Clinical Architecture', path: '#features' },
  ];

  const connectLinks = [
    { name: 'Patient Portal', path: '/login' },
    { name: 'Clinician Sign-In', path: '/login' },
    { name: 'GitHub Repository', url: 'https://github.com/Nova-022005/MediSage' },
    { name: 'Medical Disclaimer', path: '#disclaimer' },
    { name: 'Contact Clinical Team', path: '#contact' },
  ];

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-cream-paper, #faf8f5)',
        width: '100%',
        padding: '80px 0 48px 0',
        position: 'relative',
      }}
      className="site-footer"
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px',
        }}
      >
        {/* ================= 2-COLUMN MAIN FOOTER GRID ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.08fr 1fr',
            gap: '24px',
            alignItems: 'stretch',
          }}
          className="footer-main-grid"
        >
          {/* ================= LEFT COLUMN ================= */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Top Card: Hero Statement */}
            <div
              style={{
                backgroundColor: '#dceee0', // Soft soothing light sage green matching reference
                borderRadius: '28px',
                padding: '56px 52px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                minHeight: '430px',
                boxSizing: 'border-box',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(15, 62, 23, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(42px, 5vw, 64px)',
                  fontWeight: 400,
                  lineHeight: 1.12,
                  color: '#0f3e17',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Bring clarity back into
                <br />
                health records.
              </h2>

              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontSize: '16.5px',
                  lineHeight: 1.55,
                  color: '#13391b',
                  maxWidth: '430px',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Join thousands of patients and clinicians spending less time sorting medical paperwork and more time with actionable preventive care.
              </p>
            </div>

            {/* Bottom Bar: Explore Health Vault */}
            <Link
              to="/dashboard"
              style={{
                backgroundColor: '#0d3516', // Deep rich forest green matching reference
                borderRadius: '20px',
                padding: '24px 36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#ffffff',
                textDecoration: 'none',
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: '18px',
                fontWeight: 600,
                boxShadow: '0 6px 18px rgba(13, 53, 22, 0.22)',
                transition: 'background-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#164d23';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(13, 53, 22, 0.32)';
                const arrow = e.currentTarget.querySelector('.demo-arrow');
                if (arrow) arrow.style.transform = 'translateX(6px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0d3516';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(13, 53, 22, 0.22)';
                const arrow = e.currentTarget.querySelector('.demo-arrow');
                if (arrow) arrow.style.transform = 'translateX(0)';
              }}
            >
              <span>Explore Medical Vault</span>
              <ArrowRight
                size={24}
                strokeWidth={2.2}
                className="demo-arrow"
                style={{ transition: 'transform 0.25s ease' }}
              />
            </Link>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Top Card: Abstract Curved Waves Graphic */}
            <div
              style={{
                backgroundColor: '#b4c7cc', // Muted dusty slate-blue wash matching reference
                borderRadius: '28px',
                height: '210px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <svg
                viewBox="0 0 600 210"
                fill="none"
                preserveAspectRatio="none"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                }}
              >
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const offset = idx * 16;
                  return (
                    <path
                      key={idx}
                      d={`M -30 ${230 - offset} C 160 ${230 - offset}, 230 ${90 - offset}, 390 ${45 - offset} S 550 ${15 - offset}, 630 ${-15 - offset}`}
                      stroke="#0f3e17"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Bottom Card: Navigation Links & Logo */}
            <div
              style={{
                backgroundColor: '#a3d1ac', // Medium sage green matching quote card
                borderRadius: '28px',
                padding: '44px 48px 36px 48px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                minHeight: '340px',
                boxSizing: 'border-box',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(15, 62, 23, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* 3-Column Navigation Links */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '24px',
                }}
              >
                {/* Column 1: Medical Suite */}
                <div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'rgba(15, 62, 23, 0.72)',
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Clinical Suite
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {productsLinks.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.path}
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#0f3e17',
                          textDecoration: 'none',
                          transition: 'opacity 0.2s ease, transform 0.2s ease',
                          display: 'inline-block',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Column 2: MediSage */}
                <div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'rgba(15, 62, 23, 0.72)',
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    MediSage
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {medisageLinks.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.path}
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#0f3e17',
                          textDecoration: 'none',
                          transition: 'opacity 0.2s ease, transform 0.2s ease',
                          display: 'inline-block',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Column 3: Connect */}
                <div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'rgba(15, 62, 23, 0.72)',
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Connect
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {connectLinks.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url || item.path}
                        target={item.url ? '_blank' : undefined}
                        rel={item.url ? 'noreferrer' : undefined}
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#0f3e17',
                          textDecoration: 'none',
                          transition: 'opacity 0.2s ease, transform 0.2s ease',
                          display: 'inline-block',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: App Icon Mark */}
              <div style={{ paddingTop: '32px' }}>
                <Logo size={26} color="#0f3e17" to="/" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= SUB-FOOTER COPYRIGHT BAR ================= */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '36px',
            marginTop: '12px',
            fontSize: '13px',
            color: '#657a69',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            gap: '16px',
          }}
        >
          <span>© {new Date().getFullYear()} MediSage Health Technologies. All clinical rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
              Privacy Charter
            </a>
            <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }}>
              Clinical Terms
            </a>
            <a href="#hipaa" style={{ color: 'inherit', textDecoration: 'none' }}>
              HIPAA Compliance
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .footer-main-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </footer>
  );
};
