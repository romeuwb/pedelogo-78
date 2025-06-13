
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
      return;
    }

    // Se o Google Maps já está carregado
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Se já existe um script carregando
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const handleLoad = () => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
        } else {
          setLoadError(new Error('Google Maps não carregou corretamente'));
        }
      };

      const handleError = () => {
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

    // Carregar o script do Google Maps com callback único
    const script = document.createElement('script');
    const callbackName = `initGoogleMaps_${Date.now()}`;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry,places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    // Callback único para o Google Maps
    (window as any)[callbackName] = () => {
      setTimeout(() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          script.setAttribute('data-loaded', 'true');
          console.log('Google Maps carregado com sucesso');
        } else {
          setLoadError(new Error('Google Maps não carregou corretamente'));
        }
      }, 100);
    };

    script.onerror = () => {
      setLoadError(new Error('Falha ao carregar Google Maps API'));
    };

    document.head.appendChild(script);

    return () => {
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
