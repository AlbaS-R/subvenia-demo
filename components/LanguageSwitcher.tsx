
import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type LanguageCode = 'es' | 'en' | 'ca' | 'fr' | 'de' | 'it';

interface LanguageSwitcherProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement>;
}

const languageMap: Record<LanguageCode, { flag: string; code: string; nameKey: string }> = {
    es: { flag: '🇪🇸', code: 'ES', nameKey: 'languages.es' },
    ca: { flag: '🇦🇩', code: 'CA', nameKey: 'languages.ca' },
    en: { flag: '🇬🇧', code: 'EN', nameKey: 'languages.en' },
    fr: { flag: '🇫🇷', code: 'FR', nameKey: 'languages.fr' },
    de: { flag: '🇩🇪', code: 'DE', nameKey: 'languages.de' },
    it: { flag: '🇮🇹', code: 'IT', nameKey: 'languages.it' },
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ isOpen, onClose, anchorRef }) => {
    const { language, setLanguage, t } = useLanguage();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !anchorRef.current?.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);

    if (!isOpen) return null;

    return (
        <div ref={dropdownRef} className="w-48 bg-card dark:bg-neutral-800 rounded-xl shadow-2xl z-50 py-1 animate-toast-in overflow-hidden">
            {Object.entries(languageMap).map(([code, { flag, nameKey }]) => (
                <button
                    key={code}
                    onClick={() => { setLanguage(code as LanguageCode); onClose(); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between transition-colors font-poppins ${language === code ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                >
                    <span className="flex items-center gap-3">
                        <span>{flag}</span>
                        <span>{t(nameKey)}</span>
                    </span>
                    {language === code && <span className="material-symbols-outlined text-base leading-none text-primary">check</span>}
                </button>
            ))}
        </div>
    );
};
