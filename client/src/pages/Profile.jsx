import React, { useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Footer } from '../components/Footer';
import { PillBadge, PrimaryButton } from '../components/PillBadge';
import { EmergencyModal } from '../components/EmergencyModal';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Eleanor Vance',
    email: user?.email || 'eleanor.vance@easehealth.org',
    bloodGroup: user?.bloodGroup || 'O+ Positive',
    dateOfBirth: user?.dateOfBirth || '1988-06-14',
    allergies: (user?.allergies || ['Penicillin', 'Sulfonamides']).join(', '),
    chronicConditions: (user?.chronicConditions || ['Stage-1 Hypertension (Controlled)', 'Mild Dyslipidemia']).join(', '),
    iceName: user?.emergencyContact?.name || 'Julian Vance',
    iceRelationship: user?.emergencyContact?.relationship || 'Spouse',
    icePhone: user?.emergencyContact?.phone || '+1 (555) 438-9921',
  });

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      name: formData.name,
      email: formData.email,
      bloodGroup: formData.bloodGroup,
      dateOfBirth: formData.dateOfBirth,
      allergies: formData.allergies.split(',').map((a) => a.trim()).filter(Boolean),
      chronicConditions: formData.chronicConditions.split(',').map((c) => c.trim()).filter(Boolean),
      emergencyContact: {
        name: formData.iceName,
        relationship: formData.iceRelationship,
        phone: formData.icePhone,
      },
    };
    updateProfile(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-cream-paper)', minHeight: '100vh' }}>
      <DashboardNavbar onOpenEmergencyModal={() => setShowEmergencyModal(true)} />

      <main className="container" style={{ paddingTop: '42px', paddingBottom: '70px', maxWidth: '840px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px' }}>
          <div>
            <span className="eyebrow-label">PATIENT IDENTIFICATION</span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '44px',
                fontWeight: 300,
                color: 'var(--color-forest-ink)',
                margin: 0,
              }}
            >
              Medical Identity & Emergency Pass
            </h1>
            <p style={{ fontSize: '15px', color: '#555', marginTop: '6px' }}>
              Maintain verified blood type, critical allergy warnings, and emergency contact details.
            </p>
          </div>

          <button
            onClick={() => setShowEmergencyModal(true)}
            className="btn-secondary-tint"
            style={{ padding: '11px 18px', fontSize: '13px' }}
          >
            Preview Emergency Card
          </button>
        </div>

        {savedNotice && (
          <div
            style={{
              backgroundColor: 'var(--color-keylime-wash)',
              color: 'var(--color-forest-ink)',
              padding: '14px 21px',
              borderRadius: 'var(--radius-cards)',
              marginBottom: '21px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            ✓ Patient profile & emergency medical credentials updated successfully!
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* PERSONAL VITALS */}
          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-cream-paper)',
              border: '1px solid var(--color-border-mist)',
              borderRadius: 'var(--radius-cards)',
              padding: '35px',
              display: 'flex',
              flexDirection: 'column',
              gap: '21px',
              marginBottom: '28px',
            }}
          >
            <span className="eyebrow-label" style={{ margin: 0 }}>
              BASIC DEMOGRAPHICS
            </span>

            <div className="grid-2">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-forest-ink)', display: 'block', marginBottom: '7px' }}>
                  FULL LEGAL NAME
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-botanical"
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-forest-ink)', display: 'block', marginBottom: '7px' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-botanical"
                />
              </div>
            </div>

            <div className="grid-2">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-forest-ink)', display: 'block', marginBottom: '7px' }}>
                  BLOOD GROUP TYPE
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="input-botanical"
                >
                  <option value="O+ Positive">O+ Positive (Most Common)</option>
                  <option value="O- Negative">O- Negative (Universal Donor)</option>
                  <option value="A+ Positive">A+ Positive</option>
                  <option value="A- Negative">A- Negative</option>
                  <option value="B+ Positive">B+ Positive</option>
                  <option value="B- Negative">B- Negative</option>
                  <option value="AB+ Positive">AB+ Positive (Universal Recipient)</option>
                  <option value="AB- Negative">AB- Negative</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-forest-ink)', display: 'block', marginBottom: '7px' }}>
                  DATE OF BIRTH
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="input-botanical"
                />
              </div>
            </div>
          </div>

          {/* CRITICAL CLINICAL ALERTS */}
          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-cream-paper)',
              border: '1px solid var(--color-border-mist)',
              borderRadius: 'var(--radius-cards)',
              padding: '35px',
              display: 'flex',
              flexDirection: 'column',
              gap: '21px',
              marginBottom: '28px',
            }}
          >
            <span className="eyebrow-label" style={{ margin: 0, color: '#c0392b' }}>
              CRITICAL MEDICAL WARNINGS
            </span>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-forest-ink)', display: 'block', marginBottom: '7px' }}>
                KNOWN DRUG & FOOD ALLERGIES (COMMA SEPARATED)
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Sulfonamides, Shellfish"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="input-botanical"
              />
              <span style={{ fontSize: '11px', color: '#666', marginTop: '4px', display: 'block' }}>
                Displayed prominently on your Emergency Health Pass for attending medical staff.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-forest-ink)', display: 'block', marginBottom: '7px' }}>
                CHRONIC HEALTH CONDITIONS (COMMA SEPARATED)
              </label>
              <input
                type="text"
                placeholder="e.g. Stage-1 Hypertension, Mild Dyslipidemia"
                value={formData.chronicConditions}
                onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                className="input-botanical"
              />
            </div>
          </div>

          {/* IN CASE OF EMERGENCY (I.C.E.) */}
          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-keylime-wash)',
              borderRadius: 'var(--radius-cards)',
              padding: '35px',
              display: 'flex',
              flexDirection: 'column',
              gap: '21px',
              marginBottom: '35px',
            }}
          >
            <span className="eyebrow-label" style={{ margin: 0 }}>
              IN CASE OF EMERGENCY (I.C.E.) CONTACT
            </span>

            <div className="grid-3">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-forest-ink)', display: 'block', marginBottom: '7px' }}>
                  PRIMARY CONTACT NAME
                </label>
                <input
                  type="text"
                  required
                  value={formData.iceName}
                  onChange={(e) => setFormData({ ...formData, iceName: e.target.value })}
                  className="input-botanical"
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-forest-ink)', display: 'block', marginBottom: '7px' }}>
                  RELATIONSHIP
                </label>
                <input
                  type="text"
                  required
                  value={formData.iceRelationship}
                  onChange={(e) => setFormData({ ...formData, iceRelationship: e.target.value })}
                  className="input-botanical"
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-forest-ink)', display: 'block', marginBottom: '7px' }}>
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  required
                  value={formData.icePhone}
                  onChange={(e) => setFormData({ ...formData, icePhone: e.target.value })}
                  className="input-botanical"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
            <PrimaryButton type="submit">
              Save Medical Identity
            </PrimaryButton>
          </div>
        </form>
      </main>

      <EmergencyModal
        user={user}
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />

      <Footer />
    </div>
  );
};
