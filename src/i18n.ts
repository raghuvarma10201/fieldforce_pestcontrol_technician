import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend) // Use the backend to load translations
  .use(LanguageDetector)
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: true,
    resources: {}, // Empty initially, we will load it dynamically
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
