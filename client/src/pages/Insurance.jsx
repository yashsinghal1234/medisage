import React, { useState, useEffect } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Footer } from '../components/Footer';
import { PillBadge, PrimaryButton } from '../components/PillBadge';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Insurance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await aiService.recommendInsurance({
        age: 37,
        chronicConditions: user?.chronicConditions,
        allergies: user?.allergies,
      });
      setData(res);
      if (res?.plans && res.plans.length > 0) {
        setSelectedPlan(res.plans[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-cream-paper)', minHeight: '100vh' }}>
      <DashboardNavbar />

      <main className="container" style={{ paddingTop: '42px', paddingBottom: '70px' }}>
        {/* Header */}
        <div style={{ marginBottom: '35px' }}>
          <span className="eyebrow-label">RCM POLICY MATCHING</span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '44px',
              fontWeight: 300,
              color: 'var(--color-forest-ink)',
              margin: 0,
            }}
          >
            Tailored Health Insurance Matching
          </h1>
          <p style={{ fontSize: '15px', color: '#555', marginTop: '6px' }}>
            AI-matched coverage plans calibrated against your active medications, pre-existing conditions, and clinical risk profile.
          </p>
        </div>

        {/* SUMMARY CALLOUT */}
        {data?.summary && (
          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-keylime-wash)',
              borderRadius: 'var(--radius-cards)',
              padding: '28px 35px',
              marginBottom: '35px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-forest-ink)',
                  color: 'var(--color-cream-paper)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}
              >
                🌿
              </div>
              <div>
                <span className="eyebrow-label" style={{ marginBottom: '4px' }}>
                  CLINICAL RATIONALE
                </span>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-charcoal)', margin: 0 }}>
                  {data.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3 MATCHED PLANS GRID */}
        {loading ? (
          <div style={{ padding: '49px', textAlign: 'center', color: '#666' }}>
            Matching personalized health policies...
          </div>
        ) : (
          <div className="grid-3" style={{ marginBottom: '49px' }}>
            {data?.plans?.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className="card-rounded"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-keylime-wash)' : 'var(--color-cream-paper)',
                    border: isSelected ? '2px solid var(--color-forest-ink)' : '1px solid var(--color-border-mist)',
                    borderRadius: 'var(--radius-cards)',
                    padding: '35px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <PillBadge variant="sage" className="pill-badge-sm">
                        {plan.matchScore}% Clinical Match
                      </PillBadge>
                      <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                        {plan.tier}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '26px',
                        fontWeight: 300,
                        color: 'var(--color-forest-ink)',
                        marginBottom: '4px',
                      }}
                    >
                      {plan.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '21px' }}>
                      {plan.provider}
                    </div>

                    {/* Premium */}
                    <div
                      style={{
                        backgroundColor: 'var(--color-cream-paper)',
                        padding: '14px',
                        borderRadius: '10px',
                        marginBottom: '21px',
                        border: '1px solid var(--color-border-mist)',
                      }}
                    >
                      <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-forest-ink)' }}>
                        {plan.premium}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Deductible: {plan.deductible} · Max: {plan.annualCoverage}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div style={{ marginBottom: '21px' }}>
                      <span className="eyebrow-label" style={{ fontSize: '10px', marginBottom: '9px' }}>
                        KEY CLINICAL RIDERS
                      </span>
                      <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#444', lineHeight: 1.5 }}>
                        {plan.highlights.map((h, i) => (
                          <li key={i} style={{ marginBottom: '6px' }}>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ paddingTop: '14px', borderTop: '1px solid var(--color-border-mist)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--color-forest-ink)', fontStyle: 'italic', margin: 0 }}>
                      "{plan.recommendedFor}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SELECTED PLAN ACTION BANNER */}
        {selectedPlan && (
          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-slate-hush)',
              borderRadius: 'var(--radius-cards)',
              padding: '35px 42px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '21px',
            }}
          >
            <div>
              <span className="eyebrow-label" style={{ color: 'var(--color-forest-ink)' }}>
                SELECTED FOR APPLICATION
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '32px',
                  fontWeight: 300,
                  color: 'var(--color-forest-ink)',
                  margin: 0,
                }}
              >
                {selectedPlan.name} ({selectedPlan.premium})
              </h2>
              <p style={{ fontSize: '14px', color: '#444', marginTop: '4px' }}>
                Full OPD doctor consultation coverage, $0 generic medications, and pre-existing waiver ready.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <PrimaryButton
                onClick={() => alert(`Your pre-approval application for ${selectedPlan.name} has been initiated!`)}
              >
                Request Pre-Approval
              </PrimaryButton>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
