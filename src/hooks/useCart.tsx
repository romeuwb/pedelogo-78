import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  productId: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem_url?: string;
  observacoes?: string;
}

interface Cart {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (restaurantId: string, restaurantName: string, product: any, quantidade?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantidade: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Carregando carrinho para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('client_cart')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar carrinho:', error);
        throw error;
      }

      if (data) {
        console.log('Dados do carrinho encontrados:', data);
        // Get restaurant name
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurant_details')
          .select('nome_fantasia, razao_social')
          .eq('user_id', data.restaurant_id)
          .single();

        if (restaurantError) {
          console.warn('Erro ao buscar dados do restaurante:', restaurantError);
        }

        setCart({
          restaurantId: data.restaurant_id,
          restaurantName: restaurant?.nome_fantasia || restaurant?.razao_social || 'Restaurante',
          items: Array.isArray(data.itens) ? data.itens as unknown as CartItem[] : []
        });
      } else {
        console.log('Nenhum carrinho encontrado para o usuário');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: "Erro ao carregar carrinho",
        description: "Não foi possível carregar seu carrinho",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async (updatedCart: Cart) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('client_cart')
        .upsert({
          user_id: user.id,
          restaurant_id: updatedCart.restaurantId,
          itens: updatedCart.items as any,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving cart:', error);
      toast({
        title: "Erro ao salvar carrinho",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const addToCart = async (restaurantId: string, restaurantName: string, product: any, quantidade: number = 1) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar itens ao carrinho",
        variant: "destructive",
      });
      return;
    }

    // Check if adding from different restaurant
    if (cart && cart.restaurantId !== restaurantId) {
      const confirm = window.confirm(
        `Você tem itens de outro restaurante no carrinho. Deseja limpar o carrinho e adicionar itens deste restaurante?`
      );
      if (!confirm) return;
      await clearCart();
    }

    const newItem: CartItem = {
      id: product.id,
      productId: product.id,
      nome: product.nome,
      preco: product.preco,
      quantidade,
      imagem_url: product.imagem_url,
      observacoes: ''
    };

    let updatedCart: Cart;

    if (!cart || cart.restaurantId !== restaurantId) {
      updatedCart = {
        restaurantId,
        restaurantName,
        items: [newItem]
      };
    } else {
      const existingItemIndex = cart.items.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...cart.items];
        updatedItems[existingItemIndex].quantidade += quantidade;
        updatedCart = { ...cart, items: updatedItems };
      } else {
        updatedCart = { ...cart, items: [...cart.items, newItem] };
      }
    }

    setCart(updatedCart);
    await saveCart(updatedCart);

    toast({
      title: "Item adicionado",
      description: `${product.nome} foi adicionado ao carrinho`,
    });
  };

  const removeFromCart = async (productId: string) => {
    if (!cart || !user) return;

    const updatedItems = cart.items.filter(item => item.productId !== productId);
    
    if (updatedItems.length === 0) {
      await clearCart();
      return;
    }

    const updatedCart = { ...cart, items: updatedItems };
    setCart(updatedCart);
    await saveCart(updatedCart);

    toast({
      title: "Item removido",
      description: "Item removido do carrinho",
    });
  };

  const updateQuantity = async (productId: string, quantidade: number) => {
    if (!cart || !user) return;

    if (quantidade <= 0) {
      await removeFromCart(productId);
      return;
    }

    const updatedItems = cart.items.map(item =>
      item.productId === productId ? { ...item, quantidade } : item
    );

    const updatedCart = { ...cart, items: updatedItems };
    setCart(updatedCart);
    await saveCart(updatedCart);
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('client_cart')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCart(null);

      toast({
        title: "Carrinho limpo",
        description: "Todos os itens foram removidos",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Erro ao limpar carrinho",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const getCartTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const getCartItemCount = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantidade, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};