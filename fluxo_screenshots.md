# Fluxo para Geração e Organização de Screenshots das Páginas

## 1. Identificação das Páginas
As páginas principais do projeto estão localizadas em `src/pages/`:
- AdminDashboard
- Auth
- ClientDashboard
- Dashboard
- DeliveryDashboard
- Index
- NotFound
- PromotionsPage
- ResetPassword
- RestaurantDashboard
- RestaurantsPage

## 2. Ferramenta Recomendada
Utilize uma ferramenta de captura de tela, como:
- Navegador (atalho: PrintScreen, ou Ferramenta de Captura do Windows, ou extensão como "GoFullPage" para Chrome)
- Ferramentas de automação como Cypress ou Playwright (para projetos que já usam testes automatizados)

## 3. Processo de Captura
1. Execute o projeto localmente (`npm run dev` ou comando equivalente).
2. Acesse cada página listada acima pelo navegador.
3. Capture a tela completa de cada página.
4. Salve cada screenshot na pasta `docs/screenshots/` (crie a pasta se necessário).
5. Nomeie os arquivos seguindo o padrão: `nome-da-pagina.png` (ex: `AdminDashboard.png`).

## 4. Organização dos Screenshots
- Todos os arquivos devem ser salvos em `docs/screenshots/`.
- Mantenha o padrão de nomes para facilitar a identificação.

## 5. Utilização na Documentação
- Inclua os screenshots em documentos Markdown ou apresentações para ilustrar o funcionamento das páginas.
- Exemplo de inclusão em Markdown:
  ```markdown
  ![Admin Dashboard](docs/screenshots/AdminDashboard.png)
  ```

## 6. Atualização dos Screenshots
- Sempre que houver mudanças visuais relevantes em uma página, atualize o screenshot correspondente.

---

Este fluxo garante que a documentação visual do projeto esteja sempre atualizada e organizada.