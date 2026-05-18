import Modal from './Modal';
import Button from './Button';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';

type Variant = 'danger' | 'warning';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
}

const variantConfig: Record<Variant, { icon: React.ReactNode; btnClass: string }> = {
  danger: {
    icon: <IconTrash size={20} className="text-red-500" />,
    btnClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: <IconAlertTriangle size={20} className="text-amber-500" />,
    btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  variant      = 'danger',
  loading      = false,
}: ConfirmModalProps) {
  const { icon, btnClass } = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      persistent={loading}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--border-radius-md)] text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50 ${btnClass}`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : null}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</p>
          {description && (
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">{description}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
