import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ExamProvider } from './context/ExamContext';
import { useEffect } from 'react';

// Pages
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import ExamPage from './pages/ExamPage';
import ThankYouPage from './pages/ThankYouPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Maintenance from './pages/Maintenance';
import { getExamStatus } from './api/examApi';

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Maintenance Guard Component
const MaintenanceGuard = ({ children }) => {
  const [isPaused, setIsPaused] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    // Only check for student-facing routes
    if (location.pathname.startsWith('/admin') || 
        location.pathname.startsWith('/super-admin') || 
        location.pathname === '/maintenance') {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const { status } = await getExamStatus();
        setIsPaused(status === 'paused');
      } catch (e) {
        console.error("Status check failed", e);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [location.pathname]);

  if (loading) return null;
  const isExcluded = location.pathname.startsWith('/admin') || 
                    location.pathname.startsWith('/super-admin') || 
                    location.pathname === '/maintenance';

  if (isPaused && !isExcluded) {
    return <Navigate to="/maintenance" replace />;
  }
  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = sessionStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin/login" replace />;

  if (requiredRole) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== requiredRole) {
        // If they are a super admin trying to access admin dashboard, it might be fine, 
        // but if they are an admin trying to access super admin, it should block.
        if (requiredRole === 'SUPER_ADMIN' && payload.role !== 'SUPER_ADMIN') {
           return <Navigate to="/admin/dashboard" replace />;
        }
      }
    } catch (e) {
      return <Navigate to="/admin/login" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ExamProvider>
        <Routes>
          {/* Maintenance Protected Student Routes */}
          <Route path="/" element={<MaintenanceGuard><LandingPage /></MaintenanceGuard>} />
          <Route path="/register" element={<MaintenanceGuard><RegistrationPage /></MaintenanceGuard>} />
          <Route path="/exam" element={<MaintenanceGuard><ExamPage /></MaintenanceGuard>} />
          <Route path="/thank-you" element={<MaintenanceGuard><ThankYouPage /></MaintenanceGuard>} />
          
          <Route path="/maintenance" element={<Maintenance />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute requiredRole="SUPER_ADMIN">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ExamProvider>
    </Router>
  );
}

export default App;
