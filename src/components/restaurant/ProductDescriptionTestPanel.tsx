
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductDescriptionTest } from '@/hooks/useProductDescriptionTest';
import { TestTube, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';

export const ProductDescriptionTestPanel = () => {
  const { isRunningTest, testResults, runBatchTest } = useProductDescriptionTest();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Teste de Integridade - Geração de Descrição por IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Execute testes para verificar se a geração de descrição está funcionando corretamente
          </p>
          <Button 
            onClick={runBatchTest} 
            disabled={isRunningTest}
            className="flex items-center gap-2"
          >
            <Sparkles className={`h-4 w-4 ${isRunningTest ? 'animate-spin' : ''}`} />
            {isRunningTest ? 'Executando Testes...' : 'Executar Testes'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Resultados dos Testes:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      Teste {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.duration && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {result.duration}ms
                      </Badge>
                    )}
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? 'Sucesso' : 'Falha'}
                    </Badge>
                  </div>
                </div>
                
                {result.success && result.description && (
                  <div className="bg-green-50 p-2 rounded text-sm">
                    <strong>Descrição gerada:</strong>
                    <p className="mt-1 text-gray-700">{result.description}</p>
                    {result.metadata && (
                      <div className="mt-2 text-xs text-gray-500">
                        Produto: {result.metadata.produto} | 
                        Ingredientes: {result.metadata.ingredientes_count} | 
                        Info Nutricional: {result.metadata.tem_info_nutricional ? 'Sim' : 'Não'}
                      </div>
                    )}
                  </div>
                )}
                
                {!result.success && result.error && (
                  <div className="bg-red-50 p-2 rounded text-sm">
                    <strong>Erro:</strong>
                    <p className="mt-1 text-red-700">{result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isRunningTest && (
          <div className="flex items-center justify-center p-4 bg-blue-50 rounded">
            <div className="flex items-center gap-2 text-blue-600">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>Executando testes de integridade...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
