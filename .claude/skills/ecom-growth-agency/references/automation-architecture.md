# Arquitectura de Automatización

## Pipeline conceptual (n8n / Make)

```
Producto
  ↓
Base de datos
  ↓
Investigación (research + competitor intel)
  ↓
IA (generación de ángulos/hooks/guiones)
  ↓
Generación de guiones
  ↓
Generación de voz
  ↓
Generación de video
  ↓
Edición
  ↓
Subtítulos
  ↓
Control de calidad (checklist de compliance + checklist "por qué alguien vería esto")
  ↓
Aprobación (humana, al menos en fase inicial)
  ↓
Publicación (vía APIs oficiales)
  ↓
Analytics
  ↓
IA analiza resultados
  ↓
Genera nuevas versiones (Creative Family del ganador — ver testing-winner-detection.md)
  ↓
Publicación
  ↓
Escalamiento (ver decision-rules-scaling.md)
```

Este es el diagrama de referencia para diseñar el workflow real en n8n/Make — cada flecha es un
nodo o grupo de nodos. La IA participa en generación de guiones y en el análisis de resultados
para proponer nuevas variantes; el control de calidad y la aprobación de gasto significativo
deben tener un checkpoint humano hasta que el sistema tenga suficiente historial de decisiones
correctas.

## Publicación automatizada

Conectar mediante **APIs oficiales** cuando estén disponibles: TikTok, Instagram, Facebook,
YouTube, Pinterest. Nunca depender de métodos que violen los términos de servicio de una
plataforma (no bots de interacción falsa, no publicación por scraping/sesión no oficial).

## Calendario y ficha de cada pieza

Cada video/publicación debe tener un registro con:

| Campo | Ejemplo |
|---|---|
| ID | LED-MASK-W3-H07-C03-A02 (producto-semana-hook-creador-ángulo) |
| Producto | Máscara facial LED |
| Hook | # y texto corto |
| Ángulo | categoría |
| Creator | perfil usado |
| Plataforma | TikTok / IG / YT / FB |
| Fecha | de publicación |
| Hora | de publicación |
| Estado | borrador / aprobado / publicado / pausado |
| URL | link a la pieza publicada |
| Métricas | hook rate, retención, CTR, CPA, ROAS (link al dashboard) |

Esta tabla es la base de datos que alimenta `testing-winner-detection.md` y
`analytics-dashboard.md` — sin ID consistente no se puede rastrear qué combinación (hook ×
creador × ángulo) es la que realmente está ganando.
