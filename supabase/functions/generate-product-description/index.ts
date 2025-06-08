
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Configuração da API do OpenAI não encontrada' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { productName, category, price } = await req.json();

    if (!productName) {
      return new Response(
        JSON.stringify({ error: 'Nome do produto é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Gerando descrição para produto:', productName);

    const prompt = `Crie uma descrição atrativa e apetitosa para o produto de comida "${productName}" ${category ? `da categoria ${category}` : ''} ${price ? `com preço de R$ ${price}` : ''}. 

A descrição deve:
- Ter entre 80-150 caracteres
- Ser apetitosa e convidativa
- Destacar ingredientes ou características especiais
- Ser adequada para um cardápio de delivery
- Usar linguagem brasileira informal mas profissional

Retorne apenas a descrição, sem aspas ou formatação adicional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em criar descrições atrativas para produtos alimentícios em aplicativos de delivery. Suas descrições são sempre apetitosas, concisas e eficazes para aumentar as vendas.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro da API OpenAI:', response.status, errorData);
      throw new Error(`Erro da API OpenAI: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Resposta inválida da API OpenAI:', data);
      throw new Error('Resposta inválida da API OpenAI');
    }

    const generatedDescription = data.choices[0].message.content.trim();

    console.log('Descrição gerada com sucesso:', generatedDescription);

    return new Response(
      JSON.stringify({ 
        description: generatedDescription,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na função generate-product-description:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor ao gerar descrição',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
