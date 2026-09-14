import React, { useState } from 'react';

export const FAQRow = ({ question, answer, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderBottom: '1px solid var(--color-border-mist)',
        paddingTop: '35px',
        paddingBottom: '35px',
      }}
    >
      <div
        className="faq-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '42px',
          alignItems: 'flex-start',
        }}
      >
        {/* Left Column: Serif Question 40px / 300 in Forest Ink */}
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              fontWeight: 300,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              color: 'var(--color-forest-ink)',
              margin: 0,
            }}
          >
            {question}
          </h3>
        </div>

        {/* Right Column: Sans Answer 14px / 400 in Charcoal */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              lineHeight: 1.65,
              color: 'var(--color-charcoal)',
              margin: 0,
            }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export const FAQList = ({ items }) => {
  return (
    <div style={{ width: '100%' }}>
      {items.map((item, index) => (
        <FAQRow key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};
