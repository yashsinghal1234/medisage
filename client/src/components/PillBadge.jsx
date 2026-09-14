import React from 'react';

export const PillBadge = ({ children, variant = 'cream', className = '', icon: Icon }) => {
  let bgClass = 'var(--color-cream-paper)';
  let textClass = 'var(--color-forest-ink)';

  if (variant === 'sage') {
    bgClass = 'var(--color-sage-mist)';
  } else if (variant === 'keylime') {
    bgClass = 'var(--color-keylime-wash)';
  } else if (variant === 'slate') {
    bgClass = 'var(--color-slate-hush)';
  } else if (variant === 'mint') {
    bgClass = 'var(--color-mint-veil)';
  }

  return (
    <span
      className={`pill-badge ${className}`}
      style={{
        backgroundColor: bgClass,
        color: textClass,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '9px 14px',
        borderRadius: 'var(--radius-badges)',
        fontSize: 'var(--text-body)',
        fontWeight: 'var(--font-weight-regular)',
        lineHeight: 1.2,
      }}
    >
      {Icon && <Icon size={14} strokeWidth={2} />}
      {children}
    </span>
  );
};

export const PrimaryButton = ({
  children,
  onClick,
  type = 'button',
  size = 'normal',
  showArrow = true,
  className = '',
  disabled = false,
  as = 'button',
  href,
  style = {},
}) => {
  const Component = as;
  const isLarge = size === 'large';

  return (
    <Component
      type={as === 'button' ? type : undefined}
      href={href}
      onClick={onClick}
      disabled={disabled}
      className={`btn-forest ${isLarge ? 'btn-forest-lg' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '9px',
        backgroundColor: 'var(--color-forest-ink)',
        color: 'var(--color-cream-paper)',
        fontFamily: 'var(--font-sans)',
        fontSize: isLarge ? '16px' : 'var(--text-body)',
        fontWeight: 'var(--font-weight-regular)',
        padding: isLarge ? '21px 35px' : '14px 21px',
        borderRadius: 'var(--radius-buttons)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        textDecoration: 'none',
        transition: 'background-color 0.2s ease, transform 0.15s ease',
        ...style,
      }}
    >
      <span>{children}</span>
      {showArrow && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginLeft: '2px' }}
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      )}
    </Component>
  );
};
