import { useLanguage } from '../context/LanguageContext';
import { en } from '../locales/en';

const translations = { en };

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language] ?? translations.en;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return value || key;
  };

  return { t, language };
};
