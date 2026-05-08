import React from 'react';
import { Loader2 } from 'lucide-react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  'aria-label'?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-5 w-5',  
  sm: 'h-6 w-6',  
  md: 'h-8 w-8',   
  lg: 'h-10 w-10',
};

export function Spinner({ size = 'md', className = '', ...props }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${sizeClasses[size]} animate-spin text-primary ${className}`}
      {...props}
    />
  );
}

export default Spinner;


