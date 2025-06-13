
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePrinterWebSocket } from './usePrinterWebSocket';

export interface RestaurantPrinter {
  id: string;
  restaurant_id: string;
  name: string;
  type: 'thermal' | 'laser' | 'inkjet';
  connection_type: 'usb' | 'network' | 'bluetooth';
  ip_address?: string;
  port?: number;
  width: number;
  enabled: boolean;
  is_default: boolean;
  api_endpoint?: string;
  api_key?: string;
  config_data: any;
  created_at: string;
  updated_at: string;
}

export interface PrintJob {
  id: string;
  restaurant_id: string;
  printer_id?: string;
  job_type: 'order' | 'receipt' | 'kitchen' | 'bar' | 'test';
  content: string;
  copies: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  order_id?: string;
  error_message?: string;
  retries: number;
  max_retries: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PrinterConnection {
  id: string;
  restaurant_id: string;
  connection_id: string;
  api_endpoint: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  last_heartbeat?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useEnhancedPrinters = (restaurantId: string) => {
  const [printers, setPrinters] = useState<RestaurantPrinter[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [connections, setConnections] = useState<PrinterConnection[]>([]);
  const [loading, setLoading] = useState(false);

  // Configuração da API local do primeiro printer (fallback)
  const defaultApiConfig = printers.find(p => p.api_endpoint)?.api_endpoint || '';
  const defaultApiKey = printers.find(p => p.api_key)?.api_key || '';

  const {
    isConnected,
    connectionStatus,
    lastError,
    sendPrintJob,
    updatePrinterStatus,
    connect,
    disconnect
  } = usePrinterWebSocket(restaurantId, defaultApiKey);

  // Carregar impressoras
  const loadPrinters = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_printers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('name');

      if (error) throw error;
      setPrinters(data || []);
    } catch (error) {
      console.error('Error loading printers:', error);
      toast.error('Erro ao carregar impressoras');
    }
  };

  // Carregar trabalhos de impressão
  const loadPrintJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('print_jobs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPrintJobs(data || []);
    } catch (error) {
      console.error('Error loading print jobs:', error);
    }
  };

  // Carregar conexões
  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('printer_connections')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  // Configurar impressora
  const configurePrinter = async (printer: Partial<RestaurantPrinter>) => {
    try {
      setLoading(true);
      
      const printerData = {
        ...printer,
        restaurant_id: restaurantId,
        updated_at: new Date().toISOString()
      };

      let result;
      if (printer.id) {
        const { data, error } = await supabase
          .from('restaurant_printers')
          .update(printerData)
          .eq('id', printer.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('restaurant_printers')
          .insert(printerData)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      await loadPrinters();
      toast.success('Impressora configurada com sucesso');
      return result;
    } catch (error) {
      console.error('Error configuring printer:', error);
      toast.error('Erro ao configurar impressora');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Definir impressora padrão
  const setDefaultPrinter = async (printerId: string) => {
    try {
      const { error } = await supabase
        .from('restaurant_printers')
        .update({ is_default: true })
        .eq('id', printerId)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      
      await loadPrinters();
      toast.success('Impressora padrão definida');
    } catch (error) {
      console.error('Error setting default printer:', error);
      toast.error('Erro ao definir impressora padrão');
    }
  };

  // Testar impressora
  const testPrinter = async (printerId: string) => {
    const printer = printers.find(p => p.id === printerId);
    if (!printer) {
      toast.error('Impressora não encontrada');
      return false;
    }

    const testContent = generateTestContent(printer);
    
    return sendPrintJob({
      printerId,
      type: 'test',
      content: testContent,
      copies: 1,
      priority: 'normal',
      apiEndpoint: printer.api_endpoint
    });
  };

  // Imprimir pedido
  const printOrder = async (order: any, type: 'kitchen' | 'receipt') => {
    const defaultPrinter = printers.find(p => p.is_default && p.enabled);
    if (!defaultPrinter) {
      toast.error('Nenhuma impressora padrão configurada');
      return false;
    }

    const content = formatOrderForPrint(order, type);
    
    return sendPrintJob({
      printerId: defaultPrinter.id,
      type,
      content,
      copies: 1,
      priority: 'normal',
      orderId: order.id,
      apiEndpoint: defaultPrinter.api_endpoint
    });
  };

  // Excluir impressora
  const deletePrinter = async (printerId: string) => {
    try {
      const { error } = await supabase
        .from('restaurant_printers')
        .delete()
        .eq('id', printerId)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      
      await loadPrinters();
      toast.success('Impressora removida');
    } catch (error) {
      console.error('Error deleting printer:', error);
      toast.error('Erro ao remover impressora');
    }
  };

  // Funções auxiliares
  const generateTestContent = (printer: RestaurantPrinter): string => {
    const date = new Date().toLocaleString('pt-BR');
    return `
================================
        TESTE DE IMPRESSÃO
================================

Impressora: ${printer.name}
Tipo: ${printer.type}
Conexão: ${printer.connection_type}
Largura: ${printer.width}mm
${printer.ip_address ? `IP: ${printer.ip_address}:${printer.port}` : ''}

Data/Hora: ${date}

================================
Este é um teste de impressão.
Se você conseguir ler isso,
a impressora está funcionando
corretamente.
================================
    `;
  };

  const formatOrderForPrint = (order: any, type: 'kitchen' | 'receipt'): string => {
    const date = new Date(order.created_at).toLocaleString('pt-BR');
    
    if (type === 'kitchen') {
      return `
================================
         PEDIDO COZINHA
================================
Pedido: #${order.id.slice(-8)}
Data: ${date}
--------------------------------
${order.order_items?.map((item: any) => 
  `${item.quantidade}x ${item.nome_item}\n${item.observacoes ? `   Obs: ${item.observacoes}\n` : ''}`
).join('') || ''}
--------------------------------
Cliente: ${order.cliente_profile?.nome || 'N/A'}
${order.observacoes ? `\nObservações:\n${order.observacoes}` : ''}
================================
      `;
    } else {
      return `
================================
         COMPROVANTE
================================
Pedido: #${order.id.slice(-8)}
Data: ${date}
Cliente: ${order.cliente_profile?.nome || 'N/A'}
--------------------------------
${order.order_items?.map((item: any) => 
  `${item.quantidade}x ${item.nome_item.padEnd(20)} R$ ${(item.quantidade * item.preco_unitario).toFixed(2).padStart(8)}\n`
).join('') || ''}
--------------------------------
Total: R$ ${order.total.toFixed(2).padStart(20)}
${order.taxa_entrega ? `Taxa Entrega: R$ ${order.taxa_entrega.toFixed(2).padStart(10)}\n` : ''}
================================
      Obrigado pela preferência!
================================
      `;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (restaurantId) {
      loadPrinters();
      loadPrintJobs();
      loadConnections();
    }
  }, [restaurantId]);

  // Atualizar dados em tempo real
  useEffect(() => {
    if (!restaurantId) return;

    const printerSubscription = supabase
      .channel('restaurant_printers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'restaurant_printers', filter: `restaurant_id=eq.${restaurantId}` },
        () => loadPrinters()
      )
      .subscribe();

    const jobsSubscription = supabase
      .channel('print_jobs_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'print_jobs', filter: `restaurant_id=eq.${restaurantId}` },
        () => loadPrintJobs()
      )
      .subscribe();

    const connectionsSubscription = supabase
      .channel('printer_connections_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'printer_connections', filter: `restaurant_id=eq.${restaurantId}` },
        () => loadConnections()
      )
      .subscribe();

    return () => {
      printerSubscription.unsubscribe();
      jobsSubscription.unsubscribe();
      connectionsSubscription.unsubscribe();
    };
  }, [restaurantId]);

  return {
    // Estado
    printers,
    printJobs,
    connections,
    loading,
    
    // Estado da conexão WebSocket
    isConnected,
    connectionStatus,
    lastError,
    
    // Funções de gerenciamento
    configurePrinter,
    setDefaultPrinter,
    testPrinter,
    printOrder,
    deletePrinter,
    
    // Funções de conexão
    connect,
    disconnect,
    updatePrinterStatus,
    
    // Funções de recarregamento
    refreshPrinters: loadPrinters,
    refreshPrintJobs: loadPrintJobs,
    refreshConnections: loadConnections
  };
};
