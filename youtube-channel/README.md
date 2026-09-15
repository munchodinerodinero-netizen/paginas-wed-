# YouTube Automation — Paquete de Inicio

Este paquete cubre el flujo "crear canal" (secciones NICHO → BANCO DE TEMAS del sistema).

## Contenido
- `strategy/01-niche-analysis.md` — investigación de RPM/competencia y NICHE SCORE
- `strategy/02-channel-identity-EN.md` / `-ES.md` — nombre, audiencia, tono
- `strategy/03-content-pillars.md` — 5 pilares de contenido
- `strategy/04-production-stack.md` — herramientas de IA disponibles ya en esta sesión + alternativas
- `strategy/05-calendario-editorial.md` — cadencia de publicación y próximo video a producir
- `ideas/long-form-EN.csv` (24 ideas) y `ideas/shorts-EN.csv` (30 ideas)
- `ideas/long-form-ES.csv` (12 ideas) y `ideas/shorts-ES.csv` (15 ideas)
- `content_database.csv` — base de datos maestra (sección 23 del sistema): EN-L01 y ES-L01 en READY, 6 Shorts en SCRIPT

## Resumen de la decisión
- **Nicho ganador:** documentales de negocios + disrupción por IA (Score 79/100)
- **Canal principal:** EN — "Market Autopsy" (RPM y foso competitivo más favorables)
- **Canal secundario:** ES — "Radiografía Empresarial" (foco en audiencia de España)
- **Primer video recomendado:** EN-L01 (VIDEO SCORE 82.7)

## Estado actual (2026-09-15)
- **EN-L01** y **ES-L01**: paquete completo (script, shot list, voiceover, b-roll, thumbnail prompts, títulos, descripción, SEO) — estado READY en `content_database.csv`.
- **6 Shorts** derivados (3 EN + 3 ES): guion listo, estado SCRIPT.
- **1 miniatura generada** (EN-L01, Concepto 1) con AlexyaAI — binario no descargado al repo por restricción de red del entorno de esta sesión, ver `videos/long-form/EN-L01/thumbnails` / `thumbnails/EN-L01/README.md` para la URL.
- Créditos de generación de imagen usados: 31/55 en Alexia (queda para otra imagen si baja a modo `fast`, no alcanza para dos más).

## Siguiente paso
- Producir de verdad (grabar voiceover, generar/editar visuales) usando los paquetes ya READY.
- Si se quiere seguir generando ideas o paquetes nuevos, comandos equivalentes:
  - "genera el guion de [ID]" → `/youtube script`
  - "arma el paquete completo del video [ID]" → `/youtube longform`
  - "genera los Shorts de ese video" → `/youtube shorts`
  - "genera las miniaturas" → `/youtube thumbnail`
  - "activa autopilot" → ejecuta el ciclo completo (con confirmación antes de publicar)

## Recordatorio
Ninguna cifra de RPM, vistas, suscriptores o ingresos es una garantía — son estimaciones basadas en datos públicos de mercado (septiembre 2026) y en la ejecución real del canal.
