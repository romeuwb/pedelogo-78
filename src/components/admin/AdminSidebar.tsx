
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
  Settings,
  MonitorSpeaker
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminSidebar = ({ activeTab, onTabChange, sidebarOpen, setSidebarOpen }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'coupons', label: 'Cupons', icon: Gift },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'access', label: 'Acessar Dashboards', icon: MonitorSpeaker },
    { id: 'maps', label: 'Mapas', icon: Map },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'audit', label: 'Auditoria', icon: Shield },
    { id: 'support', label: 'Suporte', icon: Headphones },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    // Fechar sidebar no mobile após selecionar item
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-50 transition-transform duration-300",
      sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="p-3 lg:p-4">
        <nav className="space-y-1 lg:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 lg:gap-3 h-9 lg:h-11 text-xs lg:text-sm",
                  activeTab === item.id && "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={() => handleTabChange(item.id)}
              >
                <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
