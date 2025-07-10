import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Separator } from '@/components/ui/separator';

interface CartSidebarProps {
  onCheckout?: () => void;
}

export const CartSidebar = ({ onCheckout }: CartSidebarProps) => {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartItemCount } = useCart();

  const itemCount = getCartItemCount();
  const total = getCartTotal();

  if (itemCount === 0) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <ShoppingCart className="h-4 w-4" />
            <Badge variant="secondary" className="ml-1">0</Badge>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Seu Carrinho</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Carrinho vazio
            </h3>
            <p className="text-gray-500 text-sm">
              Adicione itens ao seu carrinho para continuar
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          <Badge variant="secondary" className="ml-1">{itemCount}</Badge>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Seu Carrinho</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {cart && (
            <>
              <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-800">{cart.restaurantName}</h3>
                <p className="text-sm text-orange-600">
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'itens'}
                </p>
              </div>

              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex items-start space-x-3">
                    {item.imagem_url && (
                      <img
                        src={item.imagem_url}
                        alt={item.nome}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{item.nome}</h4>
                      <p className="text-green-600 font-semibold text-sm">
                        R$ {item.preco.toFixed(2)}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantidade - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-semibold text-sm px-2">{item.quantidade}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantidade + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="mt-1 text-sm text-gray-600">
                        Subtotal: R$ {(item.preco * item.quantidade).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxa de entrega</span>
              <span>R$ 5,00</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>R$ {(total + 5).toFixed(2)}</span>
            </div>
          </div>

          <Button 
            onClick={onCheckout}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Finalizar Pedido
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};