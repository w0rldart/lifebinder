import type { Language, Translations } from './types';
import en from './locales/en.json';
import es from './locales/es.json';

const translations: Record<Language, Translations> = {
  en: en as Translations,
  es: es as Translations,
};

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}

export function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path;
    }
  }

  return typeof result === 'string' ? result : path;
}

export { type Language, type Translations };
