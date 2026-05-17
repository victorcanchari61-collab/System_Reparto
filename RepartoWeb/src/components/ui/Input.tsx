import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  rightElement?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, hint, rightElement, id, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={id} className="text-[11px] text-gray-500 flex items-center gap-1.5">
        {label}
        {props.required
          ? (
            <span key="req" className="text-[10px] font-bold text-r inline-block animate-required leading-none">
              *
            </span>
          ) : (
            <span key="opt" className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full animate-optional leading-none">
              opcional
            </span>
          )
        }
      </label>
    )}
    <div className="relative flex items-center">
      <input
        id={id}
        className={[
          'w-full border rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none transition-colors',
          error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-r',
          rightElement ? 'pr-20' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-1.5">{rightElement}</div>
      )}
    </div>
    {error && <span className="text-[10px] text-red-500">{error}</span>}
    {hint && !error && <span className="text-[10px] text-gray-400">{hint}</span>}
  </div>
);

export default Input;
