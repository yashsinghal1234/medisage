import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FeatureCard } from '../components/FeatureCard';
import { FAQList } from '../components/FAQRow';
import { InteractiveDashboardPreview } from '../components/InteractiveDashboardPreview';
import { PartnerStrip } from '../components/PartnerStrip';
import { ClinicalSupportSection } from '../components/ClinicalSupportSection';
import { ProblemSection } from '../components/ProblemSection';
import { WhySection } from '../components/WhySection';
import { EhrShowcaseSection } from '../components/EhrShowcaseSection';
import { AccurateEhrSection } from '../components/AccurateEhrSection';
import { ProductSpeaksSection } from '../components/ProductSpeaksSection';
import { ComplianceSection } from '../components/ComplianceSection';

export const Home = () => {
  const navigate = useNavigate();

  // Animation refs
  const sageCardRef = useRef(null);
  const actionBtnRef = useRef(null);
  const arrowRef = useRef(null);
  const rightColumnRef = useRef(null);

  // GSAP Entrance Animations ("from min to box" scale & expand motion)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left Sage Card: scales and expands from min (0.9) to full box (1)
      if (sageCardRef.current) {
        gsap.fromTo(
          sageCardRef.current,
          { scale: 0.9, y: 35, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 1.1, delay: 0.2, ease: 'power3.out' }
        );
      }

      // Left Action Card: expands from min (0.92) to box (1)
      if (actionBtnRef.current) {
        gsap.fromTo(
          actionBtnRef.current,
          { scale: 0.92, y: 25, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 1.0, delay: 0.35, ease: 'power3.out' }
        );
      }

      // Right Slate Panel: scales from min (0.9) to box (1)
      if (rightColumnRef.current) {
        gsap.fromTo(
          rightColumnRef.current,
          { scale: 0.9, y: 35, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 1.15, delay: 0.28, ease: 'power3.out' }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Smooth "Explore Health Vault" button hover handlers (Color stays deep green #0f3e17)
  const handleButtonMouseEnter = () => {
    if (actionBtnRef.current) {
      gsap.to(actionBtnRef.current, {
        y: -3,
        duration: 0.35,
        ease: 'power2.out',
      });
    }
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        x: 10,
        duration: 0.45,
        ease: 'power3.out',
      });
    }
  };

  const handleButtonMouseLeave = () => {
    if (actionBtnRef.current) {
      gsap.to(actionBtnRef.current, {
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
      });
    }
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        x: 0,
        duration: 0.45,
        ease: 'power2.out',
      });
    }
  };

  const faqItems = [
    {
      question: 'How does MediSage synthesize scattered medical documents into actionable insights?',
      answer: 'Our clinical AI pipeline ingests prescriptions, pathology biopsies, DICOM scans, and blood panels via OCR and medical entity extraction, mapping every biomarker and treatment over time into a unified, longitudinal health profile.',
    },
    {
      question: 'Is patient health data encrypted and compliant with medical privacy standards?',
      answer: 'Yes. Every record in your MediSage vault is encrypted with AES-256 at rest and transmitted using TLS 1.3. You hold complete cryptographic authority over your data, granting or revoking doctor access with single-use clinical passes.',
    },
    {
      question: 'How does the AI provide preventive, botanical, and lifestyle guidance?',
      answer: 'MediSage correlates your chronological biomarker trajectories (such as HbA1c, lipid subfractions, and inflammatory markers) to recommend evidence-backed nutritional, botanical, and lifestyle protocols tailored specifically to your physiology.',
    },
    {
      question: 'How does the Emergency Medical Pass protect me during urgent situations?',
      answer: 'Your emergency health pass generates a secure, instant triage profile with your blood group, life-critical allergy alerts, ongoing prescriptions, and emergency ICE contacts, accessible in seconds by attending first responders.',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-cream-paper)', minHeight: '100vh' }}>
      <Navbar />

      <main>
        {/* HERO SECTION WITH LIVE WORKING DASHBOARD PREVIEW */}
        <section style={{ paddingTop: '10px', paddingBottom: '24px' }}>
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '540px 1fr',
                gap: '24px',
                alignItems: 'stretch',
              }}
            >
              {/* LEFT COLUMN: TOP SAGE CARD + BOTTOM FOREST ACTION CARD */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  height: '100%',
                }}
              >
                {/* Top Sage Card */}
                <div
                  ref={sageCardRef}
                  style={{
                    backgroundColor: '#a9d4b2', // Sage Mist wash
                    borderRadius: '18px',
                    padding: '54px 46px 42px 46px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '430px',
                    transformOrigin: 'center bottom',
                    willChange: 'transform, opacity',
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', 'Faire Octave', Georgia, serif",
                        fontWeight: 400,
                        fontSize: '74px',
                        lineHeight: 1.02,
                        letterSpacing: '-0.035em',
                        color: '#0f3e17',
                        margin: 0,
                      }}
                    >
                      Fewer clicks.<br />
                      More care.
                    </h1>

                    <p
                      style={{
                        fontFamily: 'var(--font-suisse-intl)',
                        fontSize: '16px',
                        lineHeight: 1.55,
                        color: '#0f3e17',
                        marginTop: '46px',
                        marginBottom: 0,
                        maxWidth: '440px',
                        fontWeight: 400,
                      }}
                    >
                      Transform scattered prescriptions, diagnostic scans, and blood panels into an AI-synthesized health record with personalized preventive guidance.
                    </p>
                  </div>
                </div>

                {/* Bottom Forest Action Card: Deep Green #0f3e17 */}
                <Link
                  ref={actionBtnRef}
                  to="/dashboard"
                  className="btn-forest-action"
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseLeave={handleButtonMouseLeave}
                  style={{
                    backgroundColor: '#0f3e17',
                    borderRadius: '18px',
                    padding: '28px 42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transformOrigin: 'center center',
                    willChange: 'transform, opacity',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-suisse-intl)',
                      fontSize: '23px',
                      fontWeight: 400,
                      color: '#fffefc',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Explore Health Vault
                  </span>

                  {/* Long Slender White Trailing Arrow with GSAP Glide */}
                  <svg
                    ref={arrowRef}
                    width="40"
                    height="24"
                    viewBox="0 0 40 24"
                    fill="none"
                    stroke="#fffefc"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      display: 'block',
                      willChange: 'transform',
                    }}
                  >
                    <line x1="2" y1="12" x2="36" y2="12"></line>
                    <polyline points="26 2 36 12 26 22"></polyline>
                  </svg>
                </Link>
              </div>

              {/* RIGHT COLUMN: LIVE WORKING VIDEO-DASHBOARD SIMULATION */}
              <div
                ref={rightColumnRef}
                style={{
                  transformOrigin: 'center bottom',
                  willChange: 'transform, opacity',
                }}
              >
                <InteractiveDashboardPreview />
              </div>
            </div>
          </div>
        </section>

        {/* BEHAVIORAL HEALTH ORGANIZATIONS PARTNER STRIP */}
        <PartnerStrip />

        {/* BROAD CLINICAL SUPPORT SECTION (WITH BOTTOM-TO-UP ROLLING TEXT) */}
        <ClinicalSupportSection />

        {/* THE PROBLEM -> THE SOLUTION METAMORPHOSIS SECTION (WITH 7 CONVERGING LINES) */}
        <ProblemSection />

        {/* WHY EASE: 3-CARD SYSTEM WORKING TOGETHER */}
        <WhySection />

        {/* AN EHR DESIGNED FOR HOW CLINICIANS ACTUALLY WORK (CONCENTRIC CIRCLES + EHR SHOWCASE) */}
        <EhrShowcaseSection />

        {/* HORIZONTAL SHOWCASE: ACCURATE EHR -> ADMISSIONS CRM -> BILLING (PINNED HORIZONTAL SCROLL) */}
        <AccurateEhrSection />

        {/* OUR PRODUCT SPEAKS FOR ITSELF (CONCENTRIC NESTED RECTANGLES + EASE AT WORK) */}
        <ProductSpeaksSection />

        {/* STANDARDS AND REPORTING: COMPLIANCE YOU CAN COUNT ON */}
        <ComplianceSection />

        {/* THREE HEAVIER-TINTED SAGE FEATURE CARDS */}
        <section id="features" className="section-padding">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '49px' }}>
              <span className="eyebrow-label">CLINICAL ARCHITECTURE</span>
              <h2
                style={{
                  fontFamily: 'var(--font-faire-octave)',
                  fontSize: '40px',
                  fontWeight: 400,
                  color: '#0f3e17',
                  letterSpacing: '-0.01em',
                  marginBottom: '14px',
                }}
              >
                Built for clinical precision, rendered on watercolor paper.
              </h2>
              <p style={{ maxWidth: '620px', margin: '0 auto', fontSize: '15px', color: '#555' }}>
                Surfaces are flat and shadowless; depth comes from layered botanical tinted panels and generous breathing room.
              </p>
            </div>

            <div className="grid-3">
              <FeatureCard
                eyebrow="MODULE 01"
                title="Universal Document Vault"
                body="Prescriptions, pathology biopsies, DICOM scans, and blood reports automatically indexed with diagnosis tags and prescribing physicians."
                tag="DigiLocker FHIR"
                variant="sage"
              />

              <FeatureCard
                eyebrow="MODULE 02"
                title="AI Biomarker Synthesis"
                body="Longitudinal tracking connects fasting lipids, HbA1c, and vitals over time to generate tailored botanical, dietary, and preventive guidance."
                tag="Clinical AI"
                variant="sage"
              />

              <FeatureCard
                eyebrow="MODULE 03"
                title="Insurance & Emergency Pass"
                body="Personalized health insurance matching for pre-existing diagnoses alongside an instant 1-click emergency medical triage pass."
                tag="Policy & ICE Pass"
                variant="sage"
              />
            </div>
          </div>
        </section>

        {/* TWO-COLUMN FAQ SECTION */}
        <section id="faq" className="section-padding">
          <div className="container">
            <div style={{ marginBottom: '42px' }}>
              <span className="eyebrow-label">CLINICAL QUESTIONS</span>
              <h2
                style={{
                  fontFamily: 'var(--font-faire-octave)',
                  fontSize: '40px',
                  fontWeight: 400,
                  color: '#0f3e17',
                  margin: 0,
                }}
              >
                Frequently Asked Inquiries
              </h2>
            </div>

            <FAQList items={faqItems} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
