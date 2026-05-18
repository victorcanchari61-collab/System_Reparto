import { createPortal } from 'react-dom';
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { useToastStore, type ToastVariant } from '../../store/useToastStore';

const config: Record<ToastVariant, { icon: React.ReactNode; cls: string }> = {
  success: {
    icon: <IconCheck size={15} />,
    cls:  'bg-green-600 text-white',
  },
  error: {
    icon: <IconX size={15} />,
    cls:  'bg-red-600 text-white',
  },
  warning: {
    icon: <IconAlertTriangle size={15} />,
    cls:  'bg-amber-500 text-white',
  },
  info: {
    icon: <IconInfoCircle size={15} />,
    cls:  'bg-[#C0392B] text-white',
  },
};

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const { icon, cls } = config[toast.variant];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-[var(--border-radius-lg)] shadow-lg text-[13px] font-medium pointer-events-auto animate-modal-panel ${cls}`}
          >
            <span className="shrink-0">{icon}</span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="shrink-0 opacity-70 hover:opacity-100 cursor-pointer ml-1"
            >
              <IconX size={13} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
