import React from 'react';

interface ButtonGhostProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export const ButtonGhost: React.FC<ButtonGhostProps> = ({
  children,
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-medium text-[13px] py-2 px-[15px] rounded-[var(--border-radius-md)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default ButtonGhost;
