import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ChevronDown, PenLine, Info, X, Check, Lock, Sparkles, Plus } from 'lucide-react';
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

// Clinical scenarios that cycle through the board
const CLINICAL_SCENARIOS = [
  {
    templateName: '15 minute detox',
    text: 'Pt presents for brief detox session per wellness plan. Reports feeling well today. Denies dizziness, chest pain, SOB, fever, nausea/vomiting. Hydration reviewed.',
    noteSubtitle: 'Today, 10:30 AM • Completed & Locked',
    tag: 'Detox Session',
  },
  {
    templateName: 'Comprehensive Intake',
    text: 'Initial behavioral assessment completed. Patient reports episodic fatigue, sleep latency >60min, and moderate stress. Baseline vitals stable. Restorative care plan formulated.',
    noteSubtitle: 'Just now • Signed by Clinician',
    tag: 'Intake Assessment',
  },
  {
    templateName: 'Acupuncture & Meridian',
    text: 'Acupuncture session targeting autonomic regulation and meridian pathways. Patient reported immediate reduction in somatic tension post-procedure. Follow-up in 14 days.',
    noteSubtitle: 'Just now • Signed by Clinician',
    tag: 'Meridian Therapy',
  },
];

// Claims data for Box 3 (Billing that feels in-house)
const CLAIMS_DATA = [
  {
    name: 'Emma Smith',
    claimNumber: '1920929-AB',
    avatar: '/emma_avatar.jpg',
  },
  {
    name: 'Daniel Kim',
    claimNumber: '1847712-KM',
    avatar: '/daniel_avatar.jpg',
  },
  {
    name: 'Priya Patel',
    claimNumber: '2038841-PP',
    avatar: '/priya_avatar.jpg',
  },
  {
    name: 'Sofia Garcia',
    claimNumber: '1765409-SG',
    avatar: '/sofia_avatar.jpg',
  },
  {
    name: 'Michael John',
    claimNumber: '1993304-MJ',
    avatar: '/michael_avatar.jpg',
  },
];

export const AccurateEhrSection = () => {
  // Pinned horizontal track refs
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  // Box 1 (EHR) Refs
  const rightColRef = useRef(null);
  const newNoteBtnRef = useRef(null);
  const signBtnRef = useRef(null);
  const modalRef = useRef(null);
  const topRowRef = useRef(null);

  // Box 2 (CRM) Refs
  const convertBtnRef = useRef(null);

  // Box 3 (Billing) Refs & States
  const submitClaimBtnRef = useRef(null);
  const [billingSubmitted, setBillingSubmitted] = useState(false);
  const [billingClicking, setBillingClicking] = useState(false);

  // Box 1 Workflow States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(CLINICAL_SCENARIOS[0].templateName);
  const [typedText, setTypedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // SINGLE CURSOR FOR BOX 1: Moves around to click buttons!
  const [cursorPos, setCursorPos] = useState({
    x: 480,
    y: 430,
    isClicking: false,
    visible: true,
  });

  // Box 1 active patient notes list matching Image 2
  const [patientNotes, setPatientNotes] = useState([
    {
      id: 1,
      title: 'individual session note',
      subtitle: 'Today, 10:30 AM • Completed & Locked',
      tag: 'Detox Session',
    },
    {
      id: 2,
      title: 'patient safety rounds',
      subtitle: 'Oct 24, 2025 • Signed by Dr. Chen',
      tag: 'Safety Check',
    },
    {
      id: 3,
      title: 'group session note',
      subtitle: 'Sep 12, 2025 • Treatment Plan',
      tag: 'Group Therapy',
    },
  ]);

  // Box 2 (CRM) Drag & Conversion Workflow States
  // Phases: 'inquiry' -> 'dragging' -> 'admitted' -> 'form_completed' -> 'form_removed' -> 'show_convert' -> 'converted'
  const [crmPhase, setCrmPhase] = useState('inquiry');
  const [crmClicking, setCrmClicking] = useState(false);

  // ================= 1. PINNED HORIZONTAL SCROLL ANIMATION =================
  // Starts when Box 1 arrives in screen, ends immediately when the last box (Box 3) arrives in screen
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!trackRef.current || !sectionRef.current) return;

      const calculateDistance = () => {
        const boxes = trackRef.current.querySelectorAll('.accurate-ehr-container-box');
        if (!boxes || boxes.length < 2) {
          return Math.max(trackRef.current.scrollWidth - window.innerWidth, 0);
        }
        const firstBox = boxes[0];
        const lastBox = boxes[boxes.length - 1];
        // Precise distance so the last box finishes in the exact same centered position as the first box
        return Math.max(lastBox.offsetLeft - firstBox.offsetLeft, 0);
      };

      gsap.to(trackRef.current, {
        x: () => -calculateDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          start: 'top top',
          end: () => `+=${calculateDistance()}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, sectionRef);

    // Refresh dimensions after DOM renders
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  // Helper to compute target button coordinates relative to rightColRef
  const getCoordsForElement = (el) => {
    if (!rightColRef.current || !el) return null;
    const colRect = rightColRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      x: elRect.right - colRect.left - 12,
      y: elRect.bottom - colRect.top - 8,
    };
  };

  // ================= 2. BOX 1: SINGLE CURSOR GLIDING WORKFLOW =================
  useEffect(() => {
    let timeoutId;
    let typeIntervalId;
    let scenarioIdx = 0;

    // Set initial cursor position on the "+ New Note" button
    const initTimer = setTimeout(() => {
      const coords = getCoordsForElement(newNoteBtnRef.current);
      if (coords) {
        setCursorPos({ x: coords.x, y: coords.y, isClicking: false, visible: true });
      }
    }, 400);

    const runWorkflowCycle = () => {
      setIsModalOpen(false);
      setIsSigned(false);
      setIsTranscribing(false);
      setTypedText('');

      const scenario = CLINICAL_SCENARIOS[scenarioIdx];
      setSelectedTemplate(scenario.templateName);

      // 1. Move cursor to "+ New Note" button
      timeoutId = setTimeout(() => {
        const coords = getCoordsForElement(newNoteBtnRef.current);
        if (coords) {
          setCursorPos({ x: coords.x, y: coords.y, isClicking: false, visible: true });
        }

        // 2. Cursor clicks down on "+ New Note"
        timeoutId = setTimeout(() => {
          setCursorPos((prev) => ({ ...prev, isClicking: true }));

          if (newNoteBtnRef.current) {
            gsap.to(newNoteBtnRef.current, {
              scale: 0.92,
              duration: 0.12,
              yoyo: true,
              repeat: 1,
              ease: 'power1.inOut',
            });
          }

          // 3. Modal opens!
          timeoutId = setTimeout(() => {
            setCursorPos((prev) => ({ ...prev, isClicking: false }));
            setIsModalOpen(true);
            setIsTranscribing(true);
            setTypedText('');
            let charIndex = 0;
            const fullText = scenario.text;

            // 4. Cursor smoothly glides over to "Sign and Lock" inside the modal
            timeoutId = setTimeout(() => {
              const signCoords = getCoordsForElement(signBtnRef.current);
              if (signCoords) {
                setCursorPos({ x: signCoords.x, y: signCoords.y, isClicking: false, visible: true });
              }
            }, 500);

            // 5. Transcription live typing
            timeoutId = setTimeout(() => {
              typeIntervalId = setInterval(() => {
                if (charIndex < fullText.length) {
                  setTypedText(fullText.slice(0, charIndex + 1));
                  charIndex++;
                } else {
                  clearInterval(typeIntervalId);
                  setIsTranscribing(false);

                  // 6. Typing complete -> Cursor clicks "Sign and Lock"
                  timeoutId = setTimeout(() => {
                    const signCoords = getCoordsForElement(signBtnRef.current);
                    if (signCoords) {
                      setCursorPos({ x: signCoords.x, y: signCoords.y, isClicking: true, visible: true });
                    }

                    if (signBtnRef.current) {
                      gsap.to(signBtnRef.current, {
                        scale: 0.93,
                        duration: 0.14,
                        yoyo: true,
                        repeat: 1,
                        ease: 'power1.inOut',
                      });
                    }

                    timeoutId = setTimeout(() => {
                      setCursorPos((prev) => ({ ...prev, isClicking: false }));
                      setIsSigned(true);

                      // 7. Hold signed note, then close modal and return cursor to "+ New Note"
                      timeoutId = setTimeout(() => {
                        if (modalRef.current) {
                          gsap.to(modalRef.current, {
                            scale: 0.94,
                            opacity: 0,
                            y: 20,
                            duration: 0.35,
                            ease: 'power2.in',
                            onComplete: () => {
                              setIsModalOpen(false);

                              // Update notes list
                              setPatientNotes((prev) => [
                                {
                                  id: Date.now(),
                                  title: scenario.templateName,
                                  subtitle: scenario.noteSubtitle,
                                  tag: scenario.tag,
                                  isNew: true,
                                },
                                ...prev.slice(0, 2),
                              ]);

                              // Green flash highlight
                              if (topRowRef.current) {
                                gsap.fromTo(
                                  topRowRef.current,
                                  { backgroundColor: 'rgba(160, 202, 165, 0.65)', borderRadius: '10px' },
                                  { backgroundColor: 'transparent', duration: 1.8, ease: 'power2.out' }
                                );
                              }

                              // Glide cursor back to + New Note
                              setTimeout(() => {
                                const noteCoords = getCoordsForElement(newNoteBtnRef.current);
                                if (noteCoords) {
                                  setCursorPos({ x: noteCoords.x, y: noteCoords.y, isClicking: false, visible: true });
                                }
                              }, 250);

                              // Hold updated board for 5s, then cycle next scenario
                              timeoutId = setTimeout(() => {
                                scenarioIdx = (scenarioIdx + 1) % CLINICAL_SCENARIOS.length;
                                runWorkflowCycle();
                              }, 5000);
                            },
                          });
                        } else {
                          setIsModalOpen(false);
                          timeoutId = setTimeout(runWorkflowCycle, 5000);
                        }
                      }, 2200);
                    }, 180);
                  }, 800);
                }
              }, 32);
            }, 500);
          }, 200);
        }, 800);
      }, 2500);
    };

    const startTimer = setTimeout(runWorkflowCycle, 1500);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(startTimer);
      clearTimeout(timeoutId);
      clearInterval(typeIntervalId);
    };
  }, []);

  // ================= 3. BOX 2 (CRM): DRAG TO ADMITTED, FORM COMPLETED, THEN CONVERT BUTTON =================
  useEffect(() => {
    let t1, t2, t3, t4, t5, t6, t7;

    const runCrmWorkflow = () => {
      // 1. Initial state (matching user's screenshot):
      // Emma Smith in "New Inquiry", tilted 3.5deg, cursor grabbing it
      setCrmPhase('inquiry');
      setCrmClicking(true);

      // 2. Cursor drags Emma Smith card across to "Admitted"
      t1 = setTimeout(() => {
        setCrmPhase('dragging');

        // 3. Card lands in "Admitted", rotation straightens to 0deg
        t2 = setTimeout(() => {
          setCrmPhase('admitted');
          setCrmClicking(false);

          // 4. Tick with "Form completed" badge appears
          t3 = setTimeout(() => {
            setCrmPhase('form_completed');

            // 5. "Form completed" badge is removed
            t4 = setTimeout(() => {
              setCrmPhase('form_removed');

              // 6. "Convert to Patient" button appears
              t5 = setTimeout(() => {
                setCrmPhase('show_convert');

                // 7. Cursor clicks "Convert to Patient"
                t6 = setTimeout(() => {
                  setCrmClicking(true);

                  if (convertBtnRef.current) {
                    gsap.to(convertBtnRef.current, {
                      scale: 0.93,
                      duration: 0.12,
                      yoyo: true,
                      repeat: 1,
                      ease: 'power1.inOut',
                    });
                  }

                  setTimeout(() => {
                    setCrmClicking(false);
                    setCrmPhase('converted');

                    // 8. Hold converted state for 3.5s, then loop from beginning
                    t7 = setTimeout(() => {
                      runCrmWorkflow();
                    }, 3500);
                  }, 200);
                }, 900);
              }, 400);
            }, 1500);
          }, 600);
        }, 1100);
      }, 1600);
    };

    const initialDelay = setTimeout(runCrmWorkflow, 1000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, []);

  // Manual interactive click handlers for EHR Box
  const handleOpenNewNoteManual = () => {
    setIsModalOpen(true);
    setIsTranscribing(false);
    setIsSigned(false);
    setTypedText(CLINICAL_SCENARIOS[0].text);
  };

  const handleSelectTemplate = (name) => {
    setSelectedTemplate(name);
    setDropdownOpen(false);
    const found = CLINICAL_SCENARIOS.find((s) => s.templateName === name);
    if (found) {
      setTypedText(found.text);
    }
  };

  const ehrPills = [
    'Fewer clicks',
    'AI documentation',
    'Higher staff satisfaction',
    'Faster implementation',
  ];

  const crmPills = [
    'Higher conversions',
    'Fewer handoffs',
    'Less manual work',
    'Native to platform',
  ];

  const billingPills = [
    'Faster collections',
    'Fewer denials',
    'Real-time visibility',
    'AI-assisted workflows',
  ];

  // ================= 4. BOX 3 (BILLING): SUBMIT CLAIM BUTTON LOOP =================
  useEffect(() => {
    const billingInterval = setInterval(() => {
      setBillingClicking(true);

      if (submitClaimBtnRef.current) {
        gsap.to(submitClaimBtnRef.current, {
          scale: 0.93,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
        });
      }

      setTimeout(() => {
        setBillingClicking(false);
        setBillingSubmitted(true);

        setTimeout(() => {
          setBillingSubmitted(false);
        }, 2500);
      }, 180);
    }, 4500);

    return () => clearInterval(billingInterval);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        height: '100vh',
        minHeight: '800px',
        backgroundColor: 'var(--color-cream-paper)',
        width: '100%',
        position: 'relative',
        overflow: 'hidden', // Cleanly clips the horizontal track during scroll
        display: 'flex',
        alignItems: 'center',
        padding: '0',
      }}
      className="horizontal-showcase-pinned-section"
    >
      {/* ================= HORIZONTAL SLIDER TRACK: BOX 1, BOX 2 & BOX 3 ================= */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '36px',
          width: 'max-content',
          paddingLeft: 'max(28px, calc((100vw - 1440px) / 2))',
          paddingRight: 'max(28px, calc((100vw - 1440px) / 2))',
          willChange: 'transform',
          alignItems: 'center',
        }}
      >
        {/* ========================================================================= */}
        {/* ================= BOX 1: ACCURATE AND ORGANIZED EHR ==================== */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: '#a0caa5', // Signature sage green
            borderRadius: '32px',
            padding: '54px 52px',
            width: 'calc(100vw - 56px)',
            maxWidth: '1440px',
            minHeight: '700px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            boxSizing: 'border-box',
          }}
          className="accurate-ehr-container-box"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.18fr',
              gap: '52px',
              alignItems: 'center',
            }}
            className="accurate-ehr-grid"
          >
            {/* LEFT COLUMN: EHR COPY & PILLS */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                zIndex: 2,
                maxWidth: '490px',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', var(--font-suisse-intl), sans-serif",
                  fontSize: '52px',
                  lineHeight: 1.15,
                  fontWeight: 500,
                  color: '#0f3e17',
                  letterSpacing: '-0.025em',
                  margin: '0 0 20px 0',
                }}
              >
                Accurate and organized EHR
              </h2>

              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', var(--font-suisse-intl), sans-serif",
                  fontSize: '17px',
                  lineHeight: 1.6,
                  color: 'rgba(15, 62, 23, 0.9)',
                  maxWidth: '460px',
                  margin: '0 0 38px 0',
                  fontWeight: 400,
                }}
              >
                An EHR built for speed and efficiency. AI-powered documentation lets clinicians spend time with patients, not forms.
              </p>

              {/* Feature Pill Badges */}
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
                {ehrPills.map((pill, idx) => (
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
                <span>Explore the EHR</span>
                <ArrowRight size={17} strokeWidth={2.2} />
              </a>
            </div>

            {/* RIGHT COLUMN: SINGLE BOARD + MODAL + EXACTLY ONE GLIDING CURSOR */}
            <div
              ref={rightColRef}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                minHeight: '550px',
              }}
              className="accurate-ehr-right-col"
            >
              {/* PRIMARY BOARD: PATIENT RECORD */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  padding: '42px 44px',
                  width: '575px',
                  minHeight: '510px',
                  maxWidth: '100%',
                  boxShadow: '0 16px 45px rgba(15, 62, 23, 0.09)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '22px',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                }}
              >
                {/* Board Top: Patient Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '20px',
                    borderBottom: '1px solid #edf2ee',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img
                      src="/emma_avatar.jpg"
                      alt="Emma Smith"
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #eef5ef',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3
                          style={{
                            fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                            fontSize: '34px',
                            fontWeight: 400,
                            color: '#13391b',
                            margin: 0,
                            letterSpacing: '-0.01em',
                            lineHeight: 1.1,
                          }}
                        >
                          Emma Smith
                        </h3>
                        {/* Green DOB Pill Tag Matching Image 2 */}
                        <span
                          style={{
                            backgroundColor: '#d8ecd9',
                            color: '#13391b',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          DOB: 8/15/1979
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--font-suisse-intl)',
                          fontSize: '12px',
                          color: '#6e8071',
                          marginTop: '4px',
                          display: 'block',
                        }}
                      >
                        MRN #84291 • Active Wellness Chart
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#166534',
                      backgroundColor: '#eaf7ed',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#166534',
                      }}
                    />
                    In Care
                  </span>
                </div>

                {/* Patient Notes List Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {patientNotes.map((note, index) => (
                    <div
                      key={note.id}
                      ref={index === 0 ? topRowRef : null}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 16px',
                        borderRadius: '12px',
                        backgroundColor: '#fbfdfb',
                        border: '1px solid #edf4ee',
                        transition: 'background-color 0.25s ease',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#143b1c',
                            }}
                          >
                            {note.title}
                          </span>
                          {index === 0 && note.isNew && (
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: '#15803d',
                                backgroundColor: '#e2f4e6',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                              }}
                            >
                              New
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: '#65806b' }}>
                          {note.subtitle}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#97a89a' }}>
                        <button
                          type="button"
                          aria-label="Note info"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '3px',
                          }}
                        >
                          <Info size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label="Edit note"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '3px',
                          }}
                          onClick={handleOpenNewNoteManual}
                        >
                          <PenLine size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Primary Action Buttons: Edit Details + New Note */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  {/* Edit Details Button matching Image 2 */}
                  <button
                    type="button"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f3e17',
                      border: '1.5px solid #a0caa5',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '13.5px',
                      fontWeight: 600,
                      padding: '10px 18px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f2f8f3')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    <PenLine size={15} />
                    <span>Edit Details</span>
                  </button>

                  {/* + New Note Button (Target for cursor) */}
                  <button
                    ref={newNoteBtnRef}
                    type="button"
                    onClick={handleOpenNewNoteManual}
                    style={{
                      backgroundColor: '#0f3e17',
                      color: '#ffffff',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      padding: '11px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s ease, transform 0.15s ease',
                      boxShadow: '0 4px 14px rgba(15, 62, 23, 0.2)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#185422')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f3e17')}
                  >
                    <Plus size={17} />
                    <span>New Note</span>
                  </button>
                </div>
              </div>

              {/* ================= MODAL: OPENS UP ON NEW NOTE CLICK ================= */}
              {isModalOpen && (
                <div
                  ref={modalRef}
                  style={{
                    position: 'absolute',
                    left: '-65px',
                    bottom: '-35px',
                    width: '515px',
                    minHeight: '430px',
                    maxWidth: '96%',
                    backgroundColor: '#ffffff',
                    borderRadius: '22px',
                    padding: '34px 36px',
                    boxShadow: '0 28px 70px -10px rgba(15, 50, 20, 0.32), 0 10px 28px -5px rgba(0, 0, 0, 0.1)',
                    zIndex: 20,
                    border: '1px solid rgba(255, 255, 255, 0.95)',
                  }}
                  className="accurate-ehr-floating-modal"
                >
                  {/* Modal Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '25px',
                          fontWeight: 400,
                          color: '#13391b',
                          margin: 0,
                        }}
                      >
                        New note
                      </h4>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#166534',
                          backgroundColor: '#e7f5e9',
                          padding: '2.5px 9px',
                          borderRadius: '999px',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Active
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label="Close modal"
                      onClick={() => setIsModalOpen(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#708876',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '50%',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f5f1')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Template selector pill */}
                  <div style={{ marginBottom: '18px', position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#edf5ee',
                        border: '1px solid #d4e5d7',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#13391b',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <span>Template: {selectedTemplate}</span>
                      <ChevronDown
                        size={15}
                        style={{
                          transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </button>

                    {/* Dropdown Popover */}
                    {dropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          left: 0,
                          right: 0,
                          backgroundColor: '#ffffff',
                          borderRadius: '11px',
                          border: '1px solid #dce5dd',
                          boxShadow: '0 12px 28px rgba(15, 62, 23, 0.16)',
                          zIndex: 30,
                          overflow: 'hidden',
                        }}
                      >
                        {CLINICAL_SCENARIOS.map((scenario) => (
                          <button
                            key={scenario.templateName}
                            type="button"
                            onClick={() => handleSelectTemplate(scenario.templateName)}
                            style={{
                              width: '100%',
                              padding: '12px 18px',
                              textAlign: 'left',
                              background: selectedTemplate === scenario.templateName ? '#f2f8f3' : '#ffffff',
                              border: 'none',
                              borderBottom: '1px solid #f0f4f1',
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: '14px',
                              fontWeight: selectedTemplate === scenario.templateName ? 600 : 400,
                              color: '#13391b',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{scenario.templateName}</span>
                            {selectedTemplate === scenario.templateName && <Check size={15} color="#0f3e17" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transcription Body Box */}
                  <div
                    style={{
                      minHeight: '160px',
                      maxHeight: '190px',
                      overflowY: 'auto',
                      padding: '16px 18px',
                      backgroundColor: '#fafcfa',
                      border: '1px solid #e2ebe4',
                      borderRadius: '12px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '14.5px',
                      lineHeight: 1.65,
                      color: '#1e3822',
                      marginBottom: '20px',
                      position: 'relative',
                    }}
                  >
                    {typedText}
                    {isTranscribing && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: '2px',
                          height: '16px',
                          backgroundColor: '#1b8b3d',
                          marginLeft: '3px',
                          verticalAlign: 'text-bottom',
                          animation: 'blinkCursor 0.7s infinite',
                        }}
                      />
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid #edf2ee',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1.5px solid #a3cca8',
                        backgroundColor: '#ffffff',
                        color: '#144621',
                        borderRadius: '999px',
                        padding: '9px 18px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '13.5px',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(15, 62, 23, 0.05)',
                      }}
                    >
                      {isTranscribing ? (
                        <>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2.8px',
                              height: '15px',
                            }}
                          >
                            <span
                              style={{
                                width: '2.5px',
                                height: '10px',
                                backgroundColor: '#1b8b3d',
                                borderRadius: '2px',
                                animation: 'audioWave 0.8s ease-in-out infinite alternate',
                              }}
                            />
                            <span
                              style={{
                                width: '2.5px',
                                height: '15px',
                                backgroundColor: '#1b8b3d',
                                borderRadius: '2px',
                                animation: 'audioWave 0.6s ease-in-out infinite 0.15s alternate',
                              }}
                            />
                            <span
                              style={{
                                width: '2.5px',
                                height: '8px',
                                backgroundColor: '#1b8b3d',
                                borderRadius: '2px',
                                animation: 'audioWave 1.0s ease-in-out infinite 0.3s alternate',
                              }}
                            />
                            <span
                              style={{
                                width: '2.5px',
                                height: '12px',
                                backgroundColor: '#1b8b3d',
                                borderRadius: '2px',
                                animation: 'audioWave 0.7s ease-in-out infinite 0.2s alternate',
                              }}
                            />
                          </span>
                          <span>Transcribing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} color="#15803d" />
                          <span>AI Draft Complete</span>
                        </>
                      )}
                    </div>

                    {/* Right: Sign and Lock Button (Target for cursor) */}
                    <button
                      ref={signBtnRef}
                      type="button"
                      onClick={() => setIsSigned((prev) => !prev)}
                      style={{
                        backgroundColor: isSigned ? '#235930' : '#4a6750',
                        color: '#ffffff',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '14px',
                        fontWeight: 600,
                        padding: '11px 20px',
                        borderRadius: '9px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.25s ease, transform 0.15s ease',
                        boxShadow: '0 4px 12px rgba(74, 103, 80, 0.28)',
                      }}
                    >
                      {isSigned ? (
                        <>
                          <Lock size={16} />
                          <span>Signed & Locked</span>
                        </>
                      ) : (
                        <>
                          <PenLine size={16} />
                          <span>Sign and Lock</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ================= EXACTLY ONE CURSOR FOR BOX 1: GLIDES TO AND CLICKS BUTTONS ================= */}
              <CustomMouseCursor
                isClicking={cursorPos.isClicking}
                style={{
                  left: `${cursorPos.x}px`,
                  top: `${cursorPos.y}px`,
                  transition: 'left 0.7s cubic-bezier(0.22, 1, 0.36, 1), top 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.12s ease',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ================= BOX 2: ADMISSIONS THAT RUN SMOOTHLY ================== */}
        {/* ============= (MOVED FROM BELOW TO THE RIGHT AS REQUESTED) ============== */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: '#a0caa5', // Signature sage green matching Box 1
            borderRadius: '32px',
            padding: '54px 52px',
            width: 'calc(100vw - 56px)',
            maxWidth: '1440px',
            minHeight: '700px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            boxSizing: 'border-box',
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
            className="accurate-ehr-grid"
          >
            {/* LEFT COLUMN: CRM COPY & PILLS */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                zIndex: 2,
                maxWidth: '490px',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', var(--font-suisse-intl), sans-serif",
                  fontSize: '52px',
                  lineHeight: 1.15,
                  fontWeight: 500,
                  color: '#0f3e17',
                  letterSpacing: '-0.025em',
                  margin: '0 0 20px 0',
                }}
              >
                Admissions that run smoothly
              </h2>

              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', var(--font-suisse-intl), sans-serif",
                  fontSize: '17px',
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
                {crmPills.map((pill, idx) => (
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

            {/* RIGHT COLUMN: CRM KANBAN BOARD */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
              className="crm-board-wrapper"
            >
              {/* WHITE CRM KANBAN BOARD */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '26px',
                  padding: '44px 44px',
                  width: '610px',
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
                    position: 'relative',
                    minHeight: '380px',
                  }}
                >
                  {/* ================= COLUMN 1: NEW INQUIRY ================= */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
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

                    {/* Slot 1: Emma Smith (Rendered here during 'inquiry' and 'dragging') */}
                    {(crmPhase === 'inquiry' || crmPhase === 'dragging') && (
                      <div
                        style={{
                          backgroundColor: '#dcf0df', // Exact light sage green from screenshot
                          borderRadius: '16px',
                          padding: '16px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          border: '1px solid rgba(15, 62, 23, 0.08)',
                          position: 'relative',
                          zIndex: crmPhase === 'dragging' ? 60 : 20,
                          transform: crmPhase === 'inquiry'
                            ? 'translate(0px, 0px) rotate(3.5deg)'
                            : 'translate(273px, 0px) rotate(3.5deg)',
                          boxShadow: crmPhase === 'dragging'
                            ? '0 18px 36px rgba(15, 62, 23, 0.22)'
                            : '0 4px 14px rgba(15, 62, 23, 0.06)',
                          transition: crmPhase === 'dragging'
                            ? 'transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease'
                            : 'transform 0.4s ease, box-shadow 0.3s ease',
                          willChange: 'transform',
                        }}
                      >
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

                        {/* Mouse Cursor grabbing Emma Smith at bottom right corner (Matching user screenshot) */}
                        <CustomMouseCursor
                          isClicking={crmClicking}
                          style={{
                            right: '-8px',
                            bottom: '-12px',
                          }}
                        />
                      </div>
                    )}

                    {/* Placeholder space if Emma has moved to Admitted to keep list neat */}
                    {crmPhase !== 'inquiry' && crmPhase !== 'dragging' && (
                      <div style={{ height: '0px', transition: 'height 0.4s ease' }} />
                    )}

                    {/* Card 2: Alex Moreno */}
                    <div
                      style={{
                        backgroundColor: '#f8f6f0',
                        borderRadius: '16px',
                        padding: '16px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        border: '1px solid rgba(15, 62, 23, 0.04)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
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

                    {/* Card 3: Daniel Cruz */}
                    <div
                      style={{
                        backgroundColor: '#f8f6f0',
                        borderRadius: '16px',
                        padding: '16px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        border: '1px solid rgba(15, 62, 23, 0.04)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
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

                    {/* Emma Smith card once dropped into Admitted */}
                    {crmPhase !== 'inquiry' && crmPhase !== 'dragging' && (
                      <div
                        style={{
                          backgroundColor: '#d8ecd9',
                          borderRadius: '16px',
                          padding: '18px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                          border: '1px solid rgba(15, 62, 23, 0.08)',
                          position: 'relative',
                          boxShadow: crmPhase === 'converted'
                            ? '0 6px 20px rgba(35, 89, 48, 0.16)'
                            : '0 2px 10px rgba(15, 62, 23, 0.05)',
                          animation: 'popIn 0.35s ease forwards',
                        }}
                      >
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

                        {/* STEP 3 & 4: "Form completed" badge pops in, then gets removed */}
                        {crmPhase === 'form_completed' && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#e6f6e8',
                              border: '1px solid #bfe3c4',
                              color: '#15803d',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              width: 'fit-content',
                              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            }}
                          >
                            <Check size={14} strokeWidth={2.6} />
                            <span>Form completed</span>
                          </div>
                        )}

                        {/* STEP 5: Then button "Convert to Patient" appears and gets clicked */}
                        {(crmPhase === 'show_convert' || crmPhase === 'converted') && (
                          <div style={{ position: 'relative' }}>
                            <button
                              ref={convertBtnRef}
                              type="button"
                              style={{
                                position: 'relative',
                                backgroundColor: crmPhase === 'converted' ? '#235930' : '#3c1333',
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
                                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              }}
                            >
                              {crmPhase === 'converted' ? (
                                <>
                                  <Check size={16} strokeWidth={2.5} />
                                  <span>Converted to Patient</span>
                                </>
                              ) : (
                                <span>Convert to Patient</span>
                              )}

                              {/* Mouse Cursor clicking Convert to Patient */}
                              <CustomMouseCursor
                                isClicking={crmClicking}
                                style={{
                                  right: '-8px',
                                  bottom: '-12px',
                                }}
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card: Olivia Bennett */}
                    <div
                      style={{
                        backgroundColor: '#f8f6f0',
                        borderRadius: '16px',
                        padding: '16px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        border: '1px solid rgba(15, 62, 23, 0.04)',
                        transition: 'transform 0.35s ease, box-shadow 0.2s ease',
                      }}
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

        {/* ========================================================================= */}
        {/* ================= BOX 3: BILLING THAT FEELS IN-HOUSE ==================== */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: '#a0caa5', // Signature sage green matching Box 1 & Box 2
            borderRadius: '32px',
            padding: '54px 52px',
            width: 'calc(100vw - 56px)',
            maxWidth: '1440px',
            minHeight: '700px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            boxSizing: 'border-box',
          }}
          className="accurate-ehr-container-box"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.15fr',
              gap: '52px',
              alignItems: 'center',
            }}
            className="accurate-ehr-grid"
          >
            {/* LEFT COLUMN: BILLING COPY & PILLS */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                zIndex: 2,
                maxWidth: '490px',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', var(--font-suisse-intl), sans-serif",
                  fontSize: '52px',
                  lineHeight: 1.15,
                  fontWeight: 500,
                  color: '#0f3e17',
                  letterSpacing: '-0.025em',
                  margin: '0 0 20px 0',
                }}
              >
                Billing that feels in-house
              </h2>

              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', var(--font-suisse-intl), sans-serif",
                  fontSize: '17px',
                  lineHeight: 1.6,
                  color: 'rgba(15, 62, 23, 0.9)',
                  maxWidth: '470px',
                  margin: '0 0 38px 0',
                  fontWeight: 400,
                }}
              >
                A native RCM engine that powers expert billing services with real-time visibility, fast follow-up, and transparent reporting.
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
                {billingPills.map((pill, idx) => (
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
                <span>Explore Billing</span>
                <ArrowRight size={17} strokeWidth={2.2} />
              </a>
            </div>

            {/* RIGHT COLUMN: WHITE CLAIMS BOARD & FLOATING CLAIM MODAL */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                minHeight: '540px',
              }}
              className="claims-board-wrapper"
            >
              {/* WHITE CLAIMS TABLE BOARD */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '26px',
                  padding: '38px 42px',
                  width: '560px',
                  maxWidth: '100%',
                  minHeight: '480px',
                  boxShadow: '0 16px 45px rgba(15, 62, 23, 0.09)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                }}
              >
                {/* Heading: Claims */}
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '36px',
                    fontWeight: 400,
                    color: '#13391b',
                    margin: '0',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Claims
                </h3>

                {/* Table Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #edf3ee',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#6e8071',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <span>Patient Name</span>
                  <span>Claim Number</span>
                </div>

                {/* Table Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {CLAIMS_DATA.map((claim, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.4fr 1fr',
                        alignItems: 'center',
                        fontSize: '14.5px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#13391b',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={claim.avatar}
                          alt={claim.name}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid #edf4ee',
                          }}
                        />
                        <span style={{ fontWeight: 500 }}>{claim.name}</span>
                      </div>
                      <span style={{ color: '#445b49', fontWeight: 400 }}>{claim.claimNumber}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= FLOATING CLAIM MODAL: FRONT RIGHT ================= */}
              <div
                style={{
                  position: 'absolute',
                  right: '-10px',
                  bottom: '-20px',
                  width: '375px',
                  maxWidth: '92%',
                  backgroundColor: '#ffffff',
                  borderRadius: '22px',
                  padding: '28px 30px',
                  boxShadow: '0 24px 60px rgba(15, 62, 23, 0.22), 0 8px 20px rgba(0, 0, 0, 0.06)',
                  zIndex: 25,
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                }}
                className="claim-floating-modal"
              >
                {/* Header with Close Icon */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <h4
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '24px',
                      fontWeight: 400,
                      color: '#13391b',
                      margin: 0,
                    }}
                  >
                    Claim #1920929-AB
                  </h4>
                  <button
                    type="button"
                    aria-label="Close"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9aa89d',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* Key-Value Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#68806f' }}>Patient Name</span>
                    <span style={{ fontWeight: 600, color: '#13391b' }}>Emma Smith</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#68806f' }}>DOB</span>
                    <span style={{ fontWeight: 600, color: '#13391b' }}>09/18/1983</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#68806f' }}>Member ID</span>
                    <span style={{ fontWeight: 600, color: '#13391b' }}>W12039K8L</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#68806f' }}>Group ID</span>
                    <span style={{ fontWeight: 600, color: '#13391b' }}>1000-2000</span>
                  </div>
                </div>

                {/* Beige/Cream Inset Box */}
                <div
                  style={{
                    backgroundColor: '#faf6ee',
                    borderRadius: '11px',
                    padding: '12px 16px',
                    margin: '16px 0 20px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '13px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    border: '1px solid #f0eae0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#737f76' }}>Date of Service</span>
                    <span style={{ fontWeight: 600, color: '#13391b' }}>02/06/2026</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#737f76' }}>Amount</span>
                    <span style={{ fontWeight: 600, color: '#13391b' }}>$500</span>
                  </div>
                </div>

                {/* Action Button: "Submit Claim" with Animated Cursor */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                  <button
                    ref={submitClaimBtnRef}
                    type="button"
                    onClick={() => setBillingSubmitted((p) => !p)}
                    style={{
                      position: 'relative',
                      backgroundColor: billingSubmitted ? '#235930' : '#0f3e17',
                      color: '#ffffff',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      padding: '11px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      transition: 'background-color 0.25s ease, transform 0.15s ease',
                      boxShadow: '0 4px 14px rgba(15, 62, 23, 0.2)',
                    }}
                  >
                    {billingSubmitted ? (
                      <>
                        <Check size={16} strokeWidth={2.5} />
                        <span>Claim Submitted</span>
                      </>
                    ) : (
                      <span>Submit Claim</span>
                    )}

                    {/* MOUSE CURSOR OVER SUBMIT CLAIM BUTTON */}
                    <CustomMouseCursor
                      isClicking={billingClicking}
                      style={{
                        right: '-8px',
                        bottom: '-12px',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for responsive layout and animations */}
      <style>{`
        @keyframes audioWave {
          0% {
            transform: scaleY(0.35);
          }
          100% {
            transform: scaleY(1.4);
          }
        }
        @keyframes blinkCursor {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          70% {
            transform: scale(1.04);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @media (max-width: 1100px) {
          .accurate-ehr-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .accurate-ehr-right-col,
          .crm-board-wrapper,
          .claims-board-wrapper {
            justify-content: center !important;
          }
          .accurate-ehr-floating-modal,
          .claim-floating-modal {
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            bottom: -20px !important;
          }
        }
      `}</style>
    </section>
  );
};
