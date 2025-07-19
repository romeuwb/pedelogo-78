import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '2 solid #e5e5e5',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 25,
    padding: 15,
    border: '1 solid #e5e5e5',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    borderBottom: '1 solid #d1d5db',
    paddingBottom: 5,
  },
  screenTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  path: {
    fontSize: 10,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: 3,
    borderRadius: 3,
    marginBottom: 5,
  },
  description: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  functionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  functionItem: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 2,
    paddingLeft: 10,
  },
  flowSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 3,
  },
  flowItem: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 3,
    flexDirection: 'row',
  },
  flowArrow: {
    marginHorizontal: 5,
    color: '#9ca3af',
  },
  screenshotPlaceholder: {
    height: 150,
    backgroundColor: '#f3f4f6',
    border: '2 dashed #d1d5db',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  screenshotText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  userTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  userTypeBadge: {
    fontSize: 9,
    color: '#1f2937',
    backgroundColor: '#e5e7eb',
    padding: 3,
    borderRadius: 3,
    marginRight: 5,
    marginBottom: 3,
  },
  flowDiagram: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  flowStep: {
    fontSize: 10,
    color: '#1f2937',
    backgroundColor: '#dbeafe',
    padding: 8,
    borderRadius: 5,
    margin: 3,
    textAlign: 'center',
  },
});

// Dados das telas
const screenData = [
  {
    id: 'auth',
    title: 'Tela de Autenticação',
    path: '/auth',
    description: 'Interface de login e cadastro que permite diferentes tipos de usuário acessarem o sistema. Inclui validação de credenciais e redirecionamento automático baseado no perfil.',
    functions: [
      '• Login por email e senha',
      '• Seleção de tipo de usuário (Cliente, Restaurante, Entregador, Admin)',
      '• Cadastro de novos usuários',
      '• Redirecionamento automático para dashboard específico',
      '• Validação de formulários',
      '• Recuperação de senha'
    ],
    userTypes: ['Cliente', 'Restaurante', 'Entregador', 'Admin'],
    flows: [
      { from: 'Login Cliente', to: 'Dashboard Cliente' },
      { from: 'Login Restaurante', to: 'Dashboard Restaurante' },
      { from: 'Login Entregador', to: 'Dashboard Entregador' },
      { from: 'Login Admin', to: 'Painel Admin' }
    ]
  },
  {
    id: 'cliente-dashboard',
    title: 'Dashboard do Cliente',
    path: '/cliente/dashboard',
    description: 'Interface principal para clientes navegarem, buscarem restaurantes, visualizarem cardápios e realizarem pedidos. Inclui sistema de favoritos e acompanhamento de entregas.',
    functions: [
      '• Buscar restaurantes por localização',
      '• Filtrar por categoria de comida',
      '• Visualizar cardápios detalhados',
      '• Adicionar itens ao carrinho',
      '• Finalizar pedidos e pagamento',
      '• Acompanhar status da entrega',
      '• Gerenciar favoritos',
      '• Ver histórico de pedidos'
    ],
    userTypes: ['Cliente'],
    flows: [
      { from: 'Busca Restaurante', to: 'Cardápio' },
      { from: 'Adiciona ao Carrinho', to: 'Checkout' },
      { from: 'Finaliza Pedido', to: 'Acompanhamento' }
    ]
  },
  {
    id: 'restaurante-dashboard',
    title: 'Dashboard do Restaurante',
    path: '/restaurante/dashboard',
    description: 'Painel de controle completo para gestão do restaurante incluindo gerenciamento de pedidos, cardápio, sistema POS para atendimento presencial e relatórios financeiros.',
    functions: [
      '• Gerenciar pedidos em tempo real',
      '• Configurar e editar cardápio',
      '• Sistema POS para atendimento presencial',
      '• Gestão de mesas e reservas',
      '• Relatórios financeiros e de vendas',
      '• Configurações de horário de funcionamento',
      '• Gestão de funcionários',
      '• Integração com impressoras'
    ],
    userTypes: ['Restaurante'],
    flows: [
      { from: 'Recebe Pedido', to: 'Prepara Comida' },
      { from: 'Pedido Pronto', to: 'Chama Entregador' },
      { from: 'Atendimento Presencial', to: 'Sistema POS' }
    ]
  }
];

// Componente do PDF
const DocumentationPDF = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>📱 Documentação Visual do Sistema</Text>
        <Text style={styles.subtitle}>PedeLogo - Plataforma de Delivery</Text>
        <Text style={styles.subtitle}>Capturas de Tela + Descrições + Fluxos de Navegação</Text>
      </View>

      {/* Telas do Sistema */}
      {screenData.map((screen, index) => (
        <View key={screen.id} style={styles.section} break={index > 0}>
          <Text style={styles.sectionTitle}>🖥️ {screen.title}</Text>
          
          {/* Path e Tipos de Usuário */}
          <Text style={styles.path}>Rota: {screen.path}</Text>
          <View style={styles.userTypes}>
            {screen.userTypes.map((type) => (
              <Text key={type} style={styles.userTypeBadge}>{type}</Text>
            ))}
          </View>

          {/* Screenshot Placeholder */}
          <View style={styles.screenshotPlaceholder}>
            <Text style={styles.screenshotText}>📸 Screenshot da Tela</Text>
            <Text style={styles.screenshotText}>(Capturado automaticamente)</Text>
          </View>

          {/* Descrição */}
          <Text style={styles.functionTitle}>📝 Descrição Funcional:</Text>
          <Text style={styles.description}>{screen.description}</Text>

          {/* Funcionalidades */}
          <Text style={styles.functionTitle}>⚙️ Principais Funcionalidades:</Text>
          {screen.functions.map((func, i) => (
            <Text key={i} style={styles.functionItem}>{func}</Text>
          ))}

          {/* Fluxos de Navegação */}
          <View style={styles.flowSection}>
            <Text style={styles.functionTitle}>🔄 Fluxos de Navegação:</Text>
            {screen.flows.map((flow, i) => (
              <View key={i} style={styles.flowItem}>
                <Text>{flow.from}</Text>
                <Text style={styles.flowArrow}>→</Text>
                <Text>{flow.to}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </Page>

    {/* Segunda página - Fluxo Geral */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>🔄 Fluxo Geral do Sistema</Text>
        <Text style={styles.subtitle}>Navegação entre todas as telas</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Arquitetura de Navegação</Text>
        
        <View style={styles.flowDiagram}>
          <Text style={styles.flowStep}>Página Inicial</Text>
          <Text style={styles.flowArrow}>→</Text>
          <Text style={styles.flowStep}>Autenticação</Text>
          <Text style={styles.flowArrow}>→</Text>
          <Text style={styles.flowStep}>Seleção Perfil</Text>
        </View>
        
        <View style={styles.flowDiagram}>
          <Text style={styles.flowStep}>Dashboard Cliente</Text>
          <Text style={styles.flowStep}>Dashboard Restaurante</Text>
          <Text style={styles.flowStep}>Dashboard Entregador</Text>
          <Text style={styles.flowStep}>Painel Admin</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Resumo de Funcionalidades por Perfil</Text>
        
        <Text style={styles.functionTitle}>👤 Cliente:</Text>
        <Text style={styles.functionItem}>• Buscar e filtrar restaurantes</Text>
        <Text style={styles.functionItem}>• Fazer pedidos e acompanhar entregas</Text>
        <Text style={styles.functionItem}>• Gerenciar perfil e favoritos</Text>

        <Text style={styles.functionTitle}>🏪 Restaurante:</Text>
        <Text style={styles.functionItem}>• Gerenciar pedidos e cardápio</Text>
        <Text style={styles.functionItem}>• Sistema POS e gestão de mesas</Text>
        <Text style={styles.functionItem}>• Relatórios e configurações</Text>

        <Text style={styles.functionTitle}>🚛 Entregador:</Text>
        <Text style={styles.functionItem}>• Aceitar e gerenciar entregas</Text>
        <Text style={styles.functionItem}>• Rastreamento e navegação</Text>
        <Text style={styles.functionItem}>• Controle de ganhos</Text>

        <Text style={styles.functionTitle}>⚙️ Admin:</Text>
        <Text style={styles.functionItem}>• Gestão completa da plataforma</Text>
        <Text style={styles.functionItem}>• Relatórios e configurações gerais</Text>
        <Text style={styles.functionItem}>• Suporte e auditoria</Text>
      </View>
    </Page>
  </Document>
);

// Componente principal com botão de download
const VisualDocumentationPDF = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Documentação Visual em PDF</h1>
        <p className="text-muted-foreground mb-6">
          Exemplo de como seria a documentação completa das telas do sistema
        </p>
        
        <div className="bg-card border rounded-lg p-6 mb-6">
          <FileText className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Conteúdo do PDF:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 mb-4">
            <li>• Screenshots de todas as telas principais</li>
            <li>• Descrições funcionais detalhadas</li>
            <li>• Lista de funcionalidades por tela</li>
            <li>• Fluxos de navegação entre telas</li>
            <li>• Arquitetura geral do sistema</li>
            <li>• Resumo por tipo de usuário</li>
          </ul>
          
          <PDFDownloadLink
            document={<DocumentationPDF />}
            fileName="documentacao-visual-pedelogo.pdf"
          >
            {({ blob, url, loading, error }) => (
              <Button 
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Gerando PDF...' : 'Baixar Documentação PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>

        <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">📝 Nota sobre Screenshots:</p>
          <p>
            Na implementação real, as capturas de tela seriam geradas automaticamente 
            usando ferramentas como Puppeteer ou Playwright para capturar cada rota 
            do sistema em diferentes resoluções e estados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisualDocumentationPDF;