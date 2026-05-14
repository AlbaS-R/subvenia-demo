
import React from 'react';
import { Button } from './Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
    >
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
            <h2 id="confirmation-modal-title" className="text-lg font-semibold text-card-foreground font-poppins">{title}</h2>
            <p className="mt-2 text-base text-muted-foreground font-roboto">{message}</p>
        </div>
        <div className="bg-muted/50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl">
            <Button variant="secondary" onClick={onClose}>
                {t('general.cancel')}
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
                {t('general.confirm')}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
