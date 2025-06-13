
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Bluetooth,
  Activity,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useEnhancedPrinters, type RestaurantPrinter } from '@/hooks/useEnhancedPrinters';
import { toast } from 'sonner';

interface EnhancedPrinterConfigurationProps {
  restaurantId: string;
}

export const EnhancedPrinterConfiguration = ({ restaurantId }: EnhancedPrinterConfigurationProps) => {
  const {
    printers,
    printJobs,
    connections,
    loading,
    isConnected,
    connectionStatus,
    lastError,
    configurePrinter,
    setDefaultPrinter,
    testPrinter,
    deletePrinter,
    connect,
    disconnect,
    refreshPrinters
  } = useEnhancedPrinters(restaurantId);

  const [selectedPrinter, setSelectedPrinter] = useState<RestaurantPrinter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [testingPrinter, setTestingPrinter] = useState<string | null>(null);

  const handleTestPrinter = async (printerId: string) => {
    setTestingPrinter(printerId);
    try {
      await testPrinter(printerId);
    } finally {
      setTestingPrinter(null);
    }
  };

  const getConnectionIcon = (connectionType: string) => {
    switch (connectionType) {
      case 'usb': return <Usb className="h-4 w-4" />;
      case 'network': return <Wifi className="h-4 w-4" />;
      case 'bluetooth': return <Bluetooth className="h-4 w-4" />;
      default: return <Printer className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 border-green-600';
      case 'connecting': return 'text-yellow-600 border-yellow-600';
      case 'error': return 'text-red-600 border-red-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  const recentJobs = printJobs.slice(0, 5);
  const currentConnection = connections.find(c => c.restaurant_id === restaurantId);

  return (
    <div className="space-y-6">
      {/* Header com Status da Conexão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Printer className="h-5 w-5 mr-2" />
                Sistema de Impressão
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Gerencie impressoras e monitore o status da conexão
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                <Badge variant="outline" className={getStatusColor(connectionStatus)}>
                  {connectionStatus === 'connected' && 'Conectado'}
                  {connectionStatus === 'connecting' && 'Conectando'}
                  {connectionStatus === 'disconnected' && 'Desconectado'}
                  {connectionStatus === 'error' && 'Erro'}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={isConnected ? disconnect : connect}
              >
                {isConnected ? 'Desconectar' : 'Conectar'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {lastError && (
          <CardContent>
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{lastError}</span>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração de Impressoras */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Impressoras Configuradas</CardTitle>
                <Button onClick={() => setIsEditing(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Impressora
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {printers.map((printer) => (
                  <Card key={printer.id} className="border">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getConnectionIcon(printer.connection_type)}
                            <div>
                              <h3 className="font-semibold">{printer.name}</h3>
                              <p className="text-sm text-gray-600">
                                {printer.type} • {printer.connection_type} • {printer.width}mm
                              </p>
                              {printer.ip_address && (
                                <p className="text-xs text-gray-500">
                                  {printer.ip_address}:{printer.port}
                                </p>
                              )}
                              {printer.api_endpoint && (
                                <p className="text-xs text-blue-600">
                                  API: {printer.api_endpoint}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {printer.is_default && (
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
                            onClick={() => handleTestPrinter(printer.id)}
                            disabled={testingPrinter === printer.id || !isConnected}
                          >
                            <TestTube className="h-4 w-4 mr-2" />
                            {testingPrinter === printer.id ? 'Testando...' : 'Testar'}
                          </Button>
                          
                          {!printer.is_default && (
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

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePrinter(printer.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {printers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Printer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma impressora configurada</p>
                    <p className="text-sm">Clique em "Nova Impressora" para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status e Histórico */}
        <div className="space-y-6">
          {/* Status da Conexão */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status da Conexão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentConnection ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant="outline" className={getStatusColor(currentConnection.status)}>
                        {currentConnection.status}
                      </Badge>
                    </div>
                    {currentConnection.last_heartbeat && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Último heartbeat:</span>
                        <span className="text-xs text-gray-500">
                          {new Date(currentConnection.last_heartbeat).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                    )}
                    {currentConnection.error_message && (
                      <div className="text-sm text-red-600">
                        <strong>Erro:</strong> {currentConnection.error_message}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma conexão ativa</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trabalhos Recentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Trabalhos Recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={refreshPrinters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{job.job_type}</p>
                      <p className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(job.created_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        job.status === 'completed' ? 'text-green-600 border-green-600' :
                        job.status === 'failed' ? 'text-red-600 border-red-600' :
                        'text-yellow-600 border-yellow-600'
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>
                ))}

                {recentJobs.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum trabalho de impressão
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Edição */}
      {isEditing && (
        <PrinterEditModal
          printer={selectedPrinter}
          onSave={async (config) => {
            await configurePrinter(config);
            setIsEditing(false);
            setSelectedPrinter(null);
          }}
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
  printer: RestaurantPrinter | null;
  onSave: (config: Partial<RestaurantPrinter>) => Promise<void>;
  onCancel: () => void;
}

const PrinterEditModal = ({ printer, onSave, onCancel }: PrinterEditModalProps) => {
  const [config, setConfig] = useState<Partial<RestaurantPrinter>>(
    printer || {
      name: '',
      type: 'thermal',
      connection_type: 'usb',
      width: 80,
      enabled: true,
      is_default: false,
      config_data: {}
    }
  );

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(config);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              value={config.name || ''}
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
            <Select value={config.connection_type} onValueChange={(value: any) => setConfig({...config, connection_type: value})}>
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

          {config.connection_type === 'network' && (
            <>
              <div>
                <Label htmlFor="ip">Endereço IP</Label>
                <Input
                  id="ip"
                  value={config.ip_address || ''}
                  onChange={(e) => setConfig({...config, ip_address: e.target.value})}
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

          <Separator />

          <div>
            <Label htmlFor="api_endpoint">API REST Local (Opcional)</Label>
            <Input
              id="api_endpoint"
              value={config.api_endpoint || ''}
              onChange={(e) => setConfig({...config, api_endpoint: e.target.value})}
              placeholder="http://localhost:3001"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL da API REST local para comunicação com impressoras físicas
            </p>
          </div>

          <div>
            <Label htmlFor="api_key">Chave da API (Opcional)</Label>
            <Input
              id="api_key"
              type="password"
              value={config.api_key || ''}
              onChange={(e) => setConfig({...config, api_key: e.target.value})}
              placeholder="Chave de autenticação da API"
            />
          </div>

          <div>
            <Label htmlFor="width">Largura (mm)</Label>
            <Select value={config.width?.toString()} onValueChange={(value) => setConfig({...config, width: parseInt(value)})}>
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
            <Button onClick={handleSave} className="flex-1" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
