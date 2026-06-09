import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PatientLayout } from '@/components/layout/patient-layout';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PageLoading } from '@/components/page-loading';
// Every routed page is lazy-loaded so each ships as its own chunk. This keeps
// the initial bundle tiny: a marketing visitor at "/" downloads only the shell
// plus the landing chunk, and never the authenticated dashboard code (and
// vice-versa). The <Suspense> boundary below covers the load.
const LandingPage = lazy(() => import('@/pages/marketing/landing'));
const LoginPage = lazy(() => import('@/pages/login'));
const RegisterPage = lazy(() => import('@/pages/register'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const PortalHomePage = lazy(() => import('@/pages/portal/home'));
const PortalAppointmentsPage = lazy(() => import('@/pages/portal/appointments'));
const PortalBookAppointmentPage = lazy(() => import('@/pages/portal/book-appointment'));
const PortalRecordsPage = lazy(() => import('@/pages/portal/records'));
const PortalPrescriptionsPage = lazy(() => import('@/pages/portal/prescriptions'));
const PortalLabResultsPage = lazy(() => import('@/pages/portal/lab-results'));
const PortalInvoicesPage = lazy(() => import('@/pages/portal/invoices'));
const PortalReferralsPage = lazy(() => import('@/pages/portal/referrals'));
const PortalProfilePage = lazy(() => import('@/pages/portal/profile'));
const ProfilePage = lazy(() => import('@/pages/profile'));
const UsersPage = lazy(() => import('@/pages/admin/users'));
const NationalRegistryPage = lazy(() => import('@/pages/admin/national-registry'));
const CitiesPage = lazy(() => import('@/pages/admin/cities'));
const DepartmentsPage = lazy(() => import('@/pages/departments'));
const DepartmentDetailPage = lazy(() => import('@/pages/departments/department-detail'));
const DoctorsPage = lazy(() => import('@/pages/doctors'));
const DoctorDetailPage = lazy(() => import('@/pages/doctors/doctor-detail'));
const PatientsPage = lazy(() => import('@/pages/patients'));
const PatientDetailPage = lazy(() => import('@/pages/patients/patient-detail'));
const AppointmentsPage = lazy(() => import('@/pages/appointments'));
const BookAppointmentPage = lazy(() => import('@/pages/appointments/book-appointment'));
const AppointmentDetailPage = lazy(() => import('@/pages/appointments/appointment-detail'));
const EmergencyQueuePage = lazy(() => import('@/pages/emergency/queue'));
const EmergencyIntakePage = lazy(() => import('@/pages/emergency/intake'));
const EmergencyVisitDetailPage = lazy(() => import('@/pages/emergency/visit-detail'));
const WardsPage = lazy(() => import('@/pages/inpatient/wards'));
const BedBoardPage = lazy(() => import('@/pages/inpatient/bed-board'));
const AdmissionsPage = lazy(() => import('@/pages/inpatient/admissions'));
const AdmissionDetailPage = lazy(() => import('@/pages/inpatient/admission-detail'));
const ReferralsListPage = lazy(() => import('@/pages/referrals/list'));
const NewReferralPage = lazy(() => import('@/pages/referrals/new'));
const ReferralDetailPage = lazy(() => import('@/pages/referrals/detail'));
const MedicalRecordsPage = lazy(() => import('@/pages/medical-records'));
const RecordFormPage = lazy(() => import('@/pages/medical-records/record-form'));
const RecordDetailPage = lazy(() => import('@/pages/medical-records/record-detail'));
const PrescriptionsPage = lazy(() => import('@/pages/prescriptions'));
const PrescriptionDetailPage = lazy(() => import('@/pages/prescriptions/prescription-detail'));
const LaboratoryPage = lazy(() => import('@/pages/laboratory'));
const LabOrderDetailPage = lazy(() => import('@/pages/laboratory/lab-order-detail'));
const MedicationsPage = lazy(() => import('@/pages/pharmacy/medications'));
const DispensingPage = lazy(() => import('@/pages/pharmacy/dispensing'));
const BillingPage = lazy(() => import('@/pages/billing'));
const CreateInvoicePage = lazy(() => import('@/pages/billing/create-invoice'));
const InvoiceDetailPage = lazy(() => import('@/pages/billing/invoice-detail'));
const SettingsPage = lazy(() => import('@/pages/settings'));
const NotificationsPage = lazy(() => import('@/pages/notifications'));
const SymptomCheckerPage = lazy(() => import('@/pages/ai/symptom-checker'));
const DrugInteractionsPage = lazy(() => import('@/pages/ai/drug-interactions'));
const PneumoniaPage = lazy(() => import('@/pages/ai/pneumonia'));
const AiAnalysesPage = lazy(() => import('@/pages/ai/ai-analyses'));
const AiAnalysisDetailPage = lazy(() => import('@/pages/ai/ai-analysis-detail'));
const AiAnalyticsPage = lazy(() => import('@/pages/ai/ai-analytics'));
const AnalyticsPage = lazy(() => import('@/pages/analytics'));
const RegionalDashboardPage = lazy(() => import('@/pages/regional/dashboard'));
const MinistryDashboardPage = lazy(() => import('@/pages/ministry/dashboard'));

/**
 * Catch-all redirect that respects role: unauthenticated visitors land on the
 * public marketing site ("/"), PATIENT → /portal/home, everyone else → /dashboard.
 */
function RoleAwareRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (user?.role === 'PATIENT') {
    return <Navigate to="/portal/home" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
    <QueryProvider>
      <AuthProvider>
        <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoading variant="spinner" className="min-h-screen" />}>
          <Routes>
            {/* Public marketing landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient portal */}
            <Route
              element={
                <ProtectedRoute>
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/portal" element={<Navigate to="/portal/home" replace />} />
              <Route path="/portal/home" element={<PortalHomePage />} />
              <Route path="/portal/appointments" element={<PortalAppointmentsPage />} />
              <Route path="/portal/appointments/book" element={<PortalBookAppointmentPage />} />
              <Route path="/portal/records" element={<PortalRecordsPage />} />
              <Route path="/portal/prescriptions" element={<PortalPrescriptionsPage />} />
              <Route path="/portal/lab-results" element={<PortalLabResultsPage />} />
              <Route path="/portal/invoices" element={<PortalInvoicesPage />} />
              <Route path="/portal/referrals" element={<PortalReferralsPage />} />
              <Route path="/portal/profile" element={<PortalProfilePage />} />
            </Route>

            {/* Protected routes with dashboard layout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/national-registry" element={<NationalRegistryPage />} />
              <Route path="/admin/cities" element={<CitiesPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/departments/:id" element={<DepartmentDetailPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/doctors/:id" element={<DoctorDetailPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/appointments/book" element={<BookAppointmentPage />} />
              <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
              <Route path="/emergency" element={<EmergencyQueuePage />} />
              <Route path="/emergency/intake" element={<EmergencyIntakePage />} />
              <Route path="/emergency/:id" element={<EmergencyVisitDetailPage />} />
              <Route path="/inpatient" element={<AdmissionsPage />} />
              <Route path="/inpatient/wards" element={<WardsPage />} />
              <Route path="/inpatient/bed-board" element={<BedBoardPage />} />
              <Route path="/inpatient/admissions" element={<AdmissionsPage />} />
              <Route path="/inpatient/admissions/:id" element={<AdmissionDetailPage />} />
              <Route path="/referrals" element={<Navigate to="/referrals/incoming" replace />} />
              <Route path="/referrals/incoming" element={<ReferralsListPage direction="incoming" />} />
              <Route path="/referrals/outgoing" element={<ReferralsListPage direction="outgoing" />} />
              <Route path="/referrals/new" element={<NewReferralPage />} />
              <Route path="/referrals/:id" element={<ReferralDetailPage />} />
              <Route path="/medical-records" element={<MedicalRecordsPage />} />
              <Route path="/medical-records/new" element={<RecordFormPage />} />
              <Route path="/medical-records/:id" element={<RecordDetailPage />} />
              <Route path="/medical-records/:id/edit" element={<RecordFormPage />} />
              <Route path="/prescriptions" element={<PrescriptionsPage />} />
              <Route path="/prescriptions/:id" element={<PrescriptionDetailPage />} />
              <Route path="/laboratory" element={<LaboratoryPage />} />
              <Route path="/laboratory/:id" element={<LabOrderDetailPage />} />
              <Route path="/pharmacy" element={<MedicationsPage />} />
              <Route path="/pharmacy/dispensing" element={<DispensingPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/billing/new" element={<CreateInvoicePage />} />
              <Route path="/billing/:id" element={<InvoiceDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/ai/symptom-checker" element={<SymptomCheckerPage />} />
              <Route path="/ai/drug-interactions" element={<DrugInteractionsPage />} />
              <Route path="/ai/pneumonia" element={<PneumoniaPage />} />
              <Route path="/ai/analyses" element={<AiAnalysesPage />} />
              <Route path="/ai/analyses/:id" element={<AiAnalysisDetailPage />} />
              <Route path="/ai/analytics" element={<AiAnalyticsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/regional" element={<RegionalDashboardPage />} />
              <Route path="/ministry" element={<MinistryDashboardPage />} />
            </Route>

            {/* Catch-all redirect — patients go to the portal */}
            <Route path="*" element={<RoleAwareRedirect />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryProvider>
    </ErrorBoundary>
  );
}
