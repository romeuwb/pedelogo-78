
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Map, MapPin, Trash2, Save, Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryZoneMap } from '@/components/maps/DeliveryZoneMap';

interface ServiceRegion {
  id: string;
  name: string;
  type: 'country' | 'state' | 'city' | 'custom';
  coordinates?: Array<{ lat: number; lng: number }>;
  parent_region_id?: string;
  active: boolean;
  restrictions?: any;
  created_at: string;
  updated_at: string;
}

interface RegionStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalOrders: number;
  coverage: number;
}

const AdminMaps = () => {
  const [regions, setRegions] = useState<ServiceRegion[]>([]);
  const [newRegion, setNewRegion] = useState({
    name: '',
    type: 'city' as ServiceRegion['type'],
    parent_region_id: ''
  });
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionStats, setRegionStats] = useState<Record<string, RegionStats>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadRegions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_regions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegions(data || []);
      
      // Load statistics for each region
      await loadRegionStats(data || []);
    } catch (error) {
      console.error('Erro ao carregar regiões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as regiões de serviço.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRegionStats = async (regionList: ServiceRegion[]) => {
    const stats: Record<string, RegionStats> = {};
    
    for (const region of regionList) {
      try {
        // Simulate stats loading - replace with actual queries
        stats[region.id] = {
          totalRestaurants: Math.floor(Math.random() * 100) + 10,
          activeRestaurants: Math.floor(Math.random() * 80) + 5,
          totalOrders: Math.floor(Math.random() * 1000) + 100,
          coverage: Math.floor(Math.random() * 100) + 50
        };
      } catch (error) {
        console.error(`Erro ao carregar stats para região ${region.id}:`, error);
      }
    }
    
    setRegionStats(stats);
  };

  const createRegion = async () => {
    if (!newRegion.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da região é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('service_regions')
        .insert([{
          name: newRegion.name,
          type: newRegion.type,
          parent_region_id: newRegion.parent_region_id || null,
          active: true
        }])
        .select()
        .single();

      if (error) throw error;

      setRegions(prev => [data, ...prev]);
      setNewRegion({ name: '', type: 'city', parent_region_id: '' });
      
      toast({
        title: "Sucesso",
        description: "Região criada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao criar região:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a região.",
        variant: "destructive"
      });
    }
  };

  const toggleRegionStatus = async (regionId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('service_regions')
        .update({ active })
        .eq('id', regionId);

      if (error) throw error;

      setRegions(prev => prev.map(region => 
        region.id === regionId ? { ...region, active } : region
      ));

      toast({
        title: "Sucesso",
        description: `Região ${active ? 'ativada' : 'desativada'} com sucesso!`
      });
    } catch (error) {
      console.error('Erro ao atualizar região:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a região.",
        variant: "destructive"
      });
    }
  };

  const deleteRegion = async (regionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta região?')) return;

    try {
      const { error } = await supabase
        .from('service_regions')
        .delete()
        .eq('id', regionId);

      if (error) throw error;

      setRegions(prev => prev.filter(region => region.id !== regionId));
      
      toast({
        title: "Sucesso",
        description: "Região excluída com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao excluir região:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a região.",
        variant: "destructive"
      });
    }
  };

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadRegions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Mapas e Regiões</h1>
          <p className="text-gray-600">Configure as regiões de serviço da plataforma</p>
        </div>
      </div>

      <Tabs defaultValue="regions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="regions">Regiões de Serviço</TabsTrigger>
          <TabsTrigger value="map">Visualização do Mapa</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="regions" className="space-y-6">
          {/* Form para criar nova região */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nova Região de Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="regionName">Nome da Região</Label>
                  <Input
                    id="regionName"
                    placeholder="Ex: São Paulo - SP"
                    value={newRegion.name}
                    onChange={(e) => setNewRegion(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="regionType">Tipo de Região</Label>
                  <Select 
                    value={newRegion.type} 
                    onValueChange={(value) => setNewRegion(prev => ({ ...prev, type: value as ServiceRegion['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="country">País</SelectItem>
                      <SelectItem value="state">Estado</SelectItem>
                      <SelectItem value="city">Cidade</SelectItem>
                      <SelectItem value="custom">Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="parentRegion">Região Pai (Opcional)</Label>
                  <Select
                    value={newRegion.parent_region_id}
                    onValueChange={(value) => setNewRegion(prev => ({ ...prev, parent_region_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar região pai" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name} ({region.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={createRegion} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Região
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de regiões */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Regiões Configuradas</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar regiões..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRegions.map((region) => (
                  <div
                    key={region.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{region.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{region.type}</Badge>
                          <Badge variant={region.active ? "default" : "secondary"}>
                            {region.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                      
                      {regionStats[region.id] && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Restaurantes:</span>
                            <span className="ml-1 font-medium">
                              {regionStats[region.id].activeRestaurants}/{regionStats[region.id].totalRestaurants}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Pedidos:</span>
                            <span className="ml-1 font-medium">{regionStats[region.id].totalOrders}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={region.active}
                        onCheckedChange={(checked) => toggleRegionStatus(region.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRegion(region.id)}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRegion(region.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Mapa de Regiões de Serviço
              </CardTitle>
              <p className="text-gray-600">
                Visualize e configure as áreas onde a plataforma está disponível
              </p>
            </CardHeader>
            <CardContent>
              <DeliveryZoneMap
                zones={[]}
                onZonesChange={(zones) => console.log('Zones updated:', zones)}
                editable={true}
                center={{ lat: -14.235, lng: -51.9253 }} // Centro do Brasil
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Regiões</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {regions.filter(r => r.active).length} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cobertura Total</CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  Das áreas metropolitanas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Restaurantes Ativos</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(regionStats).reduce((sum, stats) => sum + stats.activeRestaurants, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Em todas as regiões
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Totais</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(regionStats).reduce((sum, stats) => sum + stats.totalOrders, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Este mês
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance por Região</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regions.map((region) => {
                  const stats = regionStats[region.id];
                  if (!stats) return null;

                  return (
                    <div key={region.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{region.name}</h3>
                        <p className="text-sm text-gray-500">{region.type}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-bold">{stats.activeRestaurants}</div>
                          <div className="text-gray-500">Restaurantes</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{stats.totalOrders}</div>
                          <div className="text-gray-500">Pedidos</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{stats.coverage}%</div>
                          <div className="text-gray-500">Cobertura</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMaps;
