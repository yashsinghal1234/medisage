import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export const InteractiveDashboardPreview = () => {
  // Interactive Simulation State
  const [crmStatus, setCrmStatus] = useState('Requested booking');
  const [noteText, setNoteText] = useState('Client shared successes');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [vitalityVal, setVitalityVal] = useState(98);
  const [scanX, setScanX] = useState(92);
  const [activeTooltipDate, setActiveTooltipDate] = useState('Jan 22, 2026');
  const [activeTooltipScore, setActiveTooltipScore] = useState('98% (Optimal)');

  // Animation Refs
  const containerRef = useRef(null);
  const crmBadgeRef = useRef(null);
  const submitBtnRef = useRef(null);
  const cursorLineRef = useRef(null);
  const tooltipRef = useRef(null);

  // Automated Live Video Dashboard Loop
  useEffect(() => {
    let timeoutId;
    let typeIntervalId;
    let charIndex = 0;
    const fullText = "Client shared successes";

    const runSimulationLoop = () => {
      // 1. Reset to initial state: "Requested booking"
      setCrmStatus('Requested booking');
      setNoteText('');
      setIsSubmitted(false);
      charIndex = 0;

      // 2. Animate transition from "Requested booking" to "Form completed"
      timeoutId = setTimeout(() => {
        if (crmBadgeRef.current) {
          gsap.to(crmBadgeRef.current, {
            scale: 0.9,
            opacity: 0.5,
            duration: 0.2,
            onComplete: () => {
              setCrmStatus('Form completed');
              gsap.to(crmBadgeRef.current, {
                scale: 1,
                opacity: 1,
                duration: 0.35,
                ease: 'back.out(1.7)',
              });
            },
          });
        }

        // 3. Typewriter in EHR Note Box after form completes
        timeoutId = setTimeout(() => {
          typeIntervalId = setInterval(() => {
            if (charIndex < fullText.length) {
              setNoteText(fullText.slice(0, charIndex + 1));
              charIndex++;
            } else {
              clearInterval(typeIntervalId);

              // 4. Highlight and Submit Note
              timeoutId = setTimeout(() => {
                setIsSubmitting(true);
                if (submitBtnRef.current) {
                  gsap.to(submitBtnRef.current, { scale: 0.96, duration: 0.15, yoyo: true, repeat: 1 });
                }

                timeoutId = setTimeout(() => {
                  setIsSubmitting(false);
                  setIsSubmitted(true);

                  // 5. Animate Scanning Marker across Biomarker Vitality Chart
                  if (cursorLineRef.current && tooltipRef.current) {
                    gsap.fromTo(
                      cursorLineRef.current,
                      { attr: { x1: 40, x2: 40 } },
                      {
                        attr: { x1: 96, x2: 96 },
                        duration: 1.6,
                        ease: 'power1.inOut',
                        onUpdate: function () {
                          const currentX = gsap.getProperty(cursorLineRef.current, 'x1');
                          setScanX(currentX || 92);
                          if (currentX > 70) {
                            setActiveTooltipDate('Jan 22, 2026');
                            setActiveTooltipScore('98% (Optimal)');
                          } else {
                            setActiveTooltipDate('Jan 10, 2026');
                            setActiveTooltipScore('94% (Improving)');
                          }
                        },
                      }
                    );

                    gsap.fromTo(
                      tooltipRef.current,
                      { x: -10, opacity: 0.8 },
                      { x: 0, opacity: 1, duration: 1.6, ease: 'power1.inOut' }
                    );
                  }

                  // 6. Smooth Vitality Score Count Up
                  const vitObj = { val: 91 };
                  gsap.to(vitObj, {
                    val: 98,
                    duration: 1.4,
                    ease: 'power2.out',
                    onUpdate: () => setVitalityVal(Math.round(vitObj.val)),
                  });

                  // Loop restart after 5.5 seconds
                  timeoutId = setTimeout(runSimulationLoop, 5500);
                }, 600);
              }, 800);
            }
          }, 55);
        }, 600);
      }, 1400);
    };

    runSimulationLoop();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(typeIntervalId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: 'var(--color-slate-hush)',
        borderRadius: '18px',
        padding: '52px 28px 40px 28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        minHeight: '520px',
        width: '100%',
      }}
    >
      {/* 5-Column Grid with Dedicated Natural Connector Slots */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 44px 1.15fr 44px 1fr',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* ================= CARD 1: CRM (Patient Intake) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          <div
            style={{
              backgroundColor: 'var(--color-cream-paper)',
              borderRadius: '16px',
              padding: '48px 18px 40px 18px',
              width: '100%',
              minHeight: '365px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
              textAlign: 'center',
              transition: 'transform 0.3s ease',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                marginBottom: '20px',
                border: '2px solid #eaeaea',
              }}
            >
              <img
                src="/emma_avatar.jpg"
                alt="Emma Smith"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML =
                    '<div style="width:100%;height:100%;background:#e1f4df;color:#0f3e17;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:18px;">ES</div>';
                }}
              />
            </div>

            {/* Name */}
            <h3
              style={{
                fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', serif",
                fontSize: '25px',
                fontWeight: 400,
                color: '#0f3e17',
                margin: '0 0 20px 0',
                lineHeight: 1.1,
              }}
            >
              Emma Smith
            </h3>

            {/* Status Pill Badge: Dynamically switches Requested booking -> Form completed */}
            <div
              ref={crmBadgeRef}
              style={{
                backgroundColor: crmStatus === 'Form completed' ? '#95d1a5' : '#c4e5ca',
                color: '#0f3e17',
                fontSize: '12px',
                fontWeight: 500,
                padding: '8px 18px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'background-color 0.3s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {crmStatus === 'Form completed' ? (
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#0f3e17',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="#fffefc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
              {crmStatus}
            </div>
          </div>

          {/* Bottom Tag */}
          <div
            style={{
              backgroundColor: 'var(--color-cream-paper)',
              color: '#0f3e17',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 20px',
              borderRadius: '999px',
              marginTop: '16px',
            }}
          >
            CRM
          </div>
        </div>

        {/* ================= CONNECTOR 1 (CRM -> EHR) ================= */}
        <div
          style={{
            height: '110px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
            zIndex: 1,
          }}
        >
          <svg viewBox="0 0 44 110" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Top Branch */}
            <path
              className="flowing-dash-line"
              d="M 0 55 C 18 55, 26 20, 44 20"
              fill="none"
              stroke="#2c545b"
              strokeWidth="1.8"
              opacity="0.85"
            />
            {/* Center Branch */}
            <path
              className="flowing-dash-line"
              d="M 0 55 L 44 55"
              fill="none"
              stroke="#2c545b"
              strokeWidth="1.8"
              opacity="0.85"
            />
            {/* Bottom Branch */}
            <path
              className="flowing-dash-line"
              d="M 0 55 C 18 55, 26 90, 44 90"
              fill="none"
              stroke="#2c545b"
              strokeWidth="1.8"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* ================= CARD 2: EHR (Clinical Note Synthesis) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          <div
            style={{
              backgroundColor: 'var(--color-cream-paper)',
              borderRadius: '16px',
              padding: '34px 20px 28px 20px',
              width: '100%',
              minHeight: '365px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'none',
            }}
          >
            <div>
              {/* Name */}
              <h3
                style={{
                  fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', serif",
                  fontSize: '23px',
                  fontWeight: 400,
                  color: '#0f3e17',
                  margin: '0 0 14px 0',
                }}
              >
                Emma Smith
              </h3>

              {/* Demographics Pill Strip */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '9px' }}>
                <span style={{ fontSize: '10px', color: '#555', backgroundColor: '#f2f2ef', padding: '4px 9px', borderRadius: '5px' }}>
                  Gender: Female
                </span>
                <span style={{ fontSize: '10px', color: '#555', backgroundColor: '#f2f2ef', padding: '4px 9px', borderRadius: '5px' }}>
                  Age: 33 yrs
                </span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '10px', color: '#555', backgroundColor: '#f2f2ef', padding: '4px 9px', borderRadius: '5px' }}>
                  DOB: 03/14/1992
                </span>
              </div>

              {/* Dropdown Field */}
              <div
                style={{
                  border: '1px solid #dfdfdc',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '11.5px',
                  color: '#333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  backgroundColor: '#fffefc',
                }}
              >
                <span>Individual therapy</span>
                <span style={{ fontSize: '10px', color: '#666' }}>⌵</span>
              </div>

              {/* Live Animated Typing Note Box */}
              <div
                style={{
                  border: '1px solid #e5e5e2',
                  borderRadius: '6px',
                  padding: '9px 10px',
                  fontSize: '11px',
                  backgroundColor: '#fffefc',
                  minHeight: '40px',
                  marginBottom: '18px',
                  color: '#222',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span>{noteText}</span>
                <span
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '13px',
                    backgroundColor: '#0f3e17',
                    marginLeft: '2px',
                    animation: 'blink 1s infinite',
                  }}
                ></span>
              </div>
            </div>

            {/* Dark Green Submit Note Button */}
            <button
              ref={submitBtnRef}
              onClick={() => setIsSubmitted(!isSubmitted)}
              style={{
                backgroundColor: isSubmitted ? '#1b5e20' : '#0f3e17',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '9px 20px',
                fontSize: '11px',
                fontWeight: 500,
                alignSelf: 'center',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
              }}
            >
              {isSubmitted ? (
                <>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#fffefc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Note Saved
                </>
              ) : (
                '+ Submit Note'
              )}
            </button>
          </div>

          {/* Bottom Tag */}
          <div
            style={{
              backgroundColor: 'var(--color-cream-paper)',
              color: '#0f3e17',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 20px',
              borderRadius: '999px',
              marginTop: '16px',
            }}
          >
            EHR
          </div>
        </div>

        {/* ================= CONNECTOR 2 (EHR -> BIOMARKERS) ================= */}
        <div
          style={{
            height: '110px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
            zIndex: 1,
          }}
        >
          <svg viewBox="0 0 44 110" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Top Branch */}
            <path
              className="flowing-dash-line"
              d="M 0 20 C 18 20, 26 55, 44 55"
              fill="none"
              stroke="#2c545b"
              strokeWidth="1.8"
              opacity="0.85"
            />
            {/* Center Branch */}
            <path
              className="flowing-dash-line"
              d="M 0 55 L 44 55"
              fill="none"
              stroke="#2c545b"
              strokeWidth="1.8"
              opacity="0.85"
            />
            {/* Bottom Branch */}
            <path
              className="flowing-dash-line"
              d="M 0 90 C 18 90, 26 55, 44 55"
              fill="none"
              stroke="#2c545b"
              strokeWidth="1.8"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* ================= CARD 3: HEALTH VITALITY INDEX ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          <div
            style={{
              backgroundColor: 'var(--color-cream-paper)',
              borderRadius: '16px',
              padding: '34px 20px 28px 20px',
              width: '100%',
              minHeight: '365px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'none',
              position: 'relative',
            }}
          >
            {/* Metric Header: 98% Vitality +7% */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#0f3e17',
                }}
              >
                {vitalityVal}%
              </span>
              <span
                style={{
                  backgroundColor: '#c4e5ca',
                  color: '#0f3e17',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '999px',
                }}
              >
                +7%
              </span>
            </div>

            <div style={{ fontSize: '11px', color: '#777', marginBottom: '16px' }}>
              Health Vitality Index
            </div>

            {/* Biomarker Waveform Graph Chart with Scanning Marker */}
            <div style={{ position: 'relative', width: '100%', height: '185px' }}>
              {/* Floating Dynamic Tooltip */}
              <div
                ref={tooltipRef}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '0px',
                  backgroundColor: '#fffefc',
                  border: '1px solid #efeeeb',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '9px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  zIndex: 3,
                }}
              >
                <div style={{ fontWeight: 600, color: '#555', marginBottom: '2px', fontSize: '9px' }}>Vitality Index</div>
                <div style={{ color: '#27ae60', fontWeight: 600, fontSize: '8.5px' }}>
                  {activeTooltipDate} &nbsp;{activeTooltipScore}
                </div>
                <div style={{ color: '#888', fontSize: '8.5px' }}>Dec 22, 2025 &nbsp;91% (Baseline)</div>
              </div>

              {/* Wavy Chart Lines (Biomarkers) */}
              <svg
                viewBox="0 0 140 120"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
              >
                {/* Subtle Horizontal Grid lines */}
                <line x1="0" y1="24" x2="140" y2="24" stroke="#f4f4f1" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="140" y2="60" stroke="#f4f4f1" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="96" x2="140" y2="96" stroke="#f4f4f1" strokeWidth="1" strokeDasharray="3 3" />

                {/* Vertical Scanning Indicator Line */}
                <line
                  ref={cursorLineRef}
                  x1={scanX}
                  y1="0"
                  x2={scanX}
                  y2="120"
                  stroke="#555555"
                  strokeWidth="1.3"
                  strokeDasharray="2 2"
                />

                {/* Waveform 1: Glycemic & Metabolic Recovery Curve */}
                <path
                  d="M 0 56 Q 20 56 35 52 T 65 46 T 85 54 T 105 38 T 140 48"
                  fill="none"
                  stroke="#84cc98"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Waveform 2: Cardiovascular & Lipid Balance Curve */}
                <path
                  d="M 0 84 Q 25 84 45 80 T 80 76 T 110 68 T 140 58"
                  fill="none"
                  stroke="#a3c4cc"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Bottom Tag */}
          <div
            style={{
              backgroundColor: 'var(--color-cream-paper)',
              color: '#0f3e17',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 20px',
              borderRadius: '999px',
              marginTop: '16px',
            }}
          >
            BIOMARKERS
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
