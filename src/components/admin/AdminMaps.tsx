import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import { Map, Plus, Edit, Trash2, MapPin, Globe, Search, Loader2 } from 'lucide-react';
import { useServiceRegions, ServiceRegion, CreateRegionData } from '@/hooks/useServiceRegions';
import { useGeographySearch } from '@/hooks/useGeographySearch';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import MapComponent from '@/components/maps/MapComponent';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminMaps = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<ServiceRegion | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState<CreateRegionData>({
    name: '',
    type: 'city',
    country: '',
    state: '',
    city: '',
    active: true
  });

  const { 
    regions, 
    isLoading, 
    createRegion, 
    updateRegion, 
    deleteRegion, 
    toggleRegionStatus 
  } = useServiceRegions();

  const { 
    countries, 
    getStates, 
    getCities, 
    searchCities 
  } = useGeographySearch();

  const { isLoaded: isGoogleMapsLoaded } = useGoogleMaps(googleMapsApiKey);

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

  // Busca inteligente de cidades
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (citySearchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const cities = await searchCities(citySearchTerm);
          setSearchResults(cities);
        } catch (error) {
          console.error('Erro na busca:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [citySearchTerm, searchCities]);

  const handleCitySelect = (city: any) => {
    setFormData({
      ...formData,
      name: city.name,
      country: city.country === 'BR' ? 'Brasil' : city.country,
      state: city.state,
      city: city.name,
      coordinates: city.coordinates
    });
    setCitySearchTerm(city.name);
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    setCitySearchTerm('');
    setSearchResults([]);
  };

  const handleEdit = (region: ServiceRegion) => {
    setEditingRegion(region);
    setFormData({
      name: region.name,
      type: region.type,
      country: region.country || '',
      state: region.state || '',
      city: region.city || '',
      coordinates: region.coordinates,
      active: region.active
    });
    setCitySearchTerm(region.name);
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

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    console.log('Localização selecionada:', location);
  };

  // Preparar marcadores para o mapa
  const mapMarkers = regions
    .filter(region => region.coordinates && region.active)
    .map(region => ({
      id: region.id,
      position: region.coordinates!,
      title: region.name,
      type: 'restaurant' as const
    }));

  const RegionForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="search">Buscar Cidade</Label>
        <div className="relative">
          <Input
            id="search"
            value={citySearchTerm}
            onChange={(e) => setCitySearchTerm(e.target.value)}
            placeholder="Digite o nome da cidade..."
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {isSearching && (
            <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((city, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                onClick={() => handleCitySelect(city)}
              >
                <span>{city.name}</span>
                <span className="text-sm text-gray-500">{city.state}, {city.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
            placeholder="Ex: Brasil"
            readOnly
          />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            placeholder="Ex: SP"
            readOnly
          />
        </div>
      </div>

      <div>
        <Label htmlFor="name">Nome da Região</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Nome será preenchido automaticamente"
          required
          readOnly
        />
      </div>

      <div>
        <Label htmlFor="type">Tipo de Região</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value: any) => setFormData({...formData, type: value})}
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

      <Button type="submit" className="w-full" disabled={createRegion.isPending || updateRegion.isPending}>
        {editingRegion ? 'Atualizar Região' : 'Criar Região'}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Regiões de Atendimento</h1>
          <p className="text-gray-600">Defina as regiões onde a plataforma estará disponível</p>
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

      {/* Mapa Interativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Mapa Interativo das Regiões
            {isGoogleMapsLoaded && <Badge className="bg-green-100 text-green-800">Conectado</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {googleMapsApiKey ? (
            <div className="h-96">
              <MapComponent
                center={{ lat: -14.2350, lng: -51.9253 }}
                zoom={5}
                markers={mapMarkers}
                onLocationSelect={handleLocationSelect}
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
                  para habilitar o mapa interativo.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Regiões */}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>País/Estado</TableHead>
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
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRegionTypeBadgeColor(region.type)}>
                        {getRegionTypeLabel(region.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {region.country && region.state ? `${region.country}, ${region.state}` : region.country || '-'}
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
                        >
                          {region.active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(region)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a região "{region.name}"? 
                                Esta ação não pode ser desfeita.
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
                      Nenhuma região configurada ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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

      {/* Informações sobre Integração */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Globe className="h-6 w-6 text-blue-600 mt-1" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Sobre a Gestão de Regiões
              </h3>
              <div className="text-blue-700 space-y-2">
                <p>
                  • <strong>Países:</strong> Defina em quais países a plataforma estará disponível
                </p>
                <p>
                  • <strong>Estados:</strong> Configure estados/províncias específicas dentro de cada país
                </p>
                <p>
                  • <strong>Cidades:</strong> Selecione cidades específicas para atendimento
                </p>
                <p>
                  • <strong>Regiões Personalizadas:</strong> Crie áreas customizadas com base em coordenadas
                </p>
                <p className="text-sm mt-3 text-blue-600">
                  <strong>Nota:</strong> Esta funcionalidade não interfere com as áreas de entrega 
                  individuais que cada restaurante pode configurar.
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
