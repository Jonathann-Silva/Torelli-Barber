import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ClientDashboard from './pages/client/Dashboard';
import ClientBooking from './pages/client/Booking';
import ClientProfile from './pages/client/Profile';
import ClientGallery from './pages/client/Gallery';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAppointmentDetails from './pages/admin/AppointmentDetails';
import { UserRole } from './types';

const RequireAuth = ({ children, role }: { children: React.ReactElement, role?: UserRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check email verification
  if (!user.emailVerified) {
    // If user is logged in but not verified, redirect to login (which handles the verification UI)
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === UserRole.ADMIN ? "/admin/dashboard" : "/client/dashboard"} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Client Routes */}
      <Route path="/client/dashboard" element={
        <RequireAuth role={UserRole.CLIENT}>
          <ClientDashboard />
        </RequireAuth>
      } />
      <Route path="/client/booking" element={
        <RequireAuth role={UserRole.CLIENT}>
          <ClientBooking />
        </RequireAuth>
      } />
      <Route path="/client/profile" element={
        <RequireAuth role={UserRole.CLIENT}>
          <ClientProfile />
        </RequireAuth>
      } />
      <Route path="/client/gallery" element={
        <RequireAuth role={UserRole.CLIENT}>
          <ClientGallery />
        </RequireAuth>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <RequireAuth role={UserRole.ADMIN}>
          <AdminDashboard />
        </RequireAuth>
      } />
      <Route path="/admin/appointment/:id" element={
        <RequireAuth role={UserRole.ADMIN}>
          <AdminAppointmentDetails />
        </RequireAuth>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;