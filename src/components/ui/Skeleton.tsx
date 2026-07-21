'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'image' | 'text' | 'price';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text'
}) => {
  let style = 'bg-neutral-soft/40 animate-pulse-slow';

  if (variant === 'image') {
    style += ' aspect-[3/4] w-full';
  } else if (variant === 'text') {
    style += ' h-3 w-3/4';
  } else if (variant === 'price') {
    style += ' h-3 w-1/4';
  }

  return (
    <div className={`${style} ${className}`} />
  );
};
