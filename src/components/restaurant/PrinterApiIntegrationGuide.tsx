
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Code, 
  Copy, 
  CheckCircle, 
  ExternalLink,
  Settings,
  Database,
  Wifi,
  Server
} from 'lucide-react';
import { toast } from 'sonner';

interface PrinterApiIntegrationGuideProps {
  restaurantId: string;
  apiEndpoint?: string;
  apiKey?: string;
}

export const PrinterApiIntegrationGuide = ({ 
  restaurantId, 
  apiEndpoint = 'http://localhost:3001',
  apiKey = 'your-api-key'
}: PrinterApiIntegrationGuideProps) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

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

  const websocketUrl = `wss://yezvprfvcrxzmlysruco.supabase.co/functions/v1/printer-websocket?restaurantId=${restaurantId}&apiKey=${apiKey}`;

  const configData = {
    restaurantId,
    apiEndpoint,
    apiKey,
    websocketUrl,
    supabaseUrl: 'https://yezvprfvcrxzmlysruco.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllenZwcmZ2Y3J4em1seXNydWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzg0ODIsImV4cCI6MjA2NDIxNDQ4Mn0.iatmdtbo5LgUE90KHSEC05rF_HBO4bANdYQrNIW3UO4'
  };

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

  const sampleCode = `// Exemplo de implementação da API REST Local em Node.js
const express = require('express');
const WebSocket = require('ws');
const app = express();

app.use(express.json());

// Configurações do restaurante
const config = ${JSON.stringify(configData, null, 2)};

// Conectar ao WebSocket do Supabase
const ws = new WebSocket(config.websocketUrl);

ws.on('open', () => {
  console.log('Conectado ao WebSocket do Supabase');
  
  // Registrar restaurante
  ws.send(JSON.stringify({
    type: 'auth',
    restaurantId: config.restaurantId,
    apiKey: config.apiKey
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  
  switch (message.type) {
    case 'print':
      handlePrintJob(message.data);
      break;
    case 'heartbeat':
      // Responder ao heartbeat
      ws.send(JSON.stringify({ type: 'heartbeat' }));
      break;
  }
});

// Endpoint para receber comandos de impressão
app.post('/print', async (req, res) => {
  const { jobId, printerId, type, content, copies } = req.body;
  
  try {
    // Aqui você implementa a lógica de impressão
    // usando a biblioteca específica da sua impressora
    await printToDevice(printerId, content, copies);
    
    // Enviar confirmação de sucesso
    ws.send(JSON.stringify({
      type: 'response',
      data: { success: true, jobId }
    }));
    
    res.json({ success: true, message: 'Impressão enviada' });
  } catch (error) {
    // Enviar erro
    ws.send(JSON.stringify({
      type: 'response',
      data: { success: false, jobId, error: error.message }
    }));
    
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => {
  console.log('API REST Local rodando na porta 3001');
});`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Dados para API REST Local
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure sua API REST local com estas informações para conectar ao sistema de impressão
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dados de Configuração */}
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
              <label className="text-sm font-medium">API Key</label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="font-mono text-xs">
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">WebSocket URL</label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="font-mono text-xs truncate max-w-[200px]">
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

          {/* JSON de Configuração Completo */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Configuração Completa (JSON)
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(configData, null, 2)}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => copyToClipboard(JSON.stringify(configData, null, 2), 'Configuração JSON')}
              >
                {copiedItem === 'Configuração JSON' ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copiar JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints da API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Endpoints Necessários na API Local
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiEndpoints.map((endpoint, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                  {endpoint.method}
                </Badge>
                <code className="text-sm font-mono">{endpoint.path}</code>
              </div>
              <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
              
              {endpoint.body && (
                <div className="bg-gray-50 p-3 rounded">
                  <label className="text-xs font-medium text-gray-700">Request Body:</label>
                  <pre className="text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(endpoint.body, null, 2)}
                  </pre>
                </div>
              )}
              
              {endpoint.response && (
                <div className="bg-green-50 p-3 rounded mt-2">
                  <label className="text-xs font-medium text-green-700">Response:</label>
                  <pre className="text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(endpoint.response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Código de Exemplo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Código de Exemplo (Node.js)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
              {sampleCode}
            </pre>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(sampleCode, 'Código de Exemplo')}
            >
              {copiedItem === 'Código de Exemplo' ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copiar Código
            </Button>
            <Button variant="outline" asChild>
              <a 
                href="https://github.com/websockets/ws" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentação WebSocket
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wifi className="h-5 w-5 mr-2" />
            Como Testar a Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium">Configure sua API REST local</p>
              <p className="text-sm text-gray-600">Use o código de exemplo acima para criar sua API local na porta 3001</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">2</span>
            </div>
            <div>
              <p className="font-medium">Configure a impressora no painel</p>
              <p className="text-sm text-gray-600">Adicione o endpoint da API local (http://localhost:3001) na configuração da impressora</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">3</span>
            </div>
            <div>
              <p className="font-medium">Teste a conexão</p>
              <p className="text-sm text-gray-600">Use o botão "Testar" na configuração da impressora para verificar se a comunicação está funcionando</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
