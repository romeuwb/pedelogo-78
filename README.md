# 🍕 PedeLogo - Aplicativo de Delivery

> Aplicativo de delivery moderno e completo desenvolvido com React, TypeScript, Supabase e Capacitor.

## ✨ Características

- 🎯 **Multi-plataforma**: Web, Android e iOS
- 👥 **Multi-usuário**: Clientes, restaurantes e administradores
- 🗃️ **Backend moderno**: Supabase com PostgreSQL
- 🎨 **UI moderna**: Tailwind CSS + Radix UI
- 📱 **Mobile nativo**: Capacitor para iOS/Android
- 🔐 **Autenticação segura**: Row Level Security (RLS)
- 🚀 **Performance**: Vite + TypeScript

## 🛠 Stack Tecnológica

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool moderna
- **Tailwind CSS** - Styling utilitário
- **Radix UI** - Componentes acessíveis
- **Zustand** - Gerenciamento de estado
- **React Hook Form** - Formulários performáticos

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security** - Segurança nativa
- **Realtime** - Atualizações em tempo real

### Mobile
- **Capacitor** - Framework híbrido
- **PWA** - Progressive Web App
- **Android/iOS** - Apps nativos

## 📱 Funcionalidades por Perfil

### 👤 Cliente
- ✅ Buscar restaurantes por localização
- ✅ Navegar cardápios com filtros
- ✅ Carrinho de compras inteligente
- ✅ Múltiplos endereços de entrega
- ✅ Acompanhamento de pedidos em tempo real
- ✅ Histórico completo de pedidos
- ✅ Avaliação de restaurantes

### 🍳 Restaurante
- ✅ Dashboard completo de vendas
- ✅ Gerenciamento de cardápio
- ✅ Controle de estoque de produtos
- ✅ Gestão de pedidos em tempo real
- ✅ Relatórios de vendas e analytics
- ✅ Configurações de delivery
- ✅ Perfil público do restaurante

### 👨‍💼 Administrador
- ✅ Painel de controle geral
- ✅ Gestão de usuários e restaurantes
- ✅ Moderação de conteúdo
- ✅ Analytics gerais da plataforma
- ✅ Configurações do sistema
- ✅ Suporte e atendimento

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### 1. Clone e instale

```bash
git clone https://github.com/seu-usuario/pedelogo.git
cd pedelogo
npm install
```

### 2. Configure o ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite com suas credenciais do Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Configure o banco de dados

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o schema SQL no SQL Editor:

```sql
-- Copie o conteúdo de database/schema.sql
```

### 4. Execute o projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🗄️ Schema do Banco

O banco possui uma estrutura otimizada com 8 tabelas principais:

- **users**: Dados básicos dos usuários
- **profiles**: Perfis e roles dos usuários
- **restaurants**: Informações dos restaurantes
- **categories**: Categorias de produtos
- **products**: Catálogo de produtos
- **delivery_addresses**: Endereços de entrega
- **orders**: Pedidos dos clientes
- **order_items**: Itens de cada pedido

### Características do Schema
- ✅ Row Level Security (RLS) configurado
- ✅ Índices otimizados para performance
- ✅ Triggers automáticos para timestamps
- ✅ Constraints de validação
- ✅ Tipos enumerados para status

## 📱 Build Mobile

### Android
```bash
npm run android:build
# APK gerado em android/app/build/outputs/apk/
```

### iOS
```bash
npm run ios:build
# Requer Xcode no macOS
```

## 📂 Estrutura do Projeto

```
📦 pedelogo/
├── 📁 src/
│   ├── 📁 components/     # Componentes UI reutilizáveis
│   ├── 📁 pages/         # Páginas da aplicação
│   ├── 📁 lib/           # Utilitários e configurações
│   ├── 📁 stores/        # Estado global (Zustand)
│   ├── 📁 hooks/         # Custom hooks
│   └── 📁 types/         # Definições de tipos
├── 📁 database/          # Schema e migrations SQL
├── 📁 public/           # Assets estáticos
├── 📁 android/          # Projeto Android (Capacitor)
├── 📁 ios/             # Projeto iOS (Capacitor)
└── 📄 package.json     # Dependências e scripts
```

## 🔒 Segurança

- **RLS**: Cada tabela possui políticas de segurança
- **Autenticação**: Supabase Auth com JWT
- **Validação**: Constraints no banco + validação frontend
- **HTTPS**: Comunicação criptografada
- **Sanitização**: Dados validados e sanitizados

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Netlify
```bash
npm run build
# Deploy da pasta dist/
```

### Docker
```dockerfile
# Dockerfile incluído no projeto
docker build -t pedelogo .
docker run -p 3000:3000 pedelogo
```

## 🧪 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # Linter ESLint
npm run db:reset     # Reset do banco de dados
npm run android:build # Build Android
npm run ios:build    # Build iOS
```

## 📊 Performance

- ⚡ **Vite**: Build ultra-rápida
- 🗂️ **Code splitting**: Carregamento sob demanda
- 📱 **PWA**: Cache inteligente offline
- 🔄 **Lazy loading**: Componentes e rotas
- 📈 **Otimizações**: Bundle size < 500KB

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Abra um Pull Request

### Padrões de Commit
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` tarefas gerais

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvimento**: [Seu Nome](https://github.com/seu-usuario)
- **Design**: [Designer](https://github.com/designer)
- **DevOps**: [DevOps](https://github.com/devops)

## 📞 Suporte

- 🐛 **Bugs**: [Issues](https://github.com/seu-usuario/pedelogo/issues)
- 💡 **Features**: [Discussions](https://github.com/seu-usuario/pedelogo/discussions)
- 📧 **Email**: contato@pedelogo.com
- 💬 **Discord**: [Server](https://discord.gg/pedelogo)

---

<p align="center">
  Made with ❤️ for the food delivery community
</p>