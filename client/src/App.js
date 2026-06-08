/**
 * App.js
 * Root application component with routing, auth protection, and providers.
 */
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import { PageLoader } from './components/common/Loader';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';

// Student pages
import Dashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import Resume from './pages/student/Resume';
import Interview from './pages/student/Interview';
import Jobs from './pages/student/Jobs';
import SavedJobs from './pages/student/SavedJobs';
import Learning from './pages/student/Learning';
import Reports from './pages/student/Reports';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// ── Protected Route ──
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ── Public Only Route (redirect if logged in) ──
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── App Routes ──
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Protected – Student */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <Resume />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume/cover-letter"
        element={
          <ProtectedRoute>
            <Resume defaultTab="cover-letter" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <Interview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/session/:id"
        element={
          <ProtectedRoute>
            <Interview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/saved"
        element={
          <ProtectedRoute>
            <SavedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learning"
        element={
          <ProtectedRoute>
            <Learning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Protected – Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// ── Root App ──
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A1A2E',
              color: '#E2E8F0',
              border: '1px solid rgba(108, 99, 255, 0.2)',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
