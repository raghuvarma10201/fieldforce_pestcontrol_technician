import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend) // Use the backend to load translations
  .use(LanguageDetector)
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    lng: 'es', // Default language
    fallbackLng: 'en', // Fallback language
    backend: {
      // URL to load translations
      loadPath: 'https://cors-anywhere.herokuapp.com/https://rpwebapps.us/clients/fieldforce/resources/lang/{{lng}}.json',
    },
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    debug: true, // Enable debug mode for more detailed logging
  });

export default i18n;

