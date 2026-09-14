import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const headerRef = useRef(null);
  const buttonRef = useRef(null);

  // Dropdown States
  const [activeDropdown, setActiveDropdown] = useState(null); // 'resources' | 'offer' | null
  const closeTimeoutRef = useRef(null);

  // Entrance motion: drops smoothly from above on site load
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
      );
    }
  }, []);

  // Dropdown Open handler
  const handleOpenDropdown = (menu) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveDropdown(menu);
  };

  // Grace period when moving mouse out of navbar / dropdown
  const handleMouseLeaveNav = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 140);
  };

  // Immediate close when hovering other navbar buttons (About, Case Studies, Careers, Book a Demo, Logo)
  const closeDropdownImmediately = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveDropdown(null);
  };

  // CTA Button Hover
  const handleButtonMouseEnter = () => {
    closeDropdownImmediately();
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        y: -2,
        scale: 1.015,
        duration: 0.35,
        ease: 'power2.out',
      });
    }
  };

  const handleButtonMouseLeave = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        y: 0,
        scale: 1,
        duration: 0.45,
        ease: 'power2.out',
      });
    }
  };

  // Auto-hide on scroll down, reveal on scroll up
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 30) {
        setIsHidden(false);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
        // Scrolling DOWN -> hide navbar
        if (currentScrollY > lastScrollY.current + 8 && currentScrollY > 120) {
          setIsHidden(true);
          setActiveDropdown(null); // Auto-close any dropdown
        }
        // Scrolling UP -> reveal navbar
        else if (currentScrollY < lastScrollY.current - 8) {
          setIsHidden(false);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      onMouseLeave={handleMouseLeaveNav}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: isScrolled ? 'rgba(255, 254, 252, 0.95)' : 'var(--color-cream-paper)',
        backdropFilter: isScrolled ? 'blur(14px)' : 'none',
        boxShadow: isScrolled && !isHidden ? '0 4px 24px rgba(15, 62, 23, 0.06)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(15, 62, 23, 0.08)' : '1px solid transparent',
        transform: isHidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.36s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        paddingTop: isScrolled ? '12px' : '18px',
        paddingBottom: isScrolled ? '12px' : '18px',
        width: '100%',
        willChange: 'transform',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo: Green Rounded Square + 'ease' wordmark */}
        <Link
          to="/"
          onMouseEnter={closeDropdownImmediately}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '13px',
              backgroundColor: '#0f3e17',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
            }}
          >
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%' }}
            >
              <path
                d="M15 50 C 15 25, 45 15, 85 20 C 85 55, 55 85, 15 80 Z"
                fill="#fffefc"
                opacity="0.95"
              />
              <path
                d="M30 65 C 40 45, 60 35, 80 32"
                stroke="#0f3e17"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <span
            style={{
              fontFamily: "'Playfair Display', 'Newsreader', 'Cormorant Garamond', serif",
              fontSize: '44px',
              fontWeight: 400,
              color: '#0f3e17',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginTop: '-4px',
            }}
          >
            medisage
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {/* About: closes dropdown immediately on hover */}
          <Link
            to="/#about"
            onMouseEnter={closeDropdownImmediately}
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-charcoal)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '7px',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#efeeeb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            About
          </Link>

          {/* Case Studies: closes dropdown immediately on hover */}
          <Link
            to="/#case-studies"
            onMouseEnter={closeDropdownImmediately}
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-charcoal)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '7px',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#efeeeb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Case Studies
          </Link>

          {/* Careers: closes dropdown immediately on hover */}
          <Link
            to="/#careers"
            onMouseEnter={closeDropdownImmediately}
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-charcoal)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '7px',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#efeeeb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Careers
          </Link>

          {/* Resources Dropdown Trigger (Slate-Hush Grey Pill on Hover) */}
          <div
            onMouseEnter={() => handleOpenDropdown('resources')}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 400,
              color: '#0f3e17',
              cursor: 'pointer',
              padding: '8px 14px',
              borderRadius: '7.04px',
              backgroundColor: activeDropdown === 'resources' ? '#9fbcc4' : 'transparent',
              transition: 'background-color 0.2s ease',
            }}
          >
            <span>Resources</span>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="#0f3e17"
              strokeWidth="1.8"
              style={{
                transform: activeDropdown === 'resources' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease',
              }}
            >
              <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* What We Offer Dropdown Trigger */}
          <div
            onMouseEnter={() => handleOpenDropdown('offer')}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 400,
              color: '#0f3e17',
              cursor: 'pointer',
              padding: '8px 14px',
              borderRadius: '7.04px',
              backgroundColor: activeDropdown === 'offer' ? '#9fbcc4' : 'transparent',
              transition: 'background-color 0.2s ease',
            }}
          >
            <span>What We Offer</span>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="#0f3e17"
              strokeWidth="1.8"
              style={{
                transform: activeDropdown === 'offer' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease',
              }}
            >
              <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </nav>

        {/* Right CTA Action: closes dropdown immediately on hover */}
        <div onMouseEnter={closeDropdownImmediately}>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              style={{
                backgroundColor: '#0f3e17',
                color: '#fffefc',
                fontFamily: 'var(--font-suisse-intl)',
                fontSize: '14px',
                fontWeight: 500,
                padding: '11px 26px',
                borderRadius: '999px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <span>My Vault</span>
              <span>→</span>
            </Link>
          ) : (
            <Link
              ref={buttonRef}
              to="/register"
              onMouseEnter={handleButtonMouseEnter}
              onMouseLeave={handleButtonMouseLeave}
              style={{
                backgroundColor: '#0f3e17',
                color: '#fffefc',
                fontFamily: 'var(--font-suisse-intl)',
                fontSize: '14px',
                fontWeight: 500,
                padding: '11px 26px',
                borderRadius: '999px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(15, 62, 23, 0.16)',
              }}
            >
              Create Vault
            </Link>
          )}
        </div>
      </div>

      {/* COMPACT FLOATING MEGA DROPDOWN CARD WITH FLUID HARDWARE-ACCELERATED TRANSITIONS */}
      <div
        onMouseEnter={() => {
          if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        }}
        onMouseLeave={handleMouseLeaveNav}
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: '50%',
          transform: activeDropdown ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-8px)',
          opacity: activeDropdown ? 1 : 0,
          visibility: activeDropdown ? 'visible' : 'hidden',
          pointerEvents: activeDropdown ? 'auto' : 'none',
          transition: 'opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.24s',
          width: '92%',
          maxWidth: '820px',
          backgroundColor: '#fffefc',
          border: '1px solid #efeeeb',
          boxShadow: '0 14px 36px rgba(0, 0, 0, 0.06)',
          borderRadius: '16px',
          padding: '20px 24px',
          zIndex: 100,
        }}
      >
        {activeDropdown === 'resources' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              width: '100%',
            }}
          >
            {/* Column 1: Blog */}
            <Link
              to="/#blog"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 10px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: '#0f3e17',
                }}
              >
                Blog
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '12.5px',
                  color: '#666666',
                  lineHeight: 1.35,
                }}
              >
                Practice insights & guides
              </span>
            </Link>

            {/* Column 2: Resources */}
            <Link
              to="/#resources"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 10px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: '#0f3e17',
                }}
              >
                Resources
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '12.5px',
                  color: '#666666',
                  lineHeight: 1.35,
                }}
              >
                Templates, checklists & tools
              </span>
            </Link>

            {/* Column 3: Glossary */}
            <Link
              to="/#glossary"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 10px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: '#0f3e17',
                }}
              >
                Glossary
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '12.5px',
                  color: '#666666',
                  lineHeight: 1.35,
                }}
              >
                Behavioral health terms
              </span>
            </Link>
          </div>
        ) : (
          /* What We Offer Dropdown */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              width: '100%',
            }}
          >
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 10px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: '#0f3e17',
                }}
              >
                Universal Health Vault
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '12.5px',
                  color: '#666666',
                  lineHeight: 1.35,
                }}
              >
                Medical prescriptions & scans
              </span>
            </Link>

            <Link
              to="/ai-insights"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 10px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: '#0f3e17',
                }}
              >
                Biomarker Synthesis AI
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '12.5px',
                  color: '#666666',
                  lineHeight: 1.35,
                }}
              >
                Longitudinal health guidance
              </span>
            </Link>

            <Link
              to="/insurance"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 10px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: '#0f3e17',
                }}
              >
                Insurance & Pass
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-suisse-intl)',
                  fontSize: '12.5px',
                  color: '#666666',
                  lineHeight: 1.35,
                }}
              >
                Smart policy matching & ICE pass
              </span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
