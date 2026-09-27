# LocalLingo — App móvil (Android + iOS)

App nativa hecha con **Expo (SDK 57) + React Native + Expo Router**. Usa **la misma API**
(`/api/v1`) y la misma base de datos que la web (`../locallingo`): una sola lógica de negocio,
tres clientes (web, Android, iOS).

> "LocalLingo" es un nombre provisional. Nombre, ícono y colores: `app.json` y `src/lib/theme.ts`.

## Qué hace

| Pestaña / pantalla | Turista | Guía |
|---|---|---|
| **Explorar** | Buscar por ciudad, idioma, servicio y orden; tarjetas con idiomas, reseñas y precio | — |
| **Perfil del guía** | Idiomas, servicios, disponibilidad, reseñas, política; reservar, mensaje, favorito | Vista pública propia |
| **Reservar** | Servicio, duración, fecha (solo días disponibles), horario, personas, punto de encuentro; desglose con comisión | — |
| **Reserva** | Pagar, cancelar (según política), abrir chat, calificar al terminar | Aceptar, rechazar, completar, abrir chat |
| **Reservas** | Próximas / completadas / canceladas | Pendientes / aceptadas / completadas / canceladas |
| **Mensajes** | Chat con filtro de datos sensibles, bloqueo y reporte | Igual |
| **Perfil** | Idioma ES/EN, favoritos, legales, cerrar sesión | Estado de verificación, ganancias, solicitar retiro |

Sesión: token en el **llavero cifrado del teléfono** (`expo-secure-store`: Keychain en iOS,
Keystore en Android). Si la cuenta se suspende o la sesión expira, la app sale sola.

**Deliberadamente fuera de esta versión:** el registro de guía en 6 pasos (con subida de
documentos de identidad) se abre en la web desde la pestaña Perfil. Es un proceso de una sola
vez; los guías lo hacen con calma en computadora. Pasarlo a la app es el siguiente paso si los
datos de la beta lo piden.

## Correr en tu teléfono

```bash
# 1. Backend (en otra terminal)
cd ../locallingo && npm install && npm run db:reset && npm run dev

# 2. App
cd ../locallingo-app
npm install
cp .env.example .env    # pon la IP de tu computadora: EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
npx expo start          # escanea el QR con Expo Go (Android) o la cámara (iOS)
```

El teléfono y la computadora deben estar en la misma red Wi-Fi. `localhost` no sirve desde el
teléfono: usa la IP local de tu computadora.

Cuentas demo (contraseña `demo1234`): `turista@demo.com`, `guia@demo.com`.

## Publicar en tiendas

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android   # APK para probar con la beta
npx eas-cli@latest build --profile production --platform all     # Play Store + App Store
npx eas-cli@latest submit --platform all
```

Antes: cambia las URLs de `eas.json` por tu dominio real, y los identificadores
`com.locallingo.app` en `app.json` por los definitivos (no se pueden cambiar después de
publicar). Necesitas cuenta de Google Play (USD 25 una vez) y Apple Developer (USD 99/año).

## Código compartido con la web

`src/shared/` es una **copia** de archivos de la web (traducciones, dinero en centavos,
zonas horarias, constantes). La fuente de verdad es `../locallingo/src`. Después de cambiar
alguno de esos archivos:

```bash
npm run sync-shared
```

## Verificación

```bash
npm run typecheck
```

La app se probó exportándola a web (`npm run export:web`) contra el backend real y recorriendo
con un navegador en tamaño de teléfono el flujo completo: explorar → filtrar → perfil → reservar →
pagar → chat (con ocultado de teléfono) → el guía ve la pendiente → acepta → ve sus ganancias →
el turista ve la reserva confirmada. Sin errores de consola. Falta probarla en dispositivos
físicos Android e iOS (Expo Go) antes de la beta.

## Estructura

```
src/app/            pantallas (Expo Router: cada archivo es una ruta)
  (tabs)/           Explorar, Reservas, Mensajes, Perfil
  guia/[slug]       perfil del guía
  reservar/[slug]   formulario de reserva
  reserva/[id]      detalle y acciones de la reserva
  chat/[id]         conversación
  login, registro
src/components/     UI (sin librerías nativas extra)
src/lib/            cliente de API, sesión, i18n, tema
src/shared/         copia del código compartido con la web
```
