# Instruções para Gerar APKs dos Módulos Cliente, Restaurante e Entregador

Este projeto permite gerar APKs separados para Cliente, Restaurante e Entregador. Siga os passos abaixo para cada módulo.

## 1. Pré-requisitos
- Node.js e npm instalados
- Android Studio instalado
- Dependências do projeto instaladas (`npm install`)

## 2. Centralização da URL do servidor
A URL do servidor está definida em `app.server.url.ts`. Para alterar a URL do backend/app, edite esse arquivo:
```ts
const APP_SERVER_URL = "https://pedelogo-78.lovable.app/";
export default APP_SERVER_URL;
```

## 3. Build de cada módulo
Cada módulo possui:
- Um entrypoint dedicado (`src/main.[modulo].tsx`)
- Um arquivo de configuração do Capacitor (`capacitor.[modulo].config.ts`)

### Passos para gerar o APK de cada módulo

#### 1. Escolha o módulo (cliente, restaurante ou entregador)

#### 2. Configure o entrypoint do Vite
Edite o `vite.config.ts` e altere o campo `build.rollupOptions.input` para o entrypoint desejado, por exemplo:
```js
// Para Cliente:
input: 'src/main.client.tsx',
// Para Restaurante:
input: 'src/main.restaurant.tsx',
// Para Entregador:
input: 'src/main.delivery.tsx',
```
Se não existir, adicione dentro do objeto exportado por `defineConfig`.

#### 3. Copie o arquivo de configuração do Capacitor
Copie o arquivo de configuração do módulo desejado para `capacitor.config.ts`:
```sh
# Cliente
cp capacitor.client.config.ts capacitor.config.ts
# Restaurante
cp capacitor.restaurant.config.ts capacitor.config.ts
# Entregador
cp capacitor.delivery.config.ts capacitor.config.ts
```

#### 4. Gere o build web
```sh
npm run build
```

#### 5. Sincronize o Capacitor
```sh
npx cap sync android
```

#### 6. Abra o projeto Android no Android Studio
```sh
npx cap open android
```

#### 7. Gere o APK no Android Studio
- No menu: Build > Build Bundle(s) / APK(s) > Build APK(s)
- O APK será gerado em `android/app/build/outputs/apk/debug/app-debug.apk`

## Observações
- Sempre repita os passos acima para cada módulo que desejar gerar o APK.
- Para mudar a URL do backend/app, altere apenas o arquivo `app.server.url.ts`.
- Para builds de produção, utilize o modo release e assine o APK conforme as regras da Play Store.

---

Dúvidas? Consulte este arquivo ou o README.md do projeto.
