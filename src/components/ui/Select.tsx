import React, { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  onChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-gray-700 font-medium mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border 
            ${error ? 'border-red-500' : 'border-gray-300'} 
            focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition duration-150 ease-in-out
            bg-white
            text-base
            appearance-none
            ${className}
          `}
          onChange={handleChange}
          {...props}
        >
          <option value="">선택하세요</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select'; 