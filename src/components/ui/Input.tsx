import React, { forwardRef } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', onChange, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-gray-700 font-medium mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border 
            ${error ? 'border-red-500' : 'border-gray-300'} 
            focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition duration-150 ease-in-out
            ${className}
          `}
          onChange={onChange}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input'; 