# Production Stack — Herramientas de IA disponibles

## Estado real de la sesión (2026-09-15)

| Herramienta | Uso | Saldo/plan actual | Costo de referencia |
|---|---|---|---|
| **AlexyaAI** (`alexia`) | Generación de imágenes, video, animación de personajes | 55 créditos | Imagen fast: 31 créditos · Imagen high_quality: 55 · Imagen gpt2: 15-100 según tamaño/calidad · Video: desde ~140 · Motion: 46/s |
| **Maqrketing** | Generación de imagen/video/audio, TikTok, website builder, voces | 9.76 créditos — **plan free** | Depende del modelo elegido; con este saldo no alcanza para una generación estándar de imagen |
| **YouTube API / Analytics** | Publicación y métricas reales | No conectada aún | — |
| **Google Trends** | Investigación de tendencias | No conectada aún | — |

**Conclusión operativa:** con el saldo actual, se puede generar **una imagen en modo fast por Alexia** antes de quedarse sin crédito suficiente para una segunda. Maqrketing no es utilizable para generación hasta subir de plan o recargar crédito.

## Reglas de uso mientras el saldo sea limitado
1. Nunca generar las 5 variantes de miniatura de un video de una sola vez — generar primero el concepto recomendado, validar que funciona, y solo entonces evaluar generar alternativas para A/B testing.
2. Preferir modo `fast` de Alexia (31 créditos) sobre `high_quality` (55) o `gpt2` salvo que el detalle del prompt lo exija (ej. texto legible dentro de la imagen).
3. Antes de cualquier generación de video (créditos desde ~140), confirmar explícitamente con Alberto — el costo es varias veces el de una imagen.
4. Revisar saldo (`get_account` / `balance`) antes de cada tanda de generación, no asumir que el saldo de la última sesión sigue igual.

## Alternativas sin costo de IA (mientras el saldo es limitado)
- **Stock con licencia libre:** Pexels, Pixabay, Unsplash — para b-roll genérico (oficinas, ciudades, manos escribiendo) que no necesita ser generado por IA.
- **Música/SFX con licencia:** YouTube Audio Library (gratuita, uso comercial permitido) como opción por defecto hasta definir una librería paga.
- **Motion graphics simples** (gráficos de barras, organigramas, líneas de tiempo): se pueden producir con herramientas de edición estándar (Canva, CapCut, After Effects) sin gastar créditos de generación de imagen IA — reservar la IA para los elementos que realmente lo requieren (ej. las miniaturas).

## Pendiente
- Confirmar si Alberto va a recargar crédito en Alexia/Maqrketing o subir de plan, y con qué presupuesto mensual — esto define cuántos videos/miniaturas por semana son sostenibles sin depender 100% de generación IA paga.
