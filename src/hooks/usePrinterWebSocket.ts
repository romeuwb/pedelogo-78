
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PrintJob {
  id?: string;
  printerId?: string;
  type: 'order' | 'receipt' | 'kitchen' | 'bar' | 'test';
  content: string;
  copies?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  orderId?: string;
  apiEndpoint?: string;
}

interface WebSocketMessage {
  type: 'auth' | 'heartbeat' | 'print' | 'status' | 'config' | 'response';
  restaurantId?: string;
  data?: any;
  timestamp?: string;
}

export const usePrinterWebSocket = (restaurantId: string, apiKey?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  
  const maxReconnectAttempts = 5;
  const heartbeatInterval = 30000; // 30 segundos
  const reconnectDelay = 5000; // 5 segundos

  const connect = useCallback(() => {
    if (!restaurantId) {
      console.error('Restaurant ID is required for WebSocket connection');
      return;
    }

    try {
      const wsUrl = `wss://yezvprfvcrxzmlysruco.supabase.co/functions/v1/printer-websocket?restaurantId=${restaurantId}&apiKey=${apiKey || 'default'}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      setConnectionStatus('connecting');
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        setLastError(null);
        reconnectAttempts.current = 0;
        
        // Iniciar heartbeat
        startHeartbeat();
        
        toast.success('Conexão com sistema de impressão estabelecida');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);
          
          switch (message.type) {
            case 'status':
              if (message.data?.status) {
                setConnectionStatus(message.data.status);
              }
              break;
            case 'response':
              if (message.data?.success) {
                toast.success('Impressão enviada com sucesso');
              } else {
                toast.error(`Erro na impressão: ${message.data?.error || 'Erro desconhecido'}`);
              }
              break;
            case 'heartbeat':
              // Heartbeat recebido, conexão está ativa
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        stopHeartbeat();
        
        // Tentar reconectar automaticamente
        if (reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect();
        } else {
          toast.error('Falha na conexão com sistema de impressão');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setLastError('Erro de conexão WebSocket');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionStatus('error');
      setLastError(error.message);
    }
  }, [restaurantId, apiKey]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopHeartbeat();
    clearReconnectTimeout();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const heartbeatMessage: WebSocketMessage = {
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        };
        wsRef.current.send(JSON.stringify(heartbeatMessage));
      }
    }, heartbeatInterval);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectAttempts.current++;
    console.log(`Scheduling reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, reconnectDelay);
  }, [connect]);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const sendPrintJob = useCallback((printJob: PrintJob) => {
    if (!isConnected || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Conexão não disponível para impressão');
      return false;
    }

    try {
      const message: WebSocketMessage = {
        type: 'print',
        restaurantId,
        data: printJob,
        timestamp: new Date().toISOString()
      };
      
      wsRef.current.send(JSON.stringify(message));
      console.log('Print job sent:', printJob);
      return true;
    } catch (error) {
      console.error('Error sending print job:', error);
      toast.error('Erro ao enviar trabalho de impressão');
      return false;
    }
  }, [isConnected, restaurantId]);

  const updatePrinterStatus = useCallback((status: string, error?: string) => {
    if (!isConnected || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const message: WebSocketMessage = {
        type: 'status',
        restaurantId,
        data: { status, error },
        timestamp: new Date().toISOString()
      };
      
      wsRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error updating printer status:', error);
    }
  }, [isConnected, restaurantId]);

  // Conectar automaticamente quando o hook é montado
  useEffect(() => {
    if (restaurantId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [restaurantId, connect, disconnect]);

  // Limpar timers quando o componente é desmontado
  useEffect(() => {
    return () => {
      stopHeartbeat();
      clearReconnectTimeout();
    };
  }, [stopHeartbeat, clearReconnectTimeout]);

  return {
    isConnected,
    connectionStatus,
    lastError,
    connect,
    disconnect,
    sendPrintJob,
    updatePrinterStatus,
    reconnectAttempts: reconnectAttempts.current,
    maxReconnectAttempts
  };
};
