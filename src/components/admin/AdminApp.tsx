
import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminOverview } from './AdminOverview';
import { AdminDashboardAccess } from './AdminDashboardAccess';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminApp = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleAccessDashboard = (type: 'restaurant' | 'delivery' | 'client') => {
    // Temporarily change profile type to access other dashboards
    console.log(`Accessing ${type} dashboard as admin`);
    
    // For now, just navigate to dashboard with a query parameter
    // In a real implementation, you might want to use a more sophisticated approach
    switch (type) {
      case 'restaurant':
        // Navigate to restaurant dashboard view
        console.log('Redirecting to restaurant dashboard');
        break;
      case 'delivery':
        // Navigate to delivery dashboard view
        console.log('Redirecting to delivery dashboard');
        break;
      case 'client':
        // Navigate to client dashboard view
        console.log('Redirecting to client dashboard');
        break;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'dashboard-access':
        return <AdminDashboardAccess onAccessDashboard={handleAccessDashboard} />;
      case 'users':
        return <div className="p-6"><h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2><p>Funcionalidade em desenvolvimento</p></div>;
      case 'products':
        return <div className="p-6"><h2 className="text-2xl font-bold">Gerenciamento de Produtos</h2><p>Funcionalidade em desenvolvimento</p></div>;
      case 'orders':
        return <div className="p-6"><h2 className="text-2xl font-bold">Gerenciamento de Pedidos</h2><p>Funcionalidade em desenvolvimento</p></div>;
      case 'financial':
        return <div className="p-6"><h2 className="text-2xl font-bold">Relatórios Financeiros</h2><p>Funcionalidade em desenvolvimento</p></div>;
      case 'coupons':
        return <div className="p-6"><h2 className="text-2xl font-bold">Gerenciamento de Cupons</h2><p>Funcionalidade em desenvolvimento</p></div>;
      case 'banners':
        return <div className="p-6"><h2 className="text-2xl font-bold">Gerenciamento de Banners</h2><p>Funcionalidade em desenvolvimento</p></div>;
      case 'support':
        return <div className="p-6"><h2 className="text-2xl font-bold">Suporte ao Cliente</h2><p>Funcionalidade em desenvolvimento</p></div>;
      case 'reports':
        return <div className="p-6"><h2 className="text-2xl font-bold">Relatórios</h2><p>Funcionalidade em desenvolvimento</p></div>;
      case 'audit':
        return <div className="p-6"><h2 className="text-2xl font-bold">Logs de Auditoria</h2><p>Funcionalidade em desenvolvimento</p></div>;
      case 'settings':
        return <div className="p-6"><h2 className="text-2xl font-bold">Configurações do Sistema</h2><p>Funcionalidade em desenvolvimento</p></div>;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminApp;
