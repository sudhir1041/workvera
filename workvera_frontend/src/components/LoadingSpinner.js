import React from 'react';
import { LoaderCircle } from 'lucide-react';

const LoadingSpinner = ({ size = 24, text, className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <LoaderCircle 
        size={size} 
        className="animate-spin text-blue-600" 
        strokeWidth={2.5} 
      />
      {text && <p className="text-sm text-gray-600 mt-2">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
