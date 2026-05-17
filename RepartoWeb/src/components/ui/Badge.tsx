import React from 'react';

export type BadgeVariant = 'green' | 'amber' | 'red' | 'primary' | 'gray';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  const variantClasses: Record<BadgeVariant, string> = {
    green: 'bg-[#E9F7EF] text-[#1E8449]',
    amber: 'bg-[#FEF9E7] text-[#9A7D0A]',
    red: 'bg-[#FDEDEC] text-[#922B21]',
    primary: 'bg-r3 text-r4',
    gray: 'bg-[#F2F3F4] text-[#555555]'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium py-0.5 px-2 rounded-full whitespace-nowrap ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
