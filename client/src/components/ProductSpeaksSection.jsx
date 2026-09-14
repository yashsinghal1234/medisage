import React, { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ProductSpeaksSection = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const framesRef = useRef(null);

  // Bottom "MediSage in Practice" showcase refs
  const easeHeaderRef = useRef(null);
  const quoteCardRef = useRef(null);
  const photoCardRef = useRef(null);
  const statsColRef = useRef(null);

  // Concentric nested rectangular frames anchored to the right edge
  // Offsets step inwards by 52px each
  const rectOffsets = [
    { left: 30, top: 20, bottom: 460 },
    { left: 82, top: 72, bottom: 408 },
    { left: 134, top: 124, bottom: 356 },
    { left: 186, top: 176, bottom: 304 },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Top Headline Entrance
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 2. Concentric Frames Entrance
      if (framesRef.current) {
        const paths = framesRef.current.querySelectorAll('path');
        gsap.fromTo(
          paths,
          { opacity: 0, x: 60 },
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: framesRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 3. "What it's like working with MediSage" header entrance
      if (easeHeaderRef.current) {
        gsap.fromTo(
          easeHeaderRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: easeHeaderRef.current,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 4. Staggered 3-Card Entrance
      const cards = [quoteCardRef.current, photoCardRef.current, statsColRef.current].filter(Boolean);
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.15,
            stagger: 0.16,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: quoteCardRef.current,
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
        overflow: 'hidden',
        padding: '110px 0 130px 0',
      }}
      className="product-speaks-section"
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px',
          position: 'relative',
        }}
      >
        {/* ========================================================================= */}
        {/* PART 1: "Our product speaks for itself." + CONCENTRIC FRAMES              */}
        {/* ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            alignItems: 'center',
            gap: '40px',
            position: 'relative',
            minHeight: '440px',
            marginBottom: '70px',
          }}
          className="product-speaks-top-grid"
        >
          {/* LEFT: TITLE */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2
              ref={headlineRef}
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(38px, 4.4vw, 56px)',
                fontWeight: 400,
                lineHeight: 1.22,
                color: '#13391b',
                letterSpacing: '-0.015em',
                margin: 0,
                maxWidth: '540px',
              }}
            >
              Our product speaks for itself.
            </h2>
          </div>

          {/* RIGHT: CONCENTRIC NESTED RECTANGULAR FRAMES */}
          <div
            ref={framesRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '460px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              overflow: 'visible',
            }}
          >
            <svg
              viewBox="0 0 600 460"
              fill="none"
              preserveAspectRatio="none"
              style={{
                width: '100%',
                maxWidth: '620px',
                height: '460px',
                overflow: 'visible',
              }}
            >
              {rectOffsets.map((offset, idx) => (
                <path
                  key={idx}
                  d={`M 640 ${offset.top} L ${offset.left} ${offset.top} L ${offset.left} ${offset.bottom} L 640 ${offset.bottom}`}
                  stroke="#13391b"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    opacity: 1,
                    willChange: 'transform, opacity',
                  }}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PART 2: "What it’s like working with MediSage" + 3-CARD SHOWCASE          */}
        {/* ========================================================================= */}
        <div style={{ position: 'relative', width: '100%' }}>
          {/* Header Row: Badge & 2-Line Headline */}
          <div ref={easeHeaderRef} style={{ marginBottom: '44px' }}>
            <div style={{ marginBottom: '16px' }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#dceae0', // Signature light sage/mint badge
                  color: '#13391b',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  letterSpacing: '0.01em',
                }}
              >
                MediSage in Practice
              </span>
            </div>

            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(36px, 4.2vw, 54px)',
                fontWeight: 400,
                lineHeight: 1.18,
                color: '#13391b',
                letterSpacing: '-0.015em',
                margin: 0,
              }}
            >
              What it’s like
              <br />
              working with MediSage
            </h3>
          </div>

          {/* 3-Column Showcase Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.08fr 1.15fr 1fr',
              gap: '24px',
              alignItems: 'stretch',
            }}
            className="ease-cards-grid"
          >
            {/* COLUMN 1: QUOTE CARD WITH AUTHOR & MEDICAL INSTITUTE LOGO */}
            <div
              ref={quoteCardRef}
              style={{
                backgroundColor: '#a3d1ac', // Soft soothing sage green matching screenshot
                borderRadius: '24px',
                padding: '48px 40px 36px 40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '520px',
                boxSizing: 'border-box',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(15, 62, 23, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Quote Text */}
              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '22px',
                  lineHeight: 1.5,
                  color: '#0f3e17',
                  margin: 0,
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                }}
              >
                “Scattered prescriptions and fragmented lab reports used to take hours to reconcile; MediSage unified our entire clinical vault and turned medical complexity into effortless clarity.”
              </p>

              {/* Bottom Row: Author & Metropolitan Health Institute Logo */}
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: '#0f3e17',
                      lineHeight: 1.3,
                    }}
                  >
                    Dr. Richard Hoffman, MD
                  </div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '13px',
                      color: '#3d6145',
                      fontWeight: 400,
                      marginTop: '3px',
                    }}
                  >
                    Chief Medical Officer &amp; Preventive Lead
                  </div>
                </div>

                {/* Metropolitan Health Institute Medical Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <rect width="34" height="34" rx="6" fill="#1b4332" />
                    <path
                      d="M17 7 V 27 M7 17 H 27"
                      stroke="#a3d1ac"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <circle cx="17" cy="17" r="4" fill="#ffffff" />
                  </svg>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '8px',
                      lineHeight: 1.15,
                      letterSpacing: '0.04em',
                      color: '#1b4332',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>Metropolitan</span>
                    <span>Health</span>
                    <span>Institute</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: SERENE MODERN CLINIC INTERIOR PHOTO */}
            <div
              ref={photoCardRef}
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                minHeight: '520px',
                boxSizing: 'border-box',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(15, 62, 23, 0.06)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(15, 62, 23, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 62, 23, 0.06)';
              }}
            >
              <img
                src="/clinic_lounge.jpg"
                alt="Serene Modern Clinic Consultation Suite"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* COLUMN 3: TWO STACKED STAT CARDS + READ CASE STUDY BUTTON */}
            <div
              ref={statsColRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                minHeight: '520px',
                justifyContent: 'space-between',
              }}
            >
              {/* Stat 1: 5 minutes */}
              <div
                style={{
                  backgroundColor: '#e4f3e6', // Pale minty sage matching screenshot
                  borderRadius: '20px',
                  padding: '32px 34px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '10px',
                  boxSizing: 'border-box',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(15, 62, 23, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                    fontSize: '44px',
                    fontWeight: 300,
                    color: '#0f3e17',
                    letterSpacing: '-0.025em',
                    lineHeight: 1,
                  }}
                >
                  5 minutes
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                    fontSize: '14.5px',
                    color: '#13391b',
                    lineHeight: 1.5,
                    fontWeight: 400,
                    maxWidth: '300px',
                  }}
                >
                  Average time to upload, parse, and structure a multi-year patient medical history
                </div>
              </div>

              {/* Stat 2: 50% */}
              <div
                style={{
                  backgroundColor: '#e4f3e6', // Pale minty sage matching screenshot
                  borderRadius: '20px',
                  padding: '32px 34px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '10px',
                  boxSizing: 'border-box',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(15, 62, 23, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                    fontSize: '44px',
                    fontWeight: 300,
                    color: '#0f3e17',
                    letterSpacing: '-0.025em',
                    lineHeight: 1,
                  }}
                >
                  50%
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                    fontSize: '14.5px',
                    color: '#13391b',
                    lineHeight: 1.5,
                    fontWeight: 400,
                    maxWidth: '300px',
                  }}
                >
                  Reduction in administrative time spent retrieving past prescriptions, scans, and biomarker trends
                </div>
              </div>

              {/* Button: Read Case Study */}
              <a
                href="#case-study"
                style={{
                  backgroundColor: '#0d3516', // Dark forest green matching screenshot
                  borderRadius: '18px',
                  padding: '24px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontSize: '17px',
                  fontWeight: 600,
                  boxShadow: '0 6px 18px rgba(15, 62, 23, 0.2)',
                  transition: 'background-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#164d23';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 62, 23, 0.3)';
                  const arrow = e.currentTarget.querySelector('.case-study-arrow');
                  if (arrow) arrow.style.transform = 'translateX(6px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0d3516';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(15, 62, 23, 0.2)';
                  const arrow = e.currentTarget.querySelector('.case-study-arrow');
                  if (arrow) arrow.style.transform = 'translateX(0)';
                }}
              >
                <span>Read Case Study</span>
                <ArrowRight
                  size={22}
                  strokeWidth={2.2}
                  className="case-study-arrow"
                  style={{ transition: 'transform 0.25s ease' }}
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .product-speaks-top-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .ease-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
};
