
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Printer, 
  Settings, 
  TestTube, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Wifi,
  Usb,
  Bluetooth
} from 'lucide-react';
import { printerService, type PrinterConfig } from '@/services/printerService';
import { toast } from 'sonner';

interface PrinterConfigurationProps {
  restaurantId: string;
}

export const PrinterConfiguration = ({ restaurantId }: PrinterConfigurationProps) => {
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [testingPrinter, setTestingPrinter] = useState<string | null>(null);

  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = () => {
    const configuredPrinters = printerService.getPrinters();
    setPrinters(configuredPrinters);
  };

  const detectPrinters = async () => {
    setIsDetecting(true);
    try {
      const detectedPrinters = await printerService.detectPrinters();
      setPrinters(detectedPrinters);
      toast.success(`${detectedPrinters.length} impressoras detectadas`);
    } catch (error) {
      toast.error('Erro ao detectar impressoras');
    } finally {
      setIsDetecting(false);
    }
  };

  const testPrinter = async (printerId: string) => {
    setTestingPrinter(printerId);
    try {
      const success = await printerService.testPrinter(printerId);
      if (success) {
        toast.success('Teste de impressão enviado');
      } else {
        toast.error('Falha no teste de impressão');
      }
    } catch (error) {
      toast.error('Erro ao testar impressora');
    } finally {
      setTestingPrinter(null);
    }
  };

  const savePrinter = async (config: PrinterConfig) => {
    try {
      const success = await printerService.configurePrinter(config);
      if (success) {
        loadPrinters();
        setIsEditing(false);
        setSelectedPrinter(null);
        toast.success('Impressora configurada com sucesso');
      } else {
        toast.error('Erro ao configurar impressora');
      }
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    }
  };

  const setDefaultPrinter = async (printerId: string) => {
    try {
      const success = await printerService.setDefaultPrinter(printerId);
      if (success) {
        loadPrinters();
        toast.success('Impressora padrão definida');
      } else {
        toast.error('Erro ao definir impressora padrão');
      }
    } catch (error) {
      toast.error('Erro ao definir impressora padrão');
    }
  };

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'usb': return <Usb className="h-4 w-4" />;
      case 'network': return <Wifi className="h-4 w-4" />;
      case 'bluetooth': return <Bluetooth className="h-4 w-4" />;
      default: return <Printer className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuração de Impressoras</h2>
          <p className="text-gray-600">Configure e gerencie as impressoras do restaurante</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={detectPrinters} disabled={isDetecting}>
            {isDetecting ? 'Detectando...' : 'Detectar Impressoras'}
          </Button>
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Impressora
          </Button>
        </div>
      </div>

      {/* Lista de Impressoras */}
      <div className="grid gap-4">
        {printers.map((printer) => (
          <Card key={printer.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getConnectionIcon(printer.connection)}
                    <div>
                      <h3 className="font-semibold">{printer.name}</h3>
                      <p className="text-sm text-gray-600">
                        {printer.type} • {printer.connection} • {printer.width}mm
                      </p>
                      {printer.ipAddress && (
                        <p className="text-xs text-gray-500">{printer.ipAddress}:{printer.port}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {printer.defaultPrinter && (
                      <Badge variant="default">Padrão</Badge>
                    )}
                    {printer.enabled ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Inativa
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testPrinter(printer.id)}
                    disabled={testingPrinter === printer.id}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testingPrinter === printer.id ? 'Testando...' : 'Testar'}
                  </Button>
                  
                  {!printer.defaultPrinter && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDefaultPrinter(printer.id)}
                    >
                      Definir Padrão
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPrinter(printer);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Edição */}
      {isEditing && (
        <PrinterEditModal
          printer={selectedPrinter}
          onSave={savePrinter}
          onCancel={() => {
            setIsEditing(false);
            setSelectedPrinter(null);
          }}
        />
      )}
    </div>
  );
};

// Modal de edição de impressora
interface PrinterEditModalProps {
  printer: PrinterConfig | null;
  onSave: (config: PrinterConfig) => void;
  onCancel: () => void;
}

const PrinterEditModal = ({ printer, onSave, onCancel }: PrinterEditModalProps) => {
  const [config, setConfig] = useState<PrinterConfig>(
    printer || {
      id: `printer-${Date.now()}`,
      name: '',
      type: 'thermal',
      connection: 'usb',
      width: 80,
      enabled: true,
      defaultPrinter: false
    }
  );

  return (
    <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {printer ? 'Editar Impressora' : 'Nova Impressora'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Impressora</Label>
            <Input
              id="name"
              value={config.name}
              onChange={(e) => setConfig({...config, name: e.target.value})}
              placeholder="Ex: Epson TM-T20II"
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={config.type} onValueChange={(value: any) => setConfig({...config, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thermal">Térmica</SelectItem>
                <SelectItem value="laser">Laser</SelectItem>
                <SelectItem value="inkjet">Jato de Tinta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="connection">Conexão</Label>
            <Select value={config.connection} onValueChange={(value: any) => setConfig({...config, connection: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usb">USB</SelectItem>
                <SelectItem value="network">Rede</SelectItem>
                <SelectItem value="bluetooth">Bluetooth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.connection === 'network' && (
            <>
              <div>
                <Label htmlFor="ip">Endereço IP</Label>
                <Input
                  id="ip"
                  value={config.ipAddress || ''}
                  onChange={(e) => setConfig({...config, ipAddress: e.target.value})}
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <Label htmlFor="port">Porta</Label>
                <Input
                  id="port"
                  type="number"
                  value={config.port || ''}
                  onChange={(e) => setConfig({...config, port: parseInt(e.target.value)})}
                  placeholder="9100"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="width">Largura (mm)</Label>
            <Select value={config.width.toString()} onValueChange={(value) => setConfig({...config, width: parseInt(value)})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="58">58mm</SelectItem>
                <SelectItem value="80">80mm</SelectItem>
                <SelectItem value="110">110mm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Impressora Ativa</Label>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={() => onSave(config)} className="flex-1">
              Salvar
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
