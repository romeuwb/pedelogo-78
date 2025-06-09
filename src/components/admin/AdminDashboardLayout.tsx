
import React, { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminSupport } from './AdminSupport';
import { AdminProducts } from './AdminProducts';
import AdminSettings from './AdminSettings';
import { AdminDashboardAccess } from './AdminDashboardAccess';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile || profile.tipo !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  const handleAccessDashboard = (type: 'restaurant' | 'delivery' | 'client') => {
    switch (type) {
      case 'restaurant':
        navigate('/restaurante/dashboard');
        break;
      case 'delivery':
        navigate('/entregador/dashboard');
        break;
      case 'client':
        navigate('/cliente/dashboard');
        break;
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUsers />;
      case 'support':
        return <AdminSupport />;
      case 'settings':
        return <AdminSettings />;
      case 'dashboard-access':
        return <AdminDashboardAccess onAccessDashboard={handleAccessDashboard} />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Pedidos</h1>
              <p className="text-gray-600">Visualize e gerencie todos os pedidos</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );
      case 'financial':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
              <p className="text-gray-600">Gerencie transações e relatórios financeiros</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );
      case 'coupons':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Cupons</h1>
              <p className="text-gray-600">Crie e gerencie cupons de desconto</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );
      case 'banners':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Banners</h1>
              <p className="text-gray-600">Gerencie banners promocionais</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
              <p className="text-gray-600">Visualize relatórios e análises do sistema</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );
      case 'audit':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auditoria</h1>
              <p className="text-gray-600">Visualize logs de auditoria do sistema</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <AdminSidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 p-6">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
