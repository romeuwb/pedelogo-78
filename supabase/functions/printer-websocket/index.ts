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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`WebSocket request received: ${req.method} ${req.url}`);

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    console.log(`Not a WebSocket request, upgrade header: ${upgradeHeader}`);
    return new Response("Expected WebSocket connection", { status: 400, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const restaurantId = url.searchParams.get('restaurantId');
  const apiKey = url.searchParams.get('apiKey');

  console.log(`WebSocket connection attempt - restaurantId: ${restaurantId}, apiKey: ${apiKey ? 'present' : 'missing'}`);

  if (!restaurantId) {
    console.log('Missing restaurantId parameter');
    return new Response("Missing restaurantId parameter", { status: 400, headers: corsHeaders });
  }

  if (!apiKey) {
    console.log('Missing apiKey parameter');
    return new Response("Missing apiKey parameter", { status: 400, headers: corsHeaders });
  }

  // Inicializar Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    console.error(`SUPABASE_URL: ${supabaseUrl ? 'present' : 'missing'}`);
    console.error(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'present' : 'missing'}`);
    return new Response("Server configuration error", { status: 500, headers: corsHeaders });
  }

  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Attempting WebSocket upgrade for restaurant: ${restaurantId}`);

  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created successfully');
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return new Response("Database connection error", { status: 500, headers: corsHeaders });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const connectionId = crypto.randomUUID();

    console.log(`WebSocket upgrade successful - connectionId: ${connectionId}`);

    socket.onopen = async () => {
      console.log(`WebSocket connected: ${connectionId} for restaurant: ${restaurantId}`);
      
      try {
        // Registrar conexão no pool
        connectionPool.set(connectionId, socket);
        restaurantConnections.set(restaurantId, connectionId);

        // Registrar conexão no banco
        const { error: insertError } = await supabase
          .from('printer_connections')
          .upsert({
            restaurant_id: restaurantId,
            connection_id: connectionId,
            api_endpoint: req.url,
            status: 'connected',
            last_heartbeat: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error saving connection to database:', insertError);
        } else {
          console.log('Connection saved to database successfully');
        }

        // Enviar confirmação de conexão
        const welcomeMessage: WebSocketMessage = {
          type: 'status',
          data: { 
            status: 'connected', 
            connectionId,
            message: 'WebSocket connection established successfully'
          },
          timestamp: new Date().toISOString()
        };
        socket.send(JSON.stringify(welcomeMessage));
        console.log('Welcome message sent');
      } catch (error) {
        console.error('Error in onopen handler:', error);
      }
    };

    socket.onmessage = async (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log(`Received message from ${restaurantId}:`, message.type);

        switch (message.type) {
          case 'heartbeat':
            // Atualizar timestamp do heartbeat
            const { error: updateError } = await supabase
              .from('printer_connections')
              .update({ 
                last_heartbeat: new Date().toISOString(),
                status: 'connected'
              })
              .eq('restaurant_id', restaurantId);

            if (updateError) {
              console.error('Error updating heartbeat:', updateError);
            }

            socket.send(JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            }));
            break;

          case 'print':
            // Processar trabalho de impressão
            const printJob = message.data;
            
            // Salvar job no banco
            const { data: job, error } = await supabase
              .from('print_jobs')
              .insert({
                restaurant_id: restaurantId,
                printer_id: printJob.printerId,
                job_type: printJob.type,
                content: printJob.content,
                copies: printJob.copies || 1,
                priority: printJob.priority || 'normal',
                order_id: printJob.orderId,
                status: 'processing'
              })
              .select()
              .single();

            if (error) {
              console.error('Error saving print job:', error);
              socket.send(JSON.stringify({
                type: 'response',
                data: { success: false, error: error.message }
              }));
              return;
            }

            // Encaminhar para API REST local se especificada
            if (printJob.apiEndpoint) {
              try {
                const response = await fetch(`${printJob.apiEndpoint}/print`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    jobId: job.id,
                    ...printJob
                  })
                });

                const result = await response.json();
                
                // Atualizar status do job
                await supabase
                  .from('print_jobs')
                  .update({
                    status: response.ok ? 'completed' : 'failed',
                    error_message: response.ok ? null : result.error,
                    processed_at: new Date().toISOString()
                  })
                  .eq('id', job.id);

                socket.send(JSON.stringify({
                  type: 'response',
                  data: { 
                    success: response.ok, 
                    jobId: job.id,
                    result 
                  }
                }));
              } catch (fetchError) {
                console.error('Error calling REST API:', fetchError);
                
                await supabase
                  .from('print_jobs')
                  .update({
                    status: 'failed',
                    error_message: fetchError.message,
                    processed_at: new Date().toISOString()
                  })
                  .eq('id', job.id);

                socket.send(JSON.stringify({
                  type: 'response',
                  data: { success: false, error: fetchError.message }
                }));
              }
            } else {
              // Fallback para impressão local simulada
              await supabase
                .from('print_jobs')
                .update({
                  status: 'completed',
                  processed_at: new Date().toISOString()
                })
                .eq('id', job.id);

              socket.send(JSON.stringify({
                type: 'response',
                data: { success: true, jobId: job.id }
              }));
            }
            break;

          case 'status':
            // Atualizar status da impressora
            if (message.data) {
              await supabase
                .from('printer_connections')
                .update({
                  status: message.data.status,
                  error_message: message.data.error || null,
                  last_heartbeat: new Date().toISOString()
                })
                .eq('restaurant_id', restaurantId);
            }
            break;

          default:
            console.log(`Unknown message type: ${message.type}`);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({
          type: 'response',
          data: { success: false, error: error.message }
        }));
      }
    };

    socket.onclose = async () => {
      console.log(`WebSocket closed: ${connectionId} for restaurant: ${restaurantId}`);
      
      try {
        // Remover do pool
        connectionPool.delete(connectionId);
        restaurantConnections.delete(restaurantId);

        // Atualizar status no banco
        await supabase
          .from('printer_connections')
          .update({
            status: 'disconnected',
            updated_at: new Date().toISOString()
          })
          .eq('restaurant_id', restaurantId);
      } catch (error) {
        console.error('Error in onclose handler:', error);
      }
    };

    socket.onerror = async (error) => {
      console.error(`WebSocket error for restaurant ${restaurantId}:`, error);
      
      try {
        await supabase
          .from('printer_connections')
          .update({
            status: 'error',
            error_message: error.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('restaurant_id', restaurantId);
      } catch (dbError) {
        console.error('Error updating database on socket error:', dbError);
      }
    };

    return response;
  } catch (error) {
    console.error('Error upgrading to WebSocket:', error);
    return new Response(`WebSocket upgrade failed: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
