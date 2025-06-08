
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

    const { 
      productName, 
      ingredients = [], 
      category = '', 
      nutritionalInfo = {}, 
      calories = 0,
      isVegetarian = false,
      isVegan = false,
      isGlutenFree = false,
      isLactoseFree = false
    } = await req.json();

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

    // Construir informações adicionais
    let additionalInfo = '';
    
    if (ingredients.length > 0) {
      additionalInfo += `\nIngredientes principais: ${ingredients.join(', ')}`;
    }
    
    if (calories > 0) {
      additionalInfo += `\nCalorias: ${calories} kcal`;
    }
    
    if (nutritionalInfo.proteinas) {
      additionalInfo += `\nProteínas: ${nutritionalInfo.proteinas}g`;
    }
    
    if (nutritionalInfo.carboidratos) {
      additionalInfo += `\nCarboidratos: ${nutritionalInfo.carboidratos}g`;
    }
    
    if (nutritionalInfo.gorduras) {
      additionalInfo += `\nGorduras: ${nutritionalInfo.gorduras}g`;
    }

    // Características especiais
    const specialFeatures = [];
    if (isVegetarian) specialFeatures.push('vegetariano');
    if (isVegan) specialFeatures.push('vegano');
    if (isGlutenFree) specialFeatures.push('sem glúten');
    if (isLactoseFree) specialFeatures.push('sem lactose');
    
    if (specialFeatures.length > 0) {
      additionalInfo += `\nCaracterísticas especiais: ${specialFeatures.join(', ')}`;
    }

    const prompt = `Crie uma descrição atrativa, detalhada e apetitosa para o produto de comida "${productName}" ${category ? `da categoria ${category}` : ''}.

${additionalInfo}

A descrição deve:
- Ter entre 120-200 caracteres
- Ser extremamente apetitosa e convidativa
- Destacar sabores, texturas e aromas
- Mencionar ingredientes especiais se houver
- Incluir benefícios nutricionais se relevante
- Ser adequada para um cardápio de delivery/restaurante
- Usar linguagem brasileira calorosa e profissional
- Despertar o desejo de consumo no cliente

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
            content: 'Você é um especialista em gastronomia e marketing culinário. Suas descrições são irresistíveis e fazem os clientes desejarem o produto imediatamente. Você conhece técnicas de copywriting para vendas no setor alimentício.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.8,
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
