import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Detecta o módulo pelo env
  const module = process.env.PEDELOGO_MODULE;
  let input = 'src/main.tsx';
  if (module === 'client') input = 'src/main.client.tsx';
  if (module === 'restaurant') input = 'src/main.restaurant.tsx';
  if (module === 'delivery') input = 'src/main.delivery.tsx';

  return {
    base: '/',
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        input,
      },
    },
  };
});
