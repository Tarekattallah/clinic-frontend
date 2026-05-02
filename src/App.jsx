import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider }         from './context/ToastContext';
import Navbar                    from './components/Navbar';
import ProtectedRoute            from './components/ProtectedRoute';

import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import HomePage            from './pages/HomePage';
import DoctorsPage         from './pages/DoctorsPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import AppointmentsPage    from './pages/AppointmentsPage';
import DoctorProfilePage   from './pages/DoctorProfilePage';
import MedicalHistoryPage  from './pages/MedicalHistoryPage';
import NotFoundPage        from './pages/NotFoundPage';

import AdminLayout        from './admin/layouts/AdminLayout';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import AdminUsersPage     from './admin/pages/AdminUsersPage';
import {
  AdminAppointmentsPage,
  AdminDoctorsPage,
  AdminSpecialtiesPage,
  AdminReportsPage,
  AdminAnalyticsPage,
  AdminSettingsPage,
} from './admin/pages/AdminSubPages';

function SiteRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login"    element={!user || user.isGuest ? <LoginPage />    : user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" />} />
        <Route path="/register" element={!user || user.isGuest ? <RegisterPage /> : user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" />} />

        {/* Admin — redirect to dashboard if they land on the site */}
        {user?.role === 'admin' && <Route path="*" element={<Navigate to="/admin" replace />} />}
        <Route path="/"        element={<ProtectedRoute allowGuest><HomePage /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute allowGuest><DoctorsPage /></ProtectedRoute>} />
        <Route path="/appointments"    element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
        <Route path="/medical-history" element={<ProtectedRoute roles={['patient']}><MedicalHistoryPage /></ProtectedRoute>} />
        <Route path="/book"            element={<ProtectedRoute roles={['patient']}><BookAppointmentPage /></ProtectedRoute>} />
        <Route path="/doctor-profile"  element={<ProtectedRoute roles={['doctor']}><DoctorProfilePage /></ProtectedRoute>} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*"    element={<Navigate to="/404" />} />
      </Routes>
    </>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index               element={<AdminDashboardPage />} />
        <Route path="users"        element={<AdminUsersPage />} />
        <Route path="doctors"      element={<AdminDoctorsPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="specialties"  element={<AdminSpecialtiesPage />} />
        <Route path="reports"      element={<AdminReportsPage />} />
        <Route path="analytics"    element={<AdminAnalyticsPage />} />
        <Route path="settings"     element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return null;
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*"       element={<SiteRoutes />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
