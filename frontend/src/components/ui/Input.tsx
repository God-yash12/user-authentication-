
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, icon, className, ...props }, ref) => {
    const baseClasses = "w-full px-4 py-3 rounded-lg shadow-sm border focus:outline-none focus:ring-2 transition-colors duration-200 ease-in-out";
    const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
    const normalClasses = "border-gray-300 focus:ring-primary focus:border-primary";
    const disabledClasses = "bg-gray-100 cursor-not-allowed text-gray-500";

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`${baseClasses} ${props.disabled ? disabledClasses : (error ? errorClasses : normalClasses)} ${icon ? 'pl-10' : ''} ${className || ''}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
    