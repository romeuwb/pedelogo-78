
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Code } from 'lucide-react';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  body?: any;
  response?: any;
}

interface ApiEndpointsAccordionProps {
  endpoints: ApiEndpoint[];
}

export const ApiEndpointsAccordion = ({ endpoints }: ApiEndpointsAccordionProps) => {
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(null);

  const toggleEndpoint = (index: number) => {
    setExpandedEndpoint(expandedEndpoint === index ? null : index);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Code className="h-5 w-5 mr-2" />
          Endpoints da API Local
        </CardTitle>
        <p className="text-sm text-gray-600">
          Clique nos endpoints para ver detalhes de implementação
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {endpoints.map((endpoint, index) => (
          <div key={index} className="border rounded-lg">
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto"
              onClick={() => toggleEndpoint(index)}
            >
              <div className="flex items-center space-x-3">
                <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                  {endpoint.method}
                </Badge>
                <code className="text-sm font-mono">{endpoint.path}</code>
                <span className="text-sm text-gray-600">{endpoint.description}</span>
              </div>
              {expandedEndpoint === index ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            {expandedEndpoint === index && (
              <div className="px-4 pb-4 space-y-3">
                {endpoint.body && (
                  <div className="bg-gray-50 p-3 rounded">
                    <label className="text-xs font-medium text-gray-700">Request Body:</label>
                    <pre className="text-xs mt-1 overflow-x-auto">
                      {JSON.stringify(endpoint.body, null, 2)}
                    </pre>
                  </div>
                )}
                
                {endpoint.response && (
                  <div className="bg-green-50 p-3 rounded">
                    <label className="text-xs font-medium text-green-700">Response:</label>
                    <pre className="text-xs mt-1 overflow-x-auto">
                      {JSON.stringify(endpoint.response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
