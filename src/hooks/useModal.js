import { useEffect } from 'react';

/**
 * Custom hook for modal management
 * Provides consistent modal behavior across the application
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {object} options - Configuration options
 * @param {boolean} options.closeOnEscape - Whether to close on Escape key (default: true)
 * @param {boolean} options.preventBodyScroll - Whether to prevent body scroll (default: true)
 * @param {boolean} options.closeOnOutsideClick - Whether to close on outside click (default: true)
 */
export const useModal = (isOpen, onClose, options = {}) => {
  const {
    closeOnEscape = true,
    preventBodyScroll = true,
    closeOnOutsideClick = true,
  } = options;

  useEffect(() => {
    if (!isOpen) return;

    // Handle escape key
    const handleEscapeKey = (event) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll
    if (preventBodyScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }

    // Add event listeners
    if (closeOnEscape) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Cleanup function
    return () => {
      if (preventBodyScroll) {
        document.body.style.overflow = 'auto';
      }
      if (closeOnEscape) {
        document.removeEventListener('keydown', handleEscapeKey);
      }
    };
  }, [isOpen, onClose, closeOnEscape, preventBodyScroll]);

  // Handle outside click
  const handleBackdropClick = (event) => {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return {
    handleBackdropClick,
  };
};

/**
 * Standard modal backdrop classes
 * Use these classes for consistent modal styling
 */
export const MODAL_BACKDROP_CLASSES = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm";

/**
 * Standard modal container classes
 * Use these classes for consistent modal container styling
 */
export const MODAL_CONTAINER_CLASSES = "fixed inset-0 z-50 flex items-center justify-center p-4";

/**
 * Standard modal content classes
 * Use these classes for consistent modal content styling
 */
export const MODAL_CONTENT_CLASSES = "bg-white rounded-xl shadow-lg w-full max-w-md relative transform transition-all duration-300 ease-in-out";

/**
 * Z-index constants for modal layering
 */
export const MODAL_Z_INDEX = {
  BACKDROP: 50,
  CONTENT: 51,
  OVERLAY: 52,
};
