import React from 'react';
import { Spinner } from './spinner';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = "Loading...", 
  size = 'md',
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="text-center">
        <Spinner size={size} className="mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Loading; 