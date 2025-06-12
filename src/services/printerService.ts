
interface PrinterConfig {
  id: string;
  name: string;
  type: 'thermal' | 'laser' | 'inkjet';
  connection: 'usb' | 'network' | 'bluetooth';
  ipAddress?: string;
  port?: number;
  width: number;
  enabled: boolean;
  defaultPrinter: boolean;
}

interface PrintJob {
  id: string;
  content: string;
  type: 'order' | 'receipt' | 'kitchen' | 'bar';
  printerId?: string;
  copies: number;
  priority: 'low' | 'normal' | 'high';
}

class PrinterService {
  private printers: PrinterConfig[] = [];
  private printQueue: PrintJob[] = [];

  // Detectar impressoras disponíveis
  async detectPrinters(): Promise<PrinterConfig[]> {
    try {
      // Simular detecção de impressoras (em produção seria uma API nativa)
      const mockPrinters: PrinterConfig[] = [
        {
          id: 'printer-1',
          name: 'Epson TM-T20II',
          type: 'thermal',
          connection: 'usb',
          width: 80,
          enabled: true,
          defaultPrinter: false
        },
        {
          id: 'printer-2',
          name: 'Bematech MP-4200',
          type: 'thermal',
          connection: 'network',
          ipAddress: '192.168.1.100',
          port: 9100,
          width: 58,
          enabled: false,
          defaultPrinter: false
        }
      ];

      this.printers = mockPrinters;
      return mockPrinters;
    } catch (error) {
      console.error('Erro ao detectar impressoras:', error);
      return [];
    }
  }

  // Configurar impressora
  async configurePrinter(config: PrinterConfig): Promise<boolean> {
    try {
      const index = this.printers.findIndex(p => p.id === config.id);
      if (index >= 0) {
        this.printers[index] = config;
      } else {
        this.printers.push(config);
      }

      // Salvar configuração no localStorage
      localStorage.setItem('printer-configs', JSON.stringify(this.printers));
      return true;
    } catch (error) {
      console.error('Erro ao configurar impressora:', error);
      return false;
    }
  }

  // Testar impressora
  async testPrinter(printerId: string): Promise<boolean> {
    try {
      const printer = this.printers.find(p => p.id === printerId);
      if (!printer) {
        throw new Error('Impressora não encontrada');
      }

      const testContent = this.generateTestPage(printer);
      return await this.print({
        id: `test-${Date.now()}`,
        content: testContent,
        type: 'receipt',
        printerId,
        copies: 1,
        priority: 'normal'
      });
    } catch (error) {
      console.error('Erro ao testar impressora:', error);
      return false;
    }
  }

  // Imprimir
  async print(job: PrintJob): Promise<boolean> {
    try {
      const printer = this.printers.find(p => p.id === job.printerId) || 
                     this.printers.find(p => p.defaultPrinter);

      if (!printer || !printer.enabled) {
        throw new Error('Nenhuma impressora disponível');
      }

      // Simular impressão (em produção seria chamada para API nativa)
      console.log(`Imprimindo na ${printer.name}:`, job.content);

      // Abrir janela de impressão do navegador como fallback
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Impressão - ${job.type}</title>
              <style>
                body { 
                  font-family: monospace; 
                  font-size: 12px; 
                  margin: 0; 
                  padding: 10px;
                  width: ${printer.width}mm;
                }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              <pre>${job.content}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }

      return true;
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      return false;
    }
  }

  // Gerar página de teste
  private generateTestPage(printer: PrinterConfig): string {
    const date = new Date().toLocaleString('pt-BR');
    return `
================================
        TESTE DE IMPRESSÃO
================================

Impressora: ${printer.name}
Tipo: ${printer.type}
Conexão: ${printer.connection}
Largura: ${printer.width}mm

Data/Hora: ${date}

================================
Este é um teste de impressão.
Se você conseguir ler isso,
a impressora está funcionando
corretamente.
================================

Linhas de teste:
1. Primeira linha
2. Segunda linha
3. Terceira linha

--------------------------------
Fim do teste
`;
  }

  // Formatar pedido para impressão
  formatOrderForPrint(order: any, type: 'kitchen' | 'receipt'): string {
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
  }

  // Obter impressoras configuradas
  getPrinters(): PrinterConfig[] {
    const saved = localStorage.getItem('printer-configs');
    if (saved) {
      this.printers = JSON.parse(saved);
    }
    return this.printers;
  }

  // Definir impressora padrão
  async setDefaultPrinter(printerId: string): Promise<boolean> {
    try {
      this.printers.forEach(p => p.defaultPrinter = false);
      const printer = this.printers.find(p => p.id === printerId);
      if (printer) {
        printer.defaultPrinter = true;
        localStorage.setItem('printer-configs', JSON.stringify(this.printers));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao definir impressora padrão:', error);
      return false;
    }
  }
}

export const printerService = new PrinterService();
export type { PrinterConfig, PrintJob };
