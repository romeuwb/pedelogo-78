
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
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Se já existe um script carregando
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      existingScript.addEventListener('error', (e) => setLoadError(new Error('Failed to load Google Maps')));
      return;
    }

    // Carregar o script do Google Maps
    const script = document.createElement('script');
    const key = apiKey || 'AIzaSyBCXkPLxm6DGcNJvAG6_oVXKKY9-YGZ5kA'; // Chave de exemplo - substitua pela sua
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=drawing`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setLoadError(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey]);

  return { isLoaded, loadError };
};
