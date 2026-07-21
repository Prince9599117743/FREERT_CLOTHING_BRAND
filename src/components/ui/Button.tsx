'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'text' | 'link';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'solid',
  children,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-sans-luxury font-light text-xs uppercase tracking-[0.2em] transition-all duration-300 ease-out cursor-pointer disabled:opacity-50 disabled:pointer-events-none';
  
  let variantStyle = '';
  
  if (variant === 'solid') {
    variantStyle = 'bg-fg-luxury text-bg-luxury border border-fg-luxury py-3 px-8 hover:bg-transparent hover:text-fg-luxury';
  } else if (variant === 'outline') {
    variantStyle = 'bg-transparent text-fg-luxury border border-fg-luxury py-3 px-8 hover:bg-fg-luxury hover:text-bg-luxury';
  } else if (variant === 'text') {
    variantStyle = 'bg-transparent text-fg-luxury py-2 px-4 hover:opacity-75';
  } else if (variant === 'link') {
    variantStyle = 'bg-transparent text-text-muted hover:text-accent-gold underline underline-offset-4 py-1';
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};
