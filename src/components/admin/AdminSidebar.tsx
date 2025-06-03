
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  DollarSign, 
  Tag, 
  HelpCircle, 
  BarChart3, 
  Settings,
  Image,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navigation = [
  { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', name: 'Usuários', icon: Users },
  { id: 'orders', name: 'Pedidos', icon: Package },
  { id: 'financial', name: 'Financeiro', icon: DollarSign },
  { id: 'coupons', name: 'Cupons', icon: Tag },
  { id: 'banners', name: 'Banners', icon: Image },
  { id: 'support', name: 'Suporte', icon: HelpCircle },
  { id: 'reports', name: 'Relatórios', icon: BarChart3 },
  { id: 'audit', name: 'Auditoria', icon: FileText },
  { id: 'settings', name: 'Configurações', icon: Settings },
];

export const AdminSidebar = ({ 
  activeSection, 
  setActiveSection, 
  sidebarOpen, 
  setSidebarOpen 
}: AdminSidebarProps) => {
  return (
    <div className={cn(
      "bg-white shadow-lg transition-all duration-300 relative",
      sidebarOpen ? "w-64" : "w-16"
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        {sidebarOpen && (
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="mt-8">
        <div className="px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSection === item.id
                    ? "bg-blue-100 text-blue-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "flex-shrink-0 h-5 w-5",
                  sidebarOpen ? "mr-3" : "mx-auto"
                )} />
                {sidebarOpen && item.name}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
