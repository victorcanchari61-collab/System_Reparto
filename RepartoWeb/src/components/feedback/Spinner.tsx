import React from 'react';
import { IconLoader } from '@tabler/icons-react';

interface SpinnerProps {
  label?: string;
  size?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ label = 'Cargando...', size = 16 }) => (
  <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-gray-400">
    <IconLoader size={size} className="animate-spin" />
    {label && <span>{label}</span>}
  </div>
);

export default Spinner;
