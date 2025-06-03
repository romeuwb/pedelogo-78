
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Package, Users, Settings } from "lucide-react";

interface UserTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUserType: (userType: string) => void;
}

const userTypes = [
  {
    type: "cliente",
    title: "Cliente",
    description: "Faça pedidos dos seus restaurantes favoritos",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    type: "restaurante",
    title: "Restaurante",
    description: "Gerencie seu estabelecimento e pedidos",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    type: "entregador",
    title: "Entregador",
    description: "Entregue pedidos e ganhe dinheiro",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  {
    type: "admin",
    title: "Administrador",
    description: "Gerencie toda a plataforma",
    icon: Settings,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  }
];

const UserTypeModal = ({ isOpen, onClose, onSelectUserType }: UserTypeModalProps) => {
  const handleUserTypeSelect = (userType: string) => {
    console.log(`Selected user type: ${userType}`);
    onSelectUserType(userType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Como você quer acessar o PedeLogo?
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userTypes.map((userType) => {
            const IconComponent = userType.icon;
            return (
              <Card 
                key={userType.type}
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 ${userType.borderColor} hover:scale-105`}
                onClick={() => handleUserTypeSelect(userType.type)}
              >
                <CardContent className={`p-6 text-center ${userType.bgColor}`}>
                  <div className={`${userType.color} mb-4`}>
                    <IconComponent className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    {userType.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {userType.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserTypeModal;
