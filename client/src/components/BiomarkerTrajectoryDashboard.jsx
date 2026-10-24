import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Sliders, Activity, Info, Calendar, Sparkles } from 'lucide-react';

const BIOMARKERS_DATA = {
  hba1c: {
    name: 'HbA1c (Glycated Hemoglobin)',
    shortName: 'HbA1c',
    unit: '%',
    category: 'Metabolic',
    loinc: '4548-4',
    clinicalCutoffs: {
      optimal: 5.6,
      borderline: 6.4,
      elevated: 10.0,
    },
    zones: [
      { label: 'Normal / Optimal', max: 5.6, color: 'rgba(52, 168, 83, 0.12)', border: '#34a853' },
      { label: 'Prediabetes Subclinical Drift', min: 5.7, max: 6.4, color: 'rgba(251, 188, 4, 0.14)', border: '#e37400' },
      { label: 'Diabetic Range', min: 6.5, color: 'rgba(234, 67, 53, 0.12)', border: '#ea4335' },
    ],
    history: [
      { date: '2022-04-12', value: 5.4, doctor: 'Dr. Evelyn Reed', clinic: 'St. Jude Health Clinic', notes: 'Routine annual metabolic screening. Normal baseline.' },
      { date: '2023-02-18', value: 5.7, doctor: 'Dr. Aris Vance', clinic: 'Greenhouse Clinic', notes: 'Dietary intake showed increased refined carbohydrates. Advised glycemic moderation.' },
      { date: '2024-06-05', value: 6.0, doctor: 'Dr. Evelyn Reed', clinic: 'St. Jude Health Clinic', notes: 'Subclinical upward drift detected. Initiated continuous glucose monitoring review.' },
      { date: '2025-05-14', value: 6.2, doctor: 'Dr. Marcus Vance', clinic: 'Apex Diagnostic Care', notes: 'Fast tracking toward prediabetes threshold. Dietary protocol reinforced.' },
      { date: '2026-02-28', value: 5.9, doctor: 'Dr. Clara Thorne', clinic: 'Metropolitan Health Inst', notes: 'Positive intervention response following Zone-2 conditioning & low-glycemic Mediterranean protocol.' },
    ],
    interventions: [
      { name: 'Adhere to Low-Glycemic Mediterranean Protocol', delta: -0.25 },
      { name: '150 min/wk Zone-2 Aerobic Exercise', delta: -0.30 },
      { name: 'Metformin 500mg Extended Release', delta: -0.45 },
    ],
  },
  ldl: {
    name: 'LDL Cholesterol',
    shortName: 'LDL-C',
    unit: 'mg/dL',
    category: 'Lipid Panel',
    loinc: '2089-1',
    clinicalCutoffs: {
      optimal: 99,
      borderline: 159,
      elevated: 240,
    },
    zones: [
      { label: 'Optimal (< 100 mg/dL)', max: 99, color: 'rgba(52, 168, 83, 0.12)', border: '#34a853' },
      { label: 'Borderline High (100 - 159 mg/dL)', min: 100, max: 159, color: 'rgba(251, 188, 4, 0.14)', border: '#e37400' },
      { label: 'High (> 160 mg/dL)', min: 160, color: 'rgba(234, 67, 53, 0.12)', border: '#ea4335' },
    ],
    history: [
      { date: '2022-04-12', value: 112, doctor: 'Dr. Evelyn Reed', clinic: 'St. Jude Health Clinic', notes: 'Mild lipid elevation. Lifestyle modification recommended.' },
      { date: '2023-02-18', value: 126, doctor: 'Dr. Aris Vance', clinic: 'Greenhouse Clinic', notes: 'ApoB and LDL-C trajectory climbing.' },
      { date: '2024-06-05', value: 144, doctor: 'Dr. Evelyn Reed', clinic: 'St. Jude Health Clinic', notes: 'Initiated Atorvastatin 10mg nightly protocol.' },
      { date: '2025-05-14', value: 118, doctor: 'Dr. Marcus Vance', clinic: 'Apex Diagnostic Care', notes: 'Statin adherence confirmed. Significant LDL reduction observed.' },
      { date: '2026-02-28', value: 94, doctor: 'Dr. Clara Thorne', clinic: 'Metropolitan Health Inst', notes: 'Achieved target optimal threshold (<100 mg/dL) with zero statin intolerance.' },
    ],
    interventions: [
      { name: 'Soluble Fiber Protocol (Psyllium 10g/day)', delta: -8 },
      { name: 'Reduce Saturated Fat (< 6% daily calories)', delta: -12 },
      { name: 'Atorvastatin 10mg Daily Adherence', delta: -35 },
    ],
  },
  egfr: {
    name: 'Estimated GFR (Kidney Filtration)',
    shortName: 'eGFR',
    unit: 'mL/min/1.73m²',
    category: 'Renal Function',
    loinc: '33914-3',
    clinicalCutoffs: {
      optimal: 90,
      borderline: 60,
      elevated: 15,
    },
    zones: [
      { label: 'Normal / Stage-1 (> 90)', min: 90, color: 'rgba(52, 168, 83, 0.12)', border: '#34a853' },
      { label: 'Mild Reduction / Stage-2 (60 - 89)', min: 60, max: 89, color: 'rgba(251, 188, 4, 0.14)', border: '#e37400' },
      { label: 'Moderate Reduction (< 60)', max: 59, color: 'rgba(234, 67, 53, 0.12)', border: '#ea4335' },
    ],
    history: [
      { date: '2022-04-12', value: 104, doctor: 'Dr. Evelyn Reed', clinic: 'St. Jude Health Clinic', notes: 'Normal renal filtration rate.' },
      { date: '2023-02-18', value: 98, doctor: 'Dr. Aris Vance', clinic: 'Greenhouse Clinic', notes: 'Serum creatinine 0.88 mg/dL. Renal reserve robust.' },
      { date: '2024-06-05', value: 92, doctor: 'Dr. Evelyn Reed', clinic: 'St. Jude Health Clinic', notes: 'Adequate hydration advised.' },
      { date: '2025-05-14', value: 89, doctor: 'Dr. Marcus Vance', clinic: 'Apex Diagnostic Care', notes: 'Subclinical dip following dehydration. Rechecked 2 weeks later.' },
      { date: '2026-02-28', value: 95, doctor: 'Dr. Clara Thorne', clinic: 'Metropolitan Health Inst', notes: 'Filtration recovered to optimal >90 band.' },
    ],
    interventions: [
      { name: 'Daily Structured Hydration (2.5L clean water)', delta: +4 },
      { name: 'Avoid NSAIDs (Ibuprofen / Naproxen overuse)', delta: +3 },
      { name: 'Strict Blood Pressure Control (< 120/80)', delta: +5 },
    ],
  },
  bp: {
    name: 'Systolic Blood Pressure',
    shortName: 'Systolic BP',
    unit: 'mmHg',
    category: 'Vascular & Vitals',
    loinc: '8480-6',
    clinicalCutoffs: {
      optimal: 120,
      borderline: 130,
      elevated: 180,
    },
    zones: [
      { label: 'Normal (< 120 mmHg)', max: 119, color: 'rgba(52, 168, 83, 0.12)', border: '#34a853' },
      { label: 'Elevated (120 - 129 mmHg)', min: 120, max: 129, color: 'rgba(251, 188, 4, 0.14)', border: '#e37400' },
      { label: 'Stage-1 / Stage-2 Hypertension (≥ 130 mmHg)', min: 130, color: 'rgba(234, 67, 53, 0.12)', border: '#ea4335' },
    ],
    history: [
      { date: '2022-04-12', value: 118, doctor: 'Dr. Evelyn Reed', clinic: 'St. Jude Health Clinic', notes: 'Resting BP optimal.' },
      { date: '2023-02-18', value: 128, doctor: 'Dr. Aris Vance', clinic: 'Greenhouse Clinic', notes: 'Work-related stress elevation noted.' },
      { date: '2024-06-05', value: 138, doctor: 'Dr. Evelyn Reed', clinic: 'St. Jude Health Clinic', notes: 'Confirmed Stage-1 Hypertension. Started Telmisartan 20mg.' },
      { date: '2025-05-14', value: 128, doctor: 'Dr. Marcus Vance', clinic: 'Apex Diagnostic Care', notes: 'Good response to ARB therapy.' },
      { date: '2026-02-28', value: 120, doctor: 'Dr. Clara Thorne', clinic: 'Metropolitan Health Inst', notes: 'Vascular resistance normalized with combined cardio and medication.' },
    ],
    interventions: [
      { name: 'DASH Dietary Protocol (< 1,500mg Sodium)', delta: -5 },
      { name: 'Magnesium Glycinate Supplementation (400mg)', delta: -3 },
      { name: 'Telmisartan 20mg Morning Adherence', delta: -12 },
    ],
  },
};

export const BiomarkerTrajectoryDashboard = () => {
  const [selectedKey, setSelectedKey] = useState('hba1c');
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [activeInterventions, setActiveInterventions] = useState([true, false, false]);

  const biomarker = BIOMARKERS_DATA[selectedKey];

  // Mathematical Velocity & Rate of Change Calculation
  const velocityMetrics = useMemo(() => {
    const history = biomarker.history;
    if (history.length < 2) return null;

    const first = history[0];
    const latest = history[history.length - 1];
    const prev = history[history.length - 2];

    const firstDate = new Date(first.date);
    const latestDate = new Date(latest.date);
    const prevDate = new Date(prev.date);

    // Total years elapsed
    const totalYears = (latestDate - firstDate) / (1000 * 60 * 60 * 24 * 365.25);
    const recentYears = (latestDate - prevDate) / (1000 * 60 * 60 * 24 * 365.25);

    // Rate of change per year
    const netVelocity = (latest.value - first.value) / Math.max(totalYears, 0.5);
    const recentVelocity = (latest.value - prev.value) / Math.max(recentYears, 0.25);

    return {
      currentValue: latest.value,
      initialValue: first.value,
      netChange: latest.value - first.value,
      annualVelocity: Number(recentVelocity.toFixed(2)),
      isImproving: biomarker.name.includes('eGFR') ? recentVelocity > 0 : recentVelocity < 0,
    };
  }, [biomarker]);

  // SVG Chart Geometry Constants
  const svgWidth = 840;
  const svgHeight = 320;
  const padding = { top: 30, right: 60, bottom: 45, left: 60 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Min/Max Y Scale
  const yValues = biomarker.history.map((h) => h.value);
  const minY = Math.min(...yValues) * 0.88;
  const maxY = Math.max(...yValues) * 1.12;

  // Time Scale X
  const timePoints = biomarker.history.map((h) => new Date(h.date).getTime());
  const minTime = Math.min(...timePoints);
  const maxTime = Math.max(...timePoints);

  const getX = (dateStr) => {
    const t = new Date(dateStr).getTime();
    return padding.left + ((t - minTime) / (maxTime - minTime || 1)) * (graphWidth - 80);
  };

  const getY = (val) => {
    return padding.top + graphHeight - ((val - minY) / (maxY - minY || 1)) * graphHeight;
  };

  // Generate Smooth Cubic Spline Path
  const splinePath = useMemo(() => {
    const points = biomarker.history.map((h) => ({ x: getX(h.date), y: getY(h.value) }));
    if (points.length < 2) return '';

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [biomarker, minY, maxY]);

  // Projected Simulation Trajectory
  const projectedPoint = useMemo(() => {
    if (!simulationActive) return null;
    const latest = biomarker.history[biomarker.history.length - 1];
    let delta = 0;
    biomarker.interventions.forEach((item, idx) => {
      if (activeInterventions[idx]) delta += item.delta;
    });

    const projectedVal = Math.max(latest.value + delta, minY);
    const projectedDate = '2027-02-28';
    const projX = padding.left + graphWidth;
    const projY = getY(projectedVal);

    return {
      x: projX,
      y: projY,
      val: Number(projectedVal.toFixed(1)),
      date: projectedDate,
      delta: Number(delta.toFixed(1)),
    };
  }, [simulationActive, activeInterventions, biomarker, minY, maxY]);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid rgba(15, 62, 23, 0.1)',
        padding: '36px',
        boxShadow: '0 10px 32px rgba(15, 62, 23, 0.05)',
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: '42px',
      }}
      className="biomarker-trajectory-dashboard"
    >
      {/* ================= DASHBOARD HEADER ================= */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '28px',
          borderBottom: '1px solid rgba(15, 62, 23, 0.08)',
          paddingBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                backgroundColor: '#dceae0',
                color: '#13391b',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              LONGITUDINAL PREDICTIVE ENGINE
            </span>
            <span style={{ fontSize: '12.5px', color: '#666', fontFamily: 'monospace' }}>
              LOINC #{biomarker.loinc}
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '32px',
              fontWeight: 400,
              color: '#0f3e17',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Biomarker Trajectory &amp; Velocity Forecaster
          </h2>
        </div>

        {/* Velocity Indicator Pill */}
        {velocityMetrics && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              backgroundColor: velocityMetrics.isImproving ? '#eef7f0' : '#fff9eb',
              border: `1px solid ${velocityMetrics.isImproving ? '#a3d1ac' : '#fcd34d'}`,
              borderRadius: '16px',
              padding: '12px 20px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: velocityMetrics.isImproving ? '#1b4332' : '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              {velocityMetrics.isImproving ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
            </div>

            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#666' }}>
                Annual Velocity Drift
              </div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '18px',
                  fontWeight: 600,
                  color: velocityMetrics.isImproving ? '#1b4332' : '#b45309',
                }}
              >
                {velocityMetrics.annualVelocity > 0 ? `+${velocityMetrics.annualVelocity}` : velocityMetrics.annualVelocity}{' '}
                {biomarker.unit} / yr
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= BIOMARKER SELECTOR TABS ================= */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '32px',
        }}
      >
        {Object.entries(BIOMARKERS_DATA).map(([key, data]) => {
          const isSelected = selectedKey === key;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedKey(key);
                setSelectedEncounter(null);
                setSimulationActive(false);
              }}
              style={{
                backgroundColor: isSelected ? '#0f3e17' : '#f5f7f4',
                color: isSelected ? '#ffffff' : '#1b4332',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '14px',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{data.shortName}</span>
              <span
                style={{
                  fontSize: '11px',
                  opacity: 0.8,
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(15, 62, 23, 0.08)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
              >
                {data.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= MAIN INTERACTIVE SVG SPLINE GRAPH ================= */}
      <div
        style={{
          backgroundColor: '#faf8f5',
          borderRadius: '18px',
          padding: '24px',
          position: 'relative',
          border: '1px solid rgba(15, 62, 23, 0.08)',
          marginBottom: '28px',
          overflowX: 'auto',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', minWidth: '680px', display: 'block' }}
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2d6a4f" />
              <stop offset="100%" stopColor="#1b4332" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a3d1ac" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a3d1ac" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Clinical Risk Threshold Bands */}
          {biomarker.zones.map((zone, idx) => {
            const yTop = zone.max !== undefined ? getY(zone.max) : padding.top;
            const yBottom = zone.min !== undefined ? getY(zone.min) : padding.top + graphHeight;
            const height = Math.abs(yBottom - yTop);

            return (
              <g key={idx}>
                <rect
                  x={padding.left}
                  y={Math.min(yTop, yBottom)}
                  width={graphWidth}
                  height={height || 2}
                  fill={zone.color}
                />
                <text
                  x={padding.left + 12}
                  y={Math.min(yTop, yBottom) + 16}
                  fill={zone.border}
                  fontSize="10"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight="600"
                  opacity="0.85"
                >
                  {zone.label}
                </text>
              </g>
            );
          })}

          {/* Axis Grid Lines */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight}
            stroke="#d4ded5"
            strokeWidth="1.5"
          />

          {/* Historical Spline Curve */}
          <path
            d={splinePath}
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Historical Data Points with Clickable Pins */}
          {biomarker.history.map((point, idx) => {
            const cx = getX(point.date);
            const cy = getY(point.value);
            const isSelected = selectedEncounter?.date === point.date;

            return (
              <g
                key={idx}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedEncounter(point)}
              >
                {/* Outer Glow Ring on Selection */}
                {isSelected && (
                  <circle cx={cx} cy={cy} r="14" fill="#a3d1ac" opacity="0.45" />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? '7' : '5'}
                  fill="#ffffff"
                  stroke="#0f3e17"
                  strokeWidth="3"
                  style={{ transition: 'all 0.2s ease' }}
                />
                {/* Date Label */}
                <text
                  x={cx}
                  y={padding.top + graphHeight + 20}
                  textAnchor="middle"
                  fill="#666666"
                  fontSize="11"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                >
                  {point.date.slice(0, 7)}
                </text>
                {/* Value Label above node */}
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fill="#0f3e17"
                  fontSize="12.5"
                  fontWeight="600"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                >
                  {point.value}
                </text>
              </g>
            );
          })}

          {/* Projected Trajectory (Simulation Mode) */}
          {projectedPoint && (
            <g>
              {/* Dashed projection connector line */}
              <line
                x1={getX(biomarker.history[biomarker.history.length - 1].date)}
                y1={getY(biomarker.history[biomarker.history.length - 1].value)}
                x2={projectedPoint.x}
                y2={projectedPoint.y}
                stroke="#1b4332"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              {/* Projected Node */}
              <circle cx={projectedPoint.x} cy={projectedPoint.y} r="8" fill="#1b4332" />
              <circle cx={projectedPoint.x} cy={projectedPoint.y} r="16" fill="#a3d1ac" opacity="0.35" />
              <text
                x={projectedPoint.x}
                y={projectedPoint.y - 14}
                textAnchor="middle"
                fill="#1b4332"
                fontSize="13"
                fontWeight="700"
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {projectedPoint.val} {biomarker.unit} (Proj.)
              </text>
              <text
                x={projectedPoint.x}
                y={padding.top + graphHeight + 20}
                textAnchor="middle"
                fill="#1b4332"
                fontSize="11"
                fontWeight="600"
              >
                2027 Proj.
              </text>
            </g>
          )}
        </svg>

        <div style={{ marginTop: '8px', fontSize: '12px', color: '#777', textAlign: 'right' }}>
          * Click any historical node to review source encounter clinical notes &amp; prescribing doctor.
        </div>
      </div>

      {/* ================= TWO-PANEL INTERACTIVE DRAWER ================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}
        className="biomarker-bottom-grid"
      >
        {/* PANEL 1: SELECTED ENCOUNTER CLINICAL NOTES */}
        <div
          style={{
            backgroundColor: '#f6faf6',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #d0e7d5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Calendar size={18} color="#0f3e17" />
            <h4 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#0f3e17' }}>
              {selectedEncounter ? `Clinical Encounter: ${selectedEncounter.date}` : 'Latest Encounter Clinical Context'}
            </h4>
          </div>

          {(() => {
            const enc = selectedEncounter || biomarker.history[biomarker.history.length - 1];
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>Physician / Specialist:</span>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f3e17' }}>{enc.doctor}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>Facility:</span>
                  <span style={{ fontSize: '13.5px', color: '#2d6a4f' }}>{enc.clinic}</span>
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '13.5px',
                    lineHeight: 1.5,
                    color: '#1a3d22',
                    border: '1px solid #e1efe4',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', color: '#44704e' }}>
                    Physician Assessment &amp; Rationale:
                  </div>
                  "{enc.notes}"
                </div>
              </div>
            );
          })()}
        </div>

        {/* PANEL 2: "WHAT IF" CLINICAL PROTOCOL SIMULATOR */}
        <div
          style={{
            backgroundColor: '#faf6f0',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #ebd9c5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#854d0e" />
              <h4 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#854d0e' }}>
                "What If" Protocol Simulator
              </h4>
            </div>

            <button
              onClick={() => setSimulationActive(!simulationActive)}
              style={{
                backgroundColor: simulationActive ? '#854d0e' : '#ffffff',
                color: simulationActive ? '#ffffff' : '#854d0e',
                border: '1px solid #854d0e',
                borderRadius: '8px',
                padding: '4px 12px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {simulationActive ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Simulation On <CheckCircle2 size={12} strokeWidth={2.5} />
                </span>
              ) : (
                'Preview Simulation'
              )}
            </button>
          </div>

          <p style={{ fontSize: '12.5px', color: '#78350f', margin: '0 0 14px 0', lineHeight: 1.4 }}>
            Toggle preventive clinical interventions to project your 12-month biological trajectory:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {biomarker.interventions.map((intv, idx) => (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #f3e5d8',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={activeInterventions[idx]}
                    disabled={!simulationActive}
                    onChange={() => {
                      const next = [...activeInterventions];
                      next[idx] = !next[idx];
                      setActiveInterventions(next);
                    }}
                  />
                  <span style={{ color: '#451a03' }}>{intv.name}</span>
                </div>
                <span style={{ fontWeight: 600, color: intv.delta < 0 ? '#166534' : '#1e3a8a' }}>
                  {intv.delta > 0 ? `+${intv.delta}` : intv.delta} {biomarker.unit}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .biomarker-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
