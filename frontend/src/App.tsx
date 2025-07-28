import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layout Components
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Page Components
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TendersPage } from './pages/tenders/TendersPage';
import { TenderDetailsPage } from './pages/tenders/TenderDetailsPage';
import { CreateTenderPage } from './pages/tenders/CreateTenderPage';
import { BidsPage } from './pages/bids/BidsPage';
import { BidDetailsPage } from './pages/bids/BidDetailsPage';
import { CreateBidPage } from './pages/bids/CreateBidPage';
import { OrganizationsPage } from './pages/organizations/OrganizationsPage';
import { VendorsPage } from './pages/vendors/VendorsPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { WorkflowsPage } from './pages/workflows/WorkflowsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';

const App: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LoadingSpinner size={60} />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/auth/*"
        element={
          !isAuthenticated ? (
            <AuthLayout>
              <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
              </Routes>
            </AuthLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Tender Routes */}
                <Route path="/tenders" element={<TendersPage />} />
                <Route path="/tenders/create" element={<CreateTenderPage />} />
                <Route path="/tenders/:id" element={<TenderDetailsPage />} />
                
                {/* Bid Routes */}
                <Route path="/bids" element={<BidsPage />} />
                <Route path="/bids/create/:tenderId" element={<CreateBidPage />} />
                <Route path="/bids/:id" element={<BidDetailsPage />} />
                
                {/* Organization Routes */}
                <Route path="/organizations" element={<OrganizationsPage />} />
                
                {/* Vendor Routes */}
                <Route path="/vendors" element={<VendorsPage />} />
                
                {/* Payment Routes */}
                <Route path="/payments" element={<PaymentsPage />} />
                
                {/* Workflow Routes */}
                <Route path="/workflows" element={<WorkflowsPage />} />
                
                {/* User Routes */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                
                {/* Error Routes */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect unauthenticated users to login */}
      <Route
        path="*"
        element={
          !isAuthenticated ? (
            <Navigate to="/auth/login" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
