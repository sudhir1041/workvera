import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react'; 

const AlertMessage = ({ type = 'info', message, onClose, className = "" }) => {
  const baseClasses = "p-4 rounded-md flex items-start space-x-3 shadow-md"; 
  let typeClasses = "";
  let IconComponent;

  switch (type) {
    case 'success':
      typeClasses = "bg-green-50 border border-green-300 text-green-700";
      IconComponent = CheckCircle2;
      break;
    case 'error':
      typeClasses = "bg-red-50 border border-red-300 text-red-700";
      IconComponent = XCircle;
      break;
    case 'warning':
      typeClasses = "bg-yellow-50 border border-yellow-300 text-yellow-700";
      IconComponent = AlertCircle;
      break;
    default: 
      typeClasses = "bg-blue-50 border border-blue-300 text-blue-700";
      IconComponent = Info; 
  }

  if (!message) return null;

  return (
    <div className={`${baseClasses} ${typeClasses} ${className}`} role="alert">
      <IconComponent className="h-5 w-5 flex-shrink-0 mt-0.5" /> 
      <div className="flex-1">
        {typeof message === 'string' ? <p>{message}</p> : message }
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="p-1 -m-1 rounded-full hover:bg-opacity-20 hover:bg-current focus:outline-none focus:ring-2 focus:ring-current"
          aria-label="Close message"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
