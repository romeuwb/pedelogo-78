
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Package } from "lucide-react";

interface Restaurant {
  id: number;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  category: string;
  cuisine: string;
  isPromoted?: boolean;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-delivery transition-all duration-300 border-2 hover:border-orange-200 transform hover:-translate-y-1">
      <div className="relative">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {restaurant.isPromoted && (
          <Badge className="absolute top-3 left-3 bg-delivery-orange text-white">
            Destaque
          </Badge>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-sm font-semibold text-gray-800">⭐ {restaurant.rating}</span>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-delivery-orange transition-colors">
            {restaurant.name}
          </h3>
          <p className="text-gray-600 text-sm">{restaurant.cuisine}</p>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{restaurant.deliveryTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Package className="h-4 w-4" />
            <span>R$ {restaurant.deliveryFee.toFixed(2)}</span>
          </div>
        </div>
        
        <Button className="w-full gradient-delivery text-white hover:opacity-90 transition-opacity">
          Ver Cardápio
        </Button>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
