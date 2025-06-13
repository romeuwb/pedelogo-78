
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Country {
  name: string;
  code: string;
}

interface State {
  name: string;
  code: string;
  country: string;
}

interface City {
  name: string;
  state: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

// Dados geográficos mais completos (em produção, usar API real)
const mockGeographyData = {
  countries: [
    { name: 'Brasil', code: 'BR' },
    { name: 'Estados Unidos', code: 'US' },
    { name: 'Argentina', code: 'AR' },
    { name: 'Chile', code: 'CL' },
    { name: 'Uruguai', code: 'UY' }
  ],
  states: {
    BR: [
      { name: 'São Paulo', code: 'SP' },
      { name: 'Rio de Janeiro', code: 'RJ' },
      { name: 'Minas Gerais', code: 'MG' },
      { name: 'Bahia', code: 'BA' },
      { name: 'Paraná', code: 'PR' },
      { name: 'Rio Grande do Sul', code: 'RS' },
      { name: 'Santa Catarina', code: 'SC' },
      { name: 'Goiás', code: 'GO' },
      { name: 'Pernambuco', code: 'PE' },
      { name: 'Ceará', code: 'CE' },
      { name: 'Espírito Santo', code: 'ES' },
      { name: 'Distrito Federal', code: 'DF' }
    ],
    US: [
      { name: 'California', code: 'CA' },
      { name: 'New York', code: 'NY' },
      { name: 'Texas', code: 'TX' },
      { name: 'Florida', code: 'FL' }
    ]
  },
  cities: {
    'BR-SP': [
      { name: 'São Paulo', coordinates: { lat: -23.5505, lng: -46.6333 } },
      { name: 'Campinas', coordinates: { lat: -22.9056, lng: -47.0608 } },
      { name: 'Santos', coordinates: { lat: -23.9618, lng: -46.3322 } },
      { name: 'São José dos Campos', coordinates: { lat: -23.2237, lng: -45.9009 } },
      { name: 'Ribeirão Preto', coordinates: { lat: -21.1775, lng: -47.8208 } },
      { name: 'Sorocaba', coordinates: { lat: -23.5015, lng: -47.4526 } },
      { name: 'Osasco', coordinates: { lat: -23.5329, lng: -46.7916 } },
      { name: 'São Bernardo do Campo', coordinates: { lat: -23.6914, lng: -46.5646 } }
    ],
    'BR-RJ': [
      { name: 'Rio de Janeiro', coordinates: { lat: -22.9068, lng: -43.1729 } },
      { name: 'Niterói', coordinates: { lat: -22.8833, lng: -43.1036 } },
      { name: 'Nova Iguaçu', coordinates: { lat: -22.7561, lng: -43.4510 } },
      { name: 'Duque de Caxias', coordinates: { lat: -22.7858, lng: -43.3117 } },
      { name: 'Campos dos Goytacazes', coordinates: { lat: -21.7587, lng: -41.3297 } }
    ],
    'BR-MG': [
      { name: 'Belo Horizonte', coordinates: { lat: -19.9191, lng: -43.9378 } },
      { name: 'Uberlândia', coordinates: { lat: -18.9113, lng: -48.2622 } },
      { name: 'Contagem', coordinates: { lat: -19.9317, lng: -44.0536 } },
      { name: 'Juiz de Fora', coordinates: { lat: -21.7642, lng: -43.3467 } }
    ],
    'BR-PR': [
      { name: 'Curitiba', coordinates: { lat: -25.4284, lng: -49.2733 } },
      { name: 'Londrina', coordinates: { lat: -23.3045, lng: -51.1696 } },
      { name: 'Maringá', coordinates: { lat: -23.4273, lng: -51.9375 } },
      { name: 'Ponta Grossa', coordinates: { lat: -25.0916, lng: -50.1668 } }
    ],
    'BR-RS': [
      { name: 'Porto Alegre', coordinates: { lat: -30.0346, lng: -51.2177 } },
      { name: 'Caxias do Sul', coordinates: { lat: -29.1634, lng: -51.1797 } },
      { name: 'Pelotas', coordinates: { lat: -31.7654, lng: -52.3376 } },
      { name: 'Canoas', coordinates: { lat: -29.9177, lng: -51.1844 } }
    ]
  }
};

export const useGeographySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar países
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async (): Promise<Country[]> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockGeographyData.countries;
    }
  });

  // Buscar estados por país
  const getStates = useCallback(async (countryCode: string): Promise<State[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const states = mockGeographyData.states[countryCode as keyof typeof mockGeographyData.states] || [];
    return states.map(state => ({
      ...state,
      country: countryCode
    }));
  }, []);

  // Buscar cidades por estado
  const getCities = useCallback(async (countryCode: string, stateCode: string): Promise<City[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const key = `${countryCode}-${stateCode}` as keyof typeof mockGeographyData.cities;
    const cities = mockGeographyData.cities[key] || [];
    return cities.map(city => ({
      ...city,
      state: stateCode,
      country: countryCode
    }));
  }, []);

  // Busca inteligente de cidades
  const searchCities = useCallback(async (term: string): Promise<City[]> => {
    if (!term || term.length < 2) return [];
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allCities: City[] = [];
    Object.entries(mockGeographyData.cities).forEach(([key, cities]) => {
      const [country, state] = key.split('-');
      cities.forEach(city => {
        allCities.push({
          ...city,
          state,
          country
        });
      });
    });

    return allCities.filter(city => 
      city.name.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 10); // Limitar a 10 resultados
  }, []);

  // Busca por país
  const searchCountries = useCallback(async (term: string): Promise<Country[]> => {
    if (!term || term.length < 2) return [];
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return mockGeographyData.countries.filter(country =>
      country.name.toLowerCase().includes(term.toLowerCase())
    );
  }, []);

  // Busca por estado
  const searchStates = useCallback(async (term: string, countryCode?: string): Promise<State[]> => {
    if (!term || term.length < 2) return [];
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allStates: State[] = [];
    Object.entries(mockGeographyData.states).forEach(([country, states]) => {
      if (countryCode && country !== countryCode) return;
      states.forEach(state => {
        allStates.push({
          ...state,
          country
        });
      });
    });

    return allStates.filter(state =>
      state.name.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 10);
  }, []);

  return {
    countries,
    getStates,
    getCities,
    searchCities,
    searchCountries,
    searchStates,
    searchTerm,
    setSearchTerm
  };
};
