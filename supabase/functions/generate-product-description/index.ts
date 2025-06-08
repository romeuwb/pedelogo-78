
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

    const requestData = await req.json();
    const { nome, ingredientes = [], categoria = '', informacoes_nutricionais = {} } = requestData;

    console.log('Dados recebidos:', { nome, ingredientes, categoria, informacoes_nutricionais });

    if (!nome || nome.trim().length === 0) {
      console.error('Nome do produto não fornecido');
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

    console.log('Gerando descrição para produto:', nome);

    // Construir contexto mais rico para a IA
    let contextoIngredientes = '';
    if (ingredientes && ingredientes.length > 0) {
      contextoIngredientes = `\nIngredientes principais: ${ingredientes.join(', ')}`;
    }

    let contextoCategoria = '';
    if (categoria) {
      contextoCategoria = `\nCategoria: ${categoria}`;
    }

    let contextoNutricional = '';
    if (informacoes_nutricionais && Object.keys(informacoes_nutricionais).length > 0) {
      const nutricoes = [];
      if (informacoes_nutricionais.proteinas) nutricoes.push(`${informacoes_nutricionais.proteinas}g de proteína`);
      if (informacoes_nutricionais.carboidratos) nutricoes.push(`${informacoes_nutricionais.carboidratos}g de carboidratos`);
      if (informacoes_nutricionais.gorduras) nutricoes.push(`${informacoes_nutricionais.gorduras}g de gorduras`);
      if (informacoes_nutricionais.fibras) nutricoes.push(`${informacoes_nutricionais.fibras}g de fibras`);
      
      if (nutricoes.length > 0) {
        contextoNutricional = `\nInformações nutricionais: ${nutricoes.join(', ')}`;
      }
    }

    const prompt = `Crie uma descrição detalhada e apetitosa para o produto "${nome}".
${contextoCategoria}${contextoIngredientes}${contextoNutricional}

A descrição deve:
- Ter entre 120-200 palavras
- Ser apetitosa e convidativa
- Destacar ingredientes principais e características especiais
- Incluir informações sobre textura, sabor e apresentação
- Ser adequada para um cardápio de delivery
- Usar linguagem brasileira informal mas profissional
- Mencionar benefícios nutricionais se relevante
- Criar desejo no cliente
- Incluir aspectos sensoriais (aroma, sabor, textura)
- Sugerir ocasiões de consumo apropriadas

Retorne apenas a descrição, sem aspas ou formatação adicional.`;

    console.log('Enviando prompt para OpenAI...');

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
            content: 'Você é um especialista em gastronomia e marketing de alimentos brasileiro. Crie descrições irresistíveis que destacam sabores, texturas e benefícios dos pratos, sempre focando em despertar o apetite e desejo do cliente. Use linguagem brasileira natural e atrativa.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.8,
      }),
    });

    console.log('Status da resposta OpenAI:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro da API OpenAI:', response.status, errorData);
      
      return new Response(
        JSON.stringify({ 
          error: `Erro da API OpenAI: ${response.status}`,
          details: errorData,
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Resposta completa da OpenAI:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Resposta inválida da API OpenAI:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Resposta inválida da API OpenAI',
          details: 'Estrutura de resposta inesperada',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const generatedDescription = data.choices[0].message.content.trim();

    // Validar se a descrição foi gerada corretamente
    if (!generatedDescription || generatedDescription.length < 50) {
      console.error('Descrição gerada muito curta:', generatedDescription);
      return new Response(
        JSON.stringify({ 
          error: 'Descrição gerada inadequada',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Descrição gerada com sucesso:', generatedDescription);

    return new Response(
      JSON.stringify({ 
        description: generatedDescription,
        success: true,
        metadata: {
          produto: nome,
          categoria: categoria,
          ingredientes_count: ingredientes ? ingredientes.length : 0,
          tem_info_nutricional: Object.keys(informacoes_nutricionais).length > 0
        }
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
        details: error.message,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
