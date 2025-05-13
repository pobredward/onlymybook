import React, { forwardRef } from 'react';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  className?: string;
  id?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked = false, onChange, error, className = '', id, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    const checkboxId = id || `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex items-center">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            checked={checked}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className="ml-2 block text-gray-700"
          >
            {label}
          </label>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox'; 