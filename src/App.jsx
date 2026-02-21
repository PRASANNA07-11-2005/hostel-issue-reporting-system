import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEscalation } from './hooks/useEscalation';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Verify from './pages/VerifyEmail';
import DashboardLayout from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintsList from './pages/ComplaintsList';
import EscalationsList from './pages/EscalationsList';

function App() {
  const { user } = useAuth();

  // Custom hook that runs the auto-escalation check
  useEscalation();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/verify" element={<Verify />} />

        <Route element={<DashboardLayout />}>
          {/* Default Route based on Role */}
          <Route
            path="/"
            element={
              user ? (
                user.role === 'Student' ? <StudentDashboard /> :
                  user.role === 'Warden' ? <WardenDashboard /> :
                    <AdminDashboard />
              ) : <Navigate to="/login" replace />
            }
          />

          {/* Student & Warden specific routes */}
          <Route
            path="/complaints"
            element={
              <ProtectedRoute allowedRoles={['Student', 'Warden']}>
                <ComplaintsList />
              </ProtectedRoute>
            }
          />

          {/* Admin specific route */}
          <Route
            path="/escalations"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Warden']}>
                <EscalationsList />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
