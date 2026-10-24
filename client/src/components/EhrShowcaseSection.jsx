import React, { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const EhrShowcaseSection = () => {
  const sectionRef = useRef(null);
  const ringsRef = useRef(null);
  const headlineRef = useRef(null);
  const cardRef = useRef(null);

  // Concentric ring radii matching screenshot
  const ringRadii = [35, 70, 110, 155, 205, 260, 320, 385];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Concentric rings entrance: smoothly expands and glides up on scroll
      if (ringsRef.current) {
        gsap.fromTo(
          ringsRef.current,
          { scale: 0.92, opacity: 0, x: -30 },
          {
            scale: 1,
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Headline entrance: glides up smoothly from bottom
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Large EHR showcase card entrance: glides up from bottom
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { y: 70, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            delay: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 85%',
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
        paddingTop: '64px',
        paddingBottom: '50px',
        backgroundColor: 'var(--color-cream-paper)',
        width: '100%',
        position: 'relative',
        zIndex: 10, // Higher z-index so concentric circles float cleanly above the section above
        overflow: 'visible', // Absolutely NO clipping
      }}
    >
      <div className="container" style={{ position: 'relative', overflow: 'visible' }}>
        {/* ================= TOP ROW: CONCENTRIC RINGS (LEFT) + HEADLINE (RIGHT) ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '380px 1fr', // Ample room for both rings and wide headline
            alignItems: 'center',
            minHeight: '280px',
            marginBottom: '115px', // Significantly increased gap between text and below box
            position: 'relative',
            overflow: 'visible',
            gap: '32px',
          }}
        >
          {/* LEFT: Concentric Rings radiating from the left edge (uncropped, complete circular arcs) */}
          <div
            ref={ringsRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              display: 'flex',
              alignItems: 'center',
              overflow: 'visible',
              willChange: 'transform, opacity',
            }}
          >
            <svg
              viewBox="0 0 420 320"
              fill="none"
              style={{
                width: '100%',
                maxWidth: '420px',
                height: '100%',
                overflow: 'visible', // SVG explicitly set to visible so rings extend upwards completely
              }}
            >
              {ringRadii.map((r, idx) => (
                <circle
                  key={idx}
                  cx="0"
                  cy="160"
                  r={r}
                  stroke="#0f3e17"
                  strokeWidth="1.6"
                  opacity={0.85 - idx * 0.05}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </div>

          {/* RIGHT: Display Serif Headline Aligned to the Right with More Right Margin */}
          <div
            ref={headlineRef}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%',
              paddingRight: '90px', // Increased margin to the right of text
              willChange: 'transform, opacity',
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', serif",
                fontSize: '50px',
                lineHeight: 1.18,
                fontWeight: 400,
                color: '#0f3e17',
                letterSpacing: '-0.025em',
                margin: '0 0 16px auto', // Right-aligned block
                maxWidth: '740px',
                textAlign: 'right', // Text aligned to the right
              }}
            >
              An{' '}
              <span
                style={{
                  fontFamily: "'Instrument Serif', 'Cormorant Garamond', 'Playfair Display', serif",
                  fontStyle: 'italic',
                  fontSize: '1.46em',
                  fontWeight: 400,
                  color: '#0f3e17',
                  letterSpacing: '0.01em',
                  display: 'inline-block',
                  position: 'relative',
                  paddingRight: '6px',
                  transform: 'translateY(1px)',
                }}
              >
                EHR
              </span>{' '}
              designed for how clinicians actually work.
            </h2>
          </div>
        </div>

        {/* ================= SAGE GREEN EHR SHOWCASE CARD ================= */}
        <div
          ref={cardRef}
          style={{
            backgroundColor: '#a9d4b2', // Sage Mist green matching screenshot
            borderRadius: '24px',
            padding: '36px',
            minHeight: '520px',
            width: '100%',
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: 'none',
            willChange: 'transform, opacity',
          }}
        >
          {/* Card Top Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(15, 62, 23, 0.15)',
              paddingBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                style={{
                  backgroundColor: '#fffefc',
                  color: '#0f3e17',
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '5px 14px',
                  borderRadius: '999px',
                  letterSpacing: '0.04em',
                }}
              >
                CLINICAL WORKFLOW
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0f3e17',
                }}
              >
                Marcus Vance (DOB: 04/12/1982) — Intake & Assessment
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(255, 254, 252, 0.65)',
                  color: '#0f3e17',
                  fontSize: '12px',
                  fontFamily: 'var(--font-suisse-intl)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 500,
                }}
              >
                ICD-10: F32.1 Mapped
              </span>
              <span
                style={{
                  backgroundColor: '#0f3e17',
                  color: '#fffefc',
                  fontSize: '12px',
                  fontFamily: 'var(--font-suisse-intl)',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontWeight: 500,
                }}
              >
                Sign & Finalize Note
              </span>
            </div>
          </div>

          {/* Inner Two-Column EHR Interface Canvas */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '24px',
              flex: 1,
            }}
          >
            {/* Left Column: AI Ambient Clinical Scribe & SOAP Note */}
            <div
              style={{
                backgroundColor: '#fffefc',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-suisse-intl)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0f3e17',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    AI Ambient Clinical Scribe
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#0f3e17',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#1f8276',
                        display: 'inline-block',
                      }}
                    />
                    Live Capture Active
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-suisse-intl)',
                    fontSize: '14.5px',
                    lineHeight: 1.6,
                    color: '#2b362c',
                  }}
                >
                  <p style={{ margin: '0 0 12px 0' }}>
                    <strong>Subjective:</strong> Patient reports episodic fatigue, sleep disturbances over past 3 weeks, and elevated baseline anxiety during clinical intake interview.
                  </p>
                  <p style={{ margin: '0 0 12px 0' }}>
                    <strong>Objective:</strong> Resting heart rate 72 bpm. Blood pressure 124/78 mmHg. PHQ-9 score evaluated at 14 (Moderate). GAD-7 score at 11.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Assessment & Plan:</strong> Initiating structured behavioral activation protocol, biometric sleep tracker linkage, and follow-up lab review in 14 days.
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(15, 62, 23, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '12.5px', color: '#666' }}>
                  Auto-populated in 0.8s via MediSage Clinical LLM
                </span>
                <span
                  style={{
                    fontSize: '12.5px',
                    color: '#0f3e17',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Edit SOAP Template <ArrowRight size={13} />
                </span>
              </div>
            </div>

            {/* Right Column: Diagnostic & Treatment Pathway Cards */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Box 1: DSM-5 Diagnostic Criteria */}
              <div
                style={{
                  backgroundColor: '#fffefc',
                  borderRadius: '16px',
                  padding: '24px',
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-suisse-intl)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0f3e17',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                  }}
                >
                  DSM-5 Diagnostic Criteria
                </div>
                <div
                  style={{
                    fontSize: '17px',
                    fontFamily: 'var(--font-suisse-intl)',
                    fontWeight: 600,
                    color: '#0f3e17',
                    marginBottom: '8px',
                  }}
                >
                  F32.1 Major Depressive Disorder, Moderate
                </div>
                <div style={{ fontSize: '13.5px', color: '#555', lineHeight: 1.5 }}>
                  5 of 9 symptoms present including persistent low mood and sleep architecture disruption. Confirmed by clinical intake score.
                </div>
              </div>

              {/* Box 2: Automated Treatment Plan & Prior Auth */}
              <div
                style={{
                  backgroundColor: '#fffefc',
                  borderRadius: '16px',
                  padding: '24px',
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-suisse-intl)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0f3e17',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                  }}
                >
                  Payer Verification & Prior Auth
                </div>
                <div
                  style={{
                    fontSize: '17px',
                    fontFamily: 'var(--font-suisse-intl)',
                    fontWeight: 600,
                    color: '#0f3e17',
                    marginBottom: '8px',
                  }}
                >
                  Aetna Commercial #904812 — Verified
                </div>
                <div style={{ fontSize: '13.5px', color: '#555', lineHeight: 1.5 }}>
                  Copay: $25.00 | Deductible Met: $1,400 / $1,500. Real-time eligibility confirmed with 0 manual calls.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
