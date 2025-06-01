import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

const PopoverModal = ({ 
  isOpen, 
  onClose, 
  children, 
  className,
  triggerRef,
  align = 'end', 
  offset = 4
}) => {
  const modalRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {   
      if (modalRef.current && !modalRef.current.contains(event.target) && 
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const updatePosition = () => {
      if (isOpen && triggerRef?.current && modalRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const modalRect = modalRef.current.getBoundingClientRect();
        
        let left = 0;
        
        switch (align) {
          case 'start':
            left = triggerRect.left;
            break;
          case 'center':
            left = triggerRect.left + (triggerRect.width - modalRect.width) / 2;
            break;
          case 'end':
            left = triggerRect.right - modalRect.width;
            break;
          default:
            left = triggerRect.right - modalRect.width;
        }

        const minLeft = 16; 
        const maxLeft = window.innerWidth - modalRect.width - 16;
        left = Math.max(minLeft, Math.min(left, maxLeft));

        setPosition({
          top: triggerRect.bottom + window.scrollY + offset,
          left: left
        });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      updatePosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, onClose, triggerRef, align, offset]);

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden",
        "bg-white rounded-xl shadow-lg border border-gray-100",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>
  );
};

PopoverModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  triggerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  align: PropTypes.oneOf(['start', 'center', 'end']),
  offset: PropTypes.number
};

export default PopoverModal; 