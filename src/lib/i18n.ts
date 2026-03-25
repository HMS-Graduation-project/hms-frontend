import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@/locales/en/common.json';
import enAuth from '@/locales/en/auth.json';
import enNavigation from '@/locales/en/navigation.json';
import enDashboard from '@/locales/en/dashboard.json';
import enUsers from '@/locales/en/users.json';
import trCommon from '@/locales/tr/common.json';
import trAuth from '@/locales/tr/auth.json';
import trNavigation from '@/locales/tr/navigation.json';
import trDashboard from '@/locales/tr/dashboard.json';
import trUsers from '@/locales/tr/users.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        navigation: enNavigation,
        dashboard: enDashboard,
        users: enUsers,
      },
      tr: {
        common: trCommon,
        auth: trAuth,
        navigation: trNavigation,
        dashboard: trDashboard,
        users: trUsers,
      },
    },
    fallbackLng: 'en',
    ns: ['common', 'auth', 'navigation', 'dashboard', 'users'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'hms-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
