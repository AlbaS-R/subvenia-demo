
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { translations } from '../translations';

type Language = 'es' | 'en' | 'ca' | 'fr' | 'de' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, ...args: any[]) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper function to get a value from a nested object using a dot-notation string
const getTranslation = (lang: Language, key: string): any => {
    try {
        return key.split('.').reduce((obj: any, k: string) => {
            return obj && obj[k];
        }, translations[lang]);
    } catch (e) {
        console.warn(`Could not find translation for key: ${key}`);
        return undefined;
    }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    const savedLang = localStorage.getItem('grantWinLanguage') as Language;
    if (savedLang && ['es', 'en', 'ca', 'fr', 'de', 'it'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('grantWinLanguage', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string, ...args: any[]): any => {
    const translation = getTranslation(language, key);
    if (typeof translation === 'function') {
        return translation(...args);
    }
    
    if (translation === undefined) {
      // Fallback to English if key not found in current language
      const fallbackTranslation = getTranslation('en', key);
      if (fallbackTranslation !== undefined) {
        if (typeof fallbackTranslation === 'function') {
          return fallbackTranslation(...args);
        }
        return fallbackTranslation;
      }
      return key; // Return key if not found in either language
    }
    
    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};