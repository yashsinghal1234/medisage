import React, { useState } from 'react';
import { Users, Check, Plus, User, Heart, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_FAMILY_PROFILES = [
  {
    id: 'user-eleanor',
    name: 'Eleanor Vance',
    role: 'Primary Account (Self)',
    relation: 'Self',
    age: 37,
    bloodGroup: 'O+ Positive',
    conditions: ['Stage-1 Hypertension', 'Mild Dyslipidemia'],
    allergies: ['Penicillin', 'Sulfonamides'],
    avatarBg: '#0f3e17',
    avatarText: '#ffffff',
  },
  {
    id: 'user-julian',
    name: 'Julian Vance',
    role: 'Spouse',
    relation: 'Spouse',
    age: 40,
    bloodGroup: 'B+ Positive',
    conditions: ['Mild Exercise-Induced Asthma'],
    allergies: ['Shellfish'],
    avatarBg: '#1e3a8a',
    avatarText: '#ffffff',
  },
  {
    id: 'user-arthur',
    name: 'Arthur Vance',
    role: 'Dependent Parent',
    relation: 'Father',
    age: 68,
    bloodGroup: 'O+ Positive',
    conditions: ['Type-2 Diabetes', 'Open-Angle Glaucoma', 'Osteoarthritis'],
    allergies: ['Aspirin'],
    avatarBg: '#92400e',
    avatarText: '#ffffff',
  },
  {
    id: 'user-clara',
    name: 'Clara Vance',
    role: 'Dependent Child',
    relation: 'Daughter',
    age: 8,
    bloodGroup: 'A+ Positive',
    conditions: ['Pediatric Wellness', 'Seasonal Pollen Rhinitis'],
    allergies: ['None Documented'],
    avatarBg: '#6b21a8',
    avatarText: '#ffffff',
  },
];

export const ProfileSwitcher = ({ isOpen, onClose, onSelectProfile }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('medisage_family_profiles');
    return saved ? JSON.parse(saved) : DEFAULT_FAMILY_PROFILES;
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    relation: 'Child',
    age: '',
    bloodGroup: 'O+ Positive',
    conditions: '',
  });

  if (!isOpen) return null;

  const currentId = user?._id || 'user-eleanor';

  const handleSelect = (profile) => {
    // Update active user in localStorage
    const updatedUser = {
      _id: profile.id,
      name: profile.name,
      email: `${profile.name.toLowerCase().replace(/\s+/g, '.')}@medisage.health`,
      bloodGroup: profile.bloodGroup,
      dateOfBirth: `${2026 - profile.age}-04-12`,
      allergies: profile.allergies,
      chronicConditions: profile.conditions,
      emergencyContact: {
        name: profile.relation === 'Self' ? 'Julian Vance' : 'Eleanor Vance',
        relationship: profile.relation === 'Self' ? 'Spouse' : 'Primary Vault Guardian',
        phone: '+1 (555) 438-9921',
      },
    };

    localStorage.setItem('medisage_user', JSON.stringify(updatedUser));
    if (onSelectProfile) onSelectProfile(updatedUser);
    onClose();
    window.location.reload(); // Refresh application context
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newProfile.name) return;

    const created = {
      id: 'dep-' + Date.now(),
      name: newProfile.name,
      role: `Dependent ${newProfile.relation}`,
      relation: newProfile.relation,
      age: parseInt(newProfile.age) || 25,
      bloodGroup: newProfile.bloodGroup,
      conditions: newProfile.conditions ? newProfile.conditions.split(',').map(c => c.trim()) : ['Routine Surveillance'],
      allergies: ['None Documented'],
      avatarBg: '#047857',
      avatarText: '#ffffff',
    };

    const updated = [...profiles, created];
    setProfiles(updated);
    localStorage.setItem('medisage_family_profiles', JSON.stringify(updated));
    setShowAddForm(false);
    setNewProfile({ name: '', relation: 'Child', age: '', bloodGroup: 'O+ Positive', conditions: '' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 35, 16, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--color-border-mist)',
          padding: '28px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f3e17' }}>
              <Users size={16} />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Family &amp; Dependent Vault Switcher
              </span>
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', margin: '4px 0 0 0', color: '#0f3e17' }}>
              Select Active Health Profile
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f5f7f4',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: '#666',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {profiles.map((p) => {
            const isSelected = user?.name === p.name || (!user && p.relation === 'Self');
            return (
              <div
                key={p.id}
                onClick={() => handleSelect(p)}
                style={{
                  border: isSelected ? '2px solid #0f3e17' : '1px solid #dce8df',
                  backgroundColor: isSelected ? '#f2f8f4' : '#ffffff',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: p.avatarBg,
                      color: p.avatarText,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '15px',
                    }}
                  >
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f3e17' }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: '10.5px', backgroundColor: '#e2ece4', color: '#0f3e17', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {p.role}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                      Age {p.age} • Blood {p.bloodGroup} • {p.conditions.join(', ')}
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0f3e17', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#0f3e17', fontWeight: 600 }}>Switch →</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Dependent Form Toggle */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1.5px dashed #0f3e17',
              borderRadius: '12px',
              padding: '12px',
              color: '#0f3e17',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Plus size={15} />
            <span>+ Add Family Member or Dependent</span>
          </button>
        ) : (
          <form onSubmit={handleAddSubmit} style={{ backgroundColor: '#fcfdfc', padding: '16px', borderRadius: '12px', border: '1px solid #d5e6d8' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f3e17', marginBottom: '12px' }}>
              Add Dependent Profile to Sovereign Vault
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={newProfile.name}
                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #c8d8cc', fontSize: '13px' }}
              />
              <select
                value={newProfile.relation}
                onChange={(e) => setNewProfile({ ...newProfile, relation: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #c8d8cc', fontSize: '13px' }}
              >
                <option value="Child">Child / Dependent</option>
                <option value="Spouse">Spouse / Partner</option>
                <option value="Parent">Parent / Senior</option>
                <option value="Sibling">Sibling</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <input
                type="number"
                placeholder="Age"
                required
                value={newProfile.age}
                onChange={(e) => setNewProfile({ ...newProfile, age: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #c8d8cc', fontSize: '13px' }}
              />
              <select
                value={newProfile.bloodGroup}
                onChange={(e) => setNewProfile({ ...newProfile, bloodGroup: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #c8d8cc', fontSize: '13px' }}
              >
                <option value="O+ Positive">O+ Positive</option>
                <option value="O- Negative">O- Negative</option>
                <option value="A+ Positive">A+ Positive</option>
                <option value="A- Negative">A- Negative</option>
                <option value="B+ Positive">B+ Positive</option>
                <option value="AB+ Positive">AB+ Positive</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{ background: 'none', border: 'none', color: '#666', fontSize: '12.5px', cursor: 'pointer', padding: '6px 12px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: '#0f3e17', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
              >
                Save Member
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
