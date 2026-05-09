import React from 'react';

interface LoadingProps {
  message?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center min-h-[50vh] ${className}`}>
      <div className="text-center space-y-4">
        <div
          className="h-14 w-14 rounded-full border-4 border-muted animate-spin mx-auto"
          style={{ borderTopColor: 'hsl(var(--primary))' }}
        />
        <p className="text-sm font-semibold text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default Loading;