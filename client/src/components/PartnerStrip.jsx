import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const PartnerStrip = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entire strip smoothly glides up from below when user scrolls down to it
      gsap.fromTo(
        containerRef.current,
        { y: 65, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Staggered upward entrance for individual logos
      const logoItems = containerRef.current.querySelectorAll('.partner-logo-item');
      if (logoItems.length > 0) {
        gsap.fromTo(
          logoItems,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      style={{
        paddingTop: '32px',
        paddingBottom: '52px',
        textAlign: 'center',
        width: '100%',
        willChange: 'transform, opacity',
      }}
    >
      <div className="container">
        {/* Title */}
        <h4
          style={{
            fontFamily: 'var(--font-suisse-intl)',
            fontSize: '15.5px',
            fontWeight: 500,
            color: '#0f3e17',
            marginBottom: '38px',
            letterSpacing: '-0.01em',
          }}
        >
          Used by leading behavioral health organizations
        </h4>

        {/* 8 Logos Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            maxWidth: '1280px',
            margin: '0 auto',
            flexWrap: 'wrap',
          }}
        >
          {/* 1. YHA */}
          <div
            className="partner-logo-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              willChange: 'transform, opacity',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <rect x="2" y="4" width="16" height="16" rx="1.5" stroke="#be2828" strokeWidth="2.4" />
              <rect x="10" y="2" width="16" height="16" rx="1.5" stroke="#387796" strokeWidth="2.4" />
              <rect x="4" y="14" width="16" height="16" rx="1.5" stroke="#8da835" strokeWidth="2.4" />
              <rect x="12" y="12" width="16" height="16" rx="1.5" stroke="#468896" strokeWidth="2.4" />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-suisse-intl)', fontWeight: 800, fontSize: '19px', color: '#4a4a4a', lineHeight: 1 }}>
                YHA
              </div>
              <div style={{ fontSize: '6.5px', fontWeight: 600, color: '#888', letterSpacing: '0.04em', marginTop: '2px' }}>
                YORK HEALTH ASSOCIATES
              </div>
            </div>
          </div>

          {/* 2. SANDIA CREST */}
          <div
            className="partner-logo-item"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              willChange: 'transform, opacity',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <svg width="60" height="16" viewBox="0 0 60 16" fill="none">
              <path
                d="M2 14 L 14 4 L 20 9 L 28 2 L 38 11 L 46 5 L 58 14"
                stroke="#9c7a5f"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 4 L 18 14 M 28 2 L 32 14 M 46 5 L 50 14"
                stroke="#9c7a5f"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#7b5e48',
                letterSpacing: '0.12em',
                marginTop: '4px',
              }}
            >
              SANDIA CREST
            </div>
            <div style={{ fontSize: '6px', color: '#a08878', letterSpacing: '0.08em' }}>
              BEHAVIORAL HEALTH
            </div>
          </div>

          {/* 3. Christian Counseling Associates */}
          <div
            className="partner-logo-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              willChange: 'transform, opacity',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div
              style={{
                width: '38px',
                height: '28px',
                backgroundColor: '#2b588e',
                borderRadius: '3px',
                border: '2px solid #eb8a3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="18" viewBox="0 0 24 20" fill="none">
                <path
                  d="M2 10 C 6 4, 14 3, 22 2 C 18 8, 16 14, 12 18 C 11 12, 8 11, 2 10 Z"
                  fill="#ffffff"
                />
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#284672',
                  lineHeight: 1.1,
                  letterSpacing: '0.04em',
                }}
              >
                CHRISTIAN
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#284672',
                  lineHeight: 1.1,
                  letterSpacing: '0.04em',
                }}
              >
                COUNSELING
              </div>
              <div style={{ fontSize: '7px', color: '#557299', letterSpacing: '0.06em' }}>
                ASSOCIATES
              </div>
            </div>
          </div>

          {/* 4. SOPHROS RECOVERY */}
          <div
            className="partner-logo-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              willChange: 'transform, opacity',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <circle cx="17" cy="17" r="15" stroke="#71b8c4" strokeWidth="1.5" strokeDasharray="3 2" />
              <circle cx="17" cy="17" r="10" stroke="#71b8c4" strokeWidth="1.2" />
              <circle cx="17" cy="17" r="5" stroke="#71b8c4" strokeWidth="1.2" />
              <path d="M17 2 L 17 32 M 2 17 L 32 17" stroke="#71b8c4" strokeWidth="1" opacity="0.6" />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  color: '#262626',
                  letterSpacing: '0.08em',
                  lineHeight: 1,
                }}
              >
                SOPHROS
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '8px',
                  fontWeight: 600,
                  color: '#555555',
                  letterSpacing: '0.24em',
                  marginTop: '3px',
                }}
              >
                RECOVERY
              </div>
            </div>
          </div>

          {/* 5. CANOPY PINES */}
          <div
            className="partner-logo-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              willChange: 'transform, opacity',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div
              style={{
                width: '26px',
                height: '34px',
                backgroundColor: '#527557',
                borderRadius: '13px 13px 2px 2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="26" viewBox="0 0 18 26" fill="none">
                <path
                  d="M9 3 L 3 10 L 6 10 L 2 16 L 6 16 L 1 23 L 17 23 L 12 16 L 16 16 L 12 10 L 15 10 Z"
                  fill="#98bda0"
                  opacity="0.8"
                />
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#425845',
                  letterSpacing: '0.06em',
                  lineHeight: 1.1,
                }}
              >
                CANOPY PINES
              </div>
              <div style={{ fontSize: '6.5px', color: '#778879', letterSpacing: '0.1em' }}>
                RECOVERY CENTER
              </div>
            </div>
          </div>

          {/* 6. Grand Union */}
          <div
            className="partner-logo-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              willChange: 'transform, opacity',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1f8276',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="7" r="2.2" fill="#e1f4df" />
                <circle cx="7" cy="11" r="2" fill="#e1f4df" />
                <circle cx="17" cy="11" r="2" fill="#e1f4df" />
                <path d="M12 9 L 12 18 M 8 13 L 12 15 M 16 13 L 12 15" stroke="#e1f4df" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1a4f48',
                  lineHeight: 1,
                }}
              >
                Grand Union
              </div>
              <div style={{ fontSize: '6.5px', fontWeight: 600, color: '#688e88', letterSpacing: '0.06em', marginTop: '2px' }}>
                HOLISTIC SOLUTIONS
              </div>
            </div>
          </div>

          {/* 7. AMERICAN SCHOOL FOR THE DEAF */}
          <div
            className="partner-logo-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              willChange: 'transform, opacity',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <svg width="28" height="30" viewBox="0 0 28 30" fill="none">
              <circle cx="14" cy="7" r="4.5" fill="#f07822" />
              <path
                d="M4 16 C 6 12, 11 14, 14 17 C 17 14, 22 12, 24 16 C 24 24, 18 28, 14 28 C 10 28, 4 24, 4 16 Z"
                fill="#8da835"
              />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  color: '#2b2b2b',
                  lineHeight: 1.1,
                  letterSpacing: '0.02em',
                }}
              >
                AMERICAN
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  color: '#2b2b2b',
                  lineHeight: 1.1,
                  letterSpacing: '0.02em',
                }}
              >
                SCHOOL FOR THE
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  color: '#2b2b2b',
                  lineHeight: 1.1,
                  letterSpacing: '0.02em',
                }}
              >
                DEAF
              </div>
            </div>
          </div>

          {/* 8. MONARCH */}
          <div
            className="partner-logo-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              willChange: 'transform, opacity',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#2c2c2c',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                }}
              >
                MONARCH
              </div>
              <div style={{ fontSize: '6.5px', fontStyle: 'italic', color: '#777777', marginTop: '2px' }}>
                A New Beginning
              </div>
            </div>
            <svg width="22" height="20" viewBox="0 0 24 22" fill="none">
              <path
                d="M12 11 C 9 6, 4 5, 2 8 C 0 11, 4 16, 12 14 C 20 16, 24 11, 22 8 C 20 5, 15 6, 12 11 Z"
                stroke="#555555"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M12 14 C 10 18, 7 20, 5 19 C 3 18, 5 15, 12 14 C 19 15, 21 18, 19 19 C 17 20, 14 18, 12 14 Z"
                stroke="#555555"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
