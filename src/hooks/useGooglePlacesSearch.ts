
import { useState, useCallback } from 'react';
import { useGoogleMaps } from './useGoogleMaps';

interface PlaceResult {
  name: string;
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  types: string[];
}

interface SearchResult {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  country?: string;
  state?: string;
  city?: string;
  place_id: string;
  types: string[];
}

export const useGooglePlacesSearch = (apiKey?: string) => {
  const { isLoaded } = useGoogleMaps(apiKey);
  const [isSearching, setIsSearching] = useState(false);

  const searchPlaces = useCallback(async (
    query: string, 
    types: string[] = ['(regions)', '(cities)']
  ): Promise<SearchResult[]> => {
    if (!isLoaded || !window.google || !query || query.length < 2) {
      return [];
    }

    setIsSearching(true);

    try {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      return new Promise((resolve) => {
        const request = {
          query: query,
          fields: ['name', 'formatted_address', 'place_id', 'geometry', 'address_components', 'types']
        };

        service.textSearch(request, (results, status) => {
          setIsSearching(false);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            const searchResults = results
              .filter(place => {
                // Filter by types based on search intent
                const placeTypes = place.types || [];
                return types.some(type => {
                  if (type === '(regions)') {
                    return placeTypes.includes('administrative_area_level_1') || 
                           placeTypes.includes('administrative_area_level_2') ||
                           placeTypes.includes('country');
                  }
                  if (type === '(cities)') {
                    return placeTypes.includes('locality') || 
                           placeTypes.includes('administrative_area_level_3');
                  }
                  return placeTypes.includes(type);
                });
              })
              .map(place => {
                const addressComponents = place.address_components || [];
                let country = '';
                let state = '';
                let city = '';

                addressComponents.forEach(component => {
                  if (component.types.includes('country')) {
                    country = component.long_name;
                  }
                  if (component.types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                  }
                  if (component.types.includes('locality')) {
                    city = component.long_name;
                  }
                });

                return {
                  name: place.name || '',
                  address: place.formatted_address || '',
                  coordinates: {
                    lat: place.geometry?.location.lat() || 0,
                    lng: place.geometry?.location.lng() || 0
                  },
                  country,
                  state,
                  city,
                  place_id: place.place_id || '',
                  types: place.types || []
                };
              })
              .slice(0, 10); // Limit to 10 results

            resolve(searchResults);
          } else {
            resolve([]);
          }
        });
      });
    } catch (error) {
      console.error('Erro na busca do Google Places:', error);
      setIsSearching(false);
      return [];
    }
  }, [isLoaded]);

  const searchCities = useCallback((query: string) => {
    return searchPlaces(query, ['locality', 'administrative_area_level_3']);
  }, [searchPlaces]);

  const searchStates = useCallback((query: string) => {
    return searchPlaces(query, ['administrative_area_level_1']);
  }, [searchPlaces]);

  const searchCountries = useCallback((query: string) => {
    return searchPlaces(query, ['country']);
  }, [searchPlaces]);

  return {
    searchPlaces,
    searchCities,
    searchStates,
    searchCountries,
    isSearching,
    isLoaded
  };
};
