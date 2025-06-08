
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

    const { nome, ingredientes, categoria, informacoes_nutricionais } = await req.json();

    if (!nome) {
      return new Response(
        JSON.stringify({ error: 'Nome do produto é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Gerando descrição para produto:', nome);

    const prompt = `Crie uma descrição detalhada e apetitosa para o produto de comida "${nome}" ${categoria ? `da categoria ${categoria}` : ''} ${ingredientes && ingredientes.length > 0 ? `com os ingredientes: ${ingredientes.join(', ')}` : ''}.

A descrição deve:
- Ter entre 150-250 caracteres
- Ser apetitosa e convidativa
- Destacar ingredientes principais e características especiais
- Incluir informações sobre textura, sabor e apresentação
- Ser adequada para um cardápio de delivery
- Usar linguagem brasileira informal mas profissional
- Mencionar benefícios nutricionais se relevante
- Criar desejo no cliente

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
            content: 'Você é um especialista em gastronomia e marketing de alimentos. Crie descrições irresistíveis que destacam sabores, texturas e benefícios dos pratos, sempre focando em despertar o apetite e desejo do cliente.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
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
