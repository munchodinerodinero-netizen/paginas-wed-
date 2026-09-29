# Estudio de Video IA (gratis)

Convierte un tema en un video terminado: guion → voz → imágenes o video de stock →
subtítulos → música → miniatura → subida a YouTube. Corre en tu computadora, sin suscripción.

## Qué usa (todo gratis)

| Paso | Servicio | ¿Necesita cuenta? |
|---|---|---|
| Guion | Pollinations (IA en línea) u Ollama (IA en tu PC) | No |
| Voz | Voces neuronales de Microsoft (edge-tts), español de México incluido | No |
| Imágenes | Pollinations (imágenes IA) | No |
| Video real de stock | Pexels (opcional) | Sí, API key gratis en pexels.com/api |
| Render | ffmpeg (se instala solo) | No |

## Instalar en Windows

1. Instala **Python 3.11 o 3.12** desde https://www.python.org/downloads/
   (en el instalador marca **"Add Python to PATH"**).
2. Descarga esta carpeta `estudio-video` a tu computadora.
3. Doble clic en **`instalar.bat`** (solo la primera vez, tarda unos minutos).
4. Doble clic en **`iniciar.bat`**. Se abre en tu navegador (http://127.0.0.1:7860).

## Cómo se usa

1. Escribe el **tema** (o pega tu propio guion, un párrafo por escena).
2. Elige duración, estilo e idioma → **Generar guion**. Puedes editarlo.
3. Elige voz, formato (16:9 YouTube o 9:16 TikTok/Reels), música opcional → **Crear video**.
4. El video, la miniatura y el guion quedan en la carpeta `videos/`.

## Subir a YouTube automáticamente

Usa la API oficial de YouTube (gratis). Se configura **una sola vez** (unos 10 minutos):

1. Entra a https://console.cloud.google.com/ con la cuenta de Google de tu canal y crea un
   proyecto nuevo (por ejemplo "estudio-video").
2. Menú **APIs y servicios → Biblioteca** → busca **YouTube Data API v3** → **Habilitar**.
3. Menú **Google Auth Platform / Pantalla de consentimiento de OAuth** → tipo **Externo** →
   pon un nombre y tu correo. En **Público / Audience**, agrega tu correo como **usuario de
   prueba**.
4. Menú **Credenciales → Crear credenciales → ID de cliente de OAuth** → tipo
   **App de escritorio** → **Descargar JSON**.
5. Renombra ese archivo a **`client_secret.json`** y ponlo dentro de la carpeta `estudio-video`.
6. En la app, botón **Conectar mi canal de YouTube** → se abre Google → acepta.
   Aparece "Google no verificó esta app": es tu propia app, dale **Continuar**.

Después marca **Subir automáticamente** y cada video que crees se sube solo, con título,
descripción, etiquetas y miniatura. Los videos verticales se suben como **Shorts**.
Puedes programar la publicación con fecha y hora.

**Límites que pone YouTube (importante):**
- **Tus videos van a quedar en privado** hasta que Google apruebe tu proyecto: YouTube
  bloquea en privado los videos subidos por apps de API no auditadas. Mientras tanto, entras
  a YouTube Studio y los cambias a público con un clic. Para quitar el bloqueo, llena la
  solicitud gratuita de auditoría: https://support.google.com/youtube/contact/yt_api_form
- Unos **6 videos por día** (cuota gratis de 10,000 unidades; cada subida gasta 1,600).
- Si el proyecto está en modo "Prueba", el permiso vence cada 7 días y tienes que volver a
  darle a **Conectar**. Para evitarlo, en la pantalla de consentimiento dale
  **Publicar app** (pasa a "En producción").
- La **miniatura personalizada** requiere verificar tu canal por teléfono en
  https://www.youtube.com/verify
- La app marca los videos como **contenido hecho con IA**, como pide YouTube.

## Notas

- Los servicios gratis a veces fallan o van lentos; la app reintenta y, si una imagen
  falla, pone un fondo con texto para no detener el video.
- Para video real en lugar de imágenes IA, pega tu API key de Pexels (se guarda en
  `config.json`, nunca se sube a ningún lado).
- Usa solo música que tengas derecho a usar (por ejemplo, la biblioteca de audio de YouTube).
- `python app.py --offline` crea videos de prueba sin internet (fondos de color y audio mudo).
