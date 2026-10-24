import React, { useState, useEffect } from 'react';
import { Users, Check, Plus, X, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RELATION_OPTIONS = ['Child', 'Spouse', 'Parent', 'Sibling', 'Other'];
const BLOOD_GROUPS = ['O+ Positive', 'O- Negative', 'A+ Positive', 'A- Negative', 'B+ Positive', 'AB+ Positive', 'AB- Negative'];

const AVATAR_COLORS = ['#1e3a8a', '#92400e', '#6b21a8', '#047857', '#b91c1c', '#155e75'];
const avatarColorFor = (seed = '') => {
  let n = 0;
  for (const ch of String(seed)) n += ch.charCodeAt(0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
};

const YEARS_READABLE = 2026;
const ageFromDob = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return YEARS_READABLE - d.getFullYear();
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const ProfileSwitcher = ({ isOpen, onClose }) => {
  const {
    user,
    accountUser,
    familyMembers,
    activeMemberId,
    activeMember,
    isViewingDependent,
    loadFamily,
    addFamilyMember,
    deleteFamilyMember,
    setActiveMember,
  } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    relation: 'Child',
    age: '',
    bloodGroup: 'O+ Positive',
    conditions: '',
  });

  // Refresh the household vault from the server each time the panel opens
  useEffect(() => {
    if (isOpen) loadFamily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const selfId = accountUser?._id;
  // Selecting "Self" clears the viewer concept entirely (activeMemberId: null)
  const handleSelectSelf = () => {
    setActiveMember(null);
    onClose();
  };

  const handleSelectMember = async (member) => {
    setActiveMember(member._id);
    onClose();
  };

  const handleDeleteMember = async (e, member) => {
    e.stopPropagation();
    if (!window.confirm(`Remove ${member.name}'s profile from your household vault? Their documents stay archived.`)) return;
    await deleteFamilyMember(member._id);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newProfile.name || adding) return;
    setAdding(true);
    const age = parseInt(newProfile.age, 10);
    try {
      await addFamilyMember({
        name: newProfile.name.trim(),
        // Backend enum: spouse|child|parent|sibling|other
        relationship: newProfile.relation.toLowerCase(),
        dateOfBirth: age ? `${YEARS_READABLE - age}-01-01` : undefined,
        bloodGroup: newProfile.bloodGroup,
        chronicConditions: newProfile.conditions
          ? newProfile.conditions.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        allergies: [],
      });
      setShowAddForm(false);
      setNewProfile({ name: '', relation: 'Child', age: '', bloodGroup: 'O+ Positive', conditions: '' });
    } finally {
      setAdding(false);
    }
  };

  const selfRow = {
    key: 'self',
    id: selfId,
    name: accountUser?.name || user?.name || 'You',
    badge: 'Primary Account (Self)',
    age: ageFromDob(accountUser?.dateOfBirth),
    bloodGroup: accountUser?.bloodGroup || 'O+ Positive',
    conditions: accountUser?.chronicConditions || [],
    selected: !isViewingDependent,
  };

  const memberRows = familyMembers.map((m) => ({
    key: m._id,
    id: m._id,
    memberId: m._id,
    name: m.name,
    badge: m.offline ? `${capitalize(m.relationship)} (offline draft)` : capitalize(m.relationship),
    age: ageFromDob(m.dateOfBirth),
    bloodGroup: m.bloodGroup || 'O+ Positive',
    conditions: m.chronicConditions || [],
    selected: activeMemberId === m._id,
    member,
  }));

  const rows = [selfRow, ...memberRows];

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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {rows.map((p) => (
            <div
              key={p.key}
              onClick={() => (p.member ? handleSelectMember(p.member) : handleSelectSelf())}
              style={{
                border: p.selected ? '2px solid #0f3e17' : '1px solid #dce8df',
                backgroundColor: p.selected ? '#f2f8f4' : '#ffffff',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: p.member ? avatarColorFor(p.id) : '#0f3e17',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '15px',
                    flexShrink: 0,
                  }}
                >
                  {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f3e17', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: '10.5px', backgroundColor: '#e2ece4', color: '#0f3e17', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, flexShrink: 0 }}>
                      {p.badge}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#555', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.age !== null ? `Age ${p.age}` : 'Age —'} • Blood {p.bloodGroup}
                    {p.conditions.length > 0 ? ` • ${p.conditions.join(', ')}` : ' • No conditions documented'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {p.member && (
                  <button
                    onClick={(e) => handleDeleteMember(e, p.member)}
                    title="Remove from household vault"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#b91c1c',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.7,
                      padding: '6px',
                      borderRadius: '6px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                {p.selected ? (
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0f3e17', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#0f3e17', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Switch <ArrowRight size={13} />
                  </div>
                )}
              </div>
            </div>
          ))}
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
                {RELATION_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === 'Other' ? 'Other / Relative' : `${r} / Dependent`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <input
                type="number"
                placeholder="Age"
                min="0"
                max="120"
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
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Chronic conditions (comma separated, optional)"
                value={newProfile.conditions}
                onChange={(e) => setNewProfile({ ...newProfile, conditions: e.target.value })}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid #c8d8cc', fontSize: '13px' }}
              />
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
                disabled={adding}
                style={{ backgroundColor: '#0f3e17', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12.5px', fontWeight: 600, cursor: adding ? 'wait' : 'pointer', opacity: adding ? 0.7 : 1 }}
              >
                {adding ? 'Saving…' : 'Save Member'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
