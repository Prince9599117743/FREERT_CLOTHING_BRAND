'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-light">
          {label}
        </label>
      )}
      <input 
        id={id}
        className={`input-editorial text-xs ${error ? 'border-red-700' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[9px] uppercase tracking-wider text-red-700 font-light mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
