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
import enEmergency from '@/locales/en/emergency.json';
import enInpatient from '@/locales/en/inpatient.json';
import enReferrals from '@/locales/en/referrals.json';
import enMedicalRecords from '@/locales/en/medical-records.json';
import enPrescriptions from '@/locales/en/prescriptions.json';
import enLaboratory from '@/locales/en/laboratory.json';
import enPharmacy from '@/locales/en/pharmacy.json';
import enBilling from '@/locales/en/billing.json';
import enSettings from '@/locales/en/settings.json';
import enNotifications from '@/locales/en/notifications.json';
import enAi from '@/locales/en/ai.json';
import enAnalytics from '@/locales/en/analytics.json';
import enReporting from '@/locales/en/reporting.json';
import trCommon from '@/locales/tr/common.json';
import trAuth from '@/locales/tr/auth.json';
import trNavigation from '@/locales/tr/navigation.json';
import trDashboard from '@/locales/tr/dashboard.json';
import trUsers from '@/locales/tr/users.json';
import trDepartments from '@/locales/tr/departments.json';
import trDoctors from '@/locales/tr/doctors.json';
import trPatients from '@/locales/tr/patients.json';
import trAppointments from '@/locales/tr/appointments.json';
import trEmergency from '@/locales/tr/emergency.json';
import trInpatient from '@/locales/tr/inpatient.json';
import trReferrals from '@/locales/tr/referrals.json';
import trMedicalRecords from '@/locales/tr/medical-records.json';
import trPrescriptions from '@/locales/tr/prescriptions.json';
import trLaboratory from '@/locales/tr/laboratory.json';
import trPharmacy from '@/locales/tr/pharmacy.json';
import trBilling from '@/locales/tr/billing.json';
import trSettings from '@/locales/tr/settings.json';
import trNotifications from '@/locales/tr/notifications.json';
import trAi from '@/locales/tr/ai.json';
import trAnalytics from '@/locales/tr/analytics.json';
import trReporting from '@/locales/tr/reporting.json';

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
        emergency: enEmergency,
        inpatient: enInpatient,
        referrals: enReferrals,
        'medical-records': enMedicalRecords,
        prescriptions: enPrescriptions,
        laboratory: enLaboratory,
        pharmacy: enPharmacy,
        billing: enBilling,
        settings: enSettings,
        notifications: enNotifications,
        ai: enAi,
        analytics: enAnalytics,
        reporting: enReporting,
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
        emergency: trEmergency,
        inpatient: trInpatient,
        referrals: trReferrals,
        'medical-records': trMedicalRecords,
        prescriptions: trPrescriptions,
        laboratory: trLaboratory,
        pharmacy: trPharmacy,
        billing: trBilling,
        settings: trSettings,
        notifications: trNotifications,
        ai: trAi,
        analytics: trAnalytics,
        reporting: trReporting,
      },
    },
    fallbackLng: 'en',
    ns: ['common', 'auth', 'navigation', 'dashboard', 'users', 'departments', 'doctors', 'patients', 'appointments', 'emergency', 'inpatient', 'referrals', 'medical-records', 'prescriptions', 'laboratory', 'pharmacy', 'billing', 'settings', 'notifications', 'ai', 'analytics', 'reporting'],
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
