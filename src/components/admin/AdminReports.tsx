
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  Calendar,
  Filter,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

interface ReportData {
  id: string;
  name: string;
  type: 'orders' | 'revenue' | 'users' | 'restaurants' | 'delivery';
  period: string;
  data: any;
  generated_at: string;
  generated_by: string;
}

interface ReportFilters {
  dateRange: DateRange | undefined;
  reportType: string;
  region: string;
  status: string;
}

const AdminReports = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: undefined,
    reportType: 'all',
    region: 'all',
    status: 'all'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'orders', label: 'Relatório de Pedidos', icon: ShoppingBag },
    { value: 'revenue', label: 'Relatório de Receita', icon: DollarSign },
    { value: 'users', label: 'Relatório de Usuários', icon: Users },
    { value: 'restaurants', label: 'Relatório de Restaurantes', icon: BarChart3 },
    { value: 'delivery', label: 'Relatório de Entregadores', icon: TrendingUp }
  ];

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      const reportData = await generateReportData(type, filters);
      
      const { data, error } = await supabase
        .from('admin_reports')
        .insert([{
          name: `Relatório ${reportTypes.find(t => t.value === type)?.label} - ${new Date().toLocaleDateString()}`,
          type,
          period: filters.dateRange ? 
            `${filters.dateRange.from?.toLocaleDateString()} - ${filters.dateRange.to?.toLocaleDateString()}` :
            'Todos os períodos',
          data: reportData,
          generated_by: 'admin' // Replace with actual user ID
        }])
        .select()
        .single();

      if (error) throw error;

      setReports(prev => [data, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Relatório gerado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportData = async (type: string, filters: ReportFilters) => {
    // Simulate different report data based on type
    switch (type) {
      case 'orders':
        return {
          totalOrders: Math.floor(Math.random() * 1000) + 500,
          completedOrders: Math.floor(Math.random() * 800) + 400,
          cancelledOrders: Math.floor(Math.random() * 50) + 10,
          averageOrderValue: (Math.random() * 50 + 25).toFixed(2),
          topRestaurants: [
            { name: 'Restaurante A', orders: 45 },
            { name: 'Restaurante B', orders: 38 },
            { name: 'Restaurante C', orders: 32 }
          ]
        };
      case 'revenue':
        return {
          totalRevenue: (Math.random() * 50000 + 20000).toFixed(2),
          platformFee: (Math.random() * 5000 + 2000).toFixed(2),
          restaurantRevenue: (Math.random() * 40000 + 15000).toFixed(2),
          deliveryRevenue: (Math.random() * 8000 + 3000).toFixed(2),
          monthlyGrowth: (Math.random() * 20 + 5).toFixed(1) + '%'
        };
      case 'users':
        return {
          totalUsers: Math.floor(Math.random() * 5000) + 2000,
          newUsers: Math.floor(Math.random() * 500) + 100,
          activeUsers: Math.floor(Math.random() * 3000) + 1500,
          userRetention: (Math.random() * 30 + 60).toFixed(1) + '%',
          topRegions: [
            { region: 'São Paulo', users: 850 },
            { region: 'Rio de Janeiro', users: 640 },
            { region: 'Belo Horizonte', users: 420 }
          ]
        };
      default:
        return { message: 'Dados do relatório não disponíveis' };
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Create CSV content
      const csvContent = convertToCSV(report.data, report.type);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.name}.csv`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Relatório baixado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o relatório.",
        variant: "destructive"
      });
    }
  };

  const convertToCSV = (data: any, type: string) => {
    // Simple CSV conversion - could be enhanced
    let csv = '';
    
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        csv += `${key}\n`;
        value.forEach((item: any) => {
          csv += Object.values(item).join(',') + '\n';
        });
        csv += '\n';
      } else {
        csv += `${key},${value}\n`;
      }
    });
    
    return csv;
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>
          <p className="text-gray-600">Gere e visualize relatórios detalhados da plataforma</p>
        </div>
      </div>

      {/* Filtros de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Geração de Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Período</Label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
              />
            </div>
            
            <div>
              <Label>Tipo de Relatório</Label>
              <Select 
                value={filters.reportType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Região</Label>
              <Select 
                value={filters.region} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Regiões</SelectItem>
                  <SelectItem value="sp">São Paulo</SelectItem>
                  <SelectItem value="rj">Rio de Janeiro</SelectItem>
                  <SelectItem value="mg">Minas Gerais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant="outline"
                  onClick={() => generateReport(type.value)}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios Gerados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Gerados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => {
              const reportType = reportTypes.find(t => t.value === report.type);
              const Icon = reportType?.icon || FileText;
              
              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{reportType?.label || report.type}</Badge>
                        <span className="text-sm text-gray-500">
                          Gerado em {new Date(report.generated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Período: {report.period}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReport(report.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              );
            })}

            {reports.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum relatório gerado ainda.</p>
                <p className="text-sm">Use os filtros acima para gerar seu primeiro relatório.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
