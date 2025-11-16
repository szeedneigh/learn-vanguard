/**
 * SKIP NAVIGATION COMPONENT
 * Provides keyboard users with shortcuts to skip to main content
 * Implements WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks)
 */

import React from 'react';

const SkipNav = () => {
  return (
    <>
      {/* Skip navigation links - visible only on focus */}
      <div className="skip-nav-container">
        <a
          href="#main-content"
          className="skip-nav-link"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="skip-nav-link"
        >
          Skip to navigation
        </a>
      </div>

      <style jsx>{`
        .skip-nav-container {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
        }

        .skip-nav-link {
          position: absolute;
          top: -100px;
          left: 0;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          font-weight: 600;
          border-radius: 0 0 0.5rem 0;
          box-shadow: var(--shadow-lg);
          transition: top 0.2s ease-in-out;
        }

        .skip-nav-link:focus {
          top: 0;
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }

        .skip-nav-link:hover:focus {
          background: hsl(var(--primary-hover));
        }
      `}</style>
    </>
  );
};

export default SkipNav;
