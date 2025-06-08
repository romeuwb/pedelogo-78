import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminFinancial } from '@/components/admin/AdminFinancial';
import { AdminCoupons } from '@/components/admin/AdminCoupons';
import { AdminBanners } from '@/components/admin/AdminBanners';
import { AdminSupport } from '@/components/admin/AdminSupport';
import { AdminReports } from '@/components/admin/AdminReports';
import { AdminAuditLogs } from '@/components/admin/AdminAuditLogs';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminDashboardAccess } from '@/components/admin/AdminDashboardAccess';
import RestaurantDashboard from '@/components/restaurant/RestaurantDashboard';
import DeliveryPanelComplete from '@/components/delivery/DeliveryPanelComplete';
import ClientApp from '@/components/client/ClientApp';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentDashboard, setCurrentDashboard] = useState<'admin' | 'restaurant' | 'delivery' | 'client'>('admin');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 mb-4">
            Você precisa estar logado como administrador para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  const handleAccessDashboard = (type: 'restaurant' | 'delivery' | 'client') => {
    setCurrentDashboard(type);
  };

  const handleBackToAdmin = () => {
    setCurrentDashboard('admin');
  };

  // Renderizar dashboards específicos quando acessados pelo admin
  if (currentDashboard === 'restaurant') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 bg-white border-b">
          <Button onClick={handleBackToAdmin} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Admin
          </Button>
        </div>
        <RestaurantDashboard restaurantId="admin-access" />
      </div>
    );
  }

  if (currentDashboard === 'delivery') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 bg-white border-b">
          <Button onClick={handleBackToAdmin} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Admin
          </Button>
        </div>
        <DeliveryPanelComplete />
      </div>
    );
  }

  if (currentDashboard === 'client') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 bg-white border-b">
          <Button onClick={handleBackToAdmin} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Admin
          </Button>
        </div>
        <ClientApp />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'dashboard-access':
        return <AdminDashboardAccess onAccessDashboard={handleAccessDashboard} />;
      case 'users':
        return <AdminUsers />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'financial':
        return <AdminFinancial />;
      case 'coupons':
        return <AdminCoupons />;
      case 'banners':
        return <AdminBanners />;
      case 'support':
        return <AdminSupport />;
      case 'reports':
        return <AdminReports />;
      case 'audit':
        return <AdminAuditLogs />;
      case 'settings':
        return <AdminSettings />;
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

export default AdminDashboard;
