import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import ManagerNotificationsPage from './pages/ManagerNotificationsPage';
import AlertSettingsPage from './pages/AlertSettingsPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import DeterrentReport from './pages/DeterrentReport';
import FeaturesPage from './pages/FeaturesPage';
import ManagersPage from './pages/ManagersPage';
import ReportsPage from './pages/ReportsPage';
import TestPage from './pages/TestPage';
import CameraDetectionPage from './pages/CameraDetectionPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/manager" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              } 
            />
            <Route
              path="/admin/managers"
              element={
                <AdminRoute>
                  <ManagersPage />
                </AdminRoute>
              }
            />
            <Route 
              path="/admin/reports" 
              element={
                <AdminRoute>
                  <ReportsPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/notifications" 
              element={
                <AdminRoute>
                  <AdminNotificationsPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/camera" 
              element={
                <AdminRoute>
                  <CameraDetectionPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/dashboard/reports" 
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/notifications" 
              element={
                <ProtectedRoute>
                  <ManagerNotificationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/alert-settings" 
              element={
                <ProtectedRoute>
                  <AlertSettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/alert-settings" 
              element={
                <AdminRoute>
                  <AlertSettingsPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/dashboard/camera" 
              element={
                <ProtectedRoute>
                  <CameraDetectionPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/detection-report"
              element={
                <ProtectedRoute>
                  <DeterrentReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/detection-report"
              element={
                <AdminRoute>
                  <DeterrentReport />
                </AdminRoute>
              }
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;