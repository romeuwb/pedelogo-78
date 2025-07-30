
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminOrders } from './AdminOrders';
import { AdminFinancial } from './AdminFinancial';
import { AdminProducts } from './AdminProducts';
import { AdminCoupons } from './AdminCoupons';
import { AdminDirectAccess } from './AdminDirectAccess';
import AdminBanners from './AdminBanners';
import { AdminSupport } from './AdminSupport';
import AdminSettings from './AdminSettings';
import AdminMaps from './AdminMaps';
import AdminReports from './AdminReports';
import AdminAuditLogs from './AdminAuditLogs';
import { AdminHeader } from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        {/* Overlay para fechar sidebar em mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className={`flex-1 transition-all duration-300 p-4 lg:p-6 ${
          sidebarOpen ? 'lg:ml-64' : ''
        }`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="orders">Pedidos</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="coupons">Cupons</TabsTrigger>
              <TabsTrigger value="banners">Banners</TabsTrigger>
              <TabsTrigger value="access">Acessar Dashboards</TabsTrigger>
              <TabsTrigger value="maps">Mapas</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
              <TabsTrigger value="audit">Auditoria</TabsTrigger>
              <TabsTrigger value="support">Suporte</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <AdminOverview />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>

            <TabsContent value="orders">
              <AdminOrders />
            </TabsContent>

            <TabsContent value="financial">
              <AdminFinancial />
            </TabsContent>

            <TabsContent value="products">
              <AdminProducts />
            </TabsContent>

            <TabsContent value="coupons">
              <AdminCoupons />
            </TabsContent>

            <TabsContent value="banners">
              <AdminBanners />
            </TabsContent>

            <TabsContent value="access">
              <AdminDirectAccess onAccessDashboard={handleAccessDashboard} />
            </TabsContent>

            <TabsContent value="maps">
              <AdminMaps />
            </TabsContent>

            <TabsContent value="reports">
              <AdminReports />
            </TabsContent>

            <TabsContent value="audit">
              <AdminAuditLogs />
            </TabsContent>

            <TabsContent value="support">
              <AdminSupport />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
