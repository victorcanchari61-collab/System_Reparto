import React from 'react';

interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}

/**
 * Agrupa campos de formulario bajo un título semántico.
 * Usa las variables CSS del sistema de diseño.
 */
const FormSection: React.FC<FormSectionProps> = ({ title, icon, hint, children }) => (
  <fieldset className="flex flex-col gap-3 border-none p-0 m-0">
    <legend className="w-full">
      <div className="flex items-center gap-1.5 pb-1.5 border-b border-[var(--color-border-tertiary)] mb-1">
        {icon && <span className="text-[var(--color-text-secondary)]">{icon}</span>}
        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">
          {title}
        </span>
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </legend>
    {children}
  </fieldset>
);

export default FormSection;
