# Centros Espiritas Proximos

Aplicativo mobile em React Native + Expo que usa a localizacao atual do usuario para encontrar centros espiritas proximos, mostrar detalhes essenciais, abrir rota no Google Maps e exibir apenas banners discretos do AdMob.

## O que ja esta pronto

- Busca por localizacao atual com `expo-location`
- Busca manual por cidade ou bairro quando a permissao e negada
- Integracao com Google Places API e Geocoding API
- Lista principal com cards reutilizaveis
- Tela de detalhes com foto, telefone, site e horarios
- Tela de mapa com marcadores do usuario e dos centros
- Botao para abrir rota no Google Maps
- Banner AdMob discreto no rodape da tela principal
- Tratamento de loading, erro e lista vazia

## Tecnologias

- React Native
- Expo
- Expo Dev Client
- TypeScript
- Expo Location
- React Navigation
- Google Places API
- Google Geocoding API
- react-native-maps
- react-native-google-mobile-ads
- StyleSheet

## Como instalar

1. Instale as dependencias:

```bash
npm install
```

2. Se quiser alinhar novamente as bibliotecas nativas com o SDK do Expo:

```bash
npx expo install expo-location react-native-gesture-handler react-native-maps react-native-safe-area-context react-native-screens expo-dev-client react-native-google-mobile-ads
```

3. Crie seu arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Preencha as variaveis:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=SUA_CHAVE_GOOGLE

# App IDs do AdMob usados no build nativo
ADMOB_ANDROID_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy
ADMOB_IOS_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy

# Banner unit IDs usados pelo componente em producao
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy
```

Observacoes:

- O `.env.example` ja traz App IDs de teste do Google para Android e iOS, que ajudam no setup inicial do build nativo.
- O componente usa os `EXPO_PUBLIC_ADMOB_*_BANNER_ID` reais quando eles existirem.
- Se os IDs reais nao estiverem configurados, o banner cai automaticamente para `TestIds.ADAPTIVE_BANNER`.
- Isso permite que o app continue funcionando mesmo sem configurar AdMob no inicio do projeto.

## APIs que precisam estar ativas no Google Cloud

Ative estas APIs no mesmo projeto:

- Places API (New)
- Geocoding API
- Maps SDK for Android
- Maps SDK for iOS

Observacoes:

- Place Details e Place Photos fazem parte do ecossistema da Places API.
- Se houver versao web no futuro, tambem vale ativar a Maps JavaScript API.

## Como criar conta no AdMob

1. Acesse https://admob.google.com
2. Crie sua conta ou entre com a conta Google.
3. Cadastre um app Android e um app iOS.
4. Copie os `App IDs` de cada plataforma para `ADMOB_ANDROID_APP_ID` e `ADMOB_IOS_APP_ID`.
5. Crie uma unidade de anuncio do tipo `Banner`.
6. Copie os `Banner Ad Unit IDs` para `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID` e `EXPO_PUBLIC_ADMOB_IOS_BANNER_ID`.

Importante:

- `App ID` nao e a mesma coisa que `Ad Unit ID`.
- O `App ID` entra no `app.config.ts` via plugin nativo.
- O `Banner Ad Unit ID` e lido pelo componente `AdMobBanner`.

## Test ads

Durante desenvolvimento, use anuncios de teste.

- O projeto usa `TestIds.ADAPTIVE_BANNER` em desenvolvimento e tambem como fallback quando os IDs reais nao estiverem definidos.
- Isso evita trafego invalido e protege sua conta AdMob.
- Antes de publicar, mantenha os IDs reais configurados no `.env`.

Referencia oficial do Google para anuncios de teste:

- Android: https://developers.google.com/admob/android/test-ads
- iOS: https://developers.google.com/admob/ios/test-ads

## Expo Go, expo-dev-client e EAS

`react-native-google-mobile-ads` possui codigo nativo e nao funciona corretamente no Expo Go.

Teste com development build usando `expo-dev-client`, nao com Expo Go.

### Rodando com development build local

1. Gere os arquivos nativos:

```bash
npx expo prebuild
```

2. Rode no Android:

```bash
npx expo run:android
```

3. Rode no iOS:

```bash
npx expo run:ios
```

4. Depois suba o bundler para dev client:

```bash
npm run start:dev-client
```

### Rodando com EAS Build

O projeto ja inclui [eas.json](/c:/Projetos/locEspirita/eas.json).

1. Entre na sua conta Expo:

```bash
npx eas login
```

2. Gere uma development build para Android:

```bash
npx eas build --profile development --platform android
```

3. Gere uma development build para iOS:

```bash
npx eas build --profile development --platform ios
```

4. Instale a build no aparelho e depois rode:

```bash
npm run start:dev-client
```

Se preferir build local com EAS:

```bash
npx eas build --profile development --platform android --local
npx eas build --profile development --platform ios --local
```

## Como testar no celular

1. Instale a development build no aparelho.
2. Garanta que celular e computador estejam na mesma rede.
3. Rode `npm run start:dev-client`.
4. Abra a build instalada.
5. Permita a localizacao ao abrir o app.
6. Verifique o banner no rodape da Home.

## Estrutura

```text
src/
  components/
    AdMobBanner.tsx
    CenterCard.tsx
    ErrorState.tsx
    LoadingState.tsx
  constants/
    theme.ts
  navigation/
    AppNavigator.tsx
    types.ts
  screens/
    DetailsScreen.tsx
    HomeScreen.tsx
    MapScreen.tsx
  services/
    adMob.ts
    googlePlaces.ts
    location.ts
  types/
    center.ts
  utils/
    distance.ts
    hours.ts
    maps.ts
```

## Seguranca da chave da Google

Como a chave do Google Maps/Places fica no cliente, restrinja no Google Cloud:

- Restrinja por `Android apps` usando o `android.package`
- Restrinja por `iOS apps` usando o `ios.bundleIdentifier`
- Restrinja o uso apenas para as APIs necessarias
- Se houver uso web no futuro, aplique restricao por dominio

Valores atuais do projeto:

- Android package name: `com.seuapp.centrosespiritasproximos`
- iOS bundle identifier: `com.seuapp.centrosespiritasproximos`

Antes de publicar, troque esses identificadores pelos seus.

## Notas sobre AdMob

- O app usa somente `BannerAd`.
- Nao ha interstitial, rewarded ou tela cheia.
- O banner foi mantido apenas no rodape da `HomeScreen` para nao atrapalhar a experiencia.
- A `DetailsScreen` ficou sem banner por padrao para respeitar uma navegacao mais limpa.
- O componente trata falha de carregamento sem derrubar a tela.
- Se o banner falhar ao carregar, ele e ocultado sem quebrar o restante da interface.
- O banner fica em `ListFooterComponent` da `HomeScreen`, entao nao sobrepoe cards, botoes ou conteudo.
- O request do banner esta configurado como `requestNonPersonalizedAdsOnly: true`.

## Notas importantes

- O projeto usa App IDs de teste como fallback no `app.config.ts`, entao a integracao nao bloqueia o app durante o setup inicial.
- Mesmo sem configurar os IDs reais do AdMob, o restante do app continua funcionando normalmente.
- Mudancas em `app.config.ts` e plugins nativos exigem nova build nativa.
- O mapa continua dependendo da configuracao correta da Google Maps API key.
- As fotos e detalhes dependem da cobertura do Google Places para cada local.

## Proximos passos

- Adicionar consentimento para regioes que exigem fluxo de privacidade
- Controlar remotamente se o banner deve aparecer ou nao
- Adicionar analytics para medir impacto do banner sem prejudicar o uso
- Criar cache local dos resultados recentes
- Adicionar favoritos e historico de buscas
