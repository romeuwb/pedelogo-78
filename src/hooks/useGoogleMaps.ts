
import { useState, useEffect } from 'react';

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
}

export const useGoogleMaps = (apiKey?: string): UseGoogleMapsReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setIsLoaded(false);
      setLoadError(null);
      return;
    }

    // Se o Google Maps já está carregado
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setIsLoaded(true);
      setLoadError(null);
      return;
    }

    // Se já existe um script carregando
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const handleLoad = () => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          setLoadError(null);
        } else {
          setLoadError(new Error('Google Maps não carregou corretamente'));
        }
      };

      const handleError = (error: any) => {
        console.error('Erro ao carregar Google Maps:', error);
        setLoadError(new Error('Falha ao carregar Google Maps'));
      };

      if (existingScript.getAttribute('data-loaded') === 'true') {
        handleLoad();
      } else {
        existingScript.addEventListener('load', handleLoad);
        existingScript.addEventListener('error', handleError);
      }

      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    // Limpar erros anteriores
    setLoadError(null);

    // Carregar o script do Google Maps com callback único
    const script = document.createElement('script');
    const callbackName = `initGoogleMaps_${Date.now()}`;
    
    // Adicionar parâmetros de segurança e controle de versão
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry,places&callback=${callbackName}&v=3.55&loading=async`;
    script.async = true;
    script.defer = true;

    // Callback único para o Google Maps
    (window as any)[callbackName] = () => {
      console.log('Callback do Google Maps executado');
      setTimeout(() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          setLoadError(null);
          script.setAttribute('data-loaded', 'true');
          console.log('Google Maps carregado com sucesso');
        } else {
          const error = new Error('Google Maps não carregou corretamente');
          console.error('Erro:', error);
          setLoadError(error);
        }
        // Limpar callback
        delete (window as any)[callbackName];
      }, 100);
    };

    // Tratar erros de carregamento do script
    script.onerror = (error) => {
      console.error('Erro ao carregar script do Google Maps:', error);
      setLoadError(new Error('Falha ao carregar Google Maps API'));
      // Limpar callback
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
      }
    };

    // Detectar erros específicos do Google Maps
    const originalError = window.console.error;
    window.console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('RefererNotAllowedMapError')) {
        setLoadError(new Error('REFERER_NOT_ALLOWED: O domínio atual não está autorizado para esta chave da API do Google Maps'));
      } else if (message.includes('InvalidKeyMapError')) {
        setLoadError(new Error('INVALID_KEY: Chave da API do Google Maps inválida'));
      } else if (message.includes('RequestDeniedMapError')) {
        setLoadError(new Error('REQUEST_DENIED: Requisição negada pela API do Google Maps'));
      }
      originalError.apply(window.console, args);
    };

    document.head.appendChild(script);

    return () => {
      // Restaurar console.error original
      window.console.error = originalError;
      
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
      }
    };
  }, [apiKey]);

  return { isLoaded, loadError };
};
