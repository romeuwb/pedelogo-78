import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { periodo = 'semanal' } = await req.json().catch(() => ({}));
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log(`Processando repasses para período: ${periodo}`);

    // Processar repasses dos restaurantes
    const restaurantResults = await processRestaurantPayouts(supabaseAdmin, periodo);
    
    // Processar repasses dos entregadores
    const deliveryResults = await processDeliveryPayouts(supabaseAdmin, periodo);

    const result = {
      success: true,
      processedAt: new Date().toISOString(),
      restaurants: restaurantResults,
      deliveries: deliveryResults
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no processamento de repasses:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function processRestaurantPayouts(supabaseAdmin: any, periodo: string) {
  try {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    // Calcular período baseado no tipo
    switch (periodo) {
      case 'diario':
        startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case 'semanal':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case 'quinzenal':
        startDate = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case 'mensal':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      default:
        throw new Error('Período inválido');
    }

    // Buscar repasses pendentes do período
    const { data: pendingPayouts, error } = await supabaseAdmin
      .from('restaurant_payouts')
      .select(`
        *,
        restaurant_details!inner(nome, user_id)
      `)
      .eq('status', 'pendente')
      .gte('periodo_inicio', startDate.toISOString().split('T')[0])
      .lte('periodo_fim', endDate.toISOString().split('T')[0]);

    if (error) throw error;

    const results = [];

    for (const payout of pendingPayouts || []) {
      try {
        // Simular processamento do repasse (aqui integraria com banco/PIX)
        const processedPayout = {
          ...payout,
          status: 'processado',
          data_processamento: new Date().toISOString(),
          reference_id: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        // Atualizar status do repasse
        const { error: updateError } = await supabaseAdmin
          .from('restaurant_payouts')
          .update({
            status: 'processado',
            data_processamento: processedPayout.data_processamento,
            reference_id: processedPayout.reference_id
          })
          .eq('id', payout.id);

        if (updateError) throw updateError;

        // Criar transação financeira
        await supabaseAdmin
          .from('financial_transactions')
          .insert({
            tipo: 'restaurant_payout',
            valor: payout.valor_liquido,
            restaurante_id: payout.restaurant_id,
            periodo_cobranca: periodo,
            data_transacao: new Date().toISOString()
          });

        // Notificar restaurante
        await supabaseAdmin
          .from('restaurant_notifications')
          .insert({
            restaurant_id: payout.restaurant_id,
            tipo: 'payout_processed',
            titulo: 'Repasse Processado',
            mensagem: `Seu repasse de R$ ${payout.valor_liquido.toFixed(2)} foi processado com sucesso.`,
            dados_extras: {
              payoutId: payout.id,
              amount: payout.valor_liquido,
              period: `${payout.periodo_inicio} - ${payout.periodo_fim}`
            }
          });

        results.push({
          restaurantId: payout.restaurant_id,
          restaurantName: payout.restaurant_details.nome,
          amount: payout.valor_liquido,
          status: 'success'
        });

        console.log(`Repasse processado: ${payout.restaurant_details.nome} - R$ ${payout.valor_liquido}`);

      } catch (error) {
        console.error(`Erro ao processar repasse do restaurante ${payout.restaurant_id}:`, error);
        results.push({
          restaurantId: payout.restaurant_id,
          restaurantName: payout.restaurant_details?.nome || 'Desconhecido',
          amount: payout.valor_liquido,
          status: 'error',
          error: error.message
        });
      }
    }

    return results;

  } catch (error) {
    console.error('Erro ao processar repasses de restaurantes:', error);
    return [];
  }
}

async function processDeliveryPayouts(supabaseAdmin: any, periodo: string) {
  try {
    const today = new Date();
    let startDate: Date;

    // Calcular data de início baseado no período
    switch (periodo) {
      case 'diario':
        startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'semanal':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quinzenal':
        startDate = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
        break;
      case 'mensal':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        throw new Error('Período inválido');
    }

    // Buscar ganhos pendentes do período
    const { data: pendingEarnings, error } = await supabaseAdmin
      .from('delivery_earnings')
      .select(`
        *,
        delivery_details!inner(user_id),
        profiles!inner(nome, email)
      `)
      .eq('status_pagamento', 'pendente')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Agrupar por entregador
    const groupedEarnings = pendingEarnings?.reduce((acc: any, earning: any) => {
      const deliveryId = earning.delivery_detail_id;
      if (!acc[deliveryId]) {
        acc[deliveryId] = {
          deliveryDetailId: deliveryId,
          userId: earning.delivery_details.user_id,
          deliveryName: earning.profiles?.nome || 'Entregador',
          totalAmount: 0,
          earnings: []
        };
      }
      acc[deliveryId].totalAmount += earning.valor_total;
      acc[deliveryId].earnings.push(earning);
      return acc;
    }, {});

    const results = [];

    for (const [deliveryId, group] of Object.entries(groupedEarnings || {})) {
      try {
        const delivery = group as any;
        
        // Simular processamento do repasse
        const referenceId = `DEL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Atualizar status dos ganhos
        const earningIds = delivery.earnings.map((e: any) => e.id);
        const { error: updateError } = await supabaseAdmin
          .from('delivery_earnings')
          .update({
            status_pagamento: 'pago',
            data_pagamento: new Date().toISOString()
          })
          .in('id', earningIds);

        if (updateError) throw updateError;

        // Criar transação financeira
        await supabaseAdmin
          .from('financial_transactions')
          .insert({
            tipo: 'delivery_payout',
            valor: delivery.totalAmount,
            entregador_id: delivery.deliveryDetailId,
            periodo_cobranca: periodo,
            data_transacao: new Date().toISOString()
          });

        // Notificar entregador
        await supabaseAdmin
          .from('delivery_notifications')
          .insert({
            delivery_detail_id: delivery.deliveryDetailId,
            tipo: 'payout_processed',
            titulo: 'Repasse Processado',
            mensagem: `Seu repasse de R$ ${delivery.totalAmount.toFixed(2)} foi processado com sucesso.`,
            dados_extras: {
              amount: delivery.totalAmount,
              earningsCount: delivery.earnings.length,
              referenceId
            }
          });

        results.push({
          deliveryId: delivery.deliveryDetailId,
          deliveryName: delivery.deliveryName,
          amount: delivery.totalAmount,
          earningsCount: delivery.earnings.length,
          status: 'success'
        });

        console.log(`Repasse processado: ${delivery.deliveryName} - R$ ${delivery.totalAmount}`);

      } catch (error) {
        console.error(`Erro ao processar repasse do entregador ${deliveryId}:`, error);
        results.push({
          deliveryId,
          deliveryName: (group as any).deliveryName,
          amount: (group as any).totalAmount,
          status: 'error',
          error: error.message
        });
      }
    }

    return results;

  } catch (error) {
    console.error('Erro ao processar repasses de entregadores:', error);
    return [];
  }
}