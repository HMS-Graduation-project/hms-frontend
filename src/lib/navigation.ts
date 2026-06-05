import {
  LayoutDashboard,
  Users,
  Building2,
  Stethoscope,
  UserRound,
  CalendarDays,
  FileText,
  Pill,
  FlaskConical,
  Receipt,
  BarChart3,
  Settings,
  Brain,
  ShieldCheck,
  Siren,
  BedDouble,
  ArrowRightLeft,
  Globe2,
  Map,
  MapPin,
  ClipboardList,
} from 'lucide-react';

export interface NavItem {
  label: string; // i18n key in 'navigation' namespace
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles: string[]; // ['*'] means all authenticated users
}

/**
 * Staff sidebar items. PATIENT users live in the patient portal layout
 * (`/portal/*`) and must NOT see staff nav, so we never include them in
 * any role list here. The wildcard `'*'` was retired for the same reason.
 */
const STAFF_ALL = [
  'SUPER_ADMIN',
  'MINISTRY_ADMIN',
  'REGIONAL_ADMIN',
  'ADMIN',
  'HOSPITAL_ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'PHARMACIST',
  'LAB_TECHNICIAN',
];

export const navigationItems: NavItem[] = [
  { label: 'dashboard', icon: LayoutDashboard, href: '/dashboard', roles: STAFF_ALL },
  { label: 'ministryDashboard', icon: Globe2, href: '/ministry', roles: ['SUPER_ADMIN'] },
  { label: 'regionalDashboard', icon: Map, href: '/regional', roles: ['SUPER_ADMIN', 'MINISTRY_ADMIN', 'REGIONAL_ADMIN'] },
  { label: 'patients', icon: UserRound, href: '/patients', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
  { label: 'doctors', icon: Stethoscope, href: '/doctors', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'] },
  { label: 'departments', icon: Building2, href: '/departments', roles: STAFF_ALL },
  { label: 'appointments', icon: CalendarDays, href: '/appointments', roles: STAFF_ALL },
  { label: 'emergency', icon: Siren, href: '/emergency', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
  { label: 'inpatient', icon: BedDouble, href: '/inpatient/admissions', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
  { label: 'referrals', icon: ArrowRightLeft, href: '/referrals/incoming', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'] },
  { label: 'medicalRecords', icon: FileText, href: '/medical-records', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'] },
  { label: 'prescriptions', icon: Pill, href: '/prescriptions', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST'] },
  { label: 'laboratory', icon: FlaskConical, href: '/laboratory', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN'] },
  { label: 'billing', icon: Receipt, href: '/billing', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'] },
  { label: 'aiTools', icon: Brain, href: '/ai/symptom-checker', roles: ['DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'] },
  { label: 'pneumoniaDetection', icon: Stethoscope, href: '/ai/pneumonia', roles: ['DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'] },
  { label: 'aiAnalysesHistory', icon: ClipboardList, href: '/ai/analyses', roles: ['DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'] },
  { label: 'aiAnalyticsDashboard', icon: BarChart3, href: '/ai/analytics', roles: ['DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'] },
  { label: 'analytics', icon: BarChart3, href: '/analytics', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN'] },
  { label: 'users', icon: Users, href: '/admin/users', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN'] },
  { label: 'nationalRegistry', icon: ShieldCheck, href: '/admin/national-registry', roles: ['SUPER_ADMIN', 'MINISTRY_ADMIN'] },
  { label: 'cities', icon: MapPin, href: '/admin/cities', roles: ['SUPER_ADMIN', 'MINISTRY_ADMIN'] },
  { label: 'settings', icon: Settings, href: '/settings', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN'] },
];
