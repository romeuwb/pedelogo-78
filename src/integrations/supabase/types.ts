export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          nome: string
          role: Database["public"]["Enums"]["admin_role"]
          token: string
          updated_at: string
          used: boolean
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          nome: string
          role?: Database["public"]["Enums"]["admin_role"]
          token?: string
          updated_at?: string
          used?: boolean
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          nome?: string
          role?: Database["public"]["Enums"]["admin_role"]
          token?: string
          updated_at?: string
          used?: boolean
          used_at?: string | null
        }
        Relationships: []
      }
      admin_products: {
        Row: {
          ativo: boolean | null
          calorias: number | null
          categoria: string
          codigo_barras: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          ingredientes: string[] | null
          livre_gluten: boolean | null
          livre_lactose: boolean | null
          nome: string
          tempo_preparo: number | null
          updated_at: string
          vegano: boolean | null
          vegetariano: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          calorias?: number | null
          categoria: string
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          ingredientes?: string[] | null
          livre_gluten?: boolean | null
          livre_lactose?: boolean | null
          nome: string
          tempo_preparo?: number | null
          updated_at?: string
          vegano?: boolean | null
          vegetariano?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          calorias?: number | null
          categoria?: string
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          ingredientes?: string[] | null
          livre_gluten?: boolean | null
          livre_lactose?: boolean | null
          nome?: string
          tempo_preparo?: number | null
          updated_at?: string
          vegano?: boolean | null
          vegetariano?: boolean | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          acao: string
          admin_id: string
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          ip_address: unknown | null
          registro_id: string | null
          tabela_afetada: string | null
          user_agent: string | null
        }
        Insert: {
          acao: string
          admin_id: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown | null
          registro_id?: string | null
          tabela_afetada?: string | null
          user_agent?: string | null
        }
        Update: {
          acao?: string
          admin_id?: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown | null
          registro_id?: string | null
          tabela_afetada?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          imagem_url: string
          link_url: string | null
          posicao: number | null
          target_audience: string[] | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          imagem_url: string
          link_url?: string | null
          posicao?: number | null
          target_audience?: string[] | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string
          link_url?: string | null
          posicao?: number | null
          target_audience?: string[] | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      client_campaign_history: {
        Row: {
          campaign_id: string
          client_id: string
          coupon_used: boolean | null
          coupon_used_at: string | null
          id: string
          message_sent: string
          response_rate: number | null
          sent_at: string
        }
        Insert: {
          campaign_id: string
          client_id: string
          coupon_used?: boolean | null
          coupon_used_at?: string | null
          id?: string
          message_sent: string
          response_rate?: number | null
          sent_at?: string
        }
        Update: {
          campaign_id?: string
          client_id?: string
          coupon_used?: boolean | null
          coupon_used_at?: string | null
          id?: string
          message_sent?: string
          response_rate?: number | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_campaign_history_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "client_marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_campaign_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      client_cart: {
        Row: {
          created_at: string
          id: string
          itens: Json
          observacoes: string | null
          restaurant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          itens?: Json
          observacoes?: string | null
          restaurant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          itens?: Json
          observacoes?: string | null
          restaurant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_cart_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      client_consumption_history: {
        Row: {
          client_id: string
          created_at: string
          id: string
          order_date: string
          product_id: string
          quantity: number
          restaurant_id: string
          total_spent: number
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          order_date: string
          product_id: string
          quantity?: number
          restaurant_id: string
          total_spent: number
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          order_date?: string
          product_id?: string
          quantity?: number
          restaurant_id?: string
          total_spent?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_consumption_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_consumption_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "restaurant_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_consumption_history_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      client_coupon_history: {
        Row: {
          coupon_id: string
          data_utilizacao: string
          id: string
          order_id: string | null
          user_id: string
          valor_desconto: number
        }
        Insert: {
          coupon_id: string
          data_utilizacao?: string
          id?: string
          order_id?: string | null
          user_id: string
          valor_desconto: number
        }
        Update: {
          coupon_id?: string
          data_utilizacao?: string
          id?: string
          order_id?: string | null
          user_id?: string
          valor_desconto?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_coupon_history_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_coupon_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      client_favorites: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      client_marketing_campaigns: {
        Row: {
          active: boolean
          auto_send: boolean
          campaign_name: string
          campaign_type: string
          coupon_id: string | null
          created_at: string
          id: string
          message_template: string
          restaurant_id: string
          send_date: string | null
          target_criteria: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          auto_send?: boolean
          campaign_name: string
          campaign_type: string
          coupon_id?: string | null
          created_at?: string
          id?: string
          message_template: string
          restaurant_id: string
          send_date?: string | null
          target_criteria: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          auto_send?: boolean
          campaign_name?: string
          campaign_type?: string
          coupon_id?: string | null
          created_at?: string
          id?: string
          message_template?: string
          restaurant_id?: string
          send_date?: string | null
          target_criteria?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_marketing_campaigns_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_marketing_campaigns_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notifications: {
        Row: {
          created_at: string
          dados_extras: Json | null
          data_leitura: string | null
          id: string
          lida: boolean
          mensagem: string
          order_id: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dados_extras?: Json | null
          data_leitura?: string | null
          id?: string
          lida?: boolean
          mensagem: string
          order_id?: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          dados_extras?: Json | null
          data_leitura?: string | null
          id?: string
          lida?: boolean
          mensagem?: string
          order_id?: string | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      client_payment_methods: {
        Row: {
          ativo: boolean
          created_at: string
          dados_pagamento: Json | null
          id: string
          nome_metodo: string
          padrao: boolean
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          dados_pagamento?: Json | null
          id?: string
          nome_metodo: string
          padrao?: boolean
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          dados_pagamento?: Json | null
          id?: string
          nome_metodo?: string
          padrao?: boolean
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_preferences: {
        Row: {
          created_at: string
          endereco_padrao_id: string | null
          faixa_preco_preferida: string | null
          id: string
          metodo_pagamento_padrao_id: string | null
          modo_escuro: boolean | null
          notificacoes_email: boolean | null
          notificacoes_promocoes: boolean | null
          notificacoes_push: boolean | null
          notificacoes_sms: boolean | null
          raio_entrega_preferido: number | null
          tempo_maximo_entrega: number | null
          tipos_cozinha_preferidos: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endereco_padrao_id?: string | null
          faixa_preco_preferida?: string | null
          id?: string
          metodo_pagamento_padrao_id?: string | null
          modo_escuro?: boolean | null
          notificacoes_email?: boolean | null
          notificacoes_promocoes?: boolean | null
          notificacoes_push?: boolean | null
          notificacoes_sms?: boolean | null
          raio_entrega_preferido?: number | null
          tempo_maximo_entrega?: number | null
          tipos_cozinha_preferidos?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          endereco_padrao_id?: string | null
          faixa_preco_preferida?: string | null
          id?: string
          metodo_pagamento_padrao_id?: string | null
          modo_escuro?: boolean | null
          notificacoes_email?: boolean | null
          notificacoes_promocoes?: boolean | null
          notificacoes_push?: boolean | null
          notificacoes_sms?: boolean | null
          raio_entrega_preferido?: number | null
          tempo_maximo_entrega?: number | null
          tipos_cozinha_preferidos?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_preferences_endereco_padrao_id_fkey"
            columns: ["endereco_padrao_id"]
            isOneToOne: false
            referencedRelation: "user_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_preferences_metodo_pagamento_padrao_id_fkey"
            columns: ["metodo_pagamento_padrao_id"]
            isOneToOne: false
            referencedRelation: "client_payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      client_product_preferences: {
        Row: {
          client_id: string
          created_at: string
          id: string
          last_ordered: string | null
          order_frequency: number | null
          preference_score: number
          product_id: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          last_ordered?: string | null
          order_frequency?: number | null
          preference_score?: number
          product_id: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          last_ordered?: string | null
          order_frequency?: number | null
          preference_score?: number
          product_id?: string
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_product_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_product_preferences_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "restaurant_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_product_preferences_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      client_recommendations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          motivo_recomendacao: string
          restaurant_id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          motivo_recomendacao: string
          restaurant_id: string
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          motivo_recomendacao?: string
          restaurant_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_recommendations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      client_search_history: {
        Row: {
          categoria: string | null
          created_at: string
          filtros_aplicados: Json | null
          id: string
          termo_pesquisa: string
          user_id: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          filtros_aplicados?: Json | null
          id?: string
          termo_pesquisa: string
          user_id: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          filtros_aplicados?: Json | null
          id?: string
          termo_pesquisa?: string
          user_id?: string
        }
        Relationships: []
      }
      client_subscriptions: {
        Row: {
          cliente_id: string
          created_at: string
          data_inicio: string
          data_proxima_cobranca: string | null
          data_vencimento: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          plano_id: string
          status: string
          updated_at: string
          valor_pago: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_inicio?: string
          data_proxima_cobranca?: string | null
          data_vencimento: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          plano_id: string
          status?: string
          updated_at?: string
          valor_pago: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_inicio?: string
          data_proxima_cobranca?: string | null
          data_vencimento?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          plano_id?: string
          status?: string
          updated_at?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_subscriptions_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          created_at: string | null
          id: string
          order_id: string
          user_id: string
          valor_desconto: number
        }
        Insert: {
          coupon_id: string
          created_at?: string | null
          id?: string
          order_id: string
          user_id: string
          valor_desconto: number
        }
        Update: {
          coupon_id?: string
          created_at?: string | null
          id?: string
          order_id?: string
          user_id?: string
          valor_desconto?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          apenas_novos_clientes: boolean | null
          ativo: boolean | null
          codigo: string
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: string
          limite_uso: number | null
          restaurantes_especificos: string[] | null
          tipo_desconto: string
          updated_at: string | null
          usos_realizados: number | null
          valor_desconto: number
          valor_minimo_pedido: number | null
        }
        Insert: {
          apenas_novos_clientes?: boolean | null
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          limite_uso?: number | null
          restaurantes_especificos?: string[] | null
          tipo_desconto: string
          updated_at?: string | null
          usos_realizados?: number | null
          valor_desconto: number
          valor_minimo_pedido?: number | null
        }
        Update: {
          apenas_novos_clientes?: boolean | null
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          limite_uso?: number | null
          restaurantes_especificos?: string[] | null
          tipo_desconto?: string
          updated_at?: string | null
          usos_realizados?: number | null
          valor_desconto?: number
          valor_minimo_pedido?: number | null
        }
        Relationships: []
      }
      customer_communications: {
        Row: {
          cliente_id: string
          created_at: string | null
          enviada_por: string | null
          id: string
          mensagem: string
          order_id: string
          restaurant_id: string
          tipo_mensagem: string
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          enviada_por?: string | null
          id?: string
          mensagem: string
          order_id: string
          restaurant_id: string
          tipo_mensagem: string
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          enviada_por?: string | null
          id?: string
          mensagem?: string
          order_id?: string
          restaurant_id?: string
          tipo_mensagem?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_communications_enviada_por_fkey"
            columns: ["enviada_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "customer_communications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_communications_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_bank_details: {
        Row: {
          agencia: string
          ativo: boolean | null
          banco: string
          chave_pix: string | null
          conta: string
          cpf_titular: string
          created_at: string | null
          delivery_detail_id: string
          id: string
          tipo_chave_pix: string | null
          tipo_conta: string
          titular_conta: string
          updated_at: string | null
          verificado: boolean | null
        }
        Insert: {
          agencia: string
          ativo?: boolean | null
          banco: string
          chave_pix?: string | null
          conta: string
          cpf_titular: string
          created_at?: string | null
          delivery_detail_id: string
          id?: string
          tipo_chave_pix?: string | null
          tipo_conta: string
          titular_conta: string
          updated_at?: string | null
          verificado?: boolean | null
        }
        Update: {
          agencia?: string
          ativo?: boolean | null
          banco?: string
          chave_pix?: string | null
          conta?: string
          cpf_titular?: string
          created_at?: string | null
          delivery_detail_id?: string
          id?: string
          tipo_chave_pix?: string | null
          tipo_conta?: string
          titular_conta?: string
          updated_at?: string | null
          verificado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_bank_details_delivery_detail_id_fkey"
            columns: ["delivery_detail_id"]
            isOneToOne: false
            referencedRelation: "delivery_details"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_details: {
        Row: {
          aceita_termos: boolean | null
          banco_agencia: string | null
          banco_conta: string | null
          banco_tipo_conta: string | null
          categorias_servico: string[] | null
          cep: string | null
          cidade: string | null
          cor_veiculo: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          data_ultima_atividade: string | null
          disponibilidade_horarios: Json | null
          disponivel_para_entregas: boolean | null
          documento_veiculo: string | null
          documentos_verificados: boolean
          endereco: string | null
          estado: string | null
          foto_perfil: string | null
          id: string
          localizacao_atual: Json | null
          modelo_veiculo: string | null
          numero_cnh: string | null
          placa_veiculo: string | null
          raio_atuacao: number | null
          rating_medio: number | null
          status_aprovacao: Database["public"]["Enums"]["approval_status"]
          status_online: boolean | null
          tem_experiencia: boolean | null
          total_entregas: number | null
          updated_at: string
          user_id: string
          veiculos: string[] | null
        }
        Insert: {
          aceita_termos?: boolean | null
          banco_agencia?: string | null
          banco_conta?: string | null
          banco_tipo_conta?: string | null
          categorias_servico?: string[] | null
          cep?: string | null
          cidade?: string | null
          cor_veiculo?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_ultima_atividade?: string | null
          disponibilidade_horarios?: Json | null
          disponivel_para_entregas?: boolean | null
          documento_veiculo?: string | null
          documentos_verificados?: boolean
          endereco?: string | null
          estado?: string | null
          foto_perfil?: string | null
          id?: string
          localizacao_atual?: Json | null
          modelo_veiculo?: string | null
          numero_cnh?: string | null
          placa_veiculo?: string | null
          raio_atuacao?: number | null
          rating_medio?: number | null
          status_aprovacao?: Database["public"]["Enums"]["approval_status"]
          status_online?: boolean | null
          tem_experiencia?: boolean | null
          total_entregas?: number | null
          updated_at?: string
          user_id: string
          veiculos?: string[] | null
        }
        Update: {
          aceita_termos?: boolean | null
          banco_agencia?: string | null
          banco_conta?: string | null
          banco_tipo_conta?: string | null
          categorias_servico?: string[] | null
          cep?: string | null
          cidade?: string | null
          cor_veiculo?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_ultima_atividade?: string | null
          disponibilidade_horarios?: Json | null
          disponivel_para_entregas?: boolean | null
          documento_veiculo?: string | null
          documentos_verificados?: boolean
          endereco?: string | null
          estado?: string | null
          foto_perfil?: string | null
          id?: string
          localizacao_atual?: Json | null
          modelo_veiculo?: string | null
          numero_cnh?: string | null
          placa_veiculo?: string | null
          raio_atuacao?: number | null
          rating_medio?: number | null
          status_aprovacao?: Database["public"]["Enums"]["approval_status"]
          status_online?: boolean | null
          tem_experiencia?: boolean | null
          total_entregas?: number | null
          updated_at?: string
          user_id?: string
          veiculos?: string[] | null
        }
        Relationships: []
      }
      delivery_documents: {
        Row: {
          created_at: string | null
          delivery_detail_id: string
          id: string
          tipo_documento: string
          updated_at: string | null
          url_documento: string
          verificado: boolean | null
        }
        Insert: {
          created_at?: string | null
          delivery_detail_id: string
          id?: string
          tipo_documento: string
          updated_at?: string | null
          url_documento: string
          verificado?: boolean | null
        }
        Update: {
          created_at?: string | null
          delivery_detail_id?: string
          id?: string
          tipo_documento?: string
          updated_at?: string | null
          url_documento?: string
          verificado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_documents_delivery_detail_id_fkey"
            columns: ["delivery_detail_id"]
            isOneToOne: false
            referencedRelation: "delivery_details"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_earnings: {
        Row: {
          bonus: number | null
          created_at: string | null
          data_pagamento: string | null
          delivery_detail_id: string
          desconto: number | null
          distancia_km: number | null
          gorjeta: number | null
          id: string
          order_id: string
          status_pagamento: string | null
          tempo_entrega_minutos: number | null
          valor_base: number
          valor_total: number
        }
        Insert: {
          bonus?: number | null
          created_at?: string | null
          data_pagamento?: string | null
          delivery_detail_id: string
          desconto?: number | null
          distancia_km?: number | null
          gorjeta?: number | null
          id?: string
          order_id: string
          status_pagamento?: string | null
          tempo_entrega_minutos?: number | null
          valor_base: number
          valor_total: number
        }
        Update: {
          bonus?: number | null
          created_at?: string | null
          data_pagamento?: string | null
          delivery_detail_id?: string
          desconto?: number | null
          distancia_km?: number | null
          gorjeta?: number | null
          id?: string
          order_id?: string
          status_pagamento?: string | null
          tempo_entrega_minutos?: number | null
          valor_base?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_earnings_delivery_detail_id_fkey"
            columns: ["delivery_detail_id"]
            isOneToOne: false
            referencedRelation: "delivery_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_incident_reports: {
        Row: {
          created_at: string | null
          delivery_detail_id: string
          descricao: string
          fotos: Json | null
          id: string
          localizacao: Json | null
          order_id: string | null
          resolucao: string | null
          resolvido: boolean | null
          tipo_problema: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_detail_id: string
          descricao: string
          fotos?: Json | null
          id?: string
          localizacao?: Json | null
          order_id?: string | null
          resolucao?: string | null
          resolvido?: boolean | null
          tipo_problema: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_detail_id?: string
          descricao?: string
          fotos?: Json | null
          id?: string
          localizacao?: Json | null
          order_id?: string | null
          resolucao?: string | null
          resolvido?: boolean | null
          tipo_problema?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_incident_reports_delivery_detail_id_fkey"
            columns: ["delivery_detail_id"]
            isOneToOne: false
            referencedRelation: "delivery_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_incident_reports_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_notifications: {
        Row: {
          created_at: string | null
          dados_extras: Json | null
          data_leitura: string | null
          delivery_detail_id: string
          id: string
          lida: boolean | null
          mensagem: string
          order_id: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          dados_extras?: Json | null
          data_leitura?: string | null
          delivery_detail_id: string
          id?: string
          lida?: boolean | null
          mensagem: string
          order_id?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          dados_extras?: Json | null
          data_leitura?: string | null
          delivery_detail_id?: string
          id?: string
          lida?: boolean | null
          mensagem?: string
          order_id?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_notifications_delivery_detail_id_fkey"
            columns: ["delivery_detail_id"]
            isOneToOne: false
            referencedRelation: "delivery_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_ratings: {
        Row: {
          cliente_id: string
          comentario: string | null
          created_at: string | null
          delivery_detail_id: string
          id: string
          nota: number
          order_id: string
        }
        Insert: {
          cliente_id: string
          comentario?: string | null
          created_at?: string | null
          delivery_detail_id: string
          id?: string
          nota: number
          order_id: string
        }
        Update: {
          cliente_id?: string
          comentario?: string | null
          created_at?: string | null
          delivery_detail_id?: string
          id?: string
          nota?: number
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_ratings_delivery_detail_id_fkey"
            columns: ["delivery_detail_id"]
            isOneToOne: false
            referencedRelation: "delivery_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_status_history: {
        Row: {
          created_at: string | null
          delivery_detail_id: string
          id: string
          localizacao: Json | null
          status_anterior: boolean | null
          status_novo: boolean
        }
        Insert: {
          created_at?: string | null
          delivery_detail_id: string
          id?: string
          localizacao?: Json | null
          status_anterior?: boolean | null
          status_novo: boolean
        }
        Update: {
          created_at?: string | null
          delivery_detail_id?: string
          id?: string
          localizacao?: Json | null
          status_anterior?: boolean | null
          status_novo?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "delivery_status_history_delivery_detail_id_fkey"
            columns: ["delivery_detail_id"]
            isOneToOne: false
            referencedRelation: "delivery_details"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_vehicles: {
        Row: {
          ano: number | null
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          delivery_detail_id: string
          id: string
          marca: string | null
          modelo: string | null
          placa: string | null
          principal: boolean | null
          renavam: string | null
          status_verificacao:
            | Database["public"]["Enums"]["document_status"]
            | null
          tipo_veiculo: Database["public"]["Enums"]["vehicle_type"]
          updated_at: string | null
        }
        Insert: {
          ano?: number | null
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          delivery_detail_id: string
          id?: string
          marca?: string | null
          modelo?: string | null
          placa?: string | null
          principal?: boolean | null
          renavam?: string | null
          status_verificacao?:
            | Database["public"]["Enums"]["document_status"]
            | null
          tipo_veiculo: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string | null
        }
        Update: {
          ano?: number | null
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          delivery_detail_id?: string
          id?: string
          marca?: string | null
          modelo?: string | null
          placa?: string | null
          principal?: boolean | null
          renavam?: string | null
          status_verificacao?:
            | Database["public"]["Enums"]["document_status"]
            | null
          tipo_veiculo?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_vehicles_delivery_detail_id_fkey"
            columns: ["delivery_detail_id"]
            isOneToOne: false
            referencedRelation: "delivery_details"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          delivery_detail_id: string
          id: string
          nome_zona: string
          poligono: Json
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          delivery_detail_id: string
          id?: string
          nome_zona: string
          poligono: Json
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          delivery_detail_id?: string
          id?: string
          nome_zona?: string
          poligono?: Json
        }
        Relationships: [
          {
            foreignKeyName: "delivery_zones_delivery_detail_id_fkey"
            columns: ["delivery_detail_id"]
            isOneToOne: false
            referencedRelation: "delivery_details"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          assunto: string
          ativo: boolean | null
          conteudo_html: string
          created_at: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string | null
          variaveis: string[] | null
        }
        Insert: {
          assunto: string
          ativo?: boolean | null
          conteudo_html: string
          created_at?: string | null
          id?: string
          nome: string
          tipo: string
          updated_at?: string | null
          variaveis?: string[] | null
        }
        Update: {
          assunto?: string
          ativo?: boolean | null
          conteudo_html?: string
          created_at?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string | null
          variaveis?: string[] | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          created_at: string
          data_transacao: string
          entregador_id: string | null
          id: string
          pedido_id: string | null
          periodo_cobranca: string | null
          restaurante_id: string | null
          tipo: string
          valor: number
        }
        Insert: {
          created_at?: string
          data_transacao?: string
          entregador_id?: string | null
          id?: string
          pedido_id?: string | null
          periodo_cobranca?: string | null
          restaurante_id?: string | null
          tipo: string
          valor: number
        }
        Update: {
          created_at?: string
          data_transacao?: string
          entregador_id?: string | null
          id?: string
          pedido_id?: string | null
          periodo_cobranca?: string | null
          restaurante_id?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: []
      }
      optimized_routes: {
        Row: {
          created_at: string
          estimated_cost: number | null
          id: string
          optimization_type: string
          orders_included: Json
          restaurant_id: string
          route_data: Json
          route_name: string
          status: string
          total_distance: number | null
          total_time: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          optimization_type?: string
          orders_included?: Json
          restaurant_id: string
          route_data: Json
          route_name: string
          status?: string
          total_distance?: number | null
          total_time?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          optimization_type?: string
          orders_included?: Json
          restaurant_id?: string
          route_data?: Json
          route_name?: string
          status?: string
          total_distance?: number | null
          total_time?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "optimized_routes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          nome_item: string
          observacoes: string | null
          order_id: string
          preco_unitario: number
          quantidade: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome_item: string
          observacoes?: string | null
          order_id: string
          preco_unitario: number
          quantidade: number
        }
        Update: {
          created_at?: string | null
          id?: string
          nome_item?: string
          observacoes?: string | null
          order_id?: string
          preco_unitario?: number
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cliente_id: string
          created_at: string | null
          endereco_entrega: Json
          entregador_id: string | null
          id: string
          observacoes: string | null
          restaurante_id: string
          status: string | null
          taxa_entrega: number | null
          tempo_estimado: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          endereco_entrega: Json
          entregador_id?: string | null
          id?: string
          observacoes?: string | null
          restaurante_id: string
          status?: string | null
          taxa_entrega?: number | null
          tempo_estimado?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          endereco_entrega?: Json
          entregador_id?: string | null
          id?: string
          observacoes?: string | null
          restaurante_id?: string
          status?: string | null
          taxa_entrega?: number | null
          tempo_estimado?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_models: {
        Row: {
          ativo: boolean
          comissao_entregador: number
          comissao_restaurante: number
          created_at: string
          id: string
          periodo: string
          taxa_plataforma: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          comissao_entregador: number
          comissao_restaurante: number
          created_at?: string
          id?: string
          periodo: string
          taxa_plataforma: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          comissao_entregador?: number
          comissao_restaurante?: number
          created_at?: string
          id?: string
          periodo?: string
          taxa_plataforma?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          aprovado_por: string | null
          comprovante_url: string | null
          created_at: string
          data_aprovacao: string | null
          data_fim: string
          data_inicio: string
          data_pagamento: string | null
          id: string
          observacoes: string | null
          periodo_referencia: string
          solicitante_id: string
          status: string
          tipo_solicitante: string
          updated_at: string
          valor_solicitado: number
        }
        Insert: {
          aprovado_por?: string | null
          comprovante_url?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_fim: string
          data_inicio: string
          data_pagamento?: string | null
          id?: string
          observacoes?: string | null
          periodo_referencia: string
          solicitante_id: string
          status?: string
          tipo_solicitante: string
          updated_at?: string
          valor_solicitado: number
        }
        Update: {
          aprovado_por?: string | null
          comprovante_url?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_fim?: string
          data_inicio?: string
          data_pagamento?: string | null
          id?: string
          observacoes?: string | null
          periodo_referencia?: string
          solicitante_id?: string
          status?: string
          tipo_solicitante?: string
          updated_at?: string
          valor_solicitado?: number
        }
        Relationships: []
      }
      plan_categories: {
        Row: {
          ativo: boolean
          cor: string | null
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          posicao: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          posicao?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          posicao?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      plan_category_features: {
        Row: {
          ativo: boolean
          category_id: string
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          posicao: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          category_id: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          posicao?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          category_id?: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          posicao?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_category_features_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "plan_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          posicao: number | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          posicao?: number | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          posicao?: number | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          cadastro_completo: boolean | null
          created_at: string
          data_nascimento: string | null
          data_ultimo_acesso: string | null
          documento: string | null
          email: string
          email_confirmado: boolean | null
          endereco: string | null
          genero: string | null
          id: string
          idioma: string | null
          nome: string
          preferencias_notificacao: Json | null
          telefone: string | null
          tipo: Database["public"]["Enums"]["user_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          cadastro_completo?: boolean | null
          created_at?: string
          data_nascimento?: string | null
          data_ultimo_acesso?: string | null
          documento?: string | null
          email: string
          email_confirmado?: boolean | null
          endereco?: string | null
          genero?: string | null
          id?: string
          idioma?: string | null
          nome: string
          preferencias_notificacao?: Json | null
          telefone?: string | null
          tipo: Database["public"]["Enums"]["user_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          cadastro_completo?: boolean | null
          created_at?: string
          data_nascimento?: string | null
          data_ultimo_acesso?: string | null
          documento?: string | null
          email?: string
          email_confirmado?: boolean | null
          endereco?: string | null
          genero?: string | null
          id?: string
          idioma?: string | null
          nome?: string
          preferencias_notificacao?: Json | null
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["user_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurant_admin_products: {
        Row: {
          admin_product_id: string
          created_at: string
          disponivel: boolean | null
          id: string
          preco: number
          restaurant_id: string
          restaurant_product_id: string
          updated_at: string
        }
        Insert: {
          admin_product_id: string
          created_at?: string
          disponivel?: boolean | null
          id?: string
          preco: number
          restaurant_id: string
          restaurant_product_id: string
          updated_at?: string
        }
        Update: {
          admin_product_id?: string
          created_at?: string
          disponivel?: boolean | null
          id?: string
          preco?: number
          restaurant_id?: string
          restaurant_product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_admin_products_admin_product_id_fkey"
            columns: ["admin_product_id"]
            isOneToOne: false
            referencedRelation: "admin_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_admin_products_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_admin_products_restaurant_product_id_fkey"
            columns: ["restaurant_product_id"]
            isOneToOne: false
            referencedRelation: "restaurant_products"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_details: {
        Row: {
          aceita_delivery: boolean | null
          aceita_retirada: boolean | null
          capacidade_mesas: number | null
          categoria: string
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string
          descricao: string | null
          endereco: string | null
          estado: string | null
          horario_funcionamento: Json | null
          id: string
          logo_url: string | null
          nome_fantasia: string | null
          razao_social: string | null
          responsavel_cpf: string | null
          responsavel_nome: string | null
          status_aprovacao: Database["public"]["Enums"]["approval_status"]
          taxa_entrega: number | null
          tempo_entrega_min: number | null
          tipo_estabelecimento: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aceita_delivery?: boolean | null
          aceita_retirada?: boolean | null
          capacidade_mesas?: number | null
          categoria: string
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome_fantasia?: string | null
          razao_social?: string | null
          responsavel_cpf?: string | null
          responsavel_nome?: string | null
          status_aprovacao?: Database["public"]["Enums"]["approval_status"]
          taxa_entrega?: number | null
          tempo_entrega_min?: number | null
          tipo_estabelecimento?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aceita_delivery?: boolean | null
          aceita_retirada?: boolean | null
          capacidade_mesas?: number | null
          categoria?: string
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome_fantasia?: string | null
          razao_social?: string | null
          responsavel_cpf?: string | null
          responsavel_nome?: string | null
          status_aprovacao?: Database["public"]["Enums"]["approval_status"]
          taxa_entrega?: number | null
          tempo_entrega_min?: number | null
          tipo_estabelecimento?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurant_employees: {
        Row: {
          ativo: boolean | null
          cargo: string
          created_at: string
          data_admissao: string | null
          email: string
          id: string
          nome: string
          permissoes: Json | null
          restaurant_id: string
          salario: number | null
          telefone: string | null
          turno: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo: string
          created_at?: string
          data_admissao?: string | null
          email: string
          id?: string
          nome: string
          permissoes?: Json | null
          restaurant_id: string
          salario?: number | null
          telefone?: string | null
          turno?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string
          created_at?: string
          data_admissao?: string | null
          email?: string
          id?: string
          nome?: string
          permissoes?: Json | null
          restaurant_id?: string
          salario?: number | null
          telefone?: string | null
          turno?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_employees_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_message_templates: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          mensagem: string
          restaurant_id: string
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          mensagem: string
          restaurant_id: string
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          mensagem?: string
          restaurant_id?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_message_templates_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_operating_hours: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          closing_time: string
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          opening_time: string
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          closing_time: string
          created_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          opening_time: string
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          closing_time?: string
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          opening_time?: string
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_operating_hours_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_payouts: {
        Row: {
          comprovante_url: string | null
          created_at: string | null
          data_processamento: string | null
          id: string
          observacoes: string | null
          periodo_fim: string
          periodo_inicio: string
          restaurant_id: string
          status: string | null
          updated_at: string | null
          valor_bruto: number
          valor_comissao: number
          valor_liquido: number
        }
        Insert: {
          comprovante_url?: string | null
          created_at?: string | null
          data_processamento?: string | null
          id?: string
          observacoes?: string | null
          periodo_fim: string
          periodo_inicio: string
          restaurant_id: string
          status?: string | null
          updated_at?: string | null
          valor_bruto: number
          valor_comissao: number
          valor_liquido: number
        }
        Update: {
          comprovante_url?: string | null
          created_at?: string | null
          data_processamento?: string | null
          id?: string
          observacoes?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          restaurant_id?: string
          status?: string | null
          updated_at?: string | null
          valor_bruto?: number
          valor_comissao?: number
          valor_liquido?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_payouts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_product_availability: {
        Row: {
          created_at: string | null
          data_indisponibilidade: string | null
          disponivel: boolean | null
          id: string
          motivo_indisponibilidade: string | null
          previsao_retorno: string | null
          product_id: string
          restaurant_id: string
          updated_at: string | null
          usuario_responsavel: string | null
        }
        Insert: {
          created_at?: string | null
          data_indisponibilidade?: string | null
          disponivel?: boolean | null
          id?: string
          motivo_indisponibilidade?: string | null
          previsao_retorno?: string | null
          product_id: string
          restaurant_id: string
          updated_at?: string | null
          usuario_responsavel?: string | null
        }
        Update: {
          created_at?: string | null
          data_indisponibilidade?: string | null
          disponivel?: boolean | null
          id?: string
          motivo_indisponibilidade?: string | null
          previsao_retorno?: string | null
          product_id?: string
          restaurant_id?: string
          updated_at?: string | null
          usuario_responsavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_product_availability_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "restaurant_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_product_availability_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_product_availability_usuario_responsavel_fkey"
            columns: ["usuario_responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      restaurant_products: {
        Row: {
          admin_product_id: string | null
          ativo: boolean | null
          calorias: number | null
          category_id: string | null
          codigo_barras: string | null
          created_at: string
          descricao: string | null
          disponivel: boolean | null
          favorito: boolean | null
          id: string
          imagem_url: string | null
          informacoes_nutricionais: Json | null
          ingredientes: string[] | null
          is_imported_from_admin: boolean | null
          livre_gluten: boolean | null
          livre_lactose: boolean | null
          nome: string
          preco: number
          preco_custo: number | null
          restaurant_id: string
          tempo_preparo: number | null
          unidade: string | null
          updated_at: string
          vegano: boolean | null
          vegetariano: boolean | null
        }
        Insert: {
          admin_product_id?: string | null
          ativo?: boolean | null
          calorias?: number | null
          category_id?: string | null
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          disponivel?: boolean | null
          favorito?: boolean | null
          id?: string
          imagem_url?: string | null
          informacoes_nutricionais?: Json | null
          ingredientes?: string[] | null
          is_imported_from_admin?: boolean | null
          livre_gluten?: boolean | null
          livre_lactose?: boolean | null
          nome: string
          preco: number
          preco_custo?: number | null
          restaurant_id: string
          tempo_preparo?: number | null
          unidade?: string | null
          updated_at?: string
          vegano?: boolean | null
          vegetariano?: boolean | null
        }
        Update: {
          admin_product_id?: string | null
          ativo?: boolean | null
          calorias?: number | null
          category_id?: string | null
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          disponivel?: boolean | null
          favorito?: boolean | null
          id?: string
          imagem_url?: string | null
          informacoes_nutricionais?: Json | null
          ingredientes?: string[] | null
          is_imported_from_admin?: boolean | null
          livre_gluten?: boolean | null
          livre_lactose?: boolean | null
          nome?: string
          preco?: number
          preco_custo?: number | null
          restaurant_id?: string
          tempo_preparo?: number | null
          unidade?: string | null
          updated_at?: string
          vegano?: boolean | null
          vegetariano?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_products_admin_product_id_fkey"
            columns: ["admin_product_id"]
            isOneToOne: false
            referencedRelation: "admin_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_products_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_promotions: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          dias_semana: number[] | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          limite_uso: number | null
          nome: string
          produtos_aplicaveis: string[] | null
          restaurant_id: string
          tipo_promocao: string
          updated_at: string | null
          usos_realizados: number | null
          valor_desconto: number | null
          valor_minimo_pedido: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          dias_semana?: number[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          limite_uso?: number | null
          nome: string
          produtos_aplicaveis?: string[] | null
          restaurant_id: string
          tipo_promocao: string
          updated_at?: string | null
          usos_realizados?: number | null
          valor_desconto?: number | null
          valor_minimo_pedido?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          dias_semana?: number[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          limite_uso?: number | null
          nome?: string
          produtos_aplicaveis?: string[] | null
          restaurant_id?: string
          tipo_promocao?: string
          updated_at?: string | null
          usos_realizados?: number | null
          valor_desconto?: number | null
          valor_minimo_pedido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          area_entrega: Json | null
          configuracao: Json | null
          configuracoes_notificacao: Json | null
          created_at: string
          dados_bancarios: Json | null
          delivery_fee_per_km: number | null
          delivery_zones: Json | null
          horario_funcionamento: Json | null
          id: string
          max_delivery_distance: number | null
          restaurant_id: string
          status_online: boolean | null
          updated_at: string
        }
        Insert: {
          area_entrega?: Json | null
          configuracao?: Json | null
          configuracoes_notificacao?: Json | null
          created_at?: string
          dados_bancarios?: Json | null
          delivery_fee_per_km?: number | null
          delivery_zones?: Json | null
          horario_funcionamento?: Json | null
          id?: string
          max_delivery_distance?: number | null
          restaurant_id: string
          status_online?: boolean | null
          updated_at?: string
        }
        Update: {
          area_entrega?: Json | null
          configuracao?: Json | null
          configuracoes_notificacao?: Json | null
          created_at?: string
          dados_bancarios?: Json | null
          delivery_fee_per_km?: number | null
          delivery_zones?: Json | null
          horario_funcionamento?: Json | null
          id?: string
          max_delivery_distance?: number | null
          restaurant_id?: string
          status_online?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_special_hours: {
        Row: {
          created_at: string | null
          data: string
          fechado: boolean | null
          horario_abertura: string | null
          horario_fechamento: string | null
          id: string
          motivo: string | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          fechado?: boolean | null
          horario_abertura?: string | null
          horario_fechamento?: string | null
          id?: string
          motivo?: string | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          fechado?: boolean | null
          horario_abertura?: string | null
          horario_fechamento?: string | null
          id?: string
          motivo?: string | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_special_hours_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_status_log: {
        Row: {
          created_at: string | null
          id: string
          motivo: string | null
          restaurant_id: string
          status_anterior: boolean | null
          status_novo: boolean | null
          usuario_responsavel: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          motivo?: string | null
          restaurant_id: string
          status_anterior?: boolean | null
          status_novo?: boolean | null
          usuario_responsavel?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          motivo?: string | null
          restaurant_id?: string
          status_anterior?: boolean | null
          status_novo?: boolean | null
          usuario_responsavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_status_log_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_status_log_usuario_responsavel_fkey"
            columns: ["usuario_responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      restaurant_suppliers: {
        Row: {
          categoria: string | null
          cnpj: string | null
          contato_nome: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          restaurant_id: string
          status: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          cnpj?: string | null
          contato_nome?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          restaurant_id: string
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          cnpj?: string | null
          contato_nome?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          restaurant_id?: string
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_suppliers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          ativo: boolean | null
          capacidade: number
          created_at: string
          id: string
          numero: number
          observacoes: string | null
          posicao_x: number | null
          posicao_y: number | null
          qr_code: string | null
          restaurant_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          capacidade?: number
          created_at?: string
          id?: string
          numero: number
          observacoes?: string | null
          posicao_x?: number | null
          posicao_y?: number | null
          qr_code?: string | null
          restaurant_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          capacidade?: number
          created_at?: string
          id?: string
          numero?: number
          observacoes?: string | null
          posicao_x?: number | null
          posicao_y?: number | null
          qr_code?: string | null
          restaurant_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          created_at: string | null
          id: string
          respondido_por: string | null
          resposta: string
          restaurant_id: string
          review_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          respondido_por?: string | null
          resposta: string
          restaurant_id: string
          review_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          respondido_por?: string | null
          resposta?: string
          restaurant_id?: string
          review_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_respondido_por_fkey"
            columns: ["respondido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "review_responses_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          cliente_id: string
          comentario: string | null
          created_at: string | null
          entregador_id: string | null
          id: string
          nota: number
          order_id: string
          restaurante_id: string | null
          tipo_avaliacao: string
        }
        Insert: {
          cliente_id: string
          comentario?: string | null
          created_at?: string | null
          entregador_id?: string | null
          id?: string
          nota: number
          order_id: string
          restaurante_id?: string | null
          tipo_avaliacao: string
        }
        Update: {
          cliente_id?: string
          comentario?: string | null
          created_at?: string | null
          entregador_id?: string | null
          id?: string
          nota?: number
          order_id?: string
          restaurante_id?: string | null
          tipo_avaliacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          destaque: boolean | null
          id: string
          limite_armazenamento: number | null
          limite_entregadores: number | null
          limite_pedidos_mes: number | null
          limite_restaurantes: number | null
          limite_usuarios: number | null
          nome: string
          posicao: number | null
          recursos: string[] | null
          tipo: string
          updated_at: string
          valor_comissao: number | null
          valor_mensalidade: number | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          limite_armazenamento?: number | null
          limite_entregadores?: number | null
          limite_pedidos_mes?: number | null
          limite_restaurantes?: number | null
          limite_usuarios?: number | null
          nome: string
          posicao?: number | null
          recursos?: string[] | null
          tipo: string
          updated_at?: string
          valor_comissao?: number | null
          valor_mensalidade?: number | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          limite_armazenamento?: number | null
          limite_entregadores?: number | null
          limite_pedidos_mes?: number | null
          limite_restaurantes?: number | null
          limite_usuarios?: number | null
          nome?: string
          posicao?: number | null
          recursos?: string[] | null
          tipo?: string
          updated_at?: string
          valor_comissao?: number | null
          valor_mensalidade?: number | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          anexos: Json | null
          assunto: string
          atribuido_para: string | null
          categoria: string
          created_at: string | null
          descricao: string
          id: string
          pedido_id: string | null
          prioridade: string | null
          status: string | null
          tipo_usuario: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          anexos?: Json | null
          assunto: string
          atribuido_para?: string | null
          categoria: string
          created_at?: string | null
          descricao: string
          id?: string
          pedido_id?: string | null
          prioridade?: string | null
          status?: string | null
          tipo_usuario: string
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          anexos?: Json | null
          assunto?: string
          atribuido_para?: string | null
          categoria?: string
          created_at?: string | null
          descricao?: string
          id?: string
          pedido_id?: string | null
          prioridade?: string | null
          status?: string | null
          tipo_usuario?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_atribuido_para_fkey"
            columns: ["atribuido_para"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configurations: {
        Row: {
          categoria: string
          chave: string
          created_at: string | null
          descricao: string | null
          id: string
          updated_at: string | null
          valor: Json
        }
        Insert: {
          categoria: string
          chave: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor: Json
        }
        Update: {
          categoria?: string
          chave?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor?: Json
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          credit_card_enabled: boolean | null
          debit_card_enabled: boolean | null
          delivery_base_fee: number | null
          delivery_per_km: number | null
          delivery_zones_enabled: boolean | null
          dynamic_pricing: boolean | null
          favicon_url: string | null
          google_maps_api: string | null
          id: string
          logo_url: string | null
          max_delivery_distance: number | null
          money_enabled: boolean | null
          paypal_client_id: string | null
          paypal_client_secret: string | null
          paypal_enabled: boolean | null
          pix_enabled: boolean | null
          primary_color: string | null
          pusher_app_id: string | null
          pusher_app_key: string | null
          pusher_app_secret: string | null
          pusher_cluster: string | null
          rush_hour_multiplier: number | null
          secondary_color: string | null
          smtp_enabled: boolean | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_ssl: boolean | null
          smtp_user: string | null
          stripe_enabled: boolean | null
          stripe_public_key: string | null
          stripe_secret_key: string | null
          system_name: string
          updated_at: string
          weather_multiplier: number | null
        }
        Insert: {
          created_at?: string
          credit_card_enabled?: boolean | null
          debit_card_enabled?: boolean | null
          delivery_base_fee?: number | null
          delivery_per_km?: number | null
          delivery_zones_enabled?: boolean | null
          dynamic_pricing?: boolean | null
          favicon_url?: string | null
          google_maps_api?: string | null
          id?: string
          logo_url?: string | null
          max_delivery_distance?: number | null
          money_enabled?: boolean | null
          paypal_client_id?: string | null
          paypal_client_secret?: string | null
          paypal_enabled?: boolean | null
          pix_enabled?: boolean | null
          primary_color?: string | null
          pusher_app_id?: string | null
          pusher_app_key?: string | null
          pusher_app_secret?: string | null
          pusher_cluster?: string | null
          rush_hour_multiplier?: number | null
          secondary_color?: string | null
          smtp_enabled?: boolean | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_ssl?: boolean | null
          smtp_user?: string | null
          stripe_enabled?: boolean | null
          stripe_public_key?: string | null
          stripe_secret_key?: string | null
          system_name?: string
          updated_at?: string
          weather_multiplier?: number | null
        }
        Update: {
          created_at?: string
          credit_card_enabled?: boolean | null
          debit_card_enabled?: boolean | null
          delivery_base_fee?: number | null
          delivery_per_km?: number | null
          delivery_zones_enabled?: boolean | null
          dynamic_pricing?: boolean | null
          favicon_url?: string | null
          google_maps_api?: string | null
          id?: string
          logo_url?: string | null
          max_delivery_distance?: number | null
          money_enabled?: boolean | null
          paypal_client_id?: string | null
          paypal_client_secret?: string | null
          paypal_enabled?: boolean | null
          pix_enabled?: boolean | null
          primary_color?: string | null
          pusher_app_id?: string | null
          pusher_app_key?: string | null
          pusher_app_secret?: string | null
          pusher_cluster?: string | null
          rush_hour_multiplier?: number | null
          secondary_color?: string | null
          smtp_enabled?: boolean | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_ssl?: boolean | null
          smtp_user?: string | null
          stripe_enabled?: boolean | null
          stripe_public_key?: string | null
          stripe_secret_key?: string | null
          system_name?: string
          updated_at?: string
          weather_multiplier?: number | null
        }
        Relationships: []
      }
      ticket_responses: {
        Row: {
          anexos: Json | null
          autor_id: string
          created_at: string | null
          id: string
          mensagem: string
          ticket_id: string
          tipo_autor: string
        }
        Insert: {
          anexos?: Json | null
          autor_id: string
          created_at?: string | null
          id?: string
          mensagem: string
          ticket_id: string
          tipo_autor: string
        }
        Update: {
          anexos?: Json | null
          autor_id?: string
          created_at?: string | null
          id?: string
          mensagem?: string
          ticket_id?: string
          tipo_autor?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          bairro: string
          cep: string
          cidade: string
          complemento: string | null
          created_at: string
          estado: string
          id: string
          is_default: boolean
          logradouro: string
          numero: string
          pais: string
          tipo_endereco: Database["public"]["Enums"]["address_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          bairro: string
          cep: string
          cidade: string
          complemento?: string | null
          created_at?: string
          estado: string
          id?: string
          is_default?: boolean
          logradouro: string
          numero: string
          pais?: string
          tipo_endereco?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          complemento?: string | null
          created_at?: string
          estado?: string
          id?: string
          is_default?: boolean
          logradouro?: string
          numero?: string
          pais?: string
          tipo_endereco?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_delivery_earnings: {
        Args: {
          delivery_detail_id: string
          start_date?: string
          end_date?: string
        }
        Returns: Json
      }
      cleanup_expired_invites: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_recommendations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_audit_log: {
        Args: {
          p_admin_id: string
          p_acao: string
          p_tabela_afetada?: string
          p_registro_id?: string
          p_dados_anteriores?: Json
          p_dados_novos?: Json
        }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_delivery_owner: {
        Args: { delivery_detail_id: string }
        Returns: boolean
      }
      is_restaurant_owner: {
        Args: { restaurant_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      test_smtp_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      address_type: "residencial" | "comercial" | "entrega" | "cobranca"
      admin_role: "admin" | "moderator" | "super_admin" | "operador"
      approval_status: "pendente" | "aprovado" | "rejeitado"
      document_status:
        | "pendente"
        | "enviado"
        | "aprovado"
        | "rejeitado"
        | "expirado"
      user_type: "cliente" | "restaurante" | "entregador"
      vehicle_type: "moto" | "carro" | "bicicleta" | "patinete" | "a_pe"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      address_type: ["residencial", "comercial", "entrega", "cobranca"],
      admin_role: ["admin", "moderator", "super_admin", "operador"],
      approval_status: ["pendente", "aprovado", "rejeitado"],
      document_status: [
        "pendente",
        "enviado",
        "aprovado",
        "rejeitado",
        "expirado",
      ],
      user_type: ["cliente", "restaurante", "entregador"],
      vehicle_type: ["moto", "carro", "bicicleta", "patinete", "a_pe"],
    },
  },
} as const
