import { createRoot } from 'react-dom/client';
import MobileRestaurantApp from './components/mobile/MobileRestaurantApp';
import './index.css';
import { StrictMode } from 'react';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/hooks/useCart";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <CartProvider>
          <MobileRestaurantApp />
          <Toaster />
        </CartProvider>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>,
);
