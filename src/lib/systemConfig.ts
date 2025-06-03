
export interface SystemConfiguration {
  chave: string;
  valor: string;
  categoria: string;
  descricao?: string;
  updated_at: string;
}

export const defaultSystemConfigurations: Omit<SystemConfiguration, 'updated_at'>[] = [
  // Geral
  {
    chave: 'app_name',
    valor: 'PedeLogo',
    categoria: 'geral',
    descricao: 'Nome do aplicativo'
  },
  {
    chave: 'app_logo',
    valor: '',
    categoria: 'geral',
    descricao: 'URL do logo do aplicativo'
  },
  {
    chave: 'moeda',
    valor: 'BRL',
    categoria: 'geral',
    descricao: 'Moeda padrão do sistema'
  },
  
  // Mapas
  {
    chave: 'google_maps_api_key',
    valor: '',
    categoria: 'mapas',
    descricao: 'Chave da API do Google Maps'
  },
  {
    chave: 'mapbox_access_token',
    valor: '',
    categoria: 'mapas',
    descricao: 'Token de acesso do Mapbox'
  },
  {
    chave: 'default_map_provider',
    valor: 'google',
    categoria: 'mapas',
    descricao: 'Provedor de mapas padrão (google/mapbox)'
  },
  
  // Financeiro
  {
    chave: 'stripe_publishable_key',
    valor: '',
    categoria: 'financeiro',
    descricao: 'Chave pública do Stripe'
  },
  {
    chave: 'stripe_secret_key',
    valor: '',
    categoria: 'financeiro',
    descricao: 'Chave secreta do Stripe'
  },
  {
    chave: 'taxa_comissao_restaurante',
    valor: '0.15',
    categoria: 'financeiro',
    descricao: 'Taxa de comissão do restaurante (decimal)'
  },
  {
    chave: 'taxa_entrega_base',
    valor: '5.00',
    categoria: 'financeiro',
    descricao: 'Taxa base de entrega em reais'
  },
  {
    chave: 'taxa_entrega_por_km',
    valor: '1.50',
    categoria: 'financeiro',
    descricao: 'Taxa por quilômetro em reais'
  },
  
  // Entrega
  {
    chave: 'distancia_maxima_entrega',
    valor: '20',
    categoria: 'entrega',
    descricao: 'Distância máxima de entrega em quilômetros'
  },
  {
    chave: 'tempo_maximo_preparo',
    valor: '60',
    categoria: 'entrega',
    descricao: 'Tempo máximo de preparo em minutos'
  },
  {
    chave: 'horario_pico_inicio',
    valor: '18:00',
    categoria: 'entrega',
    descricao: 'Horário de início do pico'
  },
  {
    chave: 'horario_pico_fim',
    valor: '21:00',
    categoria: 'entrega',
    descricao: 'Horário de fim do pico'
  },
  {
    chave: 'taxa_pico_multiplier',
    valor: '1.5',
    categoria: 'entrega',
    descricao: 'Multiplicador da taxa no horário de pico'
  },
  
  // Notificações
  {
    chave: 'email_from',
    valor: 'noreply@pedelogo.com',
    categoria: 'notificacoes',
    descricao: 'E-mail remetente padrão'
  },
  {
    chave: 'smtp_host',
    valor: '',
    categoria: 'notificacoes',
    descricao: 'Servidor SMTP'
  },
  {
    chave: 'smtp_port',
    valor: '587',
    categoria: 'notificacoes',
    descricao: 'Porta do servidor SMTP'
  },
  {
    chave: 'push_notification_key',
    valor: '',
    categoria: 'notificacoes',
    descricao: 'Chave para notificações push'
  }
];

export const initializeSystemConfigurations = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    // Check if configurations already exist
    const { data: existingConfigs } = await supabase
      .from('system_configurations')
      .select('chave');
    
    const existingKeys = new Set(existingConfigs?.map(config => config.chave) || []);
    
    // Insert only new configurations
    const newConfigs = defaultSystemConfigurations
      .filter(config => !existingKeys.has(config.chave))
      .map(config => ({
        ...config,
        updated_at: new Date().toISOString()
      }));
    
    if (newConfigs.length > 0) {
      const { error } = await supabase
        .from('system_configurations')
        .insert(newConfigs);
      
      if (error) {
        console.error('Error initializing system configurations:', error);
      } else {
        console.log(`Initialized ${newConfigs.length} system configurations`);
      }
    }
  } catch (error) {
    console.error('Error during system configuration initialization:', error);
  }
};

// Hook to get system configuration
export const useSystemConfig = () => {
  return {
    initializeConfigurations: initializeSystemConfigurations
  };
};
