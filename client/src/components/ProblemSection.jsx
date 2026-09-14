import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ProblemSection = () => {
  const trackRef = useRef(null);
  const pinnedContainerRef = useRef(null);
  const problemHeadlineRef = useRef(null);
  const solutionHeadlineRef = useRef(null);
  const pillRef = useRef(null);
  const pillTextRef = useRef(null);
  const pathElementsRef = useRef([]);

  // 7 converging lines: parallel lines run across 66% of the screen,
  // curve and converge at exactly 75% (X = 1350), and single line extends to 100% (X = 1800)
  const paths = [
    // Line 1 (Top)
    'M 0 10 L 1180 10 C 1260 10, 1310 67, 1350 67 L 1800 67',
    // Line 2
    'M 0 29 L 1180 29 C 1250 29, 1305 67, 1350 67 L 1800 67',
    // Line 3
    'M 0 48 L 1180 48 C 1240 48, 1300 67, 1350 67 L 1800 67',
    // Line 4 (Center straight line - runs all the way across)
    'M 0 67 L 1800 67',
    // Line 5
    'M 0 86 L 1180 86 C 1240 86, 1300 67, 1350 67 L 1800 67',
    // Line 6
    'M 0 105 L 1180 105 C 1250 105, 1305 67, 1350 67 L 1800 67',
    // Line 7 (Bottom)
    'M 0 124 L 1180 124 C 1260 124, 1310 67, 1350 67 L 1800 67',
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create butter-smooth GSAP ScrollTrigger timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: '+=3400', // Substantially slower, cinematic scroll runway
          pin: pinnedContainerRef.current,
          scrub: 1.6, // Luxurious inertia scrub
          anticipatePin: 1,
        },
      });

      // 1. Draw all lines smoothly from left edge to right edge
      tl.fromTo(
        pathElementsRef.current,
        { strokeDashoffset: 1800 },
        {
          strokeDashoffset: 0,
          ease: 'none',
          duration: 1,
        },
        0
      );

      // 2. Metamorphosis: background transitions from Cream to Sage green right as lines converge
      tl.fromTo(
        pinnedContainerRef.current,
        { backgroundColor: '#fffefc' },
        {
          backgroundColor: '#a9d4b2',
          ease: 'power2.inOut',
          duration: 0.35,
        },
        0.48
      );

      // 3. Pill badge color and text metamorphosis
      tl.fromTo(
        pillRef.current,
        { backgroundColor: '#b6ced5' },
        {
          backgroundColor: '#fffefc',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          duration: 0.25,
          ease: 'power1.out',
          onUpdate: function () {
            const prog = this.progress();
            if (pillTextRef.current) {
              pillTextRef.current.textContent = prog >= 0.5 ? 'The solution' : 'The problem';
            }
          },
        },
        0.48
      );

      // 4. Cross-fade headlines without overlap
      tl.fromTo(
        problemHeadlineRef.current,
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -14,
          ease: 'power1.out',
          duration: 0.28,
        },
        0.44
      );

      tl.fromTo(
        solutionHeadlineRef.current,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          ease: 'power1.out',
          duration: 0.28,
        },
        0.52
      );
    }, trackRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={trackRef}
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Pinned Viewport Container managed smoothly by GSAP ScrollTrigger */}
      <div
        ref={pinnedContainerRef}
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#fffefc',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          willChange: 'background-color',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Centered Content Container */}
          <div
            style={{
              maxWidth: '960px',
              margin: '0 auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Centered Pill Badge */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
              <span
                ref={pillRef}
                style={{
                  backgroundColor: '#b6ced5',
                  color: '#0f3e17',
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '7px 18px',
                  borderRadius: '999px',
                  display: 'inline-block',
                  letterSpacing: '0.01em',
                  willChange: 'background-color',
                }}
              >
                <span ref={pillTextRef}>The problem</span>
              </span>
            </div>

            {/* Cross-fading Centered Headlines */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '200px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {/* Problem Headline */}
              <h2
                ref={problemHeadlineRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', serif",
                  fontSize: '46px',
                  lineHeight: 1.28,
                  fontWeight: 400,
                  color: '#0f3e17',
                  letterSpacing: '-0.025em',
                  margin: 0,
                  maxWidth: '920px',
                  width: '100%',
                  textAlign: 'center',
                  opacity: 1,
                  willChange: 'transform, opacity',
                }}
              >
                Fragmented CRM, EHR, and RCM systems are inefficient. They slow intake, burden staff, and hide revenue leakage.
              </h2>

              {/* Solution Headline */}
              <h2
                ref={solutionHeadlineRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', serif",
                  fontSize: '46px',
                  lineHeight: 1.28,
                  fontWeight: 400,
                  color: '#0f3e17',
                  letterSpacing: '-0.025em',
                  margin: 0,
                  maxWidth: '920px',
                  width: '100%',
                  textAlign: 'center',
                  opacity: 0,
                  willChange: 'transform, opacity',
                }}
              >
                Instead of bouncing between CRM, EHR, and RCM systems, Ease provides one AI-powered system for referrals, clinical notes, and billing.
              </h2>
            </div>
          </div>
        </div>

        {/* ================= 7 CONVERGING HORIZONTAL LINES MERGING AT 75% OF SCREEN ================= */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            marginTop: '56px',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <svg
            viewBox="0 0 1800 134"
            preserveAspectRatio="none"
            fill="none"
            style={{
              width: '100vw',
              height: '134px',
              display: 'block',
              overflow: 'visible',
            }}
          >
            {paths.map((pathD, idx) => (
              <path
                key={idx}
                ref={(el) => (pathElementsRef.current[idx] = el)}
                d={pathD}
                stroke="#0f3e17" // Forest Ink
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1800"
                strokeDashoffset="1800"
                style={{ willChange: 'stroke-dashoffset' }}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};
