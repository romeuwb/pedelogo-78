
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  success: boolean;
  description?: string;
  error?: string;
  duration?: number;
  metadata?: any;
}

export const useProductDescriptionTest = () => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const runSingleTest = async (productData: {
    nome: string;
    ingredientes?: string[];
    categoria?: string;
    informacoes_nutricionais?: any;
  }): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      console.log('Testando geração para:', productData.nome);
      
      const { data, error } = await supabase.functions.invoke('generate-product-description', {
        body: productData
      });

      const duration = Date.now() - startTime;

      if (error) {
        return {
          success: false,
          error: error.message,
          duration
        };
      }

      if (data?.success && data?.description) {
        return {
          success: true,
          description: data.description,
          duration,
          metadata: data.metadata
        };
      } else {
        return {
          success: false,
          error: data?.error || 'Resposta inválida',
          duration
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  };

  const runBatchTest = async () => {
    setIsRunningTest(true);
    setTestResults([]);

    const testCases = [
      {
        nome: "Pizza Margherita",
        ingredientes: ["molho de tomate", "mussarela", "manjericão", "azeite"],
        categoria: "Pizza",
        informacoes_nutricionais: { proteinas: 12, carboidratos: 35, gorduras: 8 }
      },
      {
        nome: "Hambúrguer Artesanal",
        ingredientes: ["carne bovina", "pão brioche", "alface", "tomate", "queijo cheddar"],
        categoria: "Hambúrguer"
      },
      {
        nome: "Salada Caesar",
        ingredientes: ["alface romana", "croutons", "parmesão", "molho caesar"],
        categoria: "Salada",
        informacoes_nutricionais: { proteinas: 8, carboidratos: 15, gorduras: 12, fibras: 4 }
      },
      {
        nome: "Açaí Bowl",
        categoria: "Sobremesa"
      },
      {
        nome: "" // Teste com nome vazio
      }
    ];

    const results: TestResult[] = [];

    for (const testCase of testCases) {
      console.log(`Executando teste: ${testCase.nome || 'Nome vazio'}`);
      const result = await runSingleTest(testCase);
      results.push(result);
      
      // Delay entre testes para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setTestResults(results);
    setIsRunningTest(false);

    // Mostrar resumo dos resultados
    const successCount = results.filter(r => r.success).length;
    const totalTests = results.length;
    
    toast({
      title: "Testes Concluídos",
      description: `${successCount}/${totalTests} testes bem-sucedidos`,
      variant: successCount === totalTests ? "default" : "destructive"
    });
  };

  return {
    isRunningTest,
    testResults,
    runSingleTest,
    runBatchTest
  };
};
