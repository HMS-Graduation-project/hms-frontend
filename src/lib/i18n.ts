import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@/locales/en/common.json';
import enAuth from '@/locales/en/auth.json';
import enNavigation from '@/locales/en/navigation.json';
import enDashboard from '@/locales/en/dashboard.json';
import enUsers from '@/locales/en/users.json';
import enDepartments from '@/locales/en/departments.json';
import enDoctors from '@/locales/en/doctors.json';
import enPatients from '@/locales/en/patients.json';
import enAppointments from '@/locales/en/appointments.json';
import enMedicalRecords from '@/locales/en/medical-records.json';
import enPrescriptions from '@/locales/en/prescriptions.json';
import trCommon from '@/locales/tr/common.json';
import trAuth from '@/locales/tr/auth.json';
import trNavigation from '@/locales/tr/navigation.json';
import trDashboard from '@/locales/tr/dashboard.json';
import trUsers from '@/locales/tr/users.json';
import trDepartments from '@/locales/tr/departments.json';
import trDoctors from '@/locales/tr/doctors.json';
import trPatients from '@/locales/tr/patients.json';
import trAppointments from '@/locales/tr/appointments.json';
import trMedicalRecords from '@/locales/tr/medical-records.json';
import trPrescriptions from '@/locales/tr/prescriptions.json';

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
        departments: enDepartments,
        doctors: enDoctors,
        patients: enPatients,
        appointments: enAppointments,
        'medical-records': enMedicalRecords,
        prescriptions: enPrescriptions,
      },
      tr: {
        common: trCommon,
        auth: trAuth,
        navigation: trNavigation,
        dashboard: trDashboard,
        users: trUsers,
        departments: trDepartments,
        doctors: trDoctors,
        patients: trPatients,
        appointments: trAppointments,
        'medical-records': trMedicalRecords,
        prescriptions: trPrescriptions,
      },
    },
    fallbackLng: 'en',
    ns: ['common', 'auth', 'navigation', 'dashboard', 'users', 'departments', 'doctors', 'patients', 'appointments', 'medical-records', 'prescriptions'],
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
