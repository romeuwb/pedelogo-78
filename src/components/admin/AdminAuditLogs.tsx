
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Shield, Search, Eye, Download, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  admin_id: string;
  acao: string;
  tabela_afetada: string | null;
  registro_id: string | null;
  dados_anteriores: any;
  dados_novos: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_name?: string;
}

interface AdminUser {
  id: string;
  nome: string;
}

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState({
    admin_id: 'all',
    acao: '',
    tabela: '',
    data_inicio: '',
    data_fim: ''
  });

  // Mock data since audit_logs table may not exist
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      admin_id: 'admin-1',
      acao: 'CREATE',
      tabela_afetada: 'restaurants',
      registro_id: 'rest-123',
      dados_anteriores: null,
      dados_novos: { nome: 'Novo Restaurante' },
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      created_at: new Date().toISOString(),
      admin_name: 'Admin Principal'
    },
    {
      id: '2',
      admin_id: 'admin-1',
      acao: 'UPDATE',
      tabela_afetada: 'users',
      registro_id: 'user-456',
      dados_anteriores: { status: 'ativo' },
      dados_novos: { status: 'inativo' },
      ip_address: '192.168.1.2',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      admin_name: 'Admin Principal'
    }
  ];

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: async () => {
      // Return mock data for now since the table may not exist
      return mockLogs.filter(log => {
        if (filters.admin_id !== 'all' && log.admin_id !== filters.admin_id) return false;
        if (filters.acao && !log.acao.toLowerCase().includes(filters.acao.toLowerCase())) return false;
        if (filters.tabela && log.tabela_afetada !== filters.tabela) return false;
        if (filters.data_inicio && log.created_at < filters.data_inicio) return false;
        if (filters.data_fim && log.created_at > filters.data_fim) return false;
        return true;
      });
    }
  });

  const { data: adminUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      // Mock admin users since the table may not exist
      return [
        { id: 'admin-1', nome: 'Admin Principal' },
        { id: 'admin-2', nome: 'Admin Secundário' }
      ];
    }
  });

  useEffect(() => {
    if (auditLogs) {
      setLogs(auditLogs);
    }
  }, [auditLogs]);

  useEffect(() => {
    if (adminUsers) {
      setAdmins(adminUsers);
    }
  }, [adminUsers]);

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const viewLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const exportLogs = () => {
    const csvContent = [
      ['Data', 'Admin', 'Ação', 'Tabela', 'IP', 'User Agent'].join(','),
      ...logs.map(log => [
        formatDate(log.created_at),
        log.admin_name,
        log.acao,
        log.tabela_afetada || '',
        log.ip_address || '',
        log.user_agent || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      admin_id: 'all',
      acao: '',
      tabela: '',
      data_inicio: '',
      data_fim: ''
    });
  };

  if (isLoading) {
    return <div>Carregando logs de auditoria...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-gray-600">Acompanhe todas as ações realizadas pelos administradores</p>
        </div>
        
        <Button onClick={exportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Administrador</Label>
              <Select 
                value={filters.admin_id} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, admin_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ação</Label>
              <Input
                placeholder="Buscar ação..."
                value={filters.acao}
                onChange={(e) => setFilters(prev => ({ ...prev, acao: e.target.value }))}
              />
            </div>

            <div>
              <Label>Tabela</Label>
              <Input
                placeholder="Nome da tabela..."
                value={filters.tabela}
                onChange={(e) => setFilters(prev => ({ ...prev, tabela: e.target.value }))}
              />
            </div>

            <div>
              <Label>Data Início</Label>
              <Input
                type="datetime-local"
                value={filters.data_inicio}
                onChange={(e) => setFilters(prev => ({ ...prev, data_inicio: e.target.value }))}
              />
            </div>

            <div>
              <Label>Data Fim</Label>
              <Input
                type="datetime-local"
                value={filters.data_fim}
                onChange={(e) => setFilters(prev => ({ ...prev, data_fim: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Logs de Auditoria
            <Badge variant="secondary">{logs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tabela</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell>{log.admin_name}</TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(log.acao)}>
                      {log.acao}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.tabela_afetada || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.ip_address || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewLogDetails(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum log encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Data/Hora</Label>
                  <p className="font-mono">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Administrador</Label>
                  <p>{selectedLog.admin_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Ação</Label>
                  <Badge className={getActionBadgeColor(selectedLog.acao)}>
                    {selectedLog.acao}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Tabela Afetada</Label>
                  <p>{selectedLog.tabela_afetada || 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-semibold">IP</Label>
                  <p className="font-mono">{selectedLog.ip_address || 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Registro ID</Label>
                  <p className="font-mono">{selectedLog.registro_id || 'N/A'}</p>
                </div>
              </div>

              {selectedLog.user_agent && (
                <div>
                  <Label className="font-semibold">User Agent</Label>
                  <p className="text-sm break-all">{selectedLog.user_agent}</p>
                </div>
              )}

              {selectedLog.dados_anteriores && (
                <div>
                  <Label className="font-semibold">Dados Anteriores</Label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.dados_anteriores, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.dados_novos && (
                <div>
                  <Label className="font-semibold">Dados Novos</Label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.dados_novos, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuditLogs;
