
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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-900 ml-2">
            Painel Administrativo
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notificações */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {pendingTickets && pendingTickets > 0 && (
              <Badge className="absolute -top-1 -right-1 min-w-[20px] h-5 text-xs">
                {pendingTickets}
              </Badge>
            )}
          </Button>

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="hidden md:block">
                  {profile?.nome || 'Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
