
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search,
  Edit,
  Trash2,
  Package,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminProduct {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  imagem_url: string;
  ingredientes: string[];
  calorias: number;
  tempo_preparo: number;
  vegano: boolean;
  vegetariano: boolean;
  livre_gluten: boolean;
  livre_lactose: boolean;
  codigo_barras: string;
  ativo: boolean;
  created_at: string;
}

export const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    imagem_url: '',
    ingredientes: '',
    calorias: 0,
    tempo_preparo: 0,
    vegano: false,
    vegetariano: false,
    livre_gluten: false,
    livre_lactose: false,
    codigo_barras: '',
    ativo: true
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['adminProducts', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('admin_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AdminProduct[];
    }
  });

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('admin_products')
        .insert({
          ...data,
          ingredientes: data.ingredientes.split(',').map((i: string) => i.trim()).filter(Boolean)
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({
        title: 'Sucesso',
        description: 'Produto criado com sucesso!'
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar produto: ' + error.message,
        variant: 'destructive'
      });
    }
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('admin_products')
        .update({
          ...data,
          ingredientes: data.ingredientes.split(',').map((i: string) => i.trim()).filter(Boolean)
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({
        title: 'Sucesso',
        description: 'Produto atualizado com sucesso!'
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar produto: ' + error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({
        title: 'Sucesso',
        description: 'Produto removido com sucesso!'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover produto: ' + error.message,
        variant: 'destructive'
      });
    }
  });

  const toggleProductStatus = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('admin_products')
        .update({ ativo })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    }
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      imagem_url: '',
      ingredientes: '',
      calorias: 0,
      tempo_preparo: 0,
      vegano: false,
      vegetariano: false,
      livre_gluten: false,
      livre_lactose: false,
      codigo_barras: '',
      ativo: true
    });
    setEditingProduct(null);
    setShowCreateModal(false);
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData({
      nome: product.nome,
      descricao: product.descricao || '',
      categoria: product.categoria,
      imagem_url: product.imagem_url || '',
      ingredientes: product.ingredientes?.join(', ') || '',
      calorias: product.calorias || 0,
      tempo_preparo: product.tempo_preparo || 0,
      vegano: product.vegano,
      vegetariano: product.vegetariano,
      livre_gluten: product.livre_gluten,
      livre_lactose: product.livre_lactose,
      codigo_barras: product.codigo_barras || '',
      ativo: product.ativo
    });
    setShowCreateModal(true);
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.categoria) {
      toast({
        title: 'Erro',
        description: 'Nome e categoria são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: formData });
    } else {
      createProduct.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos Globais</h1>
          <p className="text-gray-600">Gerencie produtos que podem ser usados por todos os restaurantes</p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Edite as informações do produto.' : 'Crie um novo produto que poderá ser usado por todos os restaurantes.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do produto"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Categoria do produto"
                />
              </div>
              
              <div>
                <Label htmlFor="codigo_barras">Código de Barras</Label>
                <Input
                  id="codigo_barras"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                  placeholder="Código de barras"
                />
              </div>
              
              <div>
                <Label htmlFor="calorias">Calorias</Label>
                <Input
                  id="calorias"
                  type="number"
                  value={formData.calorias}
                  onChange={(e) => setFormData({ ...formData, calorias: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="tempo_preparo">Tempo de Preparo (min)</Label>
                <Input
                  id="tempo_preparo"
                  type="number"
                  value={formData.tempo_preparo}
                  onChange={(e) => setFormData({ ...formData, tempo_preparo: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="imagem_url">URL da Imagem</Label>
                <Input
                  id="imagem_url"
                  value={formData.imagem_url}
                  onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="ingredientes">Ingredientes (separados por vírgula)</Label>
                <Textarea
                  id="ingredientes"
                  value={formData.ingredientes}
                  onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
                  placeholder="ingrediente1, ingrediente2, ingrediente3"
                  rows={2}
                />
              </div>
              
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="vegano"
                      checked={formData.vegano}
                      onCheckedChange={(checked) => setFormData({ ...formData, vegano: checked })}
                    />
                    <Label htmlFor="vegano">Vegano</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="vegetariano"
                      checked={formData.vegetariano}
                      onCheckedChange={(checked) => setFormData({ ...formData, vegetariano: checked })}
                    />
                    <Label htmlFor="vegetariano">Vegetariano</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="livre_gluten"
                      checked={formData.livre_gluten}
                      onCheckedChange={(checked) => setFormData({ ...formData, livre_gluten: checked })}
                    />
                    <Label htmlFor="livre_gluten">Livre de Glúten</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="livre_lactose"
                      checked={formData.livre_lactose}
                      onCheckedChange={(checked) => setFormData({ ...formData, livre_lactose: checked })}
                    />
                    <Label htmlFor="livre_lactose">Livre de Lactose</Label>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Produto Ativo</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {editingProduct ? 'Atualizar' : 'Criar'} Produto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Produtos Cadastrados</span>
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Características</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-medium">{product.nome}</p>
                      {product.descricao && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">{product.descricao}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.categoria}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={product.ativo ? "default" : "secondary"}>
                        {product.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleProductStatus.mutate({ 
                          id: product.id, 
                          ativo: !product.ativo 
                        })}
                      >
                        {product.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.vegano && <Badge variant="outline" className="text-xs">V</Badge>}
                      {product.vegetariano && <Badge variant="outline" className="text-xs">VG</Badge>}
                      {product.livre_gluten && <Badge variant="outline" className="text-xs">SG</Badge>}
                      {product.livre_lactose && <Badge variant="outline" className="text-xs">SL</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(product.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProduct.mutate(product.id)}
                        disabled={deleteProduct.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
