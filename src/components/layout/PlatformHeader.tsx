
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import LoginModal from '@/components/auth/LoginModal';

export const PlatformHeader = () => {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Platform Name */}
            <div className="flex items-center space-x-4">
              <a href="/" className="bg-orange-500 text-white px-3 py-2 rounded-md font-bold text-lg">
                🍕 DeliveryApp
              </a>
              {profile && (
                <Badge variant="secondary" className="hidden md:block">
                  {profile.tipo === 'restaurante' && 'Restaurante'}
                  {profile.tipo === 'entregador' && 'Entregador'}
                  {profile.tipo === 'cliente' && 'Cliente'}
                  {profile.tipo === 'admin' && 'Administrador'}
                </Badge>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Início
              </a>
              {user && (
                <a href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </a>
              )}
              {profile?.tipo === 'cliente' && (
                <>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Restaurantes
                  </a>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Promoções
                  </a>
                </>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 min-w-[20px] h-5 text-xs bg-red-500">
                      3
                    </Badge>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span className="hidden md:block">
                          {profile?.nome || 'Usuário'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white">
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        Meu Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell className="h-4 w-4 mr-2" />
                        Notificações
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <X className="h-4 w-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button 
                  onClick={handleLoginClick}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Entrar
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Início
                </a>
                {user && (
                  <a href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Dashboard
                  </a>
                )}
                {profile?.tipo === 'cliente' && (
                  <>
                    <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Restaurantes
                    </a>
                    <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Promoções
                    </a>
                  </>
                )}
                {!user && (
                  <Button 
                    onClick={handleLoginClick}
                    className="bg-orange-500 hover:bg-orange-600 w-full"
                  >
                    Entrar
                  </Button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};
