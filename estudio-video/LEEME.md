# Estudio de Video IA (gratis)

Convierte un tema en un video terminado: guion → voz → imágenes o video de stock →
subtítulos → música → miniatura. Corre en tu computadora, sin suscripción.

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

## Notas

- Los servicios gratis a veces fallan o van lentos; la app reintenta y, si una imagen
  falla, pone un fondo con texto para no detener el video.
- Para video real en lugar de imágenes IA, pega tu API key de Pexels (se guarda en
  `config.json`, nunca se sube a ningún lado).
- Usa solo música que tengas derecho a usar (por ejemplo, la biblioteca de audio de YouTube).
- `python app.py --offline` crea videos de prueba sin internet (fondos de color y audio mudo).
