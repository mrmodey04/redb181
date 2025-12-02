import React from 'react';
import { ExclamationCircleIcon, XMarkIcon } from './Icons';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  return (
    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm flex items-start justify-between gap-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
            <ExclamationCircleIcon />
        </div>
        <p className="font-medium">{message}</p>
      </div>
      <button 
        onClick={onDismiss} 
        className="text-red-400 hover:text-red-200 hover:bg-red-500/20 p-1 rounded-lg transition-all"
        title="Dismiss error"
      >
        <XMarkIcon />
      </button>
    </div>
  );
};
