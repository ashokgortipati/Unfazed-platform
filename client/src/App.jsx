import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/common/Layout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { TherapistProfile } from './pages/TherapistProfile';
import { Clients } from './pages/Clients';
import { ClientDetails } from './pages/ClientDetails';
import { Appointments } from './pages/Appointments';
import { SessionNotes } from './pages/SessionNotes';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { ClientPortal } from './pages/portal/ClientPortal';

// Helper component for intelligent root redirect
const RootRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'client') return <Navigate to="/portal" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Routes inside Master Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<RootRedirect />} />

              {/* Therapist Specific Pages */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['therapist']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute allowedRoles={['therapist']}>
                    <Clients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients/:id"
                element={
                  <ProtectedRoute allowedRoles={['therapist']}>
                    <ClientDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['therapist']}>
                    <TherapistProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['therapist']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Client Portal Specific Pages */}
              <Route
                path="/portal"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <ClientPortal />
                  </ProtectedRoute>
                }
              />

              {/* Shared Role Pages (Appointments, Notes, Notifications) */}
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute allowedRoles={['therapist', 'client']}>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes"
                element={
                  <ProtectedRoute allowedRoles={['therapist', 'client']}>
                    <SessionNotes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['therapist', 'client']}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
