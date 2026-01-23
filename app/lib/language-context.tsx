import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getTranslations, getNestedValue, type Language, type Translations } from './i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'lifebinder_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (storedLanguage === 'en' || storedLanguage === 'es') {
      setLanguageState(storedLanguage);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const translations = getTranslations(language);

  const t = (key: string, variables?: Record<string, string | number>): string => {
    let value = getNestedValue(translations, key);

    if (variables) {
      Object.entries(variables).forEach(([key, val]) => {
        value = value.replace(`{${key}}`, String(val));
      });
    }

    return value;
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
