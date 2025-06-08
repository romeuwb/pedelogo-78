
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';

import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import ClientDashboard from '@/pages/ClientDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import DeliveryDashboard from '@/pages/DeliveryDashboard';
import RestaurantsPage from '@/pages/RestaurantsPage';
import PromotionsPage from '@/pages/PromotionsPage';
import ResetPassword from '@/pages/ResetPassword';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

// Component to handle protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Aguardar o perfil carregar
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

// Component to render the correct dashboard based on user type
const DashboardRouter = () => {
  const { profile, loading } = useAuth();

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Renderizar o dashboard apropriado baseado no tipo de usuário
  switch (profile.tipo) {
    case 'cliente':
      return <ClientDashboard />;
    case 'restaurante':
      return <Dashboard />;
    case 'entregador':
      return <DeliveryDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <ClientDashboard />;
  }
};

// Layout wrapper for pages that need header
const LayoutWithHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={
              <LayoutWithHeader>
                <Index />
              </LayoutWithHeader>
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/restaurantes" element={
              <LayoutWithHeader>
                <RestaurantsPage />
              </LayoutWithHeader>
            } />
            <Route path="/promocoes" element={
              <LayoutWithHeader>
                <PromotionsPage />
              </LayoutWithHeader>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRouter />
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
