# Mapa Espirita

Aplicativo mobile feito com Expo e React Native para encontrar centros espiritas proximos, mostrar detalhes relevantes e abrir a rota no Google Maps externo.

## O que o app faz hoje

- Busca centros espiritas proximos usando a localizacao atual.
- Permite busca manual por cidade ou bairro.
- Mostra detalhes como endereco, telefone, site, avaliacao e horarios.
- Traduz horarios para portugues quando o Google retorna os dados.
- Abre a rota no Google Maps externo.
- Exibe banner do AdMob.
- Salva favoritos localmente no aparelho.

## Stack

- Expo 55
- React Native 0.83
- React 19
- TypeScript
- React Navigation
- Expo Location
- Google Places API
- Google Geocoding API
- Google Mobile Ads
- AsyncStorage

## Fonte principal de configuracao

O projeto segue a abordagem Expo com `app.config.ts` como fonte principal.

- `app.config.ts` define nome, slug, versao, `versionCode`, ids do app e plugins.
- As pastas `android/` e `ios/` nao devem ser tratadas como fonte oficial do projeto.
- Para builds remotos, prefira EAS Build com as variaveis configuradas no painel do EAS.

## Variaveis de ambiente

Crie um arquivo `.env` local baseado em `.env.example`.

Variaveis usadas pelo app:

- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- `ADMOB_ANDROID_APP_ID`
- `ADMOB_IOS_APP_ID`
- `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID`
- `EXPO_PUBLIC_ADMOB_IOS_BANNER_ID`

## Segredos no EAS

Para publicacao, configure os mesmos valores como secrets ou env vars no EAS.

Exemplos de nomes esperados:

- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- `ADMOB_ANDROID_APP_ID`
- `ADMOB_IOS_APP_ID`
- `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID`
- `EXPO_PUBLIC_ADMOB_IOS_BANNER_ID`

Nao deixe chaves reais versionadas no codigo ou em arquivos nativos.

## Scripts

```bash
npm install
npm run typecheck
npm start
```

## Publicacao

- Android package: `com.pedroccallejas.mapaespirita`
- Versao atual: `1.0.1`
- Android `versionCode`: `2`

O app usa Google Maps externo para rotas. Ele nao depende de mapa interno renderizado na interface.

## Politica de privacidade

O repositorio inclui uma pagina estatica de politica de privacidade em `index.html`.
