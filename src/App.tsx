
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

import Index from '@/pages/Index';
import RestaurantsPage from '@/pages/RestaurantsPage';
import PromotionsPage from '@/pages/PromotionsPage';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';

// Dashboards
import ClientApp from '@/components/client/ClientApp';
import RestaurantDashboard from '@/components/restaurant/RestaurantDashboard';
import DeliveryDashboard from '@/pages/DeliveryDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

// Protected Routes
import { ClientProtectedRoute } from '@/components/auth/ClientProtectedRoute';
import { RestaurantProtectedRoute } from '@/components/auth/RestaurantProtectedRoute';
import { DeliveryProtectedRoute } from '@/components/auth/DeliveryProtectedRoute';
import { AdminProtectedRoute } from '@/components/auth/AdminProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/restaurantes" element={<RestaurantsPage />} />
            <Route path="/promocoes" element={<PromotionsPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Cliente Dashboard */}
            <Route path="/cliente/dashboard/*" element={
              <ClientProtectedRoute>
                <ClientApp />
              </ClientProtectedRoute>
            } />

            {/* Restaurante Dashboard */}
            <Route path="/restaurante/dashboard/*" element={
              <RestaurantProtectedRoute>
                <RestaurantDashboard restaurantId="current-restaurant" />
              </RestaurantProtectedRoute>
            } />

            {/* Entregador Dashboard */}
            <Route path="/entregador/dashboard/*" element={
              <DeliveryProtectedRoute>
                <DeliveryDashboard />
              </DeliveryProtectedRoute>
            } />

            {/* Admin Dashboard */}
            <Route path="/painel-admin/dashboard/*" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
