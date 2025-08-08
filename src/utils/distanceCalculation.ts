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

// Função para extrair coordenadas do endereço (formato básico)
export const extractCoordinatesFromAddress = (endereco: string): { lat: number; lng: number } | null => {
  // Esta é uma implementação básica - em produção seria melhor usar uma API de geocoding
  // Por enquanto, vamos usar coordenadas padrão para algumas cidades conhecidas
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