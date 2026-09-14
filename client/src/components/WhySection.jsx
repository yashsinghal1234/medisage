import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const WhySection = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header: Glides up from below when user scrolls down to this section
      gsap.fromTo(
        headerRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 3 Cards: Staggered upward cascade from below on scroll
      gsap.fromTo(
        cardsRef.current,
        { y: 75, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.15,
          delay: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        paddingTop: '120px', // Added generous margin/padding top to Why Ease
        paddingBottom: '100px',
        backgroundColor: 'transparent', // Transparent so cream page shows while circles span underneath
        width: '100%',
        position: 'relative',
        zIndex: 20, // Higher z-index so the green cards sit ON TOP of the circles
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 20 }}>
        {/* ================= HEADER: LEFT-ALIGNED BUT CENTERED IN SECTION ================= */}
        <div
          ref={headerRef}
          style={{
            maxWidth: '1180px',
            margin: '0 auto 52px auto',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            willChange: 'transform, opacity',
          }}
        >
          {/* Eyebrow Pill */}
          <div style={{ marginBottom: '22px' }}>
            <span
              style={{
                backgroundColor: '#b6ced5', // Slate Hush pill
                color: '#0f3e17',
                fontFamily: 'var(--font-suisse-intl)',
                fontSize: '12.5px',
                fontWeight: 500,
                padding: '6px 18px',
                borderRadius: '999px',
                display: 'inline-block',
                letterSpacing: '0.01em',
              }}
            >
              Why MediSage
            </span>
          </div>

          {/* Left-Aligned Headline */}
          <h2
            style={{
              fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', serif",
              fontSize: '48px',
              lineHeight: 1.18,
              fontWeight: 400,
              color: '#0f3e17',
              letterSpacing: '-0.025em',
              margin: 0,
              maxWidth: '720px',
              textAlign: 'left',
            }}
          >
            A clinical intelligence system, working together.
          </h2>
        </div>

        {/* ================= 3 FEATURE CARDS (Z-INDEX 25: FLOATING ABOVE CIRCLES) ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            maxWidth: '1180px',
            margin: '0 auto',
            alignItems: 'stretch',
            position: 'relative',
            zIndex: 25,
          }}
        >
          {/* Card 1: See everything in one place */}
          <div
            ref={(el) => (cardsRef.current[0] = el)}
            style={{
              backgroundColor: '#a9d4b2', // Solid Sage Mist green
              borderRadius: '24px',
              padding: '44px 36px 42px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              minHeight: '370px',
              boxShadow: 'none',
              transition: 'transform 0.25s ease',
              willChange: 'transform, opacity',
              cursor: 'default',
              position: 'relative',
              zIndex: 25, // Above the concentric circles
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Overlapping Frames Icon */}
            <div style={{ width: '58px', height: '58px', marginBottom: '38px' }}>
              <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
                <rect x="6" y="6" width="36" height="36" rx="2.5" stroke="#0f3e17" strokeWidth="2.4" />
                <rect x="16" y="16" width="36" height="36" rx="2.5" stroke="#0f3e17" strokeWidth="2.4" />
              </svg>
            </div>

            {/* Bold Title */}
            <h3
              style={{
                fontFamily: 'var(--font-suisse-intl)',
                fontSize: '27px',
                fontWeight: 600,
                lineHeight: 1.24,
                color: '#0f3e17',
                margin: '0 0 18px 0',
                letterSpacing: '-0.02em',
              }}
            >
              See your health in one place.
            </h3>

            {/* Body Typography */}
            <p
              style={{
                fontFamily: 'var(--font-suisse-intl)',
                fontSize: '16px',
                lineHeight: 1.55,
                color: '#2b362c',
                margin: 0,
                fontWeight: 400,
              }}
            >
              Consolidate prescriptions, pathology reports, DICOM scans, and blood panels into a unified longitudinal record.
            </p>
          </div>

          {/* Card 2: Get more done, more easily */}
          <div
            ref={(el) => (cardsRef.current[1] = el)}
            style={{
              backgroundColor: '#a9d4b2', // Solid Sage Mist green
              borderRadius: '24px',
              padding: '44px 36px 42px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              minHeight: '370px',
              boxShadow: 'none',
              transition: 'transform 0.25s ease',
              willChange: 'transform, opacity',
              cursor: 'default',
              position: 'relative',
              zIndex: 25, // Above the concentric circles
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Checklist Notebook Icon */}
            <div style={{ width: '58px', height: '58px', marginBottom: '38px' }}>
              <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
                <rect x="7" y="7" width="44" height="44" rx="2.5" stroke="#0f3e17" strokeWidth="2.4" />
                <line x1="24" y1="18" x2="43" y2="18" stroke="#0f3e17" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="24" y1="29" x2="43" y2="29" stroke="#0f3e17" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="24" y1="40" x2="43" y2="40" stroke="#0f3e17" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M14 16 L 17 20 L 21 15" stroke="#0f3e17" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 27 L 17 31 L 21 26" stroke="#0f3e17" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 38 L 17 42 L 21 37" stroke="#0f3e17" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Bold Title */}
            <h3
              style={{
                fontFamily: 'var(--font-suisse-intl)',
                fontSize: '27px',
                fontWeight: 600,
                lineHeight: 1.24,
                color: '#0f3e17',
                margin: '0 0 18px 0',
                letterSpacing: '-0.02em',
              }}
            >
              AI insights with clinical rigor.
            </h3>

            {/* Body Typography */}
            <p
              style={{
                fontFamily: 'var(--font-suisse-intl)',
                fontSize: '16px',
                lineHeight: 1.55,
                color: '#2b362c',
                margin: 0,
                fontWeight: 400,
              }}
            >
              Automated extraction connects fasting vitals, blood panels, and longitudinal biomarkers to reveal tailored preventive guidance.
            </p>
          </div>

          {/* Card 3: Bill on time, every time */}
          <div
            ref={(el) => (cardsRef.current[2] = el)}
            style={{
              backgroundColor: '#a9d4b2', // Solid Sage Mist green
              borderRadius: '24px',
              padding: '44px 36px 42px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              minHeight: '370px',
              boxShadow: 'none',
              transition: 'transform 0.25s ease',
              willChange: 'transform, opacity',
              cursor: 'default',
              position: 'relative',
              zIndex: 25, // Above the concentric circles
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Concentric Scaling Boxes Icon */}
            <div style={{ width: '58px', height: '58px', marginBottom: '38px' }}>
              <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
                <rect x="7" y="7" width="44" height="44" rx="2.5" stroke="#0f3e17" strokeWidth="2.4" />
                <path d="M7 23 H 37 V 51" stroke="#0f3e17" strokeWidth="2.4" />
                <path d="M7 37 H 23 V 51" stroke="#0f3e17" strokeWidth="2.4" />
              </svg>
            </div>

            {/* Bold Title */}
            <h3
              style={{
                fontFamily: 'var(--font-suisse-intl)',
                fontSize: '27px',
                fontWeight: 600,
                lineHeight: 1.24,
                color: '#0f3e17',
                margin: '0 0 18px 0',
                letterSpacing: '-0.02em',
              }}
            >
              Insurance &amp; Emergency Pass.
            </h3>

            {/* Body Typography */}
            <p
              style={{
                fontFamily: 'var(--font-suisse-intl)',
                fontSize: '16px',
                lineHeight: 1.55,
                color: '#2b362c',
                margin: 0,
                fontWeight: 400,
              }}
            >
              Instant health insurance matching for pre-existing diagnoses alongside a secure, 1-click DigiLocker emergency medical pass.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .why-ease-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
