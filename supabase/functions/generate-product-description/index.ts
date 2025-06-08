
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Generate product description function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Configuração da API do OpenAI não encontrada',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requestBody = await req.json();
    console.log('Request body received:', requestBody);

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
    } = requestBody;

    if (!productName || productName.trim() === '') {
      console.error('Product name is required');
      return new Response(
        JSON.stringify({ 
          error: 'Nome do produto é obrigatório',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating description for product:', productName);

    // Construir informações adicionais
    let additionalInfo = '';
    
    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      additionalInfo += `\nIngredientes principais: ${ingredients.join(', ')}`;
    }
    
    if (calories && calories > 0) {
      additionalInfo += `\nCalorias: ${calories} kcal`;
    }
    
    if (nutritionalInfo && typeof nutritionalInfo === 'object' && Object.keys(nutritionalInfo).length > 0) {
      if (nutritionalInfo.proteinas) {
        additionalInfo += `\nProteínas: ${nutritionalInfo.proteinas}g`;
      }
      if (nutritionalInfo.carboidratos) {
        additionalInfo += `\nCarboidratos: ${nutritionalInfo.carboidratos}g`;
      }
      if (nutritionalInfo.gorduras) {
        additionalInfo += `\nGorduras: ${nutritionalInfo.gorduras}g`;
      }
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

    const prompt = `Crie uma descrição atrativa, detalhada e apetitosa para o produto de comida "${productName}"${category ? ` da categoria ${category}` : ''}.

${additionalInfo}

A descrição deve:
- Ter entre 80-150 palavras
- Ser extremamente apetitosa e convidativa
- Destacar sabores, texturas e aromas de forma vívida
- Mencionar ingredientes especiais se houver
- Incluir benefícios nutricionais se relevante
- Ser adequada para um cardápio de delivery/restaurante
- Usar linguagem brasileira calorosa e profissional
- Despertar o desejo de consumo no cliente
- Ser descritiva e envolvente

Exemplo de tom: "Deliciosa pizza margherita com massa artesanal crocante, molho de tomate fresco, mussarela derretida e manjericão aromático. Uma explosão de sabores tradicionais que transporta você diretamente à Itália."

Retorne apenas a descrição, sem aspas ou formatação adicional.`;

    console.log('Calling OpenAI API with prompt...');

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
            content: 'Você é um especialista em gastronomia e marketing culinário brasileiro. Suas descrições são irresistíveis e fazem os clientes desejarem o produto imediatamente. Você conhece técnicas de copywriting para vendas no setor alimentício e usa linguagem calorosa e profissional do Brasil.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Erro da API OpenAI: ${response.status}`,
          success: false,
          details: errorText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI API response structure:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Resposta inválida da API OpenAI',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const generatedDescription = data.choices[0].message.content.trim();
    console.log('Generated description successfully');

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
    console.error('Error in generate-product-description function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor ao gerar descrição',
        success: false,
        details: error.message || 'Erro desconhecido'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
