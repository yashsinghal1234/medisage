import React, { useState } from 'react';
import { 
  Bell, Calendar, Clock, CheckCircle2, AlertTriangle, 
  Plus, CalendarPlus, Check, Trash2, ArrowRight, Stethoscope, Droplets
} from 'lucide-react';

const INITIAL_REMINDERS = [
  {
    id: 'rem-1',
    title: 'Fasting Lipid & ApoB Subfraction Panel',
    category: 'Cardiovascular Surveillance',
    facility: 'Quest Diagnostics',
    physician: 'Dr. Evelyn Reed, MD',
    dueDate: '2026-04-15',
    daysRemaining: 34,
    urgency: 'medium', // 'high' | 'medium' | 'low'
    status: 'pending', // 'pending' | 'booked' | 'completed'
    clinicalRationale: 'Monitor statin response and subfractionated LDL particle density (target LDL < 100 mg/dL).',
  },
  {
    id: 'rem-2',
    title: 'HbA1c & Fasting Insulin Glycemic Audit',
    category: 'Endocrine & Metabolic',
    facility: 'St. Jude Health & Research Center',
    physician: 'Dr. Marcus Vance, MD',
    dueDate: '2026-06-14',
    daysRemaining: 94,
    urgency: 'high',
    status: 'pending',
    clinicalRationale: 'Longitudinal follow-up for pre-metabolic threshold shift (prior HbA1c: 5.8%).',
  },
  {
    id: 'rem-3',
    title: 'Renal Function & eGFR Filtration Check',
    category: 'Nephrology Check',
    facility: 'Apex Nephrology Diagnostic Center',
    physician: 'Dr. Gregory Hayes',
    dueDate: '2027-01-10',
    daysRemaining: 304,
    urgency: 'low',
    status: 'pending',
    clinicalRationale: 'Annual creatinine clearance surveillance for Telmisartan ARB maintenance therapy.',
  },
  {
    id: 'rem-4',
    title: 'Resting ECG & Ambulatory Hemodynamics',
    category: 'Preventive Cardiology',
    facility: 'Northwestern Memorial Cardiology',
    physician: 'Dr. Marcus Vance, MD',
    dueDate: '2026-05-20',
    daysRemaining: 69,
    urgency: 'medium',
    status: 'booked',
    clinicalRationale: 'Annual sinus rhythm and resting blood pressure monitoring.',
  },
];

export const ClinicalSurveillanceReminders = () => {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('medisage_surveillance_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    category: 'Lab Recheck',
    dueDate: '2026-05-01',
    clinicalRationale: '',
  });

  const saveReminders = (updated) => {
    setReminders(updated);
    localStorage.setItem('medisage_surveillance_reminders', JSON.stringify(updated));
  };

  const handleToggleStatus = (id) => {
    const updated = reminders.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'pending' ? 'booked' : r.status === 'booked' ? 'completed' : 'pending';
        return { ...r, status: nextStatus };
      }
      return r;
    });
    saveReminders(updated);
  };

  const handleDelete = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    saveReminders(updated);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newReminder.title) return;

    const diffDays = Math.ceil((new Date(newReminder.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

    const item = {
      id: 'rem-' + Date.now(),
      title: newReminder.title,
      category: newReminder.category,
      facility: 'Primary Clinical Center',
      physician: 'Attending Physician',
      dueDate: newReminder.dueDate,
      daysRemaining: diffDays > 0 ? diffDays : 0,
      urgency: diffDays < 45 ? 'high' : diffDays < 100 ? 'medium' : 'low',
      status: 'pending',
      clinicalRationale: newReminder.clinicalRationale || 'Recommended surveillance interval.',
    };

    saveReminders([...reminders, item]);
    setShowAddModal(false);
    setNewReminder({ title: '', category: 'Lab Recheck', dueDate: '2026-05-01', clinicalRationale: '' });
  };

  const handleExportIcs = (reminder) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MediSage Health Vault//Surveillance Calendar//EN
BEGIN:VEVENT
SUMMARY:MediSage Clinical Test: ${reminder.title}
DESCRIPTION:${reminder.clinicalRationale}\\nPhysician: ${reminder.physician}\\nFacility: ${reminder.facility}
DTSTART;VALUE=DATE:${reminder.dueDate.replace(/-/g, '')}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `medisage_${reminder.title.toLowerCase().replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getUrgencyBadge = (urgency, daysRemaining, status) => {
    if (status === 'completed') {
      return { bg: '#dcfce7', text: '#166534', label: 'COMPLETED' };
    }
    if (status === 'booked') {
      return { bg: '#e0e7ff', text: '#3730a3', label: 'APPOINTMENT BOOKED' };
    }
    if (urgency === 'high' || daysRemaining <= 35) {
      return { bg: '#fee2e2', text: '#991b1b', label: `DUE IN ${daysRemaining} DAYS` };
    }
    if (urgency === 'medium') {
      return { bg: '#fef3c7', text: '#92400e', label: `DUE IN ${daysRemaining} DAYS` };
    }
    return { bg: '#eaf4ec', text: '#0f3e17', label: `DUE IN ${daysRemaining} DAYS` };
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 8px 32px rgba(15, 62, 23, 0.05)',
        border: '1px solid var(--color-border-mist)',
        marginBottom: '40px',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#eaf4ec', padding: '4px 10px', borderRadius: '6px', marginBottom: '8px' }}>
            <Bell size={14} color="#0f3e17" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f3e17', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Preventive Care Surveillance Engine
            </span>
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#0f3e17', margin: 0 }}>
            Automated Clinical Retest &amp; Surveillance Schedule
          </h3>
          <p style={{ fontSize: '13.5px', color: '#555', margin: '4px 0 0 0' }}>
            Evidence-based retest intervals calculated from your biomarker velocity trends and physician recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: '#0f3e17',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(15, 62, 23, 0.15)',
          }}
        >
          <Plus size={15} />
          <span>+ Add Clinical Reminder</span>
        </button>
      </div>

      {/* Reminder Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {reminders.map((rem) => {
          const badge = getUrgencyBadge(rem.urgency, rem.daysRemaining, rem.status);
          const isDone = rem.status === 'completed';

          return (
            <div
              key={rem.id}
              style={{
                backgroundColor: isDone ? '#fafbfa' : '#ffffff',
                border: '1px solid #dce8df',
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                opacity: isDone ? 0.75 : 1,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.text,
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {badge.label}
                  </span>

                  <button
                    onClick={() => handleDelete(rem.id)}
                    style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: '2px' }}
                    title="Delete reminder"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f3e17', marginBottom: '4px' }}>
                  {rem.title}
                </div>

                <div style={{ fontSize: '11.5px', color: '#666', marginBottom: '10px' }}>
                  {rem.category} • {rem.physician} • {rem.facility}
                </div>

                <div style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.45, backgroundColor: '#f6faf6', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e1eee4', marginBottom: '14px' }}>
                  {rem.clinicalRationale}
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ borderTop: '1px solid #edf2ee', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={() => handleToggleStatus(rem.id)}
                  style={{
                    backgroundColor: rem.status === 'completed' ? '#dcfce7' : rem.status === 'booked' ? '#e0e7ff' : '#ffffff',
                    border: '1px solid #cbdcd0',
                    color: '#0f3e17',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 size={13} color={rem.status === 'completed' ? '#16a34a' : '#555'} />
                  <span>
                    {rem.status === 'pending' ? 'Mark Booked' : rem.status === 'booked' ? 'Mark Completed' : 'Re-open'}
                  </span>
                </button>

                <button
                  onClick={() => handleExportIcs(rem)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0f3e17',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CalendarPlus size={13} />
                  <span>Export to iCal</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10,35,16,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#0f3e17', margin: '0 0 14px 0' }}>
              Add Preventive Surveillance Reminder
            </h4>

            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f3e17', display: 'block', marginBottom: '4px' }}>
                  CLINICAL TEST OR ENCOUNTER TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual DEXA Bone Density Scan"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccdcd0', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f3e17', display: 'block', marginBottom: '4px' }}>
                    CATEGORY
                  </label>
                  <select
                    value={newReminder.category}
                    onChange={(e) => setNewReminder({ ...newReminder, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccdcd0', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="Lab Recheck">Blood / Lab Work</option>
                    <option value="Cardiovascular">Cardiology</option>
                    <option value="Imaging">Radiology / MRI / Scan</option>
                    <option value="Preventive">Annual Physical</option>
                    <option value="Specialist">Specialist Consult</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f3e17', display: 'block', marginBottom: '4px' }}>
                    TARGET DUE DATE *
                  </label>
                  <input
                    type="date"
                    required
                    value={newReminder.dueDate}
                    onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccdcd0', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f3e17', display: 'block', marginBottom: '4px' }}>
                  CLINICAL RATIONALE / PHYSICIAN NOTE
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Recommended by Dr. Reed to monitor bone mineral density..."
                  value={newReminder.clinicalRationale}
                  onChange={(e) => setNewReminder({ ...newReminder, clinicalRationale: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccdcd0', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer', padding: '6px 14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#0f3e17', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
