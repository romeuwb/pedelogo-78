
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { BarChart, LineChart, PieChart, Download, TrendingUp, Users, DollarSign, Package } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  id: string;
  name: string;
  type: string;
  period: string;
  data: any;
  generated_by: string;
  created_at: string;
}

const AdminReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { toast } = useToast();

  // Mock data since admin_reports table doesn't exist
  const mockReports: ReportData[] = [
    {
      id: '1',
      name: 'Relatório de Vendas Mensal',
      type: 'sales',
      period: 'monthly',
      data: {
        totalOrders: 1250,
        completedOrders: 1180,
        cancelledOrders: 70,
        averageOrderValue: 'R$ 45.80',
        topRestaurants: [
          { name: 'Pizza Express', orders: 156 },
          { name: 'Burger House', orders: 143 }
        ]
      },
      generated_by: 'Sistema',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Relatório de Usuários',
      type: 'users',
      period: 'weekly',
      data: {
        totalUsers: 2840,
        newUsers: 234,
        activeUsers: 1956,
        retentionRate: '78%'
      },
      generated_by: 'Sistema',
      created_at: new Date().toISOString()
    }
  ];

  const { data: reports = mockReports, isLoading } = useQuery({
    queryKey: ['adminReports', selectedPeriod, selectedType],
    queryFn: async () => {
      // Since the table doesn't exist, return mock data
      return mockReports.filter(report => 
        selectedType === 'all' || report.type === selectedType
      );
    }
  });

  const generateReport = async (type: string) => {
    try {
      // Mock report generation
      const newReport: ReportData = {
        id: Date.now().toString(),
        name: `Relatório ${type} - ${new Date().toLocaleDateString('pt-BR')}`,
        type,
        period: selectedPeriod,
        data: {
          message: 'Relatório gerado com sucesso'
        },
        generated_by: 'Admin',
        created_at: new Date().toISOString()
      };

      toast({
        title: 'Sucesso',
        description: 'Relatório gerado com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar relatório',
        variant: 'destructive'
      });
    }
  };

  const downloadReport = (report: ReportData) => {
    const csvContent = `Relatório: ${report.name}\nTipo: ${report.type}\nPeríodo: ${report.period}\nDados: ${JSON.stringify(report.data, null, 2)}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'sales': return <DollarSign className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'products': return <Package className="h-4 w-4" />;
      default: return <BarChart className="h-4 w-4" />;
    }
  };

  const getReportTypeBadge = (type: string) => {
    const colors = {
      sales: 'bg-green-100 text-green-800',
      users: 'bg-blue-100 text-blue-800', 
      products: 'bg-purple-100 text-purple-800',
      financial: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <div>Carregando relatórios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios e Analytics</h1>
          <p className="text-gray-600">Gere e visualize relatórios detalhados da plataforma</p>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
                <p className="text-2xl font-bold">124</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Hoje</p>
                <p className="text-2xl font-bold">R$ 5.680</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Novos Usuários</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
                <p className="text-2xl font-bold">8.7%</p>
              </div>
              <BarChart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Geração de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Novo Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Relatório</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="users">Usuários</SelectItem>
                  <SelectItem value="products">Produtos</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Data Início</label>
                  <DatePicker date={startDate} onDateChange={setStartDate} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data Fim</label>
                  <DatePicker date={endDate} onDateChange={setEndDate} />
                </div>
              </>
            )}
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => generateReport('sales')}>
              <BarChart className="h-4 w-4 mr-2" />
              Gerar Relatório de Vendas
            </Button>
            <Button variant="outline" onClick={() => generateReport('users')}>
              <Users className="h-4 w-4 mr-2" />
              Gerar Relatório de Usuários
            </Button>
            <Button variant="outline" onClick={() => generateReport('financial')}>
              <DollarSign className="h-4 w-4 mr-2" />
              Gerar Relatório Financeiro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Relatórios Gerados
            <Badge variant="secondary">{reports.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Relatório</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Gerado por</TableHead>
                <TableHead>Data de Geração</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getReportTypeIcon(report.type)}
                      {report.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getReportTypeBadge(report.type)}>
                      {report.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>{report.generated_by}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadReport(report)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum relatório encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
