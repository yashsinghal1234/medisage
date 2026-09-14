import React, { useState, useEffect } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Footer } from '../components/Footer';
import { PillBadge, PrimaryButton } from '../components/PillBadge';
import { FeatureCard } from '../components/FeatureCard';
import { BiomarkerTrajectoryDashboard } from '../components/BiomarkerTrajectoryDashboard';
import { DocumentProvenanceViewer } from '../components/DocumentProvenanceViewer';
import { DrugSafetyGuard } from '../components/DrugSafetyGuard';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AIInsights = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content:
        'Greetings. I am your MediSage Clinical AI Companion. I have analyzed your complete health vault (Metabolic panels, Cardiology exams, and Prescriptions). Ask me any questions about your lab biomarkers, dietary protocols, or medications.',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const data = await aiService.analyzeHistory({
        userId: user?._id,
        allergies: user?.allergies,
        chronicConditions: user?.chronicConditions,
      });
      setInsights(data);
    } catch (err) {
      console.error('Failed to load AI analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMessage = { role: 'user', content: inputMsg };
    const updated = [...chatMessages, userMessage];
    setChatMessages(updated);
    setInputMsg('');
    setChatLoading(true);

    try {
      const reply = await aiService.askChat(updated);
      setChatMessages([...updated, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-cream-paper)', minHeight: '100vh' }}>
      <DashboardNavbar />

      <main className="container" style={{ paddingTop: '42px', paddingBottom: '70px' }}>
        {/* Header */}
        <div style={{ marginBottom: '35px' }}>
          <span className="eyebrow-label">CLINICAL INTELLIGENCE SUITE</span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '44px',
              fontWeight: 300,
              color: 'var(--color-forest-ink)',
              margin: 0,
            }}
          >
            AI Health Synthesis & Advisory
          </h1>
          <p style={{ fontSize: '15px', color: '#555', marginTop: '6px' }}>
            Comprehensive analysis synthesizing your longitudinal medical records, biomarkers, and prescribing history.
          </p>
        </div>

        {/* TOP HEALTH STATUS BAR */}
        <div
          className="card-rounded"
          style={{
            backgroundColor: 'var(--color-keylime-wash)',
            borderRadius: 'var(--radius-cards)',
            padding: '28px',
            marginBottom: '35px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '21px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-forest-ink)', fontWeight: 600, textTransform: 'uppercase' }}>
              PATIENT PROFILE SYNTHESIZED
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 300, color: 'var(--color-forest-ink)', marginTop: '2px' }}>
              {user?.name || 'Eleanor Vance'} · Blood Group {user?.bloodGroup || 'O+'}
            </div>
            <div style={{ display: 'flex', gap: '7px', marginTop: '7px' }}>
              <PillBadge variant="cream" className="pill-badge-sm">
                Stage-1 HTN (Controlled)
              </PillBadge>
              <PillBadge variant="cream" className="pill-badge-sm">
                Mild Dyslipidemia
              </PillBadge>
              <PillBadge variant="sage" className="pill-badge-sm">
                Cardio Sinus Normal
              </PillBadge>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setProvenanceOpen(true)}
              style={{
                backgroundColor: '#0f3e17',
                color: '#ffffff',
                border: 'none',
                padding: '11px 21px',
                borderRadius: 'var(--radius-badges)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(15, 62, 23, 0.18)',
              }}
            >
              <span>🔍 View Document Provenance</span>
            </button>

            <button
              onClick={loadAnalysis}
              style={{
                backgroundColor: 'var(--color-cream-paper)',
                color: 'var(--color-forest-ink)',
                border: '1px solid rgba(15, 62, 23, 0.15)',
                padding: '11px 21px',
                borderRadius: 'var(--radius-badges)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🔄 Re-run Clinical AI Analysis
            </button>
          </div>
        </div>

        {/* LONGITUDINAL BIOMARKER TRAJECTORY & VELOCITY FORECASTER */}
        <BiomarkerTrajectoryDashboard />

        {/* PHARMACOVIGILANCE & DRUG-DRUG ALLERGY SAFETY GUARD */}
        <DrugSafetyGuard />

        {/* SPLIT-SCREEN PROVENANCE VIEWER MODAL */}
        <DocumentProvenanceViewer
          isOpen={provenanceOpen}
          onClose={() => setProvenanceOpen(false)}
        />

        {/* 4 ACTIONABLE PILLARS (SAGE MIST CARDS) */}
        {insights?.recommendations && (
          <div style={{ marginBottom: '49px' }}>
            <div style={{ marginBottom: '21px' }}>
              <span className="eyebrow-label">ACTIONABLE PROTOCOLS</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 300, color: 'var(--color-forest-ink)', margin: 0 }}>
                Personalized Care Roadmap
              </h2>
            </div>

            <div className="grid-2">
              {insights.recommendations.map((rec, i) => (
                <FeatureCard
                  key={i}
                  eyebrow={rec.category.toUpperCase()}
                  title={rec.title}
                  body={rec.desc}
                  tag={rec.badge}
                  variant={i % 2 === 0 ? 'sage' : 'mint'}
                />
              ))}
            </div>
          </div>
        )}

        {/* TWO-COLUMN SYNTHESIS & CHAT SPLIT */}
        <div className="grid-2" style={{ alignItems: 'start', gap: '35px' }}>
          {/* Left Column: Full Medical Synthesis */}
          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-cream-paper)',
              border: '1px solid var(--color-border-mist)',
              borderRadius: 'var(--radius-cards)',
              padding: '35px',
            }}
          >
            <span className="eyebrow-label">CLINICAL SYNTHESIS REPORT</span>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                fontWeight: 300,
                color: 'var(--color-forest-ink)',
                marginBottom: '21px',
              }}
            >
              Longitudinal Assessment
            </h3>

            {loading ? (
              <div style={{ padding: '35px', textAlign: 'center', color: '#666' }}>
                Analyzing clinical documents and biomarkers...
              </div>
            ) : (
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'var(--color-charcoal)',
                  whiteSpace: 'pre-line',
                }}
              >
                {insights?.analysis}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Clinical AI Chat Companion */}
          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-slate-hush)',
              borderRadius: 'var(--radius-cards)',
              padding: '35px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '520px',
            }}
          >
            <div style={{ marginBottom: '18px' }}>
              <span className="eyebrow-label" style={{ color: 'var(--color-forest-ink)' }}>
                CLINICAL CHAT COMPANION
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '26px',
                  fontWeight: 300,
                  color: 'var(--color-forest-ink)',
                  margin: 0,
                }}
              >
                Ask About Your Health Records
              </h3>
            </div>

            {/* Chat Messages Log */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                marginBottom: '21px',
                maxHeight: '380px',
                paddingRight: '6px',
              }}
            >
              {chatMessages.map((msg, i) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                      maxWidth: '85%',
                      backgroundColor: isAssistant ? 'var(--color-cream-paper)' : 'var(--color-forest-ink)',
                      color: isAssistant ? 'var(--color-charcoal)' : 'var(--color-cream-paper)',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      lineHeight: 1.55,
                      boxShadow: 'none',
                    }}
                  >
                    {isAssistant && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--color-forest-ink)',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        🌿 MediSage AI
                      </span>
                    )}
                    {msg.content}
                  </div>
                );
              })}
              {chatLoading && (
                <div
                  style={{
                    backgroundColor: 'var(--color-cream-paper)',
                    color: '#666',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    width: 'fit-content',
                  }}
                >
                  Consulting clinical knowledge base...
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              {['What does my LDL 138 mean?', 'Is Telmisartan safe with Omega-3?', 'Diet for HbA1c 5.8%'].map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInputMsg(q)}
                  style={{
                    backgroundColor: 'var(--color-cream-paper)',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    color: 'var(--color-forest-ink)',
                    cursor: 'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '9px' }}>
              <input
                type="text"
                placeholder="Ask about medications, tests, vitals..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="input-botanical"
                style={{ fontSize: '13px', padding: '12px 16px' }}
              />
              <button
                type="submit"
                disabled={chatLoading}
                style={{
                  backgroundColor: 'var(--color-forest-ink)',
                  color: 'var(--color-cream-paper)',
                  border: 'none',
                  borderRadius: 'var(--radius-buttons)',
                  padding: '0 21px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
