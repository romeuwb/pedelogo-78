
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Map, 
  MapPin, 
  Search, 
  Navigation, 
  Globe, 
  Building, 
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

interface Region {
  id: string;
  name: string;
  type: 'city' | 'state' | 'country' | 'custom';
  coordinates?: {
    lat: number;
    lng: number;
  };
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  coverage: {
    restaurants: number;
    deliveries: number;
    active_users: number;
  };
  status: 'active' | 'inactive' | 'expanding';
}

interface DeliveryZone {
  id: string;
  name: string;
  polygon: Array<{lat: number; lng: number}>;
  restaurant_id?: string;
  delivery_fee: number;
  estimated_time: number;
  active: boolean;
}

const AdminMaps = () => {
  const [activeTab, setActiveTab] = useState('coverage');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  // Mock data para demonstração
  useEffect(() => {
    const mockRegions: Region[] = [
      {
        id: '1',
        name: 'São Paulo - SP',
        type: 'city',
        coordinates: { lat: -23.5505, lng: -46.6333 },
        coverage: { restaurants: 1250, deliveries: 45000, active_users: 125000 },
        status: 'active'
      },
      {
        id: '2',
        name: 'Rio de Janeiro - RJ',
        type: 'city',
        coordinates: { lat: -22.9068, lng: -43.1729 },
        coverage: { restaurants: 890, deliveries: 32000, active_users: 89000 },
        status: 'active'
      },
      {
        id: '3',
        name: 'Belo Horizonte - MG',
        type: 'city',
        coordinates: { lat: -19.9167, lng: -43.9345 },
        coverage: { restaurants: 445, deliveries: 18000, active_users: 52000 },
        status: 'expanding'
      }
    ];

    const mockZones: DeliveryZone[] = [
      {
        id: '1',
        name: 'Centro SP',
        polygon: [
          { lat: -23.5400, lng: -46.6400 },
          { lat: -23.5500, lng: -46.6300 },
          { lat: -23.5600, lng: -46.6400 },
          { lat: -23.5500, lng: -46.6500 }
        ],
        delivery_fee: 5.99,
        estimated_time: 30,
        active: true
      }
    ];

    setRegions(mockRegions);
    setDeliveryZones(mockZones);
  }, []);

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCustomRegion = () => {
    const newRegion: Region = {
      id: Date.now().toString(),
      name: 'Nova Região Personalizada',
      type: 'custom',
      coverage: { restaurants: 0, deliveries: 0, active_users: 0 },
      status: 'inactive'
    };
    setRegions([...regions, newRegion]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expanding': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'expanding': return <Clock className="h-4 w-4" />;
      case 'inactive': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mapas e Cobertura</h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie áreas de cobertura, zonas de entrega e análise geográfica
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="coverage">Cobertura Regional</TabsTrigger>
          <TabsTrigger value="zones">Zonas de Entrega</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Geográficos</TabsTrigger>
          <TabsTrigger value="management">Gerenciamento</TabsTrigger>
        </TabsList>

        <TabsContent value="coverage" className="space-y-4">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cidade, estado ou região..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleCreateCustomRegion}>
              <MapPin className="h-4 w-4 mr-2" />
              Nova Região
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRegions.map((region) => (
              <Card 
                key={region.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedRegion?.id === region.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRegion(region)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{region.name}</CardTitle>
                    <Badge className={getStatusColor(region.status)}>
                      {getStatusIcon(region.status)}
                      <span className="ml-1 capitalize">{region.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <Building className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                        <div className="font-semibold">{region.coverage.restaurants}</div>
                        <div className="text-gray-500">Restaurantes</div>
                      </div>
                      <div className="text-center">
                        <Navigation className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                        <div className="font-semibold">{region.coverage.deliveries.toLocaleString()}</div>
                        <div className="text-gray-500">Entregas</div>
                      </div>
                      <div className="text-center">
                        <Users className="h-4 w-4 mx-auto mb-1 text-green-500" />
                        <div className="font-semibold">{region.coverage.active_users.toLocaleString()}</div>
                        <div className="text-gray-500">Usuários</div>
                      </div>
                    </div>
                    
                    {region.coordinates && (
                      <div className="pt-2 border-t text-xs text-gray-500">
                        Lat: {region.coordinates.lat.toFixed(4)}, 
                        Lng: {region.coordinates.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedRegion && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Detalhes - {selectedRegion.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Informações Gerais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tipo:</span>
                        <span className="capitalize">{selectedRegion.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className={getStatusColor(selectedRegion.status)}>
                          {selectedRegion.status}
                        </Badge>
                      </div>
                      {selectedRegion.coordinates && (
                        <>
                          <div className="flex justify-between">
                            <span>Latitude:</span>
                            <span>{selectedRegion.coordinates.lat}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Longitude:</span>
                            <span>{selectedRegion.coordinates.lng}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Métricas de Cobertura</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-orange-500" />
                          <span>Restaurantes</span>
                        </div>
                        <span className="font-bold text-orange-600">
                          {selectedRegion.coverage.restaurants}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-5 w-5 text-blue-500" />
                          <span>Entregas Realizadas</span>
                        </div>
                        <span className="font-bold text-blue-600">
                          {selectedRegion.coverage.deliveries.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-green-500" />
                          <span>Usuários Ativos</span>
                        </div>
                        <span className="font-bold text-green-600">
                          {selectedRegion.coverage.active_users.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Zonas de Entrega</h2>
            <Button>
              <MapPin className="h-4 w-4 mr-2" />
              Nova Zona
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryZones.map((zone) => (
              <Card key={zone.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{zone.name}</CardTitle>
                    <Badge className={zone.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {zone.active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Taxa de Entrega:</span>
                      <span className="font-semibold">R$ {zone.delivery_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo Estimado:</span>
                      <span className="font-semibold">{zone.estimated_time} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pontos do Polígono:</span>
                      <span className="font-semibold">{zone.polygon.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Regiões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regions.length}</div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2 esta semana
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Zonas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deliveryZones.filter(z => z.active).length}</div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  {deliveryZones.length} total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Cobertura Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {regions.reduce((acc, region) => acc + region.coverage.restaurants, 0)}
                </div>
                <div className="text-xs text-gray-500">Restaurantes cobertos</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Usuários Alcançados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(regions.reduce((acc, region) => acc + region.coverage.active_users, 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-gray-500">Usuários ativos</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição Geográfica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Map className="h-12 w-12 mx-auto mb-2" />
                  <p>Visualização do mapa será implementada aqui</p>
                  <p className="text-sm">Integração com Google Maps ou similar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Cobertura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Raio Padrão de Entrega (km)</label>
                  <Input type="number" defaultValue="10" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Taxa Mínima de Entrega (R$)</label>
                  <Input type="number" defaultValue="3.99" step="0.01" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Tempo Máximo de Entrega (min)</label>
                  <Input type="number" defaultValue="60" className="mt-1" />
                </div>
                <Button className="w-full">Salvar Configurações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Expandir para Nova Cidade
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Criar Zona Personalizada
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Navigation className="h-4 w-4 mr-2" />
                  Otimizar Rotas Existentes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Análise de Demanda
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMaps;
