
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

interface GeographySearchResult {
  countries: Country[];
  states: State[];
  cities: City[];
}

// Simulação de dados geográficos (em produção, usar API real)
const mockGeographyData = {
  countries: [
    { name: 'Brasil', code: 'BR' },
    { name: 'Estados Unidos', code: 'US' },
    { name: 'Argentina', code: 'AR' }
  ],
  states: {
    BR: [
      { name: 'São Paulo', code: 'SP' },
      { name: 'Rio de Janeiro', code: 'RJ' },
      { name: 'Minas Gerais', code: 'MG' },
      { name: 'Bahia', code: 'BA' },
      { name: 'Paraná', code: 'PR' },
      { name: 'Rio Grande do Sul', code: 'RS' }
    ]
  },
  cities: {
    'BR-SP': [
      { name: 'São Paulo', coordinates: { lat: -23.5505, lng: -46.6333 } },
      { name: 'Campinas', coordinates: { lat: -22.9056, lng: -47.0608 } },
      { name: 'Santos', coordinates: { lat: -23.9618, lng: -46.3322 } }
    ],
    'BR-RJ': [
      { name: 'Rio de Janeiro', coordinates: { lat: -22.9068, lng: -43.1729 } },
      { name: 'Niterói', coordinates: { lat: -22.8833, lng: -43.1036 } }
    ]
  }
};

export const useGeographySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar países
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async (): Promise<Country[]> => {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockGeographyData.countries;
    }
  });

  // Buscar estados por país
  const getStates = useCallback(async (countryCode: string): Promise<State[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const states = mockGeographyData.states[countryCode as keyof typeof mockGeographyData.states] || [];
    return states.map(state => ({
      ...state,
      country: countryCode
    }));
  }, []);

  // Buscar cidades por estado
  const getCities = useCallback(async (countryCode: string, stateCode: string): Promise<City[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
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
    );
  }, []);

  return {
    countries,
    getStates,
    getCities,
    searchCities,
    searchTerm,
    setSearchTerm
  };
};
