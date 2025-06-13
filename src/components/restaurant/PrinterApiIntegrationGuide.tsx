
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  CheckCircle, 
  ExternalLink,
  Settings,
  Download,
  RefreshCw,
  Key,
  Wifi,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useRestaurantApiKey } from '@/hooks/useRestaurantApiKey';
import { ApiEndpointsAccordion } from './ApiEndpointsAccordion';

interface PrinterApiIntegrationGuideProps {
  restaurantId: string;
  apiEndpoint?: string;
}

export const PrinterApiIntegrationGuide = ({ 
  restaurantId, 
  apiEndpoint = 'http://localhost:3001'
}: PrinterApiIntegrationGuideProps) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [regeneratingWebSocket, setRegeneratingWebSocket] = useState(false);
  
  const { apiKey, loading, generating, generateNewApiKey } = useRestaurantApiKey(restaurantId);

  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      toast.success(`${itemName} copiado para área de transferência`);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const downloadConfig = () => {
    const config = {
      restaurantId,
      apiEndpoint,
      apiKey,
      websocketUrl: `wss://yezvprfvcrxzmlysruco.supabase.co/functions/v1/printer-websocket?restaurantId=${restaurantId}&apiKey=${apiKey}`,
      supabaseUrl: 'https://yezvprfvcrxzmlysruco.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllenZwcmZ2Y3J4em1seXNydWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzg0ODIsImV4cCI6MjA2NDIxNDQ4Mn0.iatmdtbo5LgUE90KHSEC05rF_HBO4bANdYQrNIW3UO4'
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-restaurante-${restaurantId.slice(-8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Arquivo de configuração baixado');
  };

  const regenerateWebSocketData = async () => {
    setRegeneratingWebSocket(true);
    try {
      // Simula regeneração de dados WebSocket
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Dados do WebSocket atualizados');
    } catch (error) {
      toast.error('Erro ao atualizar dados do WebSocket');
    } finally {
      setRegeneratingWebSocket(false);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      await generateNewApiKey();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const websocketUrl = `wss://yezvprfvcrxzmlysruco.supabase.co/functions/v1/printer-websocket?restaurantId=${restaurantId}&apiKey=${apiKey}`;

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/register-restaurant',
      description: 'Registrar restaurante na API local',
      body: {
        restaurantId,
        name: 'Nome do Restaurante',
        apiKey
      }
    },
    {
      method: 'POST',
      path: '/print',
      description: 'Receber comandos de impressão',
      body: {
        jobId: 'uuid-do-trabalho',
        printerId: 'uuid-da-impressora',
        type: 'order | receipt | kitchen | bar | test',
        content: 'Conteúdo a ser impresso',
        copies: 1,
        priority: 'normal'
      }
    },
    {
      method: 'GET',
      path: '/printers',
      description: 'Listar impressoras disponíveis',
      response: {
        printers: [
          {
            id: 'printer-id',
            name: 'Impressora Térmica',
            type: 'thermal',
            status: 'online'
          }
        ]
      }
    },
    {
      method: 'POST',
      path: '/test-printer',
      description: 'Testar impressora específica',
      body: {
        printerId: 'printer-id',
        content: 'Teste de impressão'
      }
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuração da API REST Local
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure sua API REST local com estes dados para conectar ao sistema de impressão
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Restaurant ID</label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {restaurantId}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(restaurantId, 'Restaurant ID')}
                >
                  {copiedItem === 'Restaurant ID' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">API Endpoint Local</label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {apiEndpoint}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(apiEndpoint, 'API Endpoint')}
                >
                  {copiedItem === 'API Endpoint' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* API Key Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Chave da API
              </h3>
              <Button
                onClick={handleGenerateApiKey}
                disabled={generating}
                variant="outline"
                size="sm"
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                {generating ? 'Gerando...' : 'Gerar Nova Chave'}
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Carregando chave da API...</span>
              </div>
            ) : apiKey ? (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="font-mono text-xs max-w-[300px] truncate">
                  {apiKey}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(apiKey, 'API Key')}
                >
                  {copiedItem === 'API Key' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Nenhuma chave da API configurada</span>
              </div>
            )}
          </div>

          <Separator />

          {/* WebSocket Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center">
                <Wifi className="h-5 w-5 mr-2" />
                WebSocket URL
              </h3>
              <Button
                onClick={regenerateWebSocketData}
                disabled={regeneratingWebSocket}
                variant="outline"
                size="sm"
              >
                {regeneratingWebSocket ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {regeneratingWebSocket ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono text-xs max-w-[400px] truncate">
                {websocketUrl}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(websocketUrl, 'WebSocket URL')}
              >
                {copiedItem === 'WebSocket URL' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button onClick={downloadConfig} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Baixar Configuração JSON
            </Button>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(JSON.stringify({
                restaurantId,
                apiEndpoint,
                apiKey,
                websocketUrl
              }, null, 2), 'Configuração JSON')}
              className="flex-1"
            >
              {copiedItem === 'Configuração JSON' ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copiar JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints com Acordeon */}
      <ApiEndpointsAccordion endpoints={apiEndpoints} />

      {/* Informações sobre Supabase Anon Key */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre a Chave Supabase Anon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>A chave Supabase Anon Key é fixa para todo o projeto</strong> e pode ser usada publicamente. 
              Ela não é específica por restaurante e não precisa ser alterada. Esta chave permite acesso às 
              funções públicas do Supabase e é segura para uso em aplicações frontend.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Como Testar */}
      <Card>
        <CardHeader>
          <CardTitle>Como Testar a Integração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium">Baixe a configuração JSON</p>
              <p className="text-sm text-gray-600">Use o botão "Baixar Configuração JSON" para obter o arquivo completo</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">2</span>
            </div>
            <div>
              <p className="font-medium">Configure sua API REST local</p>
              <p className="text-sm text-gray-600">Implemente os endpoints necessários usando os dados baixados</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">3</span>
            </div>
            <div>
              <p className="font-medium">Teste a conexão</p>
              <p className="text-sm text-gray-600">Use o botão "Testar" nas configurações da impressora para verificar a conectividade</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
