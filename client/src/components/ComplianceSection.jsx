import React, { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const COMPLIANCE_ITEMS = [
  {
    id: 1,
    text: 'End-to-end encryption, role-based access, and secure data handling',
  },
  {
    id: 2,
    text: 'ONC-certified EHR meeting federal interoperability and documentation standards',
  },
  {
    id: 3,
    text: 'Supports state-specific behavioral health requirements (licensure, scope, parity laws)',
  },
  {
    id: 4,
    text: 'Audit-ready documentation and secure access controls for PHI',
  },
  {
    id: 5,
    text: 'Reliable uptime & cloud-based infrastructure with continuous backups',
  },
  {
    id: 6,
    text: 'Role-based permissions to safeguard sensitive clinical and billing data',
  },
];

export const ComplianceSection = () => {
  const sectionRef = useRef(null);
  const leftColRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left headline & badge entrance
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Right 6-item grid staggered entrance
      if (gridRef.current) {
        const items = gridRef.current.querySelectorAll('.compliance-item');
        gsap.fromTo(
          items,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: 'var(--color-cream-paper, #faf8f5)',
        width: '100%',
        position: 'relative',
        padding: '110px 0 130px 0',
      }}
      className="compliance-section"
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.35fr',
          gap: '64px',
          alignItems: 'start',
        }}
        className="compliance-main-grid"
      >
        {/* LEFT COLUMN: BADGE & HEADLINE */}
        <div ref={leftColRef} style={{ maxWidth: '480px' }}>
          {/* Pill Badge: Standards and reporting */}
          <div style={{ marginBottom: '22px' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#b4cecb', // Muted sage/teal badge matching screenshot
                color: '#13391b',
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                padding: '6px 14px',
                borderRadius: '7px',
                letterSpacing: '0.01em',
              }}
            >
              Standards and reporting
            </span>
          </div>

          {/* Headline: Compliance you can count on */}
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(38px, 4.4vw, 56px)',
              fontWeight: 400,
              lineHeight: 1.15,
              color: '#13391b',
              letterSpacing: '-0.015em',
              margin: 0,
            }}
          >
            Compliance you
            <br />
            can count on
          </h2>
        </div>

        {/* RIGHT COLUMN: 2x3 GRID OF 6 COMPLIANCE CHECKPOINTS */}
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: '44px',
            rowGap: '40px',
          }}
          className="compliance-items-grid"
        >
          {COMPLIANCE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="compliance-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              {/* Deep Plum Rounded Checkbox Badge */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#341328', // Signature deep plum from reference
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(52, 19, 40, 0.25)',
                }}
              >
                <Check size={14} color="#ffffff" strokeWidth={2.8} />
              </div>

              {/* Checkpoint Text */}
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontSize: '15px',
                  lineHeight: 1.55,
                  color: '#1a3d22',
                  margin: 0,
                  fontWeight: 400,
                  letterSpacing: '-0.005em',
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .compliance-main-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            padding: 0 24px !important;
          }
        }
        @media (max-width: 640px) {
          .compliance-items-grid {
            grid-template-columns: 1fr !important;
            row-gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
};
