
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import AdminFinancial from './AdminFinancial';
import AdminProducts from './AdminProducts';
import AdminCoupons from './AdminCoupons';
import AdminBanners from './AdminBanners';
import AdminSupport from './AdminSupport';
import AdminSettings from './AdminSettings';
import AdminMaps from './AdminMaps';
import AdminReports from './AdminReports';
import AdminAuditLogs from './AdminAuditLogs';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminDashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 ml-64 p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="orders">Pedidos</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="coupons">Cupons</TabsTrigger>
              <TabsTrigger value="banners">Banners</TabsTrigger>
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
