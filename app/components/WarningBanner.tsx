import type { ReactNode } from 'react';
import { AlertTriangle, Info as InfoIcon, XCircle, X } from 'lucide-react';

interface WarningBannerProps {
  children: ReactNode;
  type?: 'warning' | 'info' | 'error';
  onDismiss?: () => void;
}

export function WarningBanner({ children, type = 'warning', onDismiss }: WarningBannerProps) {
  const styles = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const icons = {
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    info: <InfoIcon className="w-5 h-5 text-blue-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
  };

  return (
    <div className={`border rounded-lg p-4 flex gap-3 ${styles[type]}`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 text-sm">
        {children}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
