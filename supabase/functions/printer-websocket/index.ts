
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebSocketMessage {
  type: 'auth' | 'heartbeat' | 'print' | 'status' | 'config' | 'response';
  restaurantId?: string;
  data?: any;
  timestamp?: string;
}

// Pool de conexões WebSocket ativas
const connectionPool = new Map<string, WebSocket>();
const restaurantConnections = new Map<string, string>(); // restaurantId -> connectionId

serve(async (req) => {
  try {
    console.log(`Request received: ${req.method} ${req.url}`);

    // Handle CORS
    if (req.method === 'OPTIONS') {
      console.log('CORS preflight request');
      return new Response(null, { headers: corsHeaders });
    }

    // Verificar se é uma requisição WebSocket
    const upgradeHeader = req.headers.get("upgrade") || "";
    if (upgradeHeader.toLowerCase() !== "websocket") {
      console.log(`Not a WebSocket request: ${upgradeHeader}`);
      return new Response("Expected WebSocket connection", { status: 400, headers: corsHeaders });
    }

    // Extrair parâmetros da URL
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get('restaurantId');
    const apiKey = url.searchParams.get('apiKey');

    console.log(`Params: restaurantId=${restaurantId}, apiKey=${apiKey ? 'yes' : 'no'}`);

    // Validação básica de parâmetros
    if (!restaurantId) {
      console.log('Missing restaurantId');
      return new Response("Missing restaurantId parameter", { status: 400, headers: corsHeaders });
    }

    if (!apiKey) {
      console.log('Missing apiKey');
      return new Response("Missing apiKey parameter", { status: 400, headers: corsHeaders });
    }

    console.log('Starting WebSocket upgrade');

    // Fazer upgrade para WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);
    const connectionId = crypto.randomUUID();

    console.log(`WebSocket upgrade successful: ${connectionId}`);

    socket.onopen = async () => {
      console.log(`WebSocket opened: ${connectionId}`);
      
      try {
        // Inicializar cliente Supabase dentro do handler
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
          console.error('Missing Supabase environment variables');
          socket.close(1011, 'Server configuration error');
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Validar API key
        console.log(`Validating API key for restaurant: ${restaurantId}`);
        const { data: apiKeyData, error: apiKeyError } = await supabase
          .from('restaurant_api_keys')
          .select('id, is_active')
          .eq('restaurant_id', restaurantId)
          .eq('api_key', apiKey)
          .eq('is_active', true)
          .single();

        if (apiKeyError || !apiKeyData) {
          console.error('Invalid API key:', apiKeyError?.message || 'Not found');
          socket.close(1008, 'Invalid API key');
          return;
        }

        console.log('API key valid');

        // Registrar conexão
        connectionPool.set(connectionId, socket);
        restaurantConnections.set(restaurantId, connectionId);

        // Registrar no banco
        await supabase
          .from('printer_connections')
          .upsert({
            restaurant_id: restaurantId,
            connection_id: connectionId,
            api_endpoint: req.url,
            status: 'connected',
            last_heartbeat: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        // Enviar confirmação
        const welcomeMessage = {
          type: 'status',
          data: { 
            status: 'connected', 
            connectionId,
            message: 'Connection established'
          },
          timestamp: new Date().toISOString()
        };
        
        socket.send(JSON.stringify(welcomeMessage));
        console.log('Welcome message sent');

      } catch (error) {
        console.error('Error in onopen:', error);
        socket.close(1011, 'Server error');
      }
    };

    socket.onmessage = async (event) => {
      try {
        console.log(`Message received: ${event.data}`);
        const message = JSON.parse(event.data);

        // Responder com heartbeat
        if (message.type === 'heartbeat') {
          socket.send(JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          }));
        }

      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    socket.onclose = () => {
      console.log(`WebSocket closed: ${connectionId}`);
      connectionPool.delete(connectionId);
      restaurantConnections.delete(restaurantId);
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error: ${error}`);
    };

    console.log('Returning WebSocket response');
    return response;

  } catch (error) {
    console.error('Function error:', error);
    return new Response(`Server Error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
