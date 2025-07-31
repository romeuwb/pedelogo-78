# Instruções para Gerar APKs dos Módulos Cliente, Restaurante e Entregador

Este projeto permite gerar APKs separados para Cliente, Restaurante e Entregador. Siga os passos abaixo para cada módulo.

## 1. Pré-requisitos
- Node.js e npm instalados
- Android Studio instalado
- Dependências do projeto instaladas (npm install)

## 2. Centralização da URL do servidor
A URL do servidor está definida em app.server.url.ts. Para alterar a URL do backend/app, edite esse arquivo:
const APP_SERVER_URL = "https://pedelogo-78.lovable.app/";
export default APP_SERVER_URL;

## 3. Nome do Aplicativo e Ícones

### Alterar o nome do aplicativo
O nome do aplicativo exibido no dispositivo é definido no campo `appName` dos arquivos de configuração do Capacitor:
- Para cada módulo, edite o campo `appName` em:
  - capacitor.client.config.ts
  - capacitor.restaurant.config.ts
  - capacitor.delivery.config.ts

Exemplo:
appName: 'PedeLogo Restaurante',

Após gerar a plataforma Android/iOS, você também pode ajustar o nome diretamente nos arquivos nativos:
- **Android:**
  - android/app/src/main/res/values/strings.xml (campo `app_name`)
- **iOS:**
  - ios/App/App/Info.plist (campo `CFBundleDisplayName`)

### Alterar os ícones do aplicativo
Os ícones do app devem ser substituídos após rodar `npx cap add android` ou `npx cap add ios`:
- **Android:**
  - Substitua os arquivos de ícone em `android/app/src/main/res/mipmap-*` (ic_launcher.png, etc.)
- **iOS:**
  - Substitua os ícones em `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Você pode gerar ícones nos tamanhos corretos usando ferramentas como [https://capacitorjs.com/docs/guides/splash-screens-and-icons](https://capacitorjs.com/docs/guides/splash-screens-and-icons)

## 4. Build de cada módulo
Cada módulo possui:
- Um entrypoint dedicado (src/main.[modulo].tsx)
- Um arquivo de configuração do Capacitor (capacitor.[modulo].config.ts)

### Passos para gerar o APK de cada módulo

#### 1. Escolha o módulo (cliente, restaurante ou entregador)

#### 2. Copie o arquivo de configuração do Capacitor para o módulo desejado

No Linux/Mac/WSL/Git Bash:
- Cliente:
  cp capacitor.client.config.ts capacitor.config.ts
- Restaurante:
  cp capacitor.restaurant.config.ts capacitor.config.ts
- Entregador:
  cp capacitor.delivery.config.ts capacitor.config.ts

No Windows (cmd/PowerShell):
copy capacitor.client.config.ts capacitor.config.ts
copy capacitor.restaurant.config.ts capacitor.config.ts
copy capacitor.delivery.config.ts capacitor.config.ts

#### 3. Gere o build web do módulo desejado

No Windows (cmd ou PowerShell):
- Cliente:
  set PEDELOGO_MODULE=client && npm run build
- Restaurante:
  set PEDELOGO_MODULE=restaurant && npm run build
- Entregador:
  set PEDELOGO_MODULE=delivery && npm run build

No Git Bash, WSL, Linux ou Mac:
- Cliente:
  PEDELOGO_MODULE=client npm run build
- Restaurante:
  PEDELOGO_MODULE=restaurant npm run build
- Entregador:
  PEDELOGO_MODULE=delivery npm run build

#### 4. Sincronize o Capacitor
npx cap sync android

#### 5. Abra o projeto Android no Android Studio
npx cap open android

#### 6. Gere o APK no Android Studio
- No menu: Build > Build Bundle(s) / APK(s) > Build APK(s)
- O APK será gerado em android/app/build/outputs/apk/debug/app-debug.apk

## Observações
- Sempre repita os passos acima para cada módulo que desejar gerar o APK.
- Para mudar a URL do backend/app, altere apenas o arquivo app.server.url.ts.
- Para builds de produção, utilize o modo release e assine o APK conforme as regras da Play Store.

---

Dúvidas? Consulte este arquivo ou o README.md do projeto.
