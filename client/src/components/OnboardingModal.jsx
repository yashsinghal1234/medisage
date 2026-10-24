import React, { useState } from 'react';
import { 
  User, 
  Stethoscope, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Droplet,
  FolderHeart,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const OnboardingModal = ({ isOpen, onClose, onComplete }) => {
  const { user, updateProfile } = useAuth();

  // Step index: 0 = Role, 1 = Blood Group, 2 = Primary Health Focus, 3 = Completion
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [selectedRole, setSelectedRole] = useState(user?.role || 'patient');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(user?.bloodGroup || 'O+ Positive');
  const [selectedHealthFocus, setSelectedHealthFocus] = useState('preventive');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const totalSteps = 3;

  // Step 1: Account Role
  const roleOptions = [
    {
      id: 'patient',
      title: 'Patient / Individual',
      subtitle: 'Personal & Family Vault',
      desc: 'Catalog lab reports, track medications, store clinical records, and access AI biomarker insights.',
      icon: User,
      badge: 'Individual & Family',
    },
    {
      id: 'clinician',
      title: 'Clinician / Physician',
      subtitle: 'Medical Professional Workflow',
      desc: 'Review patient clinical dossiers, monitor surveillance reminders, and cross-reference diagnostic reports.',
      icon: Stethoscope,
      badge: 'Licensed Clinicians',
    },
  ];

  // Step 2: Blood Group Options
  const bloodGroups = [
    { id: 'O+ Positive', label: 'O+', type: 'Positive', tag: 'Universal RBC Donor variant' },
    { id: 'O- Negative', label: 'O-', type: 'Negative', tag: 'Emergency Universal Red Blood' },
    { id: 'A+ Positive', label: 'A+', type: 'Positive', tag: 'Common Biological Phenotype' },
    { id: 'A- Negative', label: 'A-', type: 'Negative', tag: 'Clinical Baseline Match' },
    { id: 'B+ Positive', label: 'B+', type: 'Positive', tag: 'Antigen B Positive' },
    { id: 'B- Negative', label: 'B-', type: 'Negative', tag: 'Rare Biological Phenotype' },
    { id: 'AB+ Positive', label: 'AB+', type: 'Positive', tag: 'Universal Plasma Recipient' },
    { id: 'AB- Negative', label: 'AB-', type: 'Negative', tag: 'Universal Plasma Donor' },
    { id: 'Unknown', label: 'Unknown', type: 'Prefer not to specify', tag: 'Can be updated anytime later' },
  ];

  // Step 3: Health Priorities
  const focusOptions = [
    {
      id: 'preventive',
      title: 'Preventive Longevity & Lab Biomarkers',
      desc: 'Deep tracking of HbA1c, metabolic panels, lipid profiles, and cardiovascular risk scores.',
      icon: Activity,
    },
    {
      id: 'prescriptions',
      title: 'Prescriptions & Medication Adherence',
      desc: 'Active regimen reconciliation, adverse drug interaction surveillance, and dose reminders.',
      icon: Heart,
    },
    {
      id: 'comprehensive',
      title: 'Universal Health Vault & Document Archival',
      desc: 'End-to-end encrypted storage for hospital discharges, MRI scans, and emergency passports.',
      icon: ShieldCheck,
    },
    {
      id: 'family',
      title: 'Family & Dependent Care Coordination',
      desc: 'Manage medical records for children, elderly parents, and dependents under one vault.',
      icon: FolderHeart,
    },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const updates = {
        role: selectedRole,
        bloodGroup: selectedBloodGroup,
        healthFocus: selectedHealthFocus,
        onboarded: true,
        onboardingCompletedAt: new Date().toISOString(),
      };

      if (user?._id) {
        localStorage.setItem(`medisage_onboarded_${user._id}`, 'true');
      }
      localStorage.setItem('medisage_onboarded_latest', 'true');

      if (updateProfile) {
        updateProfile(updates);
      }

      // Show brief success screen
      setCurrentStep(3);
      setTimeout(() => {
        if (onComplete) onComplete(updates);
        if (onClose) onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      if (onClose) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(10, 46, 18, 0.65)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 24px 60px rgba(10, 46, 18, 0.25), 0 4px 12px rgba(0,0,0,0.06)',
          border: '1px solid rgba(15, 62, 23, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* ================= MODAL HEADER & PROGRESS ================= */}
        <div
          style={{
            padding: '24px 32px 18px 32px',
            borderBottom: '1px solid #edf4ef',
            backgroundColor: '#fbfdfb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <Logo size={24} fontSize="20px" color="#000000" to="/" />
            {currentStep < 3 && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0f3e17',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  backgroundColor: '#edf6ee',
                  padding: '4px 12px',
                  borderRadius: '999px',
                }}
              >
                Question {currentStep + 1} of {totalSteps}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {currentStep < 3 && (
            <div
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#e6efe8',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  backgroundColor: '#0f3e17',
                  borderRadius: '999px',
                  transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          )}
        </div>

        {/* ================= STEP CONTENT BODY ================= */}
        <div style={{ padding: '32px 36px', minHeight: '380px', boxSizing: 'border-box' }}>
          {/* ================= QUESTION 1: ACCOUNT ROLE ================= */}
          {currentStep === 0 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2d6a38',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Step 1 • Identity & Clinical Role
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#0a2e12',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    lineHeight: 1.25,
                  }}
                >
                  How will you be using MediSage?
                </h3>
                <p
                  style={{
                    fontFamily: "'Newsreader', 'Cormorant Garamond', Georgia, serif",
                    margin: '8px 0 0 0',
                    fontSize: '15px',
                    color: '#55725b',
                    lineHeight: 1.5,
                  }}
                >
                  Select the primary workflow for your vault. You can toggle dependent and clinician tools later.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedRole === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedRole(opt.id)}
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        border: `2px solid ${isSelected ? '#0f3e17' : '#e2ede4'}`,
                        backgroundColor: isSelected ? '#f1f8f3' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: isSelected ? '0 8px 24px rgba(15, 62, 23, 0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#b8d6bf';
                          e.currentTarget.style.backgroundColor = '#fafcfa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#e2ede4';
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '14px',
                          }}
                        >
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              backgroundColor: isSelected ? '#0f3e17' : '#eaf4ed',
                              color: isSelected ? '#ffffff' : '#0f3e17',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.18s ease',
                            }}
                          >
                            <Icon size={20} />
                          </div>
                          {isSelected && (
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: '#0f3e17',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Check size={13} strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#0a2e12' }}>
                          {opt.title}
                        </h4>
                        <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#2d6a38', marginBottom: '8px' }}>
                          {opt.subtitle}
                        </div>
                        <p
                          style={{
                            fontFamily: "'Newsreader', 'Cormorant Garamond', Georgia, serif",
                            margin: 0,
                            fontSize: '13px',
                            color: '#55725b',
                            lineHeight: 1.45,
                          }}
                        >
                          {opt.desc}
                        </p>
                      </div>

                      <div
                        style={{
                          marginTop: '16px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: isSelected ? '#0f3e17' : '#738e78',
                          letterSpacing: '0.03em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Check size={12} strokeWidth={2.5} />
                        <span>{opt.badge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= QUESTION 2: BLOOD GROUP ================= */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2d6a38',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Step 2 • Clinical Baseline
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#0a2e12',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    lineHeight: 1.25,
                  }}
                >
                  What is your biological blood group?
                </h3>
                <p
                  style={{
                    fontFamily: "'Newsreader', 'Cormorant Garamond', Georgia, serif",
                    margin: '8px 0 0 0',
                    fontSize: '15px',
                    color: '#55725b',
                    lineHeight: 1.5,
                  }}
                >
                  This critical biomarker is indexed into your Emergency Clinical Passport for rapid first-responder verification.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {bloodGroups.map((bg) => {
                  const isSelected = selectedBloodGroup === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setSelectedBloodGroup(bg.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: `1.5px solid ${isSelected ? '#0f3e17' : '#e0ece2'}`,
                        backgroundColor: isSelected ? '#f1f8f3' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = '#b8d6bf';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = '#e0ece2';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: isSelected ? '#0f3e17' : '#1a3b22' }}>
                          {bg.label}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#638069', marginTop: '2px' }}>
                          {bg.type}
                        </div>
                      </div>
                      {isSelected ? (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: '#0f3e17',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </div>
                      ) : (
                        <Droplet size={14} color="#a6c4ae" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= QUESTION 3: HEALTH FOCUS ================= */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2d6a38',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Step 3 • Vault Customization
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#0a2e12',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    lineHeight: 1.25,
                  }}
                >
                  What is your primary clinical health focus?
                </h3>
                <p
                  style={{
                    fontFamily: "'Newsreader', 'Cormorant Garamond', Georgia, serif",
                    margin: '8px 0 0 0',
                    fontSize: '15px',
                    color: '#55725b',
                    lineHeight: 1.5,
                  }}
                >
                  MediSage AI Companion adapts its biomarker analysis and reminders based on your primary objective.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {focusOptions.map((foc) => {
                  const Icon = foc.icon;
                  const isSelected = selectedHealthFocus === foc.id;
                  return (
                    <div
                      key={foc.id}
                      onClick={() => setSelectedHealthFocus(foc.id)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: `1.5px solid ${isSelected ? '#0f3e17' : '#e0ece2'}`,
                        backgroundColor: isSelected ? '#f1f8f3' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 16px rgba(15, 62, 23, 0.08)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = '#b8d6bf';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = '#e0ece2';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '9px',
                            backgroundColor: isSelected ? '#0f3e17' : '#eaf4ed',
                            color: isSelected ? '#ffffff' : '#0f3e17',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0a2e12', flex: 1 }}>
                          {foc.title}
                        </h4>
                        {isSelected && <Check size={14} color="#0f3e17" strokeWidth={3} />}
                      </div>
                      <p
                        style={{
                          fontFamily: "'Newsreader', 'Cormorant Garamond', Georgia, serif",
                          margin: 0,
                          fontSize: '13px',
                          color: '#55725b',
                          lineHeight: 1.4,
                        }}
                      >
                        {foc.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STEP 4: CELEBRATION / SUCCESS ================= */}
          {currentStep === 3 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#0f3e17',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 8px 24px rgba(15, 62, 23, 0.3)',
                  animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                <Check size={32} strokeWidth={2.5} />
              </div>
              <h3
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#0a2e12',
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                Health Vault Configured!
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#46644d', maxWidth: '380px' }}>
                Your {selectedRole === 'clinician' ? 'Clinician Surveillance Suite' : 'Personal Medical Vault'} has been personalized. Initializing workspace...
              </p>
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER NAV ================= */}
        {currentStep < 3 && (
          <div
            style={{
              padding: '18px 36px 24px 36px',
              borderTop: '1px solid #edf4ef',
              backgroundColor: '#fbfdfb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#46644d',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                }}
              >
                <ArrowLeft size={15} />
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleFinish}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#718e77',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '8px 12px',
                }}
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#0f3e17',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '11px 22px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15, 62, 23, 0.2)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#164d23';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f3e17';
                }}
              >
                <span>{currentStep === totalSteps - 1 ? 'Complete Setup' : 'Next Question'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default OnboardingModal;
