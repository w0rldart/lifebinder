import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info as InfoIcon, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <InfoIcon className="w-5 h-5" />,
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${bgColors[type]} animate-slide-in-right`}>
      <div className={iconColors[type]}>
        {icons[type]}
      </div>
      <p className={`text-sm font-medium flex-1 ${textColors[type]}`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${iconColors[type]} hover:opacity-70 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {children}
    </div>
  );
}

export type { ToastType };
