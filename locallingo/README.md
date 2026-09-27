# LocalLingo — MVP del marketplace de guías y traductores locales

> "LocalLingo" es un nombre **provisional**. Nombre, logo, colores y dominio se cambian en
> `src/config/brand.ts` (y `APP_URL`), sin tocar el resto del código.

Objetivo del MVP: demostrar que **un turista puede encontrar a una persona local que hable
su idioma, reservarla y recibir el servicio**. Beta pensada para una sola ciudad (Mazatlán).

## Arrancar en local

```bash
cd locallingo
cp .env.example .env          # cambia AUTH_SECRET por un valor largo y aleatorio
npm install
npm run db:reset              # crea la BD SQLite y carga datos de ejemplo
npm run dev                   # http://localhost:3000
```

Cuentas demo (contraseña `demo1234`): `turista@demo.com`, `guia@demo.com` (María,
Mazatlán), `admin@demo.com`, `pendiente@demo.com` (guía pendiente de aprobación).

Pruebas:

```bash
npm test                                   # unitarias: dinero, comisión, políticas, filtro de chat
npm run build && npm start &               # servidor de producción
BASE_URL=http://localhost:3000 node tests/e2e-api.mjs   # flujo completo por API (18 pasos)
```

## Stack y arquitectura

| Capa | Elección | Por qué |
|---|---|---|
| Frontend + API | Next.js 15 (App Router) + TypeScript | Web SSR/SEO y API en el mismo proyecto |
| API | REST JSON versionada en `/api/v1` | **API-first**: la futura app Android/iOS usa exactamente la misma API |
| Base de datos | Prisma + SQLite en dev → PostgreSQL en producción | Cambiar `provider` en `schema.prisma` y `DATABASE_URL` |
| Auth | JWT (HS256) en cookie httpOnly (web) o `Authorization: Bearer` (móvil) | Sesiones revocables vía `sessionVersion` |
| Pagos | Interfaz `PaymentProvider` + proveedor simulado | Enchufar Stripe Connect / Mercado Pago sin tocar el resto |
| Fotos/documentos | Interfaz de almacenamiento (local en dev) | Pasar a S3/R2/Cloudinary; documentos en bucket **privado** |
| Emails | `EmailDriver` (consola en dev) | Pasar a Resend/SES/Postmark |
| Mapas | Embed de OpenStreetMap del área de la ciudad | Nunca la dirección del guía |
| i18n | Diccionarios `src/i18n/messages/{es,en}.json` | Ningún texto de UI dentro de los componentes |

```
src/
  app/                 páginas (landing, /explorar, /guia/[slug], /panel, /admin, SEO…) y /api/v1
  server/services/     lógica de negocio compartida por páginas y API (bookings, guides, social, admin…)
  server/payments/     proveedor de pagos intercambiable
  lib/                 dinero en centavos, tiempo/zonas horarias, políticas, filtro de chat
  i18n/                sistema de traducciones
  config/brand.ts      identidad de marca
prisma/schema.prisma   modelo de datos
```

### Dinero y comisión

- Todos los montos son **enteros en unidades menores** (centavos) + código ISO de moneda.
  Nada de floats. Porcentajes en *basis points* (1500 = 15%).
- La comisión se descuenta del precio del guía: $500 → guía $425, plataforma $75.
  Se guarda un *snapshot* de la comisión en cada reserva.
- Comisión global editable en `/admin → Configuración`; override opcional por categoría
  (`Category.commissionBps`) para "comisiones diferentes según servicio".
- Monedas activas MXN/USD; EUR, GBP, JPY, CAD, AUD preparadas (`lib/constants.ts`). Los cobros
  siempre en la moneda del servicio; la conversión es solo para mostrar (tasas en `Setting`).

### Flujo de reserva y fondos

```
PENDING_PAYMENT ─pagar─▶ PENDING ─guía acepta─▶ ACCEPTED ─servicio─▶ COMPLETED ─▶ saldo del guía ─▶ retiro
   (cobro retenido)        │ guía rechaza → reembolso 100%   │ cancelación → reembolso según política
```

Valida disponibilidad semanal del guía (en la zona horaria de la ciudad), empalmes con otras
reservas, mínimo 2 h de anticipación y máximo de personas.

### Seguridad implementada

- Contraseñas con bcrypt; rate limit en login/registro/mensajes/reportes/subidas.
- Roles verificados en cada endpoint; el registro público nunca crea ADMIN.
- Suspender a un usuario invalida sus sesiones al instante.
- Protección CSRF por verificación de `Origin` en mutaciones con cookie; redirects solo internos.
- Perfiles públicos sin documento de identidad, teléfono, email, dirección ni datos bancarios.
  Documentos de verificación en almacenamiento privado, no servido por la web.
- Chat: bloquea números de tarjeta (Luhn) y oculta teléfonos, emails y CLABEs (antifraude:
  mantiene pagos dentro de la plataforma). Bloqueo de usuarios y reporte de conversaciones.
- Reseñas solo de reservas completadas, una por reserva.
- Cabeceras de seguridad (`X-Frame-Options`, `nosniff`, etc.) y registro de acciones admin.

### SEO

Páginas indexables con título, meta descripción, canonical, breadcrumbs y JSON-LD:
`/guias/mexico/mazatlan`, `/guias/mazatlan/ingles`, `/guias/japon/tokio/espanol`,
`/traductores/mazatlan/ingles`, perfiles `/guia/[slug]` (schema `Person` + `AggregateRating`),
`/ayuda` (`FAQPage`). `sitemap.xml` generado con las combinaciones que tienen guías.

## API v1 (resumen)

| Método | Ruta | Quién |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | público |
| GET/PATCH | `/me` | usuario |
| GET | `/catalog`, `/guides?city=&language=&service=&minPrice=&maxPrice=&date=&duration=&rating=&modality=&sort=`, `/guides/:slug` | público |
| POST | `/bookings/quote` | público |
| GET/POST | `/bookings` · GET `/bookings/:id` · POST `/bookings/:id/{pay,accept,reject,cancel,complete}` · POST `/bookings/:id/review` | turista/guía |
| GET/POST | `/conversations` · GET `/conversations/:id` · POST `/conversations/:id/messages` · POST `/blocks` | usuario |
| GET/POST | `/favorites` · POST `/reports` · POST `/preferences` | usuario |
| GET/PUT | `/guide/profile` · PUT `/guide/{languages,services,availability}` · POST `/guide/submit` · GET `/guide/earnings` · POST `/guide/payouts` · POST `/uploads` | guía |
| GET | `/admin/stats` · POST `/admin/guides/:id`, `/admin/users/:id`, `/admin/reports/:id`, `/admin/payouts/:id` · GET/PUT `/admin/settings` · POST/PATCH `/admin/catalog` | admin |

Respuestas: `{ "data": … }` o `{ "error": { "code", "message" } }` con códigos estables
(traducidos en `errors.*` del diccionario).

## App móvil

La app Android/iOS vive en `../locallingo-app` (Expo) y consume esta misma API con
`Authorization: Bearer`. Para la versión web de la app (desarrollo) agrega su origen a
`CORS_ORIGINS` en `.env` (ej. `http://localhost:8081`); las apps nativas no necesitan CORS.

## Qué falta antes de producción (no incluido en el MVP a propósito)

1. **Pagos reales:** implementar `PaymentProvider` con Stripe Connect o Mercado Pago
   (cuentas conectadas para guías, webhooks de confirmación) — hoy es simulado.
2. **PostgreSQL + almacenamiento externo** (S3/R2) + driver de email real.
3. Rate limit y sesiones en Redis si hay más de una instancia.
4. Textos legales definitivos revisados por un abogado (hoy son provisionales), y requisitos
   de SECTUR para guías de turistas en México.
5. Tiempo real en el chat (hoy polling cada 5 s), job automático para completar reservas y
   liberar pagos, bloqueos de fechas específicas en la disponibilidad.
6. Calificación guía → turista (el modelo ya soporta `direction`), cupones, suscripciones y
   destacados pagados (campos ya preparados: `discountMinor`, `couponCode`, `featuredUntil`).
