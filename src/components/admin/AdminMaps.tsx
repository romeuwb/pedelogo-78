import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Map, Plus, Edit, Trash2, MapPin, Globe, Search, Loader2, Power, PowerOff } from 'lucide-react';
import { useServiceRegions, CreateRegionData } from '@/hooks/useServiceRegions';
import { useGooglePlacesSearch } from '@/hooks/useGooglePlacesSearch';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import MapComponent from '@/components/maps/MapComponent';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type SearchType = 'city' | 'state' | 'country' | 'custom';
type RegionType = 'city' | 'state' | 'country' | 'custom';

const AdminMaps = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<any>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<SearchType>('city');
  const [isManualSearching, setIsManualSearching] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Hooks para dados do banco
  const {
    regions,
    isLoading,
    createRegion,
    updateRegion,
    deleteRegion,
    toggleRegionStatus
  } = useServiceRegions();

  // Hook para busca no Google Places
  const {
    searchCities,
    searchStates,
    searchCountries,
    searchPlaces,
    isSearching: isGoogleSearching,
    isLoaded: isGoogleMapsLoaded
  } = useGooglePlacesSearch(googleMapsApiKey);

  const { loadError } = useGoogleMaps(googleMapsApiKey);

  const [formData, setFormData] = useState<CreateRegionData>({
    name: '',
    type: 'city' as RegionType,
    country: '',
    state: '',
    city: '',
    active: true
  });

  // Buscar configuração da API do Google Maps
  const { data: systemConfigs } = useQuery({
    queryKey: ['system-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('*')
        .eq('chave', 'google_maps_api_key')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  useEffect(() => {
    if (systemConfigs?.valor) {
      const apiKey = typeof systemConfigs.valor === 'string' ? systemConfigs.valor : String(systemConfigs.valor);
      setGoogleMapsApiKey(apiKey);
    }
  }, [systemConfigs]);

  // Busca melhorada com tipos mais específicos para cada categoria
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 2 && searchType !== 'custom' && isGoogleMapsLoaded) {
      setIsManualSearching(true);
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          let results: any[] = [];
          
          switch (searchType) {
            case 'city':
              results = await searchPlaces(searchTerm, [
                'locality', 
                'administrative_area_level_3',
                'sublocality',
                'sublocality_level_1',
                'administrative_area_level_4'
              ]);
              break;
            case 'state':
              results = await searchPlaces(searchTerm, [
                'administrative_area_level_1',
                'administrative_area_level_2',
                'political'
              ]);
              break;
            case 'country':
              results = await searchPlaces(searchTerm, ['country']);
              break;
          }
          
          setSearchResults(results);
          setIsResultsVisible(true);
        } catch (error) {
          console.error('Erro na busca do Google Places:', error);
          setSearchResults([]);
        } finally {
          setIsManualSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsResultsVisible(false);
      setIsManualSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchType, searchPlaces, isGoogleMapsLoaded]);

  const handleLocationSelect = (location: any) => {
    console.log('Localização selecionada:', location);
    
    let newFormData: CreateRegionData = {
      ...formData,
      type: searchType as RegionType,
      coordinates: location.coordinates
    };

    const placeTypes = location.types || [];
    let determinedType: RegionType = searchType as RegionType;
    
    if (placeTypes.includes('country')) {
      determinedType = 'country';
    } else if (placeTypes.includes('administrative_area_level_1') || 
               placeTypes.includes('administrative_area_level_2') ||
               placeTypes.includes('political')) {
      determinedType = 'state';
    } else if (placeTypes.includes('locality') || 
               placeTypes.includes('administrative_area_level_3') || 
               placeTypes.includes('sublocality')) {
      determinedType = 'city';
    }

    newFormData.type = determinedType;

    const country = location.country || 'Brasil';

    switch (determinedType) {
      case 'city':
        newFormData = {
          ...newFormData,
          name: location.name || location.city,
          city: location.name || location.city,
          state: location.state || '',
          country: country
        };
        break;
      case 'state':
        newFormData = {
          ...newFormData,
          name: location.name || location.state,
          state: location.name || location.state,
          country: country,
          city: ''
        };
        break;
      case 'country':
        newFormData = {
          ...newFormData,
          name: location.name || location.country,
          country: location.name || location.country,
          state: '',
          city: ''
        };
        break;
    }

    setFormData(newFormData);
    setSearchTerm(location.name);
    setSearchResults([]);
    setIsResultsVisible(false);
    setSearchType(determinedType);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length < 2) {
      setIsResultsVisible(false);
      setSearchResults([]);
    }
  };

  const handleSearchInputFocus = () => {
    if (searchTerm.length >= 2 && searchResults.length > 0) {
      setIsResultsVisible(true);
    }
  };

  const handleResultClick = (location: any) => {
    handleLocationSelect(location);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Dados do formulário antes de enviar:', formData);
    
    if (editingRegion) {
      updateRegion.mutate({
        id: editingRegion.id,
        ...formData
      });
      setIsEditOpen(false);
      setEditingRegion(null);
    } else {
      createRegion.mutate(formData);
      setIsCreateOpen(false);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'city',
      country: '',
      state: '',
      city: '',
      active: true
    });
    setSearchTerm('');
    setSearchResults([]);
    setIsResultsVisible(false);
    setSearchType('city');
  };

  const handleEdit = (region: any) => {
    setEditingRegion(region);
    setFormData({
      name: region.name,
      type: region.type as RegionType,
      country: region.country || '',
      state: region.state || '',
      city: region.city || '',
      coordinates: region.coordinates,
      active: region.active
    });
    setSearchTerm(region.name);
    setSearchType(region.type as SearchType);
    setIsEditOpen(true);
  };

  const handleDelete = (regionId: string) => {
    deleteRegion.mutate(regionId);
  };

  const getRegionIcon = (type: string) => {
    switch (type) {
      case 'country':
        return <Globe className="h-4 w-4" />;
      case 'state':
        return <Map className="h-4 w-4" />;
      case 'city':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Map className="h-4 w-4" />;
    }
  };

  const getRegionTypeLabel = (type: string) => {
    switch (type) {
      case 'country':
        return 'País';
      case 'state':
        return 'Estado';
      case 'city':
        return 'Cidade';
      case 'custom':
        return 'Personalizada';
      default:
        return type;
    }
  };

  const getRegionTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'country':
        return 'bg-purple-100 text-purple-800';
      case 'state':
        return 'bg-blue-100 text-blue-800';
      case 'city':
        return 'bg-green-100 text-green-800';
      case 'custom':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMapLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    console.log('Localização selecionada no mapa:', location);
    setFormData({
      ...formData,
      coordinates: { lat: location.lat, lng: location.lng },
      name: formData.name || location.address
    });
  };

  // Preparar marcadores para o mapa usando dados reais do banco
  const mapMarkers = regions
    .filter(region => region.coordinates && region.active)
    .map(region => ({
      id: region.id,
      position: region.coordinates,
      title: region.name,
      type: 'restaurant' as const
    }));

  // Calcular centro do mapa baseado nas regiões cadastradas
  const getMapCenter = () => {
    const activeRegionsWithCoords = regions.filter(r => r.coordinates && r.active);
    
    if (activeRegionsWithCoords.length === 0) {
      // Centro do Brasil como padrão
      return { lat: -14.2350, lng: -51.9253 };
    }

    const avgLat = activeRegionsWithCoords.reduce((sum, r) => sum + r.coordinates.lat, 0) / activeRegionsWithCoords.length;
    const avgLng = activeRegionsWithCoords.reduce((sum, r) => sum + r.coordinates.lng, 0) / activeRegionsWithCoords.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const RegionForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Tipo de Região</Label>
        <Select 
          value={searchType} 
          onValueChange={(value: SearchType) => {
            setSearchType(value);
            setFormData({...formData, type: value as RegionType});
            setSearchTerm('');
            setSearchResults([]);
            setIsResultsVisible(false);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="country">País</SelectItem>
            <SelectItem value="state">Estado</SelectItem>
            <SelectItem value="city">Cidade</SelectItem>
            <SelectItem value="custom">Região Personalizada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {searchType !== 'custom' && (
        <div className="relative">
          <Label htmlFor="search">
            Buscar {searchType === 'city' ? 'Cidade' : searchType === 'state' ? 'Estado' : 'País'}
          </Label>
          <div className="relative">
            <Input
              ref={searchInputRef}
              id="search"
              value={searchTerm}
              onChange={handleSearchInputChange}
              onFocus={handleSearchInputFocus}
              placeholder={`Digite o nome ${searchType === 'city' ? 'da cidade' : searchType === 'state' ? 'do estado' : 'do país'}...`}
              className="pr-10"
              autoComplete="off"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {(isManualSearching || isGoogleSearching) && (
              <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          
          {isResultsVisible && searchResults.length > 0 && (
            <div 
              ref={resultsRef}
              className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {searchResults.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleResultClick(location);
                  }}
                >
                  <div className="flex-1">
                    <span className="font-medium block">{location.name}</span>
                    <span className="text-sm text-gray-500 block">{location.address}</span>
                    {location.country && (
                      <span className="text-xs text-gray-400 block">País: {location.country}</span>
                    )}
                    {location.state && (
                      <span className="text-xs text-gray-400 block">Estado: {location.state}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 ml-2">
                    {location.types?.includes('country') && '🌍'}
                    {(location.types?.includes('administrative_area_level_1') || 
                      location.types?.includes('administrative_area_level_2') ||
                      location.types?.includes('political')) && '🗺️'}
                    {(location.types?.includes('locality') || location.types?.includes('sublocality')) && '🏙️'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {isGoogleMapsLoaded && isResultsVisible && searchResults.length === 0 && !isManualSearching && !isGoogleSearching && searchTerm.length >= 2 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500">
              Nenhum resultado encontrado para "{searchTerm}"
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name">Nome da Região</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nome da região"
            required
          />
        </div>
      </div>

      {searchType !== 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              placeholder="Ex: Brasil"
              readOnly={searchType !== 'custom'}
              className={searchType !== 'custom' ? 'bg-gray-50' : ''}
            />
          </div>
          {(searchType === 'state' || searchType === 'city') && (
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="Ex: SP"
                readOnly={searchType !== 'custom'}
                className={searchType !== 'custom' ? 'bg-gray-50' : ''}
              />
            </div>
          )}
        </div>
      )}

      {formData.coordinates && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 text-green-800">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Coordenadas definidas</span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            Lat: {formData.coordinates.lat.toFixed(6)}, Lng: {formData.coordinates.lng.toFixed(6)}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={createRegion.isPending || updateRegion.isPending}>
        {createRegion.isPending || updateRegion.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        {editingRegion ? 'Atualizar Região' : 'Criar Região'}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Regiões de Atendimento</h1>
          <p className="text-gray-600">Defina as regiões onde a plataforma estará disponível usando busca real do Google Maps</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Região
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Região</DialogTitle>
            </DialogHeader>
            <RegionForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Status da API do Google Maps */}
      {loadError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Erro na API do Google Maps</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{loadError.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas baseadas em dados reais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Países</p>
                <p className="text-lg font-semibold">{regions.filter(r => r.type === 'country').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Map className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Estados</p>
                <p className="text-lg font-semibold">{regions.filter(r => r.type === 'state').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Cidades</p>
                <p className="text-lg font-semibold">{regions.filter(r => r.type === 'city').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Power className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Ativas</p>
                <p className="text-lg font-semibold">{regions.filter(r => r.active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa Interativo com dados reais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Mapa Interativo das Regiões
            {isGoogleMapsLoaded && <Badge className="bg-green-100 text-green-800">Google Maps Conectado</Badge>}
            <Badge variant="secondary">{mapMarkers.length} regiões no mapa</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {googleMapsApiKey ? (
            <div className="h-96">
              <MapComponent
                center={getMapCenter()}
                zoom={regions.length > 0 ? 6 : 5}
                markers={mapMarkers}
                onLocationSelect={handleMapLocationSelect}
                apiKey={googleMapsApiKey}
              />
            </div>
          ) : (
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  API do Google Maps não configurada
                </h3>
                <p className="text-gray-500 max-w-md">
                  Configure a chave da API do Google Maps nas configurações do sistema 
                  para habilitar o mapa interativo e busca de regiões.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Regiões com dados reais e ScrollArea */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Regiões Configuradas
            <Badge variant="secondary">{regions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando regiões...</span>
            </div>
          ) : (
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRegionIcon(region.type)}
                          <span className="font-medium">{region.name}</span>
                          {region.coordinates && (
                            <Badge variant="outline" className="text-xs">
                              Mapeada
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRegionTypeBadgeColor(region.type)}>
                          {getRegionTypeLabel(region.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {region.country && <div>{region.country}</div>}
                          {region.state && <div className="text-gray-500">{region.state}</div>}
                          {region.city && <div className="text-gray-400">{region.city}</div>}
                          {region.coordinates && (
                            <div className="text-xs text-gray-400 mt-1">
                              {region.coordinates.lat.toFixed(4)}, {region.coordinates.lng.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={region.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {region.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(region.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleRegionStatus.mutate(region.id)}
                            className="h-8 w-8 p-0"
                          >
                            {region.active ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(region)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a região "{region.name}"? 
                                  Esta ação não pode ser desfeita e pode afetar o funcionamento da plataforma.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(region.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {regions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Nenhuma região configurada ainda. Clique em "Nova Região" para começar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Região</DialogTitle>
          </DialogHeader>
          <RegionForm />
        </DialogContent>
      </Dialog>

      {/* Informações sobre Integração com dados reais */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Globe className="h-6 w-6 text-blue-600 mt-1" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Sistema de Zonas de Entrega Integrado com Google Maps
              </h3>
              <div className="text-blue-700 space-y-2">
                <p>
                  • <strong>Busca Real:</strong> Integração com Google Places API para busca precisa de países, estados e cidades
                </p>
                <p>
                  • <strong>Coordenadas Automáticas:</strong> Localização geográfica obtida automaticamente do Google Maps
                </p>
                <p>
                  • <strong>Dados Persistentes:</strong> Todas as regiões são armazenadas no banco de dados Supabase
                </p>
                <p>
                  • <strong>Mapa Dinâmico:</strong> Visualização em tempo real das regiões ativas no mapa interativo
                </p>
                <p>
                  • <strong>Gestão Hierárquica:</strong> Suporte para países, estados, cidades e regiões personalizadas
                </p>
                <p className="text-sm mt-3 text-blue-600">
                  <strong>Status:</strong> {regions.length} regiões • {regions.filter(r => r.active).length} ativas • {mapMarkers.length} no mapa • API {isGoogleMapsLoaded ? 'Conectada' : 'Desconectada'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMaps;
