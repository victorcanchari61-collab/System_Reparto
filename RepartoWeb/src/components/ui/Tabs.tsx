import React from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** Número en badge rojo (ej: errores en la tab) */
  badge?: number;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange, className = '' }) => (
  <div className={`flex border-b border-gray-100 ${className}`}>
    {tabs.map(tab => (
      <button
        key={tab.key}
        type="button"
        onClick={() => onChange(tab.key)}
        className={[
          'flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium border-b-2 -mb-px transition-all duration-200 cursor-pointer whitespace-nowrap',
          active === tab.key
            ? 'border-r text-r'
            : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200',
        ].join(' ')}
      >
        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
        {tab.label}
        {tab.badge != null && tab.badge > 0 && (
          <span className="bg-r text-white text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
            {tab.badge}
          </span>
        )}
      </button>
    ))}
  </div>
);

export default Tabs;
