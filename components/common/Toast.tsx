
import React from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastConfig = {
  success: {
    iconName: 'check_circle',
    bg: 'bg-tertiary',
    text: 'text-tertiary-foreground',
    iconColor: 'text-tertiary-foreground'
  },
  error: {
    iconName: 'cancel',
    bg: 'bg-destructive',
    text: 'text-destructive-foreground',
    iconColor: 'text-destructive-foreground'
  },
  warning: {
    iconName: 'warning',
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    iconColor: 'text-primary-foreground'
  },
  info: {
    iconName: 'info',
    bg: 'bg-neutral-800',
    text: 'text-neutral-100',
    iconColor: 'text-neutral-100'
  }
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const config = toastConfig[type];

  return (
    <div className={`w-full max-w-sm rounded-2xl shadow-2xl pointer-events-auto overflow-hidden ${config.bg} animate-toast-in border border-white/10 backdrop-blur-xl`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 text-xl">
            <span className={`material-symbols-outlined leading-none ${config.iconColor}`} aria-hidden="true">
              {config.iconName}
            </span>
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium font-roboto ${config.text}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.text} hover:opacity-80`}
            >
              <span className="sr-only">Close</span>
              <span className="material-symbols-outlined text-base leading-none">close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {children}
      </div>
    </div>
  );
};
