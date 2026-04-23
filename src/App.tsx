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
import DepartmentsPage from '@/pages/departments';
import DepartmentDetailPage from '@/pages/departments/department-detail';
import DoctorsPage from '@/pages/doctors';
import DoctorDetailPage from '@/pages/doctors/doctor-detail';
import PatientsPage from '@/pages/patients';
import PatientDetailPage from '@/pages/patients/patient-detail';
import AppointmentsPage from '@/pages/appointments';
import BookAppointmentPage from '@/pages/appointments/book-appointment';
import AppointmentDetailPage from '@/pages/appointments/appointment-detail';
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
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/departments/:id" element={<DepartmentDetailPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/doctors/:id" element={<DoctorDetailPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/appointments/book" element={<BookAppointmentPage />} />
              <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
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
