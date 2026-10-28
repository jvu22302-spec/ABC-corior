import React, { useEffect, useRef } from 'react';
import { m, AnimatePresence, type Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useMotionPreference } from '@/motion/useMotionPreference';
import { SPRING } from '@/motion/tokens';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus initial focusable element
    const timer = setTimeout(() => {
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 20);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const widthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
  }[maxWidth];

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const panelVariants: Variants = reduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.1 } },
        exit: { opacity: 0, transition: { duration: 0.08 } },
      }
    : isMobile
    ? {
        hidden: { opacity: 0, y: '100%' },
        visible: { opacity: 1, y: 0, transition: SPRING.soft },
        exit: { opacity: 0, y: '100%', transition: { duration: 0.2, ease: [0.42, 0, 1, 1] } },
      }
    : {
        hidden: { opacity: 0, scale: 0.96, y: 8 },
        visible: { opacity: 1, scale: 1, y: 0, transition: SPRING.soft },
        exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15, ease: [0.42, 0, 1, 1] } },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop with fade animation */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.2 }}
            className="fixed inset-0 bg-ink-900/50 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog Panel: bottom sheet on mobile, centered card on desktop */}
          <m.div
            ref={modalRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className={cn(
              'relative z-10 w-full bg-surface shadow-2xl border border-ink-200 overflow-hidden flex flex-col',
              'max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:max-h-[85vh]',
              'sm:rounded-xl sm:max-h-[90vh]',
              widthClasses
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-ink-100">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-base font-semibold text-ink-900">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="text-xs text-ink-600 mt-0.5">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-ink-400 hover:text-ink-900 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600 -mr-1"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 text-sm text-ink-700">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="p-4 bg-surface-muted border-t border-ink-100 flex justify-end gap-2.5">
                {footer}
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
