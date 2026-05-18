import { IconUsers, IconShield, IconKey } from '@tabler/icons-react';

export default function DashboardPage() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
          Resumen de tu empresa
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[var(--border-radius-lg)] border border-[var(--color-border-secondary)] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-[var(--border-radius-md)] bg-r3 flex items-center justify-center shrink-0">
            <IconUsers size={20} className="text-r" />
          </div>
          <div>
            <p className="text-[12px] text-[var(--color-text-secondary)]">Usuarios</p>
            <p className="text-[22px] font-bold text-[var(--color-text-primary)]">—</p>
          </div>
        </div>

        <div className="bg-white rounded-[var(--border-radius-lg)] border border-[var(--color-border-secondary)] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-[var(--border-radius-md)] bg-r3 flex items-center justify-center shrink-0">
            <IconShield size={20} className="text-r" />
          </div>
          <div>
            <p className="text-[12px] text-[var(--color-text-secondary)]">Roles</p>
            <p className="text-[22px] font-bold text-[var(--color-text-primary)]">—</p>
          </div>
        </div>

        <div className="bg-white rounded-[var(--border-radius-lg)] border border-[var(--color-border-secondary)] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-[var(--border-radius-md)] bg-r3 flex items-center justify-center shrink-0">
            <IconKey size={20} className="text-r" />
          </div>
          <div>
            <p className="text-[12px] text-[var(--color-text-secondary)]">Permisos activos</p>
            <p className="text-[22px] font-bold text-[var(--color-text-primary)]">—</p>
          </div>
        </div>
      </div>
    </div>
  );
}
