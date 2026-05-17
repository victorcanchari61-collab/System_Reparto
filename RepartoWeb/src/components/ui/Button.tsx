import React from 'react';
import { IconLoader } from '@tabler/icons-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantClass = {
  primary: 'bg-r hover:bg-r4 text-white disabled:opacity-70',
  ghost:   'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
  danger:  'bg-red-600 hover:bg-red-700 text-white disabled:opacity-70',
};

const sizeClass = {
  sm: 'py-1.5 px-3 text-[11px]',
  md: 'py-2.5 px-4 text-[12px]',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => (
  <button
    disabled={disabled || loading}
    className={[
      'flex items-center justify-center gap-1.5 font-medium rounded-[var(--border-radius-md)] transition-colors cursor-pointer disabled:cursor-not-allowed',
      variantClass[variant],
      sizeClass[size],
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ')}
    {...props}
  >
    {loading ? <IconLoader size={13} className="animate-spin shrink-0" /> : icon}
    {children}
  </button>
);

export default Button;
