import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    if (!signature) {
      throw new Error("Missing Stripe signature");
    }

    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!endpointSecret) {
      throw new Error("Missing webhook secret");
    }

    // Verificar assinatura do webhook
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log(`Webhook recebido: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(supabaseAdmin, event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(supabaseAdmin, event.data.object as Stripe.PaymentIntent);
        break;
        
      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handlePaymentSuccess(supabaseAdmin: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.error('Order ID não encontrado no metadata');
      return;
    }

    // Atualizar status do pedido para confirmado
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'confirmado',
        payment_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Erro ao atualizar pedido:', updateError);
      return;
    }

    // Buscar dados do pedido para notificações
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        restaurant_details!inner(nome, user_id),
        profiles!inner(nome, email)
      `)
      .eq('id', orderId)
      .single();

    if (order) {
      // Processar repasses financeiros
      await processOrderFinancials(supabaseAdmin, order, paymentIntent.amount / 100);
      
      // Enviar notificações
      await sendOrderNotifications(supabaseAdmin, order);
    }

    console.log(`Pagamento confirmado para pedido ${orderId}`);
    
  } catch (error) {
    console.error('Erro ao processar pagamento confirmado:', error);
  }
}

async function handlePaymentFailure(supabaseAdmin: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.error('Order ID não encontrado no metadata');
      return;
    }

    // Atualizar status do pedido para falha no pagamento
    await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'pagamento_falhado',
        payment_failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    console.log(`Pagamento falhou para pedido ${orderId}`);
    
  } catch (error) {
    console.error('Erro ao processar falha de pagamento:', error);
  }
}

async function processOrderFinancials(supabaseAdmin: any, order: any, amount: number) {
  // Reutilizar a lógica da função process-payment
  try {
    const { data: paymentModel } = await supabaseAdmin
      .from('payment_models')
      .select('*')
      .eq('ativo', true)
      .eq('periodo', 'semanal')
      .single();

    if (!paymentModel) return;

    const platformFee = (amount * paymentModel.taxa_plataforma) / 100;
    const restaurantCommission = (amount * paymentModel.comissao_restaurante) / 100;
    const deliveryCommission = order.entregador_id ? (amount * paymentModel.comissao_entregador) / 100 : 0;

    const restaurantPayout = amount - platformFee - restaurantCommission;
    const deliveryPayout = order.taxa_entrega - deliveryCommission;

    // Atualizar ou criar ganhos do entregador
    if (order.entregador_id && deliveryPayout > 0) {
      await supabaseAdmin
        .from('delivery_earnings')
        .upsert({
          delivery_detail_id: order.entregador_id,
          order_id: order.id,
          valor_base: deliveryPayout,
          valor_total: deliveryPayout,
          status_pagamento: 'confirmado'
        });
    }

    // Atualizar repasse do restaurante
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    await supabaseAdmin
      .from('restaurant_payouts')
      .upsert({
        restaurant_id: order.restaurante_id,
        periodo_inicio: today.toISOString().split('T')[0],
        periodo_fim: nextWeek.toISOString().split('T')[0],
        valor_bruto: amount,
        comissao_plataforma: platformFee,
        comissao_restaurante: restaurantCommission,
        valor_liquido: restaurantPayout,
        status: 'confirmado'
      }, {
        onConflict: 'restaurant_id,periodo_inicio'
      });

  } catch (error) {
    console.error('Erro ao processar repasses:', error);
  }
}

async function sendOrderNotifications(supabaseAdmin: any, order: any) {
  try {
    // Notificar cliente
    await supabaseAdmin
      .from('client_notifications')
      .insert({
        user_id: order.cliente_id,
        tipo: 'order_confirmed',
        titulo: 'Pedido Confirmado!',
        mensagem: `Seu pedido #${order.id.slice(0, 8)} foi confirmado e está sendo preparado.`,
        order_id: order.id
      });

    // Notificar restaurante
    await supabaseAdmin
      .from('restaurant_notifications')
      .insert({
        restaurant_id: order.restaurante_id,
        tipo: 'new_order',
        titulo: 'Novo Pedido!',
        mensagem: `Novo pedido #${order.id.slice(0, 8)} confirmado. Valor: R$ ${order.total.toFixed(2)}`,
        order_id: order.id
      });

    console.log('Notificações enviadas com sucesso');
    
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
  }
}