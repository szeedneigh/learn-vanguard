import { useRef, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/useModal";

/**
 * BaseModal component that provides consistent modal behavior and styling.
 * This can be used as a foundation for all modals in the application.
 */
const BaseModal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  showCloseButton = true,
  closeOnOutsideClick = true,
  maxWidth = "md",
  footerContent,
  loading = false,
}) => {
  const modalRef = useRef(null);
  const { handleBackdropClick } = useModal(isOpen, onClose, {
    closeOnEscape: true,
    preventBodyScroll: true,
    closeOnOutsideClick: closeOnOutsideClick,
  });

  // Handle click outside for the modal content
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        closeOnOutsideClick &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, closeOnOutsideClick]);

  if (!isOpen) {
    return null;
  }

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cn(
          "bg-white rounded-xl shadow-lg w-full overflow-hidden relative",
          "transition-all duration-300 ease-in-out transform",
          "opacity-100 scale-100",
          maxWidthClasses[maxWidth],
          loading && "pointer-events-none opacity-75",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            {title && (
              <div>
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h2>
                {description && (
                  <p id="modal-description" className="text-sm text-gray-500">
                    {description}
                  </p>
                )}
              </div>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ml-auto min-h-[44px] min-w-[44px] touch-manipulation"
                aria-label="Close modal"
                disabled={loading}
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer if provided */}
        {footerContent && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

BaseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  description: PropTypes.node,
  className: PropTypes.string,
  showCloseButton: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
  maxWidth: PropTypes.oneOf([
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "4xl",
    "5xl",
    "full",
  ]),
  footerContent: PropTypes.node,
  loading: PropTypes.bool,
};

export default BaseModal;
