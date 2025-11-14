/**
 * FOCUS TRAP HOOK
 * Traps keyboard focus within a container (e.g., modal, dialog)
 * Implements WCAG 2.1 Success Criterion 2.4.3 (Focus Order)
 *
 * Usage:
 * const trapRef = useFocusTrap(isOpen);
 * <div ref={trapRef}>...modal content...</div>
 */

import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
];

export const useFocusTrap = (isActive = true) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;
    const focusableElements = element.querySelectorAll(
      FOCUSABLE_ELEMENTS.join(',')
    );

    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Store previously focused element to restore later
    const previouslyFocused = document.activeElement;

    // Focus first element when trap activates
    if (firstFocusable) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        firstFocusable.focus();
      }, 10);
    }

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      // Shift + Tab (going backwards)
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      }
      // Tab (going forward)
      else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        // Allow parent components to handle escape
        // by dispatching a custom event
        const escapeEvent = new CustomEvent('modal:escape', {
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(escapeEvent);
      }
    };

    // Add event listeners
    element.addEventListener('keydown', handleTabKey);
    element.addEventListener('keydown', handleEscapeKey);

    // Cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey);
      element.removeEventListener('keydown', handleEscapeKey);

      // Restore focus to previously focused element
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [isActive]);

  return elementRef;
};

export default useFocusTrap;
