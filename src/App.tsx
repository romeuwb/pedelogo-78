
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import RestaurantsPage from '@/pages/RestaurantsPage';
import PromotionsPage from '@/pages/PromotionsPage';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';

// Dashboards
import ClientDashboard from '@/pages/ClientDashboard';
import RestaurantDashboardPage from '@/pages/RestaurantDashboard';
import DeliveryDashboard from '@/pages/DeliveryDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import TableManagementPage from '@/pages/TableManagementPage';
import POSSystemPage from '@/pages/POSSystemPage';

// Protected Routes
import { ClientProtectedRoute } from '@/components/auth/ClientProtectedRoute';
import { RestaurantProtectedRoute } from '@/components/auth/RestaurantProtectedRoute';
import { DeliveryProtectedRoute } from '@/components/auth/DeliveryProtectedRoute';
import { AdminProtectedRoute } from '@/components/auth/AdminProtectedRoute';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/restaurantes" element={<RestaurantsPage />} />
            <Route path="/promocoes" element={<PromotionsPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Cliente Dashboard */}
            <Route path="/cliente/dashboard/*" element={
              <ClientProtectedRoute>
                <ClientDashboard />
              </ClientProtectedRoute>
            } />

            {/* Restaurante Dashboard */}
            <Route path="/restaurante/dashboard/*" element={
              <RestaurantProtectedRoute>
                <RestaurantDashboardPage />
              </RestaurantProtectedRoute>
            } />

            {/* Módulos Restaurante - Acesso Separado */}
            <Route path="/restaurante/mesas" element={<TableManagementPage />} />
            <Route path="/restaurante/pdv" element={<POSSystemPage />} />

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
  );
}

export default App;
