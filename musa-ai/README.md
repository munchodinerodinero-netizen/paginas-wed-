# Musa AI — generador de influencers con IA

Sitio estático + 2 funciones serverless, listo para Vercel.

- `index.html` — landing (funciones, cómo funciona, precios, FAQ).
- `studio.html` — estudio: crear influencer (identidad fija por seed), sesiones de fotos,
  mejora HD, imagen a video, copies con IA y galería (guardada en el navegador).
- `api/video.js`, `api/status.js` — proxy a MuAPI para video.

## Motores

| Función | Motor | Costo |
|---|---|---|
| Imágenes / HD | Pollinations (`image.pollinations.ai`, modelo flux, `safe=true`) | Gratis, sin key |
| Copies | Pollinations (`text.pollinations.ai`) | Gratis, sin key |
| Video | MuAPI (Seedance 2, Grok Video, Happy Horse, Veo 3.1) | Por render |

## Deploy en Vercel

1. Importa el repo en Vercel con **Root Directory = `musa-ai`**, framework "Other".
2. Opcional: variable `MUAPI_KEY` para que el video funcione sin que el usuario pegue su key.
   Ojo: con esa variable, cualquier visitante gasta tus créditos. Ponla solo cuando haya
   cobro/login de por medio.

## Límites de contenido

Solo personajes ficticios, mayores de edad y contenido seguro para redes: filtro de prompts
en el cliente y en `api/video.js`, `safe=true` en imágenes, y el video solo acepta imágenes
generadas por el propio estudio (no se suben fotos de personas reales, no hay face swap).
