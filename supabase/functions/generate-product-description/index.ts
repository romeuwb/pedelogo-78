
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, category, ingredients } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    const prompt = `Gere uma descrição atrativa e apetitosa para um produto de restaurante com as seguintes informações:
    
Nome: ${productName}
Categoria: ${category || 'Não especificada'}
Ingredientes: ${ingredients && ingredients.length > 0 ? ingredients.join(', ') : 'Não especificados'}

A descrição deve ser:
- Máximo 150 caracteres
- Atrativa para o cliente
- Focada no sabor e qualidade
- Em português brasileiro
- Sem usar aspas ou caracteres especiais

Retorne apenas a descrição, sem texto adicional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um especialista em marketing gastronômico que cria descrições atrativas para produtos de restaurantes.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na API da OpenAI');
    }

    const description = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao gerar descrição:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
