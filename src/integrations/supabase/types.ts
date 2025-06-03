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
          disponibilidade_horarios: Json | null
          documento_veiculo: string | null
          documentos_verificados: boolean
          endereco: string | null
          estado: string | null
          id: string
          modelo_veiculo: string | null
          numero_cnh: string | null
          placa_veiculo: string | null
          status_aprovacao: Database["public"]["Enums"]["approval_status"]
          tem_experiencia: boolean | null
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
          disponibilidade_horarios?: Json | null
          documento_veiculo?: string | null
          documentos_verificados?: boolean
          endereco?: string | null
          estado?: string | null
          id?: string
          modelo_veiculo?: string | null
          numero_cnh?: string | null
          placa_veiculo?: string | null
          status_aprovacao?: Database["public"]["Enums"]["approval_status"]
          tem_experiencia?: boolean | null
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
          disponibilidade_horarios?: Json | null
          documento_veiculo?: string | null
          documentos_verificados?: boolean
          endereco?: string | null
          estado?: string | null
          id?: string
          modelo_veiculo?: string | null
          numero_cnh?: string | null
          placa_veiculo?: string | null
          status_aprovacao?: Database["public"]["Enums"]["approval_status"]
          tem_experiencia?: boolean | null
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
          cadastro_completo: boolean | null
          created_at: string
          data_nascimento: string | null
          documento: string | null
          email: string
          email_confirmado: boolean | null
          endereco: string | null
          genero: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: Database["public"]["Enums"]["user_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          cadastro_completo?: boolean | null
          created_at?: string
          data_nascimento?: string | null
          documento?: string | null
          email: string
          email_confirmado?: boolean | null
          endereco?: string | null
          genero?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tipo: Database["public"]["Enums"]["user_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          cadastro_completo?: boolean | null
          created_at?: string
          data_nascimento?: string | null
          documento?: string | null
          email?: string
          email_confirmado?: boolean | null
          endereco?: string | null
          genero?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["user_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      restaurant_products: {
        Row: {
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
          ingredientes: string[] | null
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
          ingredientes?: string[] | null
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
          ingredientes?: string[] | null
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
      restaurant_settings: {
        Row: {
          configuracao: Json | null
          created_at: string
          id: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          configuracao?: Json | null
          created_at?: string
          id?: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          configuracao?: Json | null
          created_at?: string
          id?: string
          restaurant_id?: string
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
      cleanup_expired_invites: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
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
      user_type: "cliente" | "restaurante" | "entregador"
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
      user_type: ["cliente", "restaurante", "entregador"],
    },
  },
} as const
