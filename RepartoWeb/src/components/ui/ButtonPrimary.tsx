import React from 'react';

interface ButtonPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  children,
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`bg-r hover:bg-r4 text-white font-medium text-[13px] py-2 px-[15px] rounded-[var(--border-radius-md)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default ButtonPrimary;
