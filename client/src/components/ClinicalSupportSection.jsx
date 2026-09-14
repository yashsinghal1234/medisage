import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ClinicalSupportSection = () => {
  const sectionRef = useRef(null);
  const leftCardRef = useRef(null);
  const rightSideRef = useRef(null);

  // MediSage clinical disciplines & modalities
  const clinicalDisciplines = [
    'Biomarkers',
    'Prescriptions',
    'DICOM Scans',
    'Pathology Reports',
    'Cardiology',
    'Lipid Panels',
    'Endocrinology',
    'Clinical Vitals',
    'Genomics',
    'Preventive Care',
    'Emergency ICE',
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left rolling box: Glides up smoothly from bottom on scroll
      if (leftCardRef.current) {
        gsap.fromTo(
          leftCardRef.current,
          { y: 70, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Right side content: Glides up smoothly from bottom on scroll
      if (rightSideRef.current) {
        gsap.fromTo(
          rightSideRef.current,
          { y: 70, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.15,
            delay: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
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
        paddingTop: '40px',
        paddingBottom: '90px',
        backgroundColor: 'var(--color-cream-paper)',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '580px 1fr',
            gap: '56px',
            alignItems: 'center',
          }}
        >
          {/* LEFT COLUMN: 580px x 590px KEYLIME BOX WITH UNBROKEN 30s VERTICAL ROLL */}
          <div
            ref={leftCardRef}
            style={{
              width: '580px',
              height: '590px',
              backgroundColor: '#e1f4df', // Keylime wash
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: 'none',
              willChange: 'transform, opacity',
            }}
          >
            {/* Top Mask Gradient for feathered entrance */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '110px',
                background: 'linear-gradient(to bottom, #e1f4df 20%, rgba(225, 244, 223, 0) 100%)',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            />

            {/* Bottom Mask Gradient for feathered exit */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '110px',
                background: 'linear-gradient(to top, #e1f4df 20%, rgba(225, 244, 223, 0) 100%)',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            />

            {/* Dual-Track Continuous Marquee Container */}
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* First Track */}
              <div
                className="rolling-marquee-track"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  paddingLeft: '48px',
                }}
              >
                {clinicalDisciplines.map((item, idx) => (
                  <div
                    key={`track1-${idx}`}
                    style={{
                      fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', serif",
                      fontSize: '38px',
                      lineHeight: 1.6,
                      color: '#0f3e17',
                      fontWeight: 400,
                      letterSpacing: '-0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Second Track (Exact clone for seamless loop) */}
              <div
                className="rolling-marquee-track"
                aria-hidden="true"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  paddingLeft: '48px',
                }}
              >
                {clinicalDisciplines.map((item, idx) => (
                  <div
                    key={`track2-${idx}`}
                    style={{
                      fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', serif",
                      fontSize: '38px',
                      lineHeight: 1.6,
                      color: '#0f3e17',
                      fontWeight: 400,
                      letterSpacing: '-0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: HEADLINE, DESCRIPTION, AND STATS */}
          <div
            ref={rightSideRef}
            style={{
              paddingLeft: '12px',
              willChange: 'transform, opacity',
            }}
          >
            {/* Slate-Hush Pill Badge */}
            <div style={{ marginBottom: '24px' }}>
              <span
                style={{
                  backgroundColor: '#b6ced5', // Slate Hush
                  color: '#0f3e17',
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '7px 16px',
                  borderRadius: '999px',
                  display: 'inline-block',
                  letterSpacing: '0.01em',
                }}
              >
                Broad clinical support
              </span>
            </div>

            {/* Display Serif Headline with 780px maxWidth */}
            <h2
              style={{
                fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', serif",
                fontSize: '48px',
                lineHeight: 1.15,
                fontWeight: 400,
                color: '#0f3e17',
                letterSpacing: '-0.025em',
                marginBottom: '26px',
                maxWidth: '780px',
              }}
            >
              MediSage is built from the ground up for unified health intelligence, with clinical AI at the core.
            </h2>

            {/* Subtitle description */}
            <p
              style={{
                fontFamily: 'var(--font-suisse-intl)',
                fontSize: '16px',
                lineHeight: 1.55,
                color: '#333333',
                maxWidth: '620px',
                marginBottom: '44px',
              }}
            >
              From acute biomarker trajectory tracking to long-term preventive guidance and secure medical passes, MediSage bridges every clinical discipline under a single intelligent operating system.
            </p>

            {/* Stat Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                maxWidth: '560px',
                borderTop: '1px solid rgba(15, 62, 23, 0.12)',
                paddingTop: '28px',
              }}
            >
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#0f3e17', fontWeight: 500, lineHeight: 1 }}>
                  100%
                </div>
                <div style={{ fontFamily: 'var(--font-suisse-intl)', fontSize: '13px', color: '#666', marginTop: '6px' }}>
                  FHIR Compliant
                </div>
              </div>

              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#0f3e17', fontWeight: 500, lineHeight: 1 }}>
                  50+
                </div>
                <div style={{ fontFamily: 'var(--font-suisse-intl)', fontSize: '13px', color: '#666', marginTop: '6px' }}>
                  Biomarkers Tracked
                </div>
              </div>

              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#0f3e17', fontWeight: 500, lineHeight: 1 }}>
                  &lt; 2s
                </div>
                <div style={{ fontFamily: 'var(--font-suisse-intl)', fontSize: '13px', color: '#666', marginTop: '6px' }}>
                  OCR Document Parsing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DUAL-TRACK CONTINUOUS MARQUEE ANIMATION */}
      <style>{`
        @keyframes unbrokenVerticalMarquee {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-100%);
          }
        }
        .rolling-marquee-track {
          animation: unbrokenVerticalMarquee 85s linear infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  );
};
