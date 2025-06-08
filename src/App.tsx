
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import ClientDashboard from '@/pages/ClientDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import DeliveryDashboard from '@/pages/DeliveryDashboard';
import RestaurantsPage from '@/pages/RestaurantsPage';
import PromotionsPage from '@/pages/PromotionsPage';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

// Component to handle protected routes
const ProtectedRoute = ({ children, allowedTypes }: { children: React.ReactNode, allowedTypes: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  if (!allowedTypes.includes(profile.tipo)) {
    // Redirect to appropriate dashboard based on user type
    switch (profile.tipo) {
      case 'cliente':
        return <Navigate to="/client-dashboard" replace />;
      case 'restaurante':
        return <Navigate to="/dashboard" replace />;
      case 'entregador':
        return <Navigate to="/delivery-dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// Component to handle admin routing
const AdminRoute = () => {
  return (
    <ProtectedRoute allowedTypes={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/restaurantes" element={<RestaurantsPage />} />
            <Route path="/promocoes" element={<PromotionsPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedTypes={['restaurante']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/client-dashboard" element={
              <ProtectedRoute allowedTypes={['cliente']}>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/delivery-dashboard" element={
              <ProtectedRoute allowedTypes={['entregador']}>
                <DeliveryDashboard />
              </ProtectedRoute>
            } />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
