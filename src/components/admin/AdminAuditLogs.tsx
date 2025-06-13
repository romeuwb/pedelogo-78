
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { 
  Shield, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

interface AuditLog {
  id: string;
  admin_id: string;
  admin_name?: string;
  acao: string;
  tabela_afetada?: string;
  registro_id?: string;
  dados_anteriores?: any;
  dados_novos?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface AuditFilters {
  dateRange: DateRange | undefined;
  adminUser: string;
  action: string;
  table: string;
  searchTerm: string;
}

const AdminAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<AuditFilters>({
    dateRange: undefined,
    adminUser: 'all',
    action: 'all',
    table: 'all',
    searchTerm: ''
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<Array<{ id: string; nome: string }>>([]);
  const { toast } = useToast();

  const actionTypes = [
    { value: 'CREATE', label: 'Criação', icon: CheckCircle, color: 'text-green-600' },
    { value: 'UPDATE', label: 'Atualização', icon: Settings, color: 'text-blue-600' },
    { value: 'DELETE', label: 'Exclusão', icon: XCircle, color: 'text-red-600' },
    { value: 'LOGIN', label: 'Login', icon: User, color: 'text-purple-600' },
    { value: 'SECURITY', label: 'Segurança', icon: Shield, color: 'text-orange-600' }
  ];

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          admin_users!inner(nome)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }
      if (filters.adminUser !== 'all') {
        query = query.eq('admin_id', filters.adminUser);
      }
      if (filters.action !== 'all') {
        query = query.eq('acao', filters.action);
      }
      if (filters.table !== 'all') {
        query = query.eq('tabela_afetada', filters.table);
      }
      if (filters.searchTerm) {
        query = query.or(`acao.ilike.%${filters.searchTerm}%,tabela_afetada.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to include admin name
      const logsWithAdminName = (data || []).map(log => ({
        ...log,
        admin_name: log.admin_users?.nome || 'Usuário não encontrado'
      }));
      
      setAuditLogs(logsWithAdminName);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs de auditoria.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id, nome')
        .eq('ativo', true);

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários admin:', error);
    }
  };

  const getActionIcon = (action: string) => {
    const actionType = actionTypes.find(type => action.includes(type.value));
    return actionType ? actionType.icon : AlertTriangle;
  };

  const getActionColor = (action: string) => {
    const actionType = actionTypes.find(type => action.includes(type.value));
    return actionType ? actionType.color : 'text-gray-600';
  };

  const formatLogData = (data: any) => {
    if (!data) return 'N/A';
    
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  useEffect(() => {
    loadAuditLogs();
    loadAdminUsers();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-gray-600">Monitore todas as ações administrativas da plataforma</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Período</Label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
              />
            </div>
            
            <div>
              <Label>Usuário Admin</Label>
              <Select 
                value={filters.adminUser} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, adminUser: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Usuários</SelectItem>
                  {adminUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de Ação</Label>
              <Select 
                value={filters.action} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ações</SelectItem>
                  {actionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tabela</Label>
              <Select 
                value={filters.table} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, table: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Tabelas</SelectItem>
                  <SelectItem value="users">Usuários</SelectItem>
                  <SelectItem value="restaurants">Restaurantes</SelectItem>
                  <SelectItem value="orders">Pedidos</SelectItem>
                  <SelectItem value="products">Produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar logs..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Registros de Auditoria ({auditLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => {
              const ActionIcon = getActionIcon(log.acao);
              const actionColor = getActionColor(log.acao);
              
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-center space-x-4">
                    <ActionIcon className={`h-6 w-6 ${actionColor}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{log.acao}</h3>
                        {log.tabela_afetada && (
                          <Badge variant="outline">{log.tabela_afetada}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.admin_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                        {log.ip_address && (
                          <span>IP: {log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            {auditLogs.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum log de auditoria encontrado.</p>
                <p className="text-sm">Ajuste os filtros para ver mais resultados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Log */}
      {selectedLog && (
        <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Detalhes do Log de Auditoria
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ação</Label>
                  <p className="font-medium">{selectedLog.acao}</p>
                </div>
                <div>
                  <Label>Usuário</Label>
                  <p className="font-medium">{selectedLog.admin_name}</p>
                </div>
                <div>
                  <Label>Tabela Afetada</Label>
                  <p className="font-medium">{selectedLog.tabela_afetada || 'N/A'}</p>
                </div>
                <div>
                  <Label>ID do Registro</Label>
                  <p className="font-medium font-mono text-sm">{selectedLog.registro_id || 'N/A'}</p>
                </div>
                <div>
                  <Label>Data/Hora</Label>
                  <p className="font-medium">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Endereço IP</Label>
                  <p className="font-medium">{selectedLog.ip_address || 'N/A'}</p>
                </div>
              </div>

              {selectedLog.dados_anteriores && (
                <div>
                  <Label>Dados Anteriores</Label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {formatLogData(selectedLog.dados_anteriores)}
                  </pre>
                </div>
              )}

              {selectedLog.dados_novos && (
                <div>
                  <Label>Dados Novos</Label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {formatLogData(selectedLog.dados_novos)}
                  </pre>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <Label>User Agent</Label>
                  <p className="text-sm text-gray-600 break-all">{selectedLog.user_agent}</p>
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminAuditLogs;
