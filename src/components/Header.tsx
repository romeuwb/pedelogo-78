
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/auth/LoginModal';
import UserTypeModal from '@/components/UserTypeModal';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleUserTypeSelect = (type: string) => {
    setSelectedUserType(type);
    setShowUserTypeModal(false);
    setShowLoginModal(true);
  };

  const handleProfileClick = () => {
    if (profile?.tipo === 'cliente') {
      navigate('/client-dashboard');
    } else if (profile?.tipo === 'restaurante') {
      navigate('/dashboard');
    } else if (profile?.tipo === 'entregador') {
      navigate('/delivery-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🍕</span>
              <span className="text-xl font-bold text-orange-600">PedeLogo</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-orange-600 transition-colors">
                Home
              </Link>
              <Link to="/restaurantes" className="text-gray-700 hover:text-orange-600 transition-colors">
                Restaurantes
              </Link>
              <Link to="/promocoes" className="text-gray-700 hover:text-orange-600 transition-colors">
                Promoções
              </Link>
            </nav>

            {/* Location & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">São Paulo, SP</span>
              </div>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <Badge variant="secondary" className="ml-1">0</Badge>
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleProfileClick}
                      className="flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Meu Perfil</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Entrar
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => setShowUserTypeModal(true)}
                  >
                    Cadastrar
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/restaurantes" 
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Restaurantes
                </Link>
                <Link 
                  to="/promocoes" 
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Promoções
                </Link>
                
                {user ? (
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleProfileClick();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Meu Perfil
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowLoginModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Entrar
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white justify-start"
                      onClick={() => {
                        setShowUserTypeModal(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Cadastrar
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <UserTypeModal
        isOpen={showUserTypeModal}
        onClose={() => setShowUserTypeModal(false)}
        onSelectUserType={handleUserTypeSelect}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        userType={selectedUserType}
      />
    </>
  );
};

export default Header;
