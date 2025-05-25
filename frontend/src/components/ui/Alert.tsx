
import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string | React.ReactNode;
  title?: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, title, onClose }) => {
  const baseClasses = "p-4 rounded-lg shadow-md flex";
  const typeClasses = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
    info: "bg-blue-50 border-blue-500 text-blue-800",
  };
  const iconClasses = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  }

  const Icon: React.FC<{type: AlertProps['type']}> = ({type}) => {
    switch(type) {
      case 'success': return <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${iconClasses[type]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'error': return <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${iconClasses[type]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'warning': return <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${iconClasses[type]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
      case 'info': return <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${iconClasses[type]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      default: return null;
    }
  }


  return (
    <div className={`${baseClasses} ${typeClasses[type]} border-l-4`} role="alert">
      <div className="mr-3 pt-1">
        <Icon type={type} />
      </div>
      <div className="flex-1">
        {title && <p className="font-bold">{title}</p>}
        <div className="text-sm">{message}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 inline-flex ${iconClasses[type]}`}>
           <span className="sr-only">Dismiss</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
    