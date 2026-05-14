
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col font-roboto"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-x-4">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl leading-none">auto_fix_high</span>
                </div>
                <h2 id="modal-title" className="text-xl font-bold text-card-foreground font-poppins">{title}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
                <span className="material-symbols-outlined text-3xl leading-none">close</span>
            </button>
        </header>
        <div className="overflow-y-auto p-6 flex-grow">
            {children}
        </div>
        {footer && (
            <footer className="flex-shrink-0 bg-muted/50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-border">
                {footer}
            </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;
