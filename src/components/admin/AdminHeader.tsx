
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminHeader = ({ sidebarOpen, setSidebarOpen }: AdminHeaderProps) => {
  const { user, profile, signOut } = useAuth();

  const { data: pendingTickets } = useQuery({
    queryKey: ['pendingTickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('id')
        .eq('status', 'aberto');

      if (error) {
        console.error('Error fetching pending tickets:', error);
        return 0;
      }
      return data?.length || 0;
    },
    enabled: !!user
  });

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2"
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-base lg:text-lg font-semibold text-gray-900 ml-2 truncate">
            Painel Administrativo
          </h2>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notificações */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
            {pendingTickets && pendingTickets > 0 && (
              <Badge className="absolute -top-1 -right-1 min-w-[18px] h-4 lg:min-w-[20px] lg:h-5 text-xs">
                {pendingTickets}
              </Badge>
            )}
          </Button>

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 lg:space-x-2">
                <User className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:block text-sm lg:text-base max-w-[100px] lg:max-w-none truncate">
                  {profile?.nome || 'Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
