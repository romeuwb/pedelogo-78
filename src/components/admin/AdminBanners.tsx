
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Image, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminBanners = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    imagem_url: '',
    link_url: '',
    posicao: '',
    data_inicio: '',
    data_fim: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('posicao', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const createBanner = useMutation({
    mutationFn: async (bannerData: any) => {
      const { error } = await supabase
        .from('banners')
        .insert({
          ...bannerData,
          posicao: bannerData.posicao ? Number(bannerData.posicao) : 0,
          data_inicio: bannerData.data_inicio || null,
          data_fim: bannerData.data_fim || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      setIsCreateOpen(false);
      setFormData({
        titulo: '',
        descricao: '',
        imagem_url: '',
        link_url: '',
        posicao: '',
        data_inicio: '',
        data_fim: ''
      });
      toast({
        title: 'Sucesso',
        description: 'Banner criado com sucesso'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar banner',
        variant: 'destructive'
      });
    }
  });

  const toggleBannerStatus = useMutation({
    mutationFn: async ({ bannerId, ativo }: { bannerId: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('banners')
        .update({ ativo })
        .eq('id', bannerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      toast({
        title: 'Sucesso',
        description: 'Status do banner atualizado'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBanner.mutate(formData);
  };

  const getBannerStatus = (banner: any) => {
    const now = new Date();
    
    if (!banner.ativo) return { label: 'Inativo', color: 'bg-gray-100 text-gray-800' };
    
    if (banner.data_inicio && new Date(banner.data_inicio) > now) {
      return { label: 'Agendado', color: 'bg-blue-100 text-blue-800' };
    }
    
    if (banner.data_fim && new Date(banner.data_fim) < now) {
      return { label: 'Expirado', color: 'bg-red-100 text-red-800' };
    }
    
    return { label: 'Ativo', color: 'bg-green-100 text-green-800' };
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners e Destaques</h1>
          <p className="text-gray-600">Gerencie banners promocionais e destaques da plataforma</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Banner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="imagem_url">URL da Imagem</Label>
                <Input
                  id="imagem_url"
                  type="url"
                  value={formData.imagem_url}
                  onChange={(e) => setFormData({...formData, imagem_url: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="link_url">URL de Destino</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="posicao">Posição</Label>
                <Input
                  id="posicao"
                  type="number"
                  value={formData.posicao}
                  onChange={(e) => setFormData({...formData, posicao: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início</Label>
                  <Input
                    id="data_inicio"
                    type="datetime-local"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="datetime-local"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createBanner.isPending}>
                {createBanner.isPending ? 'Criando...' : 'Criar Banner'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="h-5 w-5" />
            <span>Banners</span>
            {banners && <Badge variant="secondary">{banners.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Imagem</TableHead>
                <TableHead>Posição</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners?.map((banner) => {
                const status = getBannerStatus(banner);
                return (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{banner.titulo}</div>
                        {banner.descricao && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {banner.descricao}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <img 
                        src={banner.imagem_url} 
                        alt={banner.titulo}
                        className="w-16 h-10 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{banner.posicao}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {banner.data_inicio && (
                          <div>Início: {new Date(banner.data_inicio).toLocaleDateString('pt-BR')}</div>
                        )}
                        {banner.data_fim && (
                          <div>Fim: {new Date(banner.data_fim).toLocaleDateString('pt-BR')}</div>
                        )}
                        {!banner.data_inicio && !banner.data_fim && (
                          <span className="text-gray-500">Permanente</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={banner.ativo ? "destructive" : "default"}
                          onClick={() => toggleBannerStatus.mutate({ 
                            bannerId: banner.id, 
                            ativo: !banner.ativo 
                          })}
                        >
                          {banner.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {banner.link_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
