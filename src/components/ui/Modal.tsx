import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  maxWidth = 'max-w-lg'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className={cn("relative bg-card rounded-lg shadow-xl w-full flex flex-col max-h-[90vh] overflow-hidden", maxWidth)}>
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:bg-secondary p-1 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto min-h-0">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20 shrink-0">
            {footer === 'default' ? (
              <Button onClick={onClose}>Close</Button>
            ) : footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
