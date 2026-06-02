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
import enPortal from '@/locales/en/portal.json';
import enCities from '@/locales/en/cities.json';
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
import trPortal from '@/locales/tr/portal.json';
import trCities from '@/locales/tr/cities.json';
import arCommon from '@/locales/ar/common.json';
import arAuth from '@/locales/ar/auth.json';
import arNavigation from '@/locales/ar/navigation.json';
import arDashboard from '@/locales/ar/dashboard.json';
import arUsers from '@/locales/ar/users.json';
import arDepartments from '@/locales/ar/departments.json';
import arDoctors from '@/locales/ar/doctors.json';
import arPatients from '@/locales/ar/patients.json';
import arAppointments from '@/locales/ar/appointments.json';
import arEmergency from '@/locales/ar/emergency.json';
import arInpatient from '@/locales/ar/inpatient.json';
import arReferrals from '@/locales/ar/referrals.json';
import arMedicalRecords from '@/locales/ar/medical-records.json';
import arPrescriptions from '@/locales/ar/prescriptions.json';
import arLaboratory from '@/locales/ar/laboratory.json';
import arPharmacy from '@/locales/ar/pharmacy.json';
import arBilling from '@/locales/ar/billing.json';
import arSettings from '@/locales/ar/settings.json';
import arNotifications from '@/locales/ar/notifications.json';
import arAi from '@/locales/ar/ai.json';
import arAnalytics from '@/locales/ar/analytics.json';
import arReporting from '@/locales/ar/reporting.json';
import arPortal from '@/locales/ar/portal.json';
import arCities from '@/locales/ar/cities.json';

/** Languages whose UI must render right-to-left. Add others here as needed. */
export const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur']);

/**
 * Sync the document direction with the current language. Called on init AND
 * after each `languageChanged` event so the whole app flips to RTL when the
 * user switches to Arabic and back to LTR otherwise.
 */
export function applyDocumentDirection(lng: string) {
  if (typeof document === 'undefined') return;
  const base = (lng || 'en').split('-')[0];
  const dir = RTL_LANGUAGES.has(base) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = base;
}

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
        portal: enPortal,
        cities: enCities,
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
        portal: trPortal,
        cities: trCities,
      },
      ar: {
        common: arCommon,
        auth: arAuth,
        navigation: arNavigation,
        dashboard: arDashboard,
        users: arUsers,
        departments: arDepartments,
        doctors: arDoctors,
        patients: arPatients,
        appointments: arAppointments,
        emergency: arEmergency,
        inpatient: arInpatient,
        referrals: arReferrals,
        'medical-records': arMedicalRecords,
        prescriptions: arPrescriptions,
        laboratory: arLaboratory,
        pharmacy: arPharmacy,
        billing: arBilling,
        settings: arSettings,
        notifications: arNotifications,
        ai: arAi,
        analytics: arAnalytics,
        reporting: arReporting,
        portal: arPortal,
        cities: arCities,
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'tr', 'ar'],
    nonExplicitSupportedLngs: true,
    ns: ['common', 'auth', 'navigation', 'dashboard', 'users', 'departments', 'doctors', 'patients', 'appointments', 'emergency', 'inpatient', 'referrals', 'medical-records', 'prescriptions', 'laboratory', 'pharmacy', 'billing', 'settings', 'notifications', 'ai', 'analytics', 'reporting', 'portal', 'cities'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'hms-language',
      caches: ['localStorage'],
    },
  })
  .then(() => {
    applyDocumentDirection(i18n.language);
  });

i18n.on('languageChanged', (lng) => {
  applyDocumentDirection(lng);
});

export default i18n;
