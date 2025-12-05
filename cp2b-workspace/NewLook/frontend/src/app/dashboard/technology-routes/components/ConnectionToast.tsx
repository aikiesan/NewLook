'use client';

import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error';

interface ConnectionToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  autoClose?: number;
}

/**
 * Toast notification for connection validation feedback
 * Shows success (✅), warning (⚠️), or error (❌) messages
 */
export default function ConnectionToast({
  message,
  type,
  onClose,
  autoClose = 5000,
}: ConnectionToastProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-cp2b-green to-cp2b-lime',
      icon: <CheckCircle2 className="h-5 w-5 text-white" />,
      border: 'border-cp2b-green',
      title: 'Conexão Válida',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      icon: <AlertTriangle className="h-5 w-5 text-white" />,
      border: 'border-orange-500',
      title: 'Conexão Experimental',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: <AlertCircle className="h-5 w-5 text-white" />,
      border: 'border-red-500',
      title: 'Conexão Inválida',
    },
  };

  const style = styles[type];

  return (
    <div
      className={`fixed top-24 right-4 z-50 max-w-md animate-in slide-in-from-right-5 fade-in duration-300 ${
        type === 'error' ? 'animate-shake' : ''
      }`}
    >
      <div
        className={`${style.bg} text-white rounded-lg shadow-2xl border-2 ${style.border} overflow-hidden`}
      >
        <div className="flex items-start gap-3 p-4">
          <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm mb-1">{style.title}</h4>
            <p className="text-sm text-white/90 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white/20 overflow-hidden">
          <div
            className="h-full bg-white/40 animate-progress"
            style={{ animationDuration: `${autoClose}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
