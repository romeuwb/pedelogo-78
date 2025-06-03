
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tag, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminCoupons = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    tipo_desconto: 'percentual',
    valor_desconto: '',
    valor_minimo_pedido: '',
    limite_uso: '',
    data_inicio: '',
    data_fim: '',
    apenas_novos_clientes: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createCoupon = useMutation({
    mutationFn: async (couponData: any) => {
      const { error } = await supabase
        .from('coupons')
        .insert({
          ...couponData,
          valor_desconto: Number(couponData.valor_desconto),
          valor_minimo_pedido: couponData.valor_minimo_pedido ? Number(couponData.valor_minimo_pedido) : 0,
          limite_uso: couponData.limite_uso ? Number(couponData.limite_uso) : null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setIsCreateOpen(false);
      setFormData({
        codigo: '',
        tipo_desconto: 'percentual',
        valor_desconto: '',
        valor_minimo_pedido: '',
        limite_uso: '',
        data_inicio: '',
        data_fim: '',
        apenas_novos_clientes: false
      });
      toast({
        title: 'Sucesso',
        description: 'Cupom criado com sucesso'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar cupom',
        variant: 'destructive'
      });
    }
  });

  const toggleCouponStatus = useMutation({
    mutationFn: async ({ couponId, ativo }: { couponId: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('coupons')
        .update({ ativo })
        .eq('id', couponId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      toast({
        title: 'Sucesso',
        description: 'Status do cupom atualizado'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCoupon.mutate(formData);
  };

  const getCouponStatus = (coupon: any) => {
    const now = new Date();
    const inicio = new Date(coupon.data_inicio);
    const fim = new Date(coupon.data_fim);
    
    if (!coupon.ativo) return { label: 'Inativo', color: 'bg-gray-100 text-gray-800' };
    if (now < inicio) return { label: 'Agendado', color: 'bg-blue-100 text-blue-800' };
    if (now > fim) return { label: 'Expirado', color: 'bg-red-100 text-red-800' };
    if (coupon.limite_uso && coupon.usos_realizados >= coupon.limite_uso) {
      return { label: 'Esgotado', color: 'bg-orange-100 text-orange-800' };
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
          <h1 className="text-2xl font-bold text-gray-900">Cupons e Promoções</h1>
          <p className="text-gray-600">Gerencie cupons de desconto e promoções</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Cupom</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="codigo">Código do Cupom</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value.toUpperCase()})}
                  placeholder="DESCONTO10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo_desconto">Tipo de Desconto</Label>
                <Select 
                  value={formData.tipo_desconto} 
                  onValueChange={(value) => setFormData({...formData, tipo_desconto: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentual">Percentual (%)</SelectItem>
                    <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor_desconto">
                  Valor do Desconto {formData.tipo_desconto === 'percentual' ? '(%)' : '(R$)'}
                </Label>
                <Input
                  id="valor_desconto"
                  type="number"
                  step="0.01"
                  value={formData.valor_desconto}
                  onChange={(e) => setFormData({...formData, valor_desconto: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="valor_minimo_pedido">Valor Mínimo do Pedido (R$)</Label>
                <Input
                  id="valor_minimo_pedido"
                  type="number"
                  step="0.01"
                  value={formData.valor_minimo_pedido}
                  onChange={(e) => setFormData({...formData, valor_minimo_pedido: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="limite_uso">Limite de Uso</Label>
                <Input
                  id="limite_uso"
                  type="number"
                  value={formData.limite_uso}
                  onChange={(e) => setFormData({...formData, limite_uso: e.target.value})}
                  placeholder="Deixe vazio para ilimitado"
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
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="datetime-local"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createCoupon.isPending}>
                {createCoupon.isPending ? 'Criando...' : 'Criar Cupom'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Cupons</span>
            {coupons && <Badge variant="secondary">{coupons.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons?.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">
                      {coupon.codigo}
                    </TableCell>
                    <TableCell>
                      {coupon.tipo_desconto === 'percentual' 
                        ? `${coupon.valor_desconto}%`
                        : `R$ ${Number(coupon.valor_desconto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      }
                      {coupon.valor_minimo_pedido > 0 && (
                        <div className="text-sm text-gray-500">
                          Mín: R$ {Number(coupon.valor_minimo_pedido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(coupon.data_inicio).toLocaleDateString('pt-BR')}</div>
                        <div className="text-gray-500">até {new Date(coupon.data_fim).toLocaleDateString('pt-BR')}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {coupon.usos_realizados || 0}
                        {coupon.limite_uso && ` / ${coupon.limite_uso}`}
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
                          variant={coupon.ativo ? "destructive" : "default"}
                          onClick={() => toggleCouponStatus.mutate({ 
                            couponId: coupon.id, 
                            ativo: !coupon.ativo 
                          })}
                        >
                          {coupon.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
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
