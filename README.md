# Plantilla LYON — Landing de contratistas/roofers

Landing page de demostración para **Techos Querétaro**, un negocio ficticio
de roofing y remodelación en Querétaro. Sirve dos propósitos:

1. **Portafolio**: mostrarla en llamadas y mensajes de prospección como
   ejemplo de lo que LYON entrega.
2. **Plantilla base**: clonar y personalizar en minutos para un cliente real
   (nombre, teléfono, colores y fotos cambian; la estructura se mantiene).

## Stack usado y por qué

**HTML + CSS + JavaScript planos, sin build ni framework.**

- Es la opción más simple posible de mantener: Alberto (no-técnico) o
  cualquier persona puede abrir `index.html`, `css/styles.css` o
  `js/config.js` en un editor de texto y entender qué está pasando, sin
  `npm install`, sin compilador, sin dependencias que se rompan con el
  tiempo.
- No requiere infraestructura: se puede hospedar en cualquier hosting
  estático (Netlify, Vercel, GitHub Pages, cPanel de un hosting mexicano
  barato) subiendo la carpeta tal cual.
- Para el tamaño de este sitio (una landing de una sola página) un
  framework como React no aporta ventaja real y sí agrega complejidad
  innecesaria de build/despliegue.
- Todo el contenido variable por cliente (nombre, teléfono, WhatsApp,
  colores de marca) está aislado en `js/config.js` y en las variables CSS
  de `css/styles.css`, así que ajustar esos datos no requiere tocar el
  HTML ni saber programar a fondo.

## Cómo correrlo localmente

No necesita instalación. Dos opciones:

**Opción A — abrir el archivo directo**
Haz doble clic en `index.html` (o ábrelo desde el navegador con
`Archivo > Abrir`). Funciona porque no depende de un backend ni de rutas
de servidor.

**Opción B — servidor local (recomendado para ver bien todo)**
Desde la carpeta del proyecto:

```bash
# con Python (ya viene instalado en Mac/Linux)
python3 -m http.server 8000

# o con Node, si lo tienes instalado
npx serve .
```

Luego abre `http://localhost:8000` en el navegador.

## Estructura del proyecto

```
index.html          → todo el contenido y estructura de la página
css/styles.css       → estilos y variables de marca (colores, tipografía)
js/config.js         → datos del negocio: nombre, teléfono, WhatsApp, etc.
js/main.js           → menú móvil, inyección de datos, formulario → WhatsApp
```

## Cómo personalizarlo para un cliente nuevo

1. **Copia la carpeta completa** del proyecto (o crea un branch nuevo) con
   el nombre del cliente.

2. **Edita `js/config.js`** — es la única fuente de verdad para los datos
   que se repiten en todo el sitio (nombre del negocio, teléfono, número
   de WhatsApp, correo, zona de servicio, horario, redes sociales, años de
   experiencia). Cambiar este archivo actualiza automáticamente el header,
   el hero, el botón flotante de WhatsApp, el formulario y el footer.

3. **Edita los colores de marca en `css/styles.css`** — están arriba de
   todo, dentro de `:root`, como `--color-primary`. No hace falta tocar
   nada más del CSS.

4. **Edita el copy largo directo en `index.html`** — títulos, descripciones
   de servicios, testimonios y textos de las tarjetas de proyectos son
   específicos de cada negocio y viven directamente en el HTML. Búscalos
   por sección (`<!-- ══ SERVICIOS ══ -->`, `<!-- ══ TESTIMONIOS ══ -->`,
   etc.) y reemplázalos.

5. **Reemplaza las fotos** — los bloques con fondo de color y el ícono de
   techo (`class="placeholder"`) son marcadores de posición para fotos
   reales del cliente (proyecto destacado, antes/después, foto del equipo).
   Cámbialos por una etiqueta `<img>` con la foto real cuando el cliente la
   entregue.

6. **Revisa el formulario de cotización** — no requiere backend: arma un
   mensaje con los datos capturados y abre WhatsApp automáticamente hacia
   el número configurado en `CONFIG.whatsappNumber`. Si el cliente
   prefiere recibir los leads por correo o en un CRM, ese es el punto en
   `js/main.js` (`setupQuoteForm`) donde se conectaría un endpoint propio.

## Características incluidas

- **100% mobile-first**: pensado primero para pantalla de celular, con
  menú hamburguesa, botones grandes y botón flotante de WhatsApp siempre
  visible.
- **Accesible**: HTML semántico, `aria-label`s, foco visible, respeta
  `prefers-reduced-motion`, contraste de color cuidado.
- **Sin dependencias externas de JS**: solo Google Fonts vía `<link>`. Todo
  lo demás es HTML/CSS/JS propio.
- **Secciones**: header con navegación y CTA, hero con confianza inmediata,
  franja de números, servicios, galería antes/después, sobre nosotros,
  proceso de trabajo, testimonios, banda de llamado a la acción,
  formulario de cotización (con envío directo a WhatsApp) y footer con
  contacto.
