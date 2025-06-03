
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, User, Settings } from "lucide-react";

interface HeaderProps {
  onOpenUserModal: () => void;
}

const Header = ({ onOpenUserModal }: HeaderProps) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold gradient-delivery bg-clip-text text-transparent">
              🍕 PedeLogo
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-delivery-orange transition-colors font-medium">
              Início
            </a>
            <a href="#" className="text-gray-700 hover:text-delivery-orange transition-colors font-medium">
              Restaurantes
            </a>
            <a href="#" className="text-gray-700 hover:text-delivery-orange transition-colors font-medium">
              Promoções
            </a>
            <a href="#" className="text-gray-700 hover:text-delivery-orange transition-colors font-medium">
              Ajuda
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                3
              </Badge>
            </Button>
            
            <Button 
              onClick={onOpenUserModal}
              className="gradient-delivery text-white hover:opacity-90 transition-opacity shadow-delivery"
            >
              <User className="h-4 w-4 mr-2" />
              Entrar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
