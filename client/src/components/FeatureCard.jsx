import React from 'react';
import { PillBadge } from './PillBadge';

export const FeatureCard = ({
  eyebrow,
  title,
  body,
  tag,
  icon: Icon,
  variant = 'sage', // 'sage' | 'keylime' | 'mint'
  children,
  className = '',
  style = {},
}) => {
  const bg =
    variant === 'keylime'
      ? 'var(--color-keylime-wash)'
      : variant === 'mint'
      ? 'var(--color-mint-veil)'
      : 'var(--color-sage-mist)';

  const padding = variant === 'keylime' ? '28px' : '42px';

  return (
    <div
      className={`card-rounded ${className}`}
      style={{
        backgroundColor: bg,
        borderRadius: 'var(--radius-cards)',
        padding: padding,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        ...style,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          {eyebrow && (
            <span className="eyebrow-label" style={{ margin: 0 }}>
              {eyebrow}
            </span>
          )}
          {tag && <PillBadge variant="cream">{tag}</PillBadge>}
        </div>

        {title && (
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: '28px',
              lineHeight: 1.25,
              color: 'var(--color-forest-ink)',
              marginBottom: '14px',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h3>
        )}

        {body && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              lineHeight: 1.55,
              color: 'var(--color-charcoal)',
              marginBottom: children ? '21px' : '0',
            }}
          >
            {body}
          </p>
        )}
      </div>

      {children && <div style={{ marginTop: 'auto' }}>{children}</div>}
    </div>
  );
};

export const SlateProductPanel = ({ title, subtitle, tabs = [], activeTab, onTabChange, children }) => {
  return (
    <div
      className="card-rounded"
      style={{
        backgroundColor: 'var(--color-slate-hush)',
        borderRadius: 'var(--radius-cards)',
        padding: '42px',
        boxShadow: 'none',
        width: '100%',
      }}
    >
      {(title || tabs.length > 0) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            marginBottom: '28px',
          }}
        >
          {title && (
            <div>
              <span className="eyebrow-label" style={{ color: 'var(--color-forest-ink)' }}>
                CLINICAL INTERFACE
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 300,
                  fontSize: '28px',
                  color: 'var(--color-forest-ink)',
                  margin: 0,
                }}
              >
                {title}
              </h3>
            </div>
          )}

          {tabs.length > 0 && (
            <div style={{ display: 'flex', gap: '7px' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                  style={{
                    backgroundColor: activeTab === tab.id ? 'var(--color-forest-ink)' : 'var(--color-cream-paper)',
                    color: activeTab === tab.id ? 'var(--color-cream-paper)' : 'var(--color-forest-ink)',
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-badges)',
                    border: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Inner Cream Paper Card */}
      <div
        className="card-rounded"
        style={{
          backgroundColor: 'var(--color-cream-paper)',
          borderRadius: 'var(--radius-cards)',
          padding: '28px',
          boxShadow: 'none',
          border: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};
