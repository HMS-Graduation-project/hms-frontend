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
} from 'lucide-react';

export interface NavItem {
  label: string; // i18n key in 'navigation' namespace
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles: string[]; // ['*'] means all authenticated users
}

export const navigationItems: NavItem[] = [
  { label: 'dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['*'] },
  { label: 'patients', icon: UserRound, href: '/patients', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
  { label: 'doctors', icon: Stethoscope, href: '/doctors', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'PATIENT'] },
  { label: 'departments', icon: Building2, href: '/departments', roles: ['*'] },
  { label: 'appointments', icon: CalendarDays, href: '/appointments', roles: ['*'] },
  { label: 'medicalRecords', icon: FileText, href: '/medical-records', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'] },
  { label: 'prescriptions', icon: Pill, href: '/prescriptions', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST'] },
  { label: 'laboratory', icon: FlaskConical, href: '/laboratory', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN'] },
  { label: 'billing', icon: Receipt, href: '/billing', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'] },
  { label: 'aiTools', icon: Brain, href: '/ai/symptom-checker', roles: ['DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'] },
  { label: 'analytics', icon: BarChart3, href: '/analytics', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN'] },
  { label: 'users', icon: Users, href: '/admin/users', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN'] },
  { label: 'settings', icon: Settings, href: '/settings', roles: ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN'] },
];
