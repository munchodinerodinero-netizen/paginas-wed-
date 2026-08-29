# CRM.md — El sistema de seguimiento de LYON

## El tablero ya está construido — úsalo directo

**https://claude.ai/code/artifact/ebd5ae9d-2162-4240-954c-11bcf1ac1340**

No es una hoja que tengas que armar — es la herramienta corriendo, ya con las 16
columnas de abajo convertidas en un tablero real: agregas un lead, lo calificas, le
cambias la etapa con un clic (se colorea solo), ves los 6 números de la semana arriba,
y exporta a CSV cuando quieras un respaldo. Cada cambio se guarda solo — ábrelo mañana
y todo sigue ahí. El código fuente vive en `Harvey/CRM_app.html` como referencia; la
hoja `CRM_template.csv` sigue disponible si en algún momento prefieres Google Sheets a
la vieja usanza, pero para el uso diario, entra al link de arriba.

## Mi veredicto

Deja de perder leads por no darles seguimiento. Ese es el problema, no tu oferta —
ya la tienes empaquetada (Básico/Pro/Premium en `BRAIN.md`). El bloqueo ahora es
operativo: contactas un prospecto, te distraes prospectando al siguiente, y el primero
se enfría sin que nadie vuelva a escribirle. Esto se acaba hoy.

Este documento es tu CRM completo — una sola hoja de Google Sheets, tres mensajes de
seguimiento ya escritos, un sistema de calificación, y una rutina diaria de 5 minutos.
No hay código que instalar. Ábrelo, cópialo, y corre tu primer lead real por todo el
flujo hoy mismo.

**Lente Brian Tracy:** el volumen de actividad predice el resultado, no la suerte — pero
solo si cada lead tiene una próxima acción y una próxima fecha. Sin eso, "actividad" es
solo ruido.

---

## 1 / La hoja — tu única fuente de verdad

Un Google Sheet. Nómbralo `CRM LYON`. Estas 16 columnas, en este orden. No lo armes a
mano: ya está listo en `Harvey/CRM_template.csv` con las 16 columnas y dos filas de
ejemplo (una en NUEVO, una en SEGUIMIENTO) para que veas cómo se ve una fila real
llena. Abre Google Sheets → **Archivo → Importar → Subir** → sube el CSV → "Reemplazar
hoja actual" o "Insertar como nueva hoja". Borra las dos filas de ejemplo cuando metas
tus leads reales — son referencia, no datos.

| # | Columna | Qué va aquí |
|---|---|---|
| 1 | Fecha | Cuándo entró el lead |
| 2 | Nombre | Dueño o contacto del negocio |
| 3 | Negocio | Nombre del negocio (ej. "Techos García") |
| 4 | WhatsApp | Número — tu canal principal, no email. Este nicho vive en WhatsApp |
| 5 | Fuente | Google Maps / Habitissimo / StarOfService / InfoIsInfo / Redes / Referido |
| 6 | Tipo | Contratista / Roofer / Remodelador / Otro |
| 7 | Tiene Web | No / Vieja-rota / Sí-pero-débil |
| 8 | Instagram/FB | Link si tiene — de aquí sacas el hook de apertura |
| 9 | Reseñas | Rating y cantidad si existen (ej. "4.8★, 32 reseñas, Google"), o "Sin reseñas encontradas" — nunca inventado |
| 10 | Notas | Qué hace, tamaño aparente, y el hook específico para abrir la conversación |
| 11 | Score | /50 (ver sección 3) |
| 12 | Etapa | NUEVO → ENRIQUECIDO → CALIFICADO → SEGUIMIENTO → AGENDADO → CERRADO |
| 13 | Último Contacto | Fecha del último mensaje/llamada |
| 14 | Próxima Acción | Qué toca hacer después, en una línea |
| 15 | Próxima Fecha | Cuándo toca hacerlo |
| 16 | Paquete Propuesto | Básico / Pro / Premium — cuál le ofreciste |

Reseñas es información esencial pero no siempre existe: un negocio con Facebook o Wix
gratuito casi nunca tiene calificación pública. "Sin reseñas encontradas" es un dato
real y útil (es un hook: "ni siquiera tienes reseñas en Google, eso también te lo
resuelvo"), no un campo vacío que rellenar con algo inventado.

Por qué no hay columna de "Email": tu ICP no vive ahí. Contratistas y roofers en
Querétaro responden WhatsApp, no correo. No construyas el sistema para el lead que
quisieras tener — constrúyelo para el que realmente vas a contactar.

**Fuentes de entrada** (ya documentadas en `BRAIN.md`): Google Maps, Habitissimo,
StarOfService, InfoIsInfo, redes sociales, referidos. Todo entra a esta hoja, sin
excepción. Un lead que vive solo en tu cabeza o en un chat de WhatsApp perdido es un
lead que vas a olvidar.

---

## 2 / Enriquecer — de nombre a persona real

Antes de escribirle a nadie, sabe quién es. Dos minutos de investigación pública
(Google Maps, su Instagram/Facebook, el directorio donde lo encontraste) evitan que
mandes un mensaje genérico que se nota a kilómetros.

**Prompt — Enriquecer este lead:**

```
Investiga este lead y llena lo que puedas encontrar.

LEAD: [nombre, negocio, teléfono o perfil de redes]
MI NEGOCIO: LYON — construyo páginas web profesionales para contratistas, roofers
y remodeladores en Querétaro, listas en 48 horas, desde $6,000 MXN.

Dame exactamente esto, nada más:

TIPO DE NEGOCIO: (contratista / roofer / remodelador / otro)
TIENE WEB: (no / vieja-rota / sí-pero-débil) — con el link si existe
REDES: link a Instagram/Facebook si tiene
RESEÑAS: rating y cantidad si aparecen en Google/Facebook/Habitissimo, o
  "sin reseñas encontradas" si no hay
TAMAÑO APARENTE: (solo / equipo chico / equipo mediano)
NOTAS: 2-3 líneas sobre qué hace y qué necesitaría de alguien como yo
HOOK: una cosa específica de su negocio que pueda mencionar para probar
  que sí lo investigué (un proyecto que publicó, una reseña, algo puntual)

REGLAS:
- Solo información pública
- Si no encuentras algo, escribe DESCONOCIDO
- No inventes ni supongas nada — un dato falso mata el mensaje al instante
- Marca cualquier cosa de la que no estés seguro
```

Revisa cada campo DESCONOCIDO antes de mandar el mensaje. Un nombre de negocio mal
puesto en el primer mensaje es la forma más rápida de que te ignoren.

---

## 3 / Calificar — a quién le hablas hoy

No todos los leads valen tu tiempo por igual. Cinco factores, 10 puntos cada uno,
50 total — ajustado a tu negocio real, no al genérico:

| Factor | La pregunta para LYON |
|---|---|
| FIT | ¿Es contratista/roofer/remodelador en Querétaro (o zona que puedas atender)? |
| NEED | ¿No tiene web, o la tiene vieja/rota/no-mobile? |
| URGENCIA | ¿Depende de leads entrantes ya (cada día sin web es dinero perdido para él)? |
| PRESUPUESTO | ¿Su propio ticket promedio es de miles de pesos? (si sí, $6-18K MXN es una fracción) |
| AUTORIDAD | ¿Es el dueño o quien decide, no un empleado? |

**Lo que significa el score:**

- **40-50** → Llámalo hoy. No mañana.
- **25-39** → Corre la secuencia completa de 3 mensajes (sección 4).
- **15-24** → Un mensaje. Si no contesta, déjalo ir.
- **Menos de 15** → Suéltalo. Perseguir esto te cuesta un lead real que sí calificaba.

**Prompt — Calificar este lead:**

```
Califica este lead sobre 50.

LEAD: [pega la info enriquecida]
MI OFERTA: páginas web para contratistas/roofers en Querétaro — Básico $6,000 MXN,
Pro $12,000 MXN (el que más recomiendo), Premium $18,000 MXN, todos + $900/mes de
mantenimiento.
MI CLIENTE IDEAL: contratista/roofer/remodelador en Querétaro sin web o con web
débil, que ya recibe trabajos por recomendación y está perdiendo los que buscan
en línea.

Puntúa cada uno sobre 10 con una línea de razón:

FIT:        /10 - por qué
NEED:       /10 - por qué
URGENCIA:   /10 - por qué
PRESUPUESTO:/10 - por qué
AUTORIDAD:  /10 - por qué

TOTAL:    /50
VEREDICTO: llamar hoy / secuencia / un mensaje / soltar
MAYOR DUDA: lo primero que debería confirmar en la llamada, lo que más
  cambiaría este score

REGLAS:
- Sé honesto. Un score inflado me hace perder la semana.
- Si estás adivinando presupuesto o autoridad, dilo.
- No pongas más de 5 en nada que no puedas justificar.
```

---

## 4 / Seguimiento — los 3 mensajes, y ya

Tres mensajes. Nada más. La mayoría de los cierres pasan en esta ventana — y la mayoría
de la gente manda el mensaje 1 y se rinde en silencio. Tú no.

| Mensaje | Cuándo | Su trabajo |
|---|---|---|
| 1 — Inicial | Día 0 | Probar que investigaste. Un solo ask claro. |
| 2 — Recordatorio | Día 3 | Corto, ligero. Asume que está ocupado, no desinteresado. |
| 3 — Valor | Día 8 | Dar algo útil de verdad. Cerrar el ciclo con elegancia. |

**Mensaje 1 — Inicial (WhatsApp o mensaje directo en redes):**

> Hola [Nombre] — vi que [Negocio] no tiene página web (o la tienes, pero no
> aparece cuando alguien busca "[tipo de contratista] cerca de mí" en Querétaro).
> Yo construyo páginas web profesionales para contratistas y roofers en 48 horas
> — no semanas. ¿Vale una llamada rápida de 5 minutos esta semana para mostrarte
> cómo se vería para tu negocio?

**Mensaje 2 — Recordatorio (día 3):**

> Hola [Nombre] — subo esto de nuevo por si se te perdió entre tantos mensajes.
> Sigo teniendo espacio esta semana si quieres ver cómo quedaría tu página.

**Mensaje 3 — Valor, último (día 8):**

> Hola [Nombre] — este es el último de mi parte. Aquí tienes un ejemplo real de lo
> que construyo: https://radiant-confidence-hub.lovable.app/ — lo dejo por si te
> sirve de referencia aunque no trabajemos juntos ahora. Si el momento no es este,
> sin problema — solo contéstame y no te vuelvo a escribir.

**Reglas que no se rompen:**

- Escribe como persona, no como plantilla de ventas.
- Un ask por mensaje, nunca tres.
- Sin urgencia falsa ("¡últimos lugares!" si no es cierto).
- Siempre fácil decir que no y que se detenga el contacto.
- Tres mensajes, luego te detienes. El cuarto mensaje no es persistencia, es acoso —
  y es la forma más rápida de construirte una reputación que no puedes deshacer.
- Contacta solo a quien tenga una razón legítima de negocio para escucharte (negocio
  público, encontrado en un directorio o Maps, con datos de contacto públicos). Si
  alguien te pide que pares, paras de inmediato — sin excepción.

---

## 5 / Agendar la llamada — sin fricción

Con este ICP, no mandes un link de Calendly como primer movimiento. Un contratista en
obra no va a entrar a un calendario a elegir horario — va a proponer o confirmar por
WhatsApp, directo.

**Flujo por default (gratis, cero fricción):**

Responde interesado → **tú propones dos horarios concretos** ("¿Te late hoy a las 5pm
o mañana a las 10am?") → confirma por WhatsApp → tú mandas un recordatorio 24h antes →
llamas.

Nunca preguntes "¿qué horario te funciona?" — eso abre una ronda extra de mensajes que
no necesitas. Tú decides los dos horarios, él elige uno.

**Flujo opcional (cuando el volumen suba):** Calendly conectado a tu calendario, con
confirmación y recordatorio automáticos, y Zapier/Make actualizando la hoja a AGENDADO
cuando se agenda. No lo montes antes de tener el flujo manual saturado — es una
distracción de armar infraestructura antes de tener el problema que la justifique.

**Lo que no puedes saltarte:** el recordatorio 24h antes de la llamada. Es el ajuste de
mayor retorno de todo este sistema — es la diferencia entre una agenda llena y una
mañana de "no contestó".

---

## 6 / Los números que vigilo contigo cada semana

Seis números, una vez por semana, mismo día, diez minutos. Estos ya están en `BRAIN.md`
como los que Harvey vigila contigo cada sesión — aquí está el set completo:

| Métrica | Qué te dice |
|---|---|
| Leads nuevos | ¿Está entrando algo al embudo? |
| Respuestas | ¿Tus mensajes sirven, o los estás desperdiciando? |
| Leads calificados (25+) | ¿Estás atrayendo al perfil correcto? |
| Seguimientos enviados | ¿De verdad estás corriendo la secuencia, o se te está cayendo? |
| Llamadas agendadas | El número que predice tu semana siguiente |
| Cierres / MRR acumulado | El único que te paga |

**Tu pipeline — una sola columna, seis valores posibles:**

```
NUEVO → ENRIQUECIDO → CALIFICADO → SEGUIMIENTO → AGENDADO → CERRADO
```

**El único hábito que hace que esto funcione:** cada lead en la hoja tiene una
Próxima Acción y una Próxima Fecha. Siempre. Sin excepción. Cada mañana, ordena la
hoja por Próxima Fecha y trabaja de arriba hacia abajo. Esa es tu rutina diaria
completa — cinco minutos.

---

## 7 / Lo honesto

Este sistema garantiza que ningún lead se te va a olvidar y que cada seguimiento se
va a escribir. No garantiza respuestas, llamadas agendadas ni cierres — nada lo hace.
Tú sigues siendo quien cierra. La IA investiga al lead y te escribe el mensaje; la
relación y el cierre siguen siendo tu trabajo.

Y una regla que no se negocia, la misma de siempre: **si un prospecto objeta el
precio, el problema es la presentación de valor o la calificación del lead — nunca
el precio.** Este sistema no cambia eso.
