// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distância em km
  return distance;
};

// Cache para coordenadas já geocodificadas
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

// Função para geocodificar endereço usando APIs externas
export const geocodeAddress = async (endereco: string): Promise<{ lat: number; lng: number } | null> => {
  if (!endereco) return null;
  
  // Verificar cache primeiro
  if (geocodeCache.has(endereco)) {
    return geocodeCache.get(endereco) || null;
  }

  let coordinates: { lat: number; lng: number } | null = null;

  try {
    // Primeira tentativa: Google Maps Geocoding API se disponível
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      
      try {
        const result = await new Promise<any>((resolve, reject) => {
          geocoder.geocode(
            { address: endereco },
            (results: any[], status: any) => {
              if (status === 'OK' && results[0]) {
                resolve(results[0]);
              } else {
                reject(new Error('Geocoding falhou: ' + status));
              }
            }
          );
        });
        
        coordinates = {
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng()
        };
      } catch (error) {
        console.log('Erro no Google Geocoding:', error);
      }
    }

    // Fallback: Nominatim (OpenStreetMap) - grátis mas com limite de rate
    if (!coordinates) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'PedeLogoApp/1.0'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            coordinates = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon)
            };
          }
        }
      } catch (error) {
        console.log('Erro no Nominatim:', error);
      }
    }

    // Último fallback: coordenadas conhecidas de cidades brasileiras
    if (!coordinates) {
      const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
        'salinopolis': { lat: -0.6133, lng: -47.3567 },
        'salinópolis': { lat: -0.6133, lng: -47.3567 },
        'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
        'são paulo': { lat: -23.5505, lng: -46.6333 },
        'belo horizonte': { lat: -19.9167, lng: -43.9345 },
        'brasília': { lat: -15.7942, lng: -47.8822 },
        'salvador': { lat: -12.9714, lng: -38.5014 },
        'fortaleza': { lat: -3.7319, lng: -38.5267 },
        'recife': { lat: -8.0476, lng: -34.8770 },
        'porto alegre': { lat: -30.0346, lng: -51.2177 },
        'manaus': { lat: -3.1190, lng: -60.0217 },
        'curitiba': { lat: -25.4284, lng: -49.2733 },
        'goiânia': { lat: -16.6869, lng: -49.2648 },
        'belém': { lat: -1.4558, lng: -48.5044 }
      };

      const enderecoLower = endereco.toLowerCase();
      
      for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (enderecoLower.includes(city)) {
          coordinates = coords;
          break;
        }
      }
    }

  } catch (error) {
    console.error('Erro geral no geocoding:', error);
  }

  // Salvar no cache
  geocodeCache.set(endereco, coordinates);
  
  return coordinates;
};

// Função para extrair coordenadas do endereço (mantida para compatibilidade)
export const extractCoordinatesFromAddress = (endereco: string): { lat: number; lng: number } | null => {
  // Para compatibilidade, ainda suporta algumas cidades conhecidas
  const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'salinopolis': { lat: -0.6133, lng: -47.3567 },
    'salinópolis': { lat: -0.6133, lng: -47.3567 },
    'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
    'são paulo': { lat: -23.5505, lng: -46.6333 },
    'belo horizonte': { lat: -19.9167, lng: -43.9345 },
    'brasília': { lat: -15.7942, lng: -47.8822 },
    'salvador': { lat: -12.9714, lng: -38.5014 }
  };

  if (!endereco) return null;

  const enderecoLower = endereco.toLowerCase();
  
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (enderecoLower.includes(city)) {
      return coords;
    }
  }

  return null;
};

// Função para formatar distância
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};