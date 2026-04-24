import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import DashboardPage from '@/pages/dashboard';
import ProfilePage from '@/pages/profile';
import UsersPage from '@/pages/admin/users';
import NationalRegistryPage from '@/pages/admin/national-registry';
import DepartmentsPage from '@/pages/departments';
import DepartmentDetailPage from '@/pages/departments/department-detail';
import DoctorsPage from '@/pages/doctors';
import DoctorDetailPage from '@/pages/doctors/doctor-detail';
import PatientsPage from '@/pages/patients';
import PatientDetailPage from '@/pages/patients/patient-detail';
import AppointmentsPage from '@/pages/appointments';
import BookAppointmentPage from '@/pages/appointments/book-appointment';
import AppointmentDetailPage from '@/pages/appointments/appointment-detail';
import EmergencyQueuePage from '@/pages/emergency/queue';
import EmergencyIntakePage from '@/pages/emergency/intake';
import EmergencyVisitDetailPage from '@/pages/emergency/visit-detail';
import WardsPage from '@/pages/inpatient/wards';
import BedBoardPage from '@/pages/inpatient/bed-board';
import AdmissionsPage from '@/pages/inpatient/admissions';
import AdmissionDetailPage from '@/pages/inpatient/admission-detail';
import ReferralsListPage from '@/pages/referrals/list';
import NewReferralPage from '@/pages/referrals/new';
import ReferralDetailPage from '@/pages/referrals/detail';
import MedicalRecordsPage from '@/pages/medical-records';
import RecordFormPage from '@/pages/medical-records/record-form';
import RecordDetailPage from '@/pages/medical-records/record-detail';
import PrescriptionsPage from '@/pages/prescriptions';
import PrescriptionDetailPage from '@/pages/prescriptions/prescription-detail';
import LaboratoryPage from '@/pages/laboratory';
import LabOrderDetailPage from '@/pages/laboratory/lab-order-detail';
import MedicationsPage from '@/pages/pharmacy/medications';
import DispensingPage from '@/pages/pharmacy/dispensing';
import BillingPage from '@/pages/billing';
import CreateInvoicePage from '@/pages/billing/create-invoice';
import InvoiceDetailPage from '@/pages/billing/invoice-detail';
import SettingsPage from '@/pages/settings';
import NotificationsPage from '@/pages/notifications';
import SymptomCheckerPage from '@/pages/ai/symptom-checker';
import DrugInteractionsPage from '@/pages/ai/drug-interactions';
import AnalyticsPage from '@/pages/analytics';
import RegionalDashboardPage from '@/pages/regional/dashboard';
import MinistryDashboardPage from '@/pages/ministry/dashboard';

export default function App() {
  return (
    <ErrorBoundary>
    <QueryProvider>
      <AuthProvider>
        <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

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
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/regional" element={<RegionalDashboardPage />} />
              <Route path="/ministry" element={<MinistryDashboardPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryProvider>
    </ErrorBoundary>
  );
}
