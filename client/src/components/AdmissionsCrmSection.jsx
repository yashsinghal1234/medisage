import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Custom OS-Style Black Mouse Cursor with Crisp White Outline and Soft Drop Shadow
export const CustomMouseCursor = ({ style = {}, isClicking = false }) => (
  <div
    style={{
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 999,
      transform: isClicking ? 'scale(0.82)' : 'scale(1)',
      transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
      display: 'block',
      ...style,
    }}
  >
    <svg
      width="26"
      height="30"
      viewBox="0 0 24 28"
      fill="none"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d="M2.5 1.5 L 2.5 22.5 L 7.5 17.5 L 12.5 26.5 L 15.5 25 L 10.5 16 L 17.5 16 Z"
        fill="#000000"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export const AdmissionsCrmSection = () => {
  const sectionRef = useRef(null);
  const containerCardRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const convertBtnRef = useRef(null);

  // Conversion simulation state
  const [isConverted, setIsConverted] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // GSAP Entrance: ON SCROLL DOWN, THE WHOLE BOX COMES IN FROM THE RIGHT!
  useEffect(() => {
    const ctx = gsap.context(() => {
      // THE WHOLE SAGE GREEN CONTAINER CARD GLIDES IN FROM THE RIGHT ON SCROLL DOWN!
      if (containerCardRef.current) {
        gsap.fromTo(
          containerCardRef.current,
          { x: '40vw', opacity: 0.2 },
          {
            x: 0,
            opacity: 1,
            duration: 1.3,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Left Column text entrance
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            delay: 0.3,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Continuous automated loop: Cursor clicks "Convert to Patient" and repeats
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Cursor clicks down
      setIsClicking(true);

      if (convertBtnRef.current) {
        gsap.to(convertBtnRef.current, {
          scale: 0.93,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
        });
      }

      // 2. Conversion completed
      setTimeout(() => {
        setIsClicking(false);
        setIsConverted(true);

        // 3. Reset after 2.5s for next conversion cycle
        setTimeout(() => {
          setIsConverted(false);
        }, 2500);
      }, 180);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Manual click override
  const handleManualConvert = () => {
    setIsConverted((prev) => !prev);
  };

  const pills = [
    'Higher conversions',
    'Fewer handoffs',
    'Less manual work',
    'Native to platform',
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        paddingTop: '30px',
        paddingBottom: '90px',
        backgroundColor: 'var(--color-cream-paper)',
        width: '100%',
        position: 'relative',
        overflow: 'hidden', // Prevents horizontal scrollbars while the box enters from the right
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          paddingLeft: '16px',
          paddingRight: '16px',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* ================= SAGE GREEN CONTAINER CARD: COMES IN FROM RIGHT ON SCROLL DOWN ================= */}
        <div
          ref={containerCardRef}
          style={{
            backgroundColor: '#a0caa5', // Exact sage green matching screenshot
            borderRadius: '32px',
            padding: '60px 52px',
            width: '100%',
            minHeight: '680px',
            margin: '0 auto',
            position: 'relative',
            boxShadow: 'none',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            willChange: 'transform, opacity',
          }}
          className="accurate-ehr-container-box"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr',
              gap: '52px',
              alignItems: 'center',
            }}
            className="crm-section-grid"
          >
            {/* ================= LEFT COLUMN: COPY & PILLS ================= */}
            <div
              ref={leftColRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                zIndex: 2,
                maxWidth: '490px',
              }}
            >
              {/* Heading */}
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', var(--font-suisse-intl), sans-serif",
                  fontSize: '50px',
                  lineHeight: 1.15,
                  fontWeight: 500,
                  color: '#0f3e17',
                  letterSpacing: '-0.025em',
                  margin: '0 0 20px 0',
                }}
              >
                Admissions that run smoothly
              </h2>

              {/* Subtitle */}
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', var(--font-suisse-intl), sans-serif",
                  fontSize: '16.5px',
                  lineHeight: 1.6,
                  color: 'rgba(15, 62, 23, 0.9)',
                  maxWidth: '470px',
                  margin: '0 0 38px 0',
                  fontWeight: 400,
                }}
              >
                A CRM that manages referrals, tracks conversion, sends forms, checks eligibility, and hands off cleanly to other teams without third-party tools or integrations.
              </p>

              {/* Feature Pill Tags */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  alignItems: 'flex-start',
                  marginBottom: '48px',
                  width: '100%',
                }}
              >
                {pills.map((pill, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.95)',
                      borderRadius: '999px',
                      padding: '10px 22px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#0f3e17',
                      fontFamily: "'Plus Jakarta Sans', 'Inter', var(--font-suisse-intl), sans-serif",
                      boxShadow: '0 2px 8px rgba(15, 62, 23, 0.05)',
                      cursor: 'default',
                      transition: 'transform 0.2s ease, background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(5px)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.88)';
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#86b390',
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <span>{pill}</span>
                  </div>
                ))}
              </div>

              {/* Bottom CTA Button */}
              <a
                href="#features"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#0f3e17',
                  color: '#fffefc',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', var(--font-suisse-intl), sans-serif",
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '14px 28px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
                  boxShadow: '0 4px 16px rgba(15, 62, 23, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#185422';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 22px rgba(15, 62, 23, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f3e17';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 62, 23, 0.2)';
                }}
              >
                <span>Explore CRM</span>
                <ArrowRight size={17} strokeWidth={2.2} />
              </a>
            </div>

            {/* ================= RIGHT COLUMN: CRM BOARD ================= */}
            <div
              ref={rightColRef}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
              className="crm-board-wrapper"
            >
              {/* WHITE CRM KANBAN BOARD CONTAINER */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '26px',
                  padding: '40px 42px',
                  width: '580px',
                  maxWidth: '100%',
                  boxShadow: '0 16px 45px rgba(15, 62, 23, 0.09)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                }}
              >
                {/* Two-Column Kanban Layout */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                  }}
                >
                  {/* ================= COLUMN 1: NEW INQUIRY ================= */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '20px',
                        fontWeight: 500,
                        color: '#0f3e17',
                        margin: '0 0 4px 0',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      New Inquiry
                    </h3>

                    {/* Card 1: Alex Moreno */}
                    <div
                      style={{
                        backgroundColor: '#f8f6f0', // Cream card background
                        borderRadius: '16px',
                        padding: '16px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        border: '1px solid rgba(15, 62, 23, 0.04)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <img
                        src="/alex_avatar.jpg"
                        alt="Alex Moreno"
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #ffffff',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '20px',
                          fontWeight: 400,
                          color: '#13391b',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Alex Moreno
                      </span>
                    </div>

                    {/* Card 2: Daniel Cruz */}
                    <div
                      style={{
                        backgroundColor: '#f8f6f0', // Cream card background
                        borderRadius: '16px',
                        padding: '16px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        border: '1px solid rgba(15, 62, 23, 0.04)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <img
                        src="/daniel_avatar.jpg"
                        alt="Daniel Cruz"
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #ffffff',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '20px',
                          fontWeight: 400,
                          color: '#13391b',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Daniel Cruz
                      </span>
                    </div>
                  </div>

                  {/* ================= COLUMN 2: ADMITTED ================= */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '20px',
                        fontWeight: 500,
                        color: '#0f3e17',
                        margin: '0 0 4px 0',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Admitted
                    </h3>

                    {/* Card 1: Emma Smith (Highlighted green-tinted card with action button) */}
                    <div
                      style={{
                        backgroundColor: '#d8ecd9', // Sage green tinted background matching screenshot
                        borderRadius: '16px',
                        padding: '18px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        border: '1px solid rgba(15, 62, 23, 0.08)',
                        position: 'relative',
                        boxShadow: isConverted
                          ? '0 4px 18px rgba(35, 89, 48, 0.15)'
                          : '0 2px 10px rgba(15, 62, 23, 0.05)',
                        transition: 'box-shadow 0.3s ease',
                      }}
                    >
                      {/* Top Header: Avatar + Emma Smith */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src="/emma_avatar.jpg"
                          alt="Emma Smith"
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #ffffff',
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: '20px',
                            fontWeight: 400,
                            color: '#13391b',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          Emma Smith
                        </span>
                      </div>

                      {/* Action Button: "Convert to Patient" (Plum/Burgundy) with ALWAYS-VISIBLE BLACK CURSOR */}
                      <div style={{ position: 'relative' }}>
                        <button
                          ref={convertBtnRef}
                          type="button"
                          onClick={handleManualConvert}
                          style={{
                            position: 'relative',
                            backgroundColor: isConverted ? '#235930' : '#3c1333', // Deep plum/burgundy matching screenshot
                            color: '#ffffff',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '14px',
                            fontWeight: 600,
                            padding: '11px 16px',
                            borderRadius: '9px',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '7px',
                            transition: 'background-color 0.25s ease, transform 0.15s ease',
                            boxShadow: '0 4px 14px rgba(60, 19, 51, 0.25)',
                          }}
                        >
                          {isConverted ? (
                            <>
                              <Check size={16} strokeWidth={2.5} />
                              <span>Converted to Patient</span>
                            </>
                          ) : (
                            <span>Convert to Patient</span>
                          )}

                          {/* PERMANENTLY VISIBLE BLACK MOUSE CURSOR OVER THE BUTTON (EXACT POSITION FROM SCREENSHOT) */}
                          <CustomMouseCursor
                            isClicking={isClicking}
                            style={{
                              right: '-8px',
                              bottom: '-12px',
                            }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Card 2: Olivia Bennett */}
                    <div
                      style={{
                        backgroundColor: '#f8f6f0', // Cream card background
                        borderRadius: '16px',
                        padding: '16px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        border: '1px solid rgba(15, 62, 23, 0.04)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <img
                        src="/olivia_avatar.jpg"
                        alt="Olivia Bennett"
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #ffffff',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '20px',
                          fontWeight: 400,
                          color: '#13391b',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Olivia Bennett
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for responsive layout */}
      <style>{`
        @media (max-width: 1100px) {
          .crm-section-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .crm-board-wrapper {
            justify-content: center !important;
          }
        }
      `}</style>
    </section>
  );
};
