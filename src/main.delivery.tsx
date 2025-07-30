import { createRoot } from 'react-dom/client';
import MobileDeliveryApp from './components/mobile/MobileDeliveryApp';
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
          <MobileDeliveryApp />
          <Toaster />
        </CartProvider>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>,
);
