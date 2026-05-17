import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  delta: string;
  deltaColor?: string; // e.g. 'text-r' or 'text-r4'
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  delta,
  deltaColor = 'text-r',
  icon
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-[var(--border-radius-md)] p-[13px] px-[15px] border-t-2 border-t-r flex flex-col">
      <div className="text-[11px] text-gray-500 mb-1 flex items-center gap-1">
        {icon}
        <span>{title}</span>
      </div>
      <div className="text-[21px] font-medium text-gray-900 leading-tight">
        {value}
      </div>
      <div className={`text-[11px] mt-0.5 ${deltaColor}`}>
        {delta}
      </div>
    </div>
  );
};

export default StatCard;
