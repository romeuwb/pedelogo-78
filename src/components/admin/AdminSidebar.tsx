
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Gift, 
  Image, 
  Map, 
  FileText, 
  Shield, 
  Headphones, 
  Settings 
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'coupons', label: 'Cupons', icon: Gift },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'maps', label: 'Mapas', icon: Map },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'audit', label: 'Auditoria', icon: Shield },
    { id: 'support', label: 'Suporte', icon: Headphones },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
  };

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  activeTab === item.id && "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={() => handleTabChange(item.id)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
