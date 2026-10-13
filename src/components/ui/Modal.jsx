import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal Component with Full Accessibility (F-021)
 * 
 * Implements WCAG 2.2 AA accessible dialog pattern:
 * - Focus trap (Tab/Shift+Tab cycle within modal)
 * - Initial focus to first focusable element
 * - Escape key to close
 * - Focus restoration when closed
 * - Backdrop click to dismiss
 * - Proper ARIA attributes
 * 
 * @example
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Add Device"
 * >
 *   <form>...</form>
 * </Modal>
 */

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Size variants
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Focus trap effect
  useEffect(() => {
    if (!isOpen) return;

    // Store element that had focus before modal opened
    previousFocusRef.current = document.activeElement;

    // Focus first focusable element or close button
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements && focusableElements.length > 0) {
      // Focus first input/button inside modal content, or close button as fallback
      const firstInput = Array.from(focusableElements).find(
        el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'
      );
      (firstInput || closeButtonRef.current || focusableElements[0]).focus();
    }

    // Handle Tab key for focus trap
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, move to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, move to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Handle Escape key
    const handleEscapeKey = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';

      // Restore focus to element that opened the modal
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={`
              relative z-10 w-full ${sizes[size]}
              max-h-[90vh] overflow-y-auto
              bg-white rounded-2xl shadow-2xl
              ${className}
            `.trim()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
              {title && (
                <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                  {title}
                </h2>
              )}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="
                  p-2 -mr-2
                  text-gray-400 hover:text-gray-600 hover:bg-gray-100
                  rounded-lg transition-colors
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                "
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
