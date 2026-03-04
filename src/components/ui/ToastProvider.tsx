import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

export const ToastProvider: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle : 
                     toast.type === 'error' ? AlertCircle : Info;
        
        return (
          <div 
            key={toast.id}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5",
              {
                "bg-card text-foreground border-border": toast.type === 'info',
                "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800": toast.type === 'success',
                "bg-destructive/10 text-destructive border-destructive/20": toast.type === 'error',
              }
            )}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{toast.title}</p>
              {toast.description && (
                <p className="text-sm opacity-90">{toast.description}</p>
              )}
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
};
