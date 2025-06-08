
import React, { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminSupport } from './AdminSupport';
import { useAuth } from '@/hooks/useAuth';

const AdminDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const { user, profile, loading } = useAuth();

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

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUsers />;
      case 'support':
        return <AdminSupport />;
      case 'dashboard-access':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Acessar Dashboards</h1>
              <p className="text-gray-600">Acesse os diferentes dashboards do sistema</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold mb-2">Dashboard Cliente</h3>
                <p className="text-gray-600 mb-4">Visualizar experiência do cliente</p>
                <a 
                  href="/cliente/dashboard" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Acessar
                </a>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold mb-2">Dashboard Restaurante</h3>
                <p className="text-gray-600 mb-4">Visualizar painel do restaurante</p>
                <a 
                  href="/restaurante/dashboard" 
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Acessar
                </a>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold mb-2">Dashboard Entregador</h3>
                <p className="text-gray-600 mb-4">Visualizar painel do entregador</p>
                <a 
                  href="/entregador/dashboard" 
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Acessar
                </a>
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Produtos</h1>
              <p className="text-gray-600">Gerencie produtos do sistema</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );
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
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
              <p className="text-gray-600">Configure parâmetros do sistema</p>
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
