
import { useState, useEffect } from 'react';

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
}

export const useGoogleMaps = (apiKey?: string): UseGoogleMapsReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    // Se o Google Maps já está carregado
    if (window.google && window.google.maps && window.google.maps.drawing) {
      setIsLoaded(true);
      return;
    }

    // Se já existe um script carregando
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const handleLoad = () => {
        if (window.google && window.google.maps && window.google.maps.drawing) {
          setIsLoaded(true);
        } else {
          setLoadError(new Error('Google Maps drawing library not loaded'));
        }
      };

      const handleError = () => {
        setLoadError(new Error('Failed to load Google Maps'));
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

    // Carregar o script do Google Maps
    const script = document.createElement('script');
    const key = apiKey || 'AIzaSyBCXkPLxm6DGcNJvAG6_oVXKKY9-YGZ5kA';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=drawing&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Callback global para o Google Maps
    window.initGoogleMaps = () => {
      // Aguardar um pouco para garantir que tudo está carregado
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.drawing) {
          setIsLoaded(true);
          script.setAttribute('data-loaded', 'true');
        } else {
          setLoadError(new Error('Google Maps drawing library not loaded properly'));
        }
      }, 100);
    };

    script.onerror = () => {
      setLoadError(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, [apiKey]);

  return { isLoaded, loadError };
};
