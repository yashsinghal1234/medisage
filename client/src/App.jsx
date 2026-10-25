import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { Home } from './pages/Home';
import { Login, Register } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { AIInsights } from './pages/AIInsights';
import { Insurance } from './pages/Insurance';
import { Timeline } from './pages/Timeline';
import { Profile } from './pages/Profile';
import { MyScans } from './pages/MyScans';
import { AdminConsole } from './pages/AdminConsole';
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Health Vault Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scans"
            element={
              <ProtectedRoute>
                <MyScans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminConsole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-insights"
            element={
              <ProtectedRoute>
                <AIInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurance"
            element={
              <ProtectedRoute>
                <Insurance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline"
            element={
              <ProtectedRoute>
                <Timeline />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
