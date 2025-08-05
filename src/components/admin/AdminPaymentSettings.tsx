import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, QrCode, DollarSign } from 'lucide-react';

interface PaymentProvider {
  id: string;
  provider: string;
  config: any;
  ativo: boolean;
}

export const AdminPaymentSettings: React.FC = () => {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [stripeConfig, setStripeConfig] = useState({
    secret_key: '',
    webhook_secret: '',
    ativo: false
  });
  const [mercadoPagoConfig, setMercadoPagoConfig] = useState({
    access_token: '',
    public_key: '',
    webhook_secret: '',
    pix_enabled: true,
    ativo: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*');

      if (error) throw error;

      const stripeData = data?.find(p => p.provider === 'stripe');
      const mercadoPagoData = data?.find(p => p.provider === 'mercadopago');

      if (stripeData) {
        const config = stripeData.config as any;
        setStripeConfig({
          secret_key: config?.secret_key || '',
          webhook_secret: config?.webhook_secret || '',
          ativo: stripeData.ativo
        });
      }

      if (mercadoPagoData) {
        const config = mercadoPagoData.config as any;
        setMercadoPagoConfig({
          access_token: config?.access_token || '',
          public_key: config?.public_key || '',
          webhook_secret: config?.webhook_secret || '',
          pix_enabled: config?.pix_enabled !== false,
          ativo: mercadoPagoData.ativo
        });
      }

      setProviders(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de pagamento",
        variant: "destructive",
      });
    }
  };

  const saveStripeSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          provider: 'stripe',
          config: {
            secret_key: stripeConfig.secret_key,
            webhook_secret: stripeConfig.webhook_secret
          },
          ativo: stripeConfig.ativo
        }, {
          onConflict: 'provider'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações do Stripe salvas com sucesso!",
      });
      
      loadPaymentSettings();
    } catch (error) {
      console.error('Erro ao salvar Stripe:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do Stripe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMercadoPagoSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          provider: 'mercadopago',
          config: {
            access_token: mercadoPagoConfig.access_token,
            public_key: mercadoPagoConfig.public_key,
            webhook_secret: mercadoPagoConfig.webhook_secret,
            pix_enabled: mercadoPagoConfig.pix_enabled
          },
          ativo: mercadoPagoConfig.ativo
        }, {
          onConflict: 'provider'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações do Mercado Pago salvas com sucesso!",
      });
      
      loadPaymentSettings();
    } catch (error) {
      console.error('Erro ao salvar Mercado Pago:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do Mercado Pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações de Pagamento</h1>
        <p className="text-muted-foreground">
          Configure os provedores de pagamento para processar transações na plataforma
        </p>
      </div>

      <Tabs defaultValue="stripe" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stripe" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="mercadopago" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Mercado Pago + PIX
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configurações do Stripe
              </CardTitle>
              <CardDescription>
                Configure as credenciais do Stripe para processar pagamentos com cartão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="stripe-active"
                  checked={stripeConfig.ativo}
                  onCheckedChange={(checked) => 
                    setStripeConfig(prev => ({ ...prev, ativo: checked }))
                  }
                />
                <Label htmlFor="stripe-active">Ativar Stripe</Label>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-secret">Secret Key</Label>
                  <Input
                    id="stripe-secret"
                    type="password"
                    placeholder="sk_live_..."
                    value={stripeConfig.secret_key}
                    onChange={(e) => 
                      setStripeConfig(prev => ({ ...prev, secret_key: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                  <Input
                    id="stripe-webhook"
                    type="password"
                    placeholder="whsec_..."
                    value={stripeConfig.webhook_secret}
                    onChange={(e) => 
                      setStripeConfig(prev => ({ ...prev, webhook_secret: e.target.value }))
                    }
                  />
                </div>

                <Button onClick={saveStripeSettings} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Configurações Stripe'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mercadopago">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Configurações do Mercado Pago
              </CardTitle>
              <CardDescription>
                Configure as credenciais do Mercado Pago para processar PIX e outros métodos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="mp-active"
                  checked={mercadoPagoConfig.ativo}
                  onCheckedChange={(checked) => 
                    setMercadoPagoConfig(prev => ({ ...prev, ativo: checked }))
                  }
                />
                <Label htmlFor="mp-active">Ativar Mercado Pago</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="pix-enabled"
                  checked={mercadoPagoConfig.pix_enabled}
                  onCheckedChange={(checked) => 
                    setMercadoPagoConfig(prev => ({ ...prev, pix_enabled: checked }))
                  }
                />
                <Label htmlFor="pix-enabled">Habilitar PIX</Label>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mp-access-token">Access Token</Label>
                  <Input
                    id="mp-access-token"
                    type="password"
                    placeholder="APP_USR-..."
                    value={mercadoPagoConfig.access_token}
                    onChange={(e) => 
                      setMercadoPagoConfig(prev => ({ ...prev, access_token: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mp-public-key">Public Key</Label>
                  <Input
                    id="mp-public-key"
                    placeholder="APP_USR-..."
                    value={mercadoPagoConfig.public_key}
                    onChange={(e) => 
                      setMercadoPagoConfig(prev => ({ ...prev, public_key: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mp-webhook">Webhook Secret</Label>
                  <Input
                    id="mp-webhook"
                    type="password"
                    placeholder="webhook_secret_..."
                    value={mercadoPagoConfig.webhook_secret}
                    onChange={(e) => 
                      setMercadoPagoConfig(prev => ({ ...prev, webhook_secret: e.target.value }))
                    }
                  />
                </div>

                <Button onClick={saveMercadoPagoSettings} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Configurações Mercado Pago'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Status dos Provedores
          </CardTitle>
          <CardDescription>
            Visualize o status atual dos provedores de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium capitalize">{provider.provider}</h3>
                  <p className="text-sm text-muted-foreground">
                    Status: {provider.ativo ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-sm ${
                  provider.ativo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {provider.ativo ? 'Configurado' : 'Desabilitado'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};