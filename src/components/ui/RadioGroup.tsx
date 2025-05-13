import React, { forwardRef } from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value?: string;
  error?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ label, name, options, value, error, onChange, className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {label && (
          <label className="block text-gray-700 font-medium mb-2">
            {label}
          </label>
        )}
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <label
                htmlFor={`${name}-${option.value}`}
                className="ml-3 block text-gray-700"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup'; 