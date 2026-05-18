import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from '@tabler/icons-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  footer?: React.ReactNode;
  /** Impide cerrar al hacer clic en el overlay */
  persistent?: boolean;
  children: React.ReactNode;
}

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';

/**
 * Modal accesible con:
 * - React Portal (fuera del árbol DOM, z-index seguro)
 * - Focus trap (Tab/Shift+Tab limitado al modal)
 * - Cierre con Escape
 * - Scroll lock en body
 * - Animación de entrada
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  footer,
  persistent = false,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  /* ----- Efectos de accesibilidad ----- */
  useEffect(() => {
    if (!isOpen) return;

    // Bloquear scroll del body
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus al primer elemento focusable
    const el = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    el?.focus();

    // Cerrar con Escape
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) onClose();

      // Focus trap
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!focusables.length) return;
        const first = focusables[0];
        const last  = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose, persistent]);

  if (!isOpen) return null;

  return createPortal(
    /* Overlay */
    <div
      role="dialog"
      aria-modal
      aria-label={title}
      /* Mobile: slide up from bottom (items-end). sm+: center */
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-modal-overlay"
        onClick={persistent ? undefined : onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          'relative w-full bg-white shadow-xl flex flex-col animate-modal-panel',
          /* Mobile: bottom-sheet style — full width, rounded top, near-full height */
          'max-h-[92vh] rounded-t-2xl',
          /* sm+: centered card style */
          'sm:max-h-[90vh] sm:rounded-[var(--border-radius-lg)]',
          sizeClass[size],
        ].join(' ')}
      >
        {/* Header */}
        {(title != null) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{title}</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-[var(--border-radius-md)] p-1 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <IconX size={16} />
            </button>
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
