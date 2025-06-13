
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Map, Plus, Edit, Trash2, MapPin, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceRegion {
  id: string;
  name: string;
  type: 'country' | 'state' | 'city' | 'custom';
  parent_region_id: string | null;
  coordinates?: any;
  active: boolean;
  created_at: string;
}

const AdminMaps = () => {
  const [regions, setRegions] = useState<ServiceRegion[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'city' as const,
    parent_region_id: '',
    active: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For now, we'll use a mock implementation since service_regions table doesn't exist
  // This demonstrates the UI structure that would work once the table is created
  const mockRegions: ServiceRegion[] = [
    {
      id: '1',
      name: 'Brasil',
      type: 'country',
      parent_region_id: null,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'São Paulo',
      type: 'state',
      parent_region_id: '1',
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'São Paulo Capital',
      type: 'city',
      parent_region_id: '2',
      active: true,
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Using mock data for now
    setRegions(mockRegions);
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock implementation - would integrate with real database
    const newRegion: ServiceRegion = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      parent_region_id: formData.parent_region_id || null,
      active: formData.active,
      created_at: new Date().toISOString()
    };

    setRegions(prev => [...prev, newRegion]);
    setIsCreateOpen(false);
    setFormData({
      name: '',
      type: 'city',
      parent_region_id: '',
      active: true
    });

    toast({
      title: 'Sucesso',
      description: 'Região criada com sucesso'
    });
  };

  const toggleRegionStatus = (regionId: string) => {
    setRegions(prev => 
      prev.map(region => 
        region.id === regionId 
          ? { ...region, active: !region.active }
          : region
      )
    );

    toast({
      title: 'Sucesso',
      description: 'Status da região atualizado'
    });
  };

  const getParentRegions = () => {
    return regions.filter(region => region.type !== 'custom');
  };

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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Região</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: São Paulo, Rio de Janeiro..."
                  required
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

              <div>
                <Label htmlFor="parent_region_id">Região Pai (Opcional)</Label>
                <Select 
                  value={formData.parent_region_id} 
                  onValueChange={(value) => setFormData({...formData, parent_region_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar região pai..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {getParentRegions().map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name} ({getRegionTypeLabel(region.type)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Criar Região
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mapa Visual (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Visualização do Mapa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Mapa Interativo
              </h3>
              <p className="text-gray-500 max-w-md">
                Aqui será exibido o mapa interativo onde você pode visualizar e editar 
                as regiões de atendimento. Integração com Google Maps em desenvolvimento.
              </p>
            </div>
          </div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Região Pai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.map((region) => {
                const parentRegion = regions.find(r => r.id === region.parent_region_id);
                return (
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
                      {parentRegion ? parentRegion.name : '-'}
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
                          onClick={() => toggleRegionStatus(region.id)}
                        >
                          {region.active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {regions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma região configurada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
