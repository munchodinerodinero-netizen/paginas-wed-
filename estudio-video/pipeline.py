"""Motor del Estudio de Video IA: tema -> guion -> voz -> imagenes -> subtitulos -> video.

Todo con servicios gratis:
- Guion: Pollinations (sin API key) u Ollama (local). Tambien acepta guion propio.
- Voz: edge-tts (voces neuronales de Microsoft, gratis, sin API key).
- Visuales: Pexels (video real, API key gratis) o Pollinations (imagen IA, sin key).
- Render: ffmpeg incluido en imageio-ffmpeg (no hay que instalar nada aparte).
"""
import asyncio
import json
import os
import random
import re
import shutil
import subprocess
import textwrap
import time
import urllib.parse
from pathlib import Path

import imageio_ffmpeg
import requests
from PIL import Image, ImageDraw, ImageFont

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
HTTP_TIMEOUT = 90

VOCES = {
    "Español México - Hombre (Jorge)": "es-MX-JorgeNeural",
    "Español México - Mujer (Dalia)": "es-MX-DaliaNeural",
    "Español España - Hombre (Álvaro)": "es-ES-AlvaroNeural",
    "Español España - Mujer (Elvira)": "es-ES-ElviraNeural",
    "Inglés EE.UU. - Hombre (Guy)": "en-US-GuyNeural",
    "Inglés EE.UU. - Mujer (Jenny)": "en-US-JennyNeural",
}

FORMATOS = {
    "Horizontal 16:9 (YouTube)": (1920, 1080),
    "Vertical 9:16 (TikTok / Reels / Shorts)": (1080, 1920),
}

ESTILOS = {
    "Documental": "tono de documental serio, datos concretos, narrativa que engancha",
    "Top 10": "formato de lista Top 10, cuenta regresiva, cada punto con un dato sorprendente",
    "Historia": "narración histórica dramática, como un relato",
    "Educativo": "explicación clara y sencilla, paso a paso",
    "Anuncio / Ventas": "guion de anuncio persuasivo: gancho, problema, solución, llamada a la acción",
    "Misterio / True crime": "tono de misterio y suspenso, preguntas intrigantes",
}


# ---------------------------------------------------------------- utilidades

def log(progress, msg):
    print(msg, flush=True)
    if progress:
        progress(msg)


def run_ffmpeg(args, cwd=None):
    cmd = [FFMPEG, "-hide_banner", "-loglevel", "error", "-y", *args]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd)
    if res.returncode != 0:
        raise RuntimeError("ffmpeg falló:\n" + res.stderr[-2000:])


def media_duration(path):
    res = subprocess.run([FFMPEG, "-hide_banner", "-i", str(path)], capture_output=True, text=True)
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", res.stderr)
    if not m:
        raise RuntimeError(f"No pude leer la duración de {path}")
    h, mi, s = m.groups()
    return int(h) * 3600 + int(mi) * 60 + float(s)


def font(size, bold=True):
    candidatos = [
        "arialbd.ttf" if bold else "arial.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
    ]
    for c in candidatos:
        try:
            return ImageFont.truetype(c, size)
        except OSError:
            continue
    return ImageFont.load_default()


def extraer_json(texto):
    texto = re.sub(r"```(?:json)?", "", texto)
    ini, fin = texto.find("{"), texto.rfind("}")
    if ini == -1 or fin == -1:
        raise ValueError("La IA no devolvió JSON")
    return json.loads(texto[ini:fin + 1])


# ------------------------------------------------------------------- guion

PROMPT_GUION = """Eres guionista de videos para redes sociales y YouTube.
Escribe un guion en {idioma} sobre: "{tema}".
Estilo: {estilo}.
Duración aproximada: {minutos} minutos de narración (unas {palabras} palabras en total).
Divide el guion en {escenas} escenas. Cada escena: 2 a 4 frases de narración.
La primera escena debe ser un gancho fuerte. La última, un cierre con llamada a la acción.

Responde SOLO con JSON válido, sin texto extra, con esta forma exacta:
{{"titulo": "título atractivo del video (máximo 90 caracteres)",
  "descripcion": "descripción para YouTube de 3-5 líneas, con llamada a la acción",
  "etiquetas": ["8 a 12 etiquetas de búsqueda"],
  "escenas": [
    {{"narracion": "texto que dirá la voz",
      "busqueda": "2-4 palabras EN INGLÉS para buscar video de stock",
      "prompt_imagen": "descripción visual detallada EN INGLÉS para generar una imagen fotorrealista"}}
  ]}}"""


def generar_guion(tema, minutos, estilo, idioma, proveedor, ollama_modelo="llama3.1", progress=None):
    palabras = int(minutos * 150)
    escenas = max(3, round(minutos * 60 / 12))
    prompt = PROMPT_GUION.format(
        idioma=idioma, tema=tema, estilo=ESTILOS.get(estilo, estilo),
        minutos=minutos, palabras=palabras, escenas=escenas,
    )
    log(progress, f"Escribiendo guion con {proveedor}...")
    ultimo_error = None
    for intento in range(3):
        try:
            if proveedor == "Ollama (local)":
                r = requests.post(
                    "http://localhost:11434/api/chat",
                    json={"model": ollama_modelo, "stream": False, "format": "json",
                          "messages": [{"role": "user", "content": prompt}]},
                    timeout=600,
                )
                r.raise_for_status()
                texto = r.json()["message"]["content"]
            else:
                r = requests.post(
                    "https://text.pollinations.ai/openai",
                    json={"model": "openai", "messages": [{"role": "user", "content": prompt}],
                          "seed": random.randint(1, 10**6)},
                    timeout=HTTP_TIMEOUT,
                )
                r.raise_for_status()
                texto = r.json()["choices"][0]["message"]["content"]
            data = extraer_json(texto)
            if not data.get("escenas"):
                raise ValueError("Guion sin escenas")
            return data
        except Exception as e:  # reintenta: los servicios gratis a veces fallan
            ultimo_error = e
            log(progress, f"Intento {intento + 1} falló ({e}); reintentando...")
            time.sleep(3)
    raise RuntimeError(f"No se pudo generar el guion: {ultimo_error}")


def guion_desde_texto(texto, titulo=""):
    """Convierte un guion propio (párrafos separados por línea en blanco) en escenas."""
    parrafos = [p.strip() for p in re.split(r"\n\s*\n", texto.strip()) if p.strip()]
    if len(parrafos) == 1:  # un solo bloque: cortar cada ~3 frases
        frases = re.split(r"(?<=[.!?])\s+", parrafos[0])
        parrafos = [" ".join(frases[i:i + 3]) for i in range(0, len(frases), 3)]
    escenas = []
    for p in parrafos:
        palabras = [w for w in re.findall(r"[A-Za-zÁÉÍÓÚáéíóúñÑ]{5,}", p)][:4]
        escenas.append({"narracion": p, "busqueda": " ".join(palabras) or "city",
                        "prompt_imagen": p[:300]})
    titulo = titulo or parrafos[0][:60]
    return {"titulo": titulo, "descripcion": parrafos[0][:300], "etiquetas": [], "escenas": escenas}


# --------------------------------------------------------------------- voz

async def _tts(texto, voz, velocidad, salida):
    import edge_tts
    com = edge_tts.Communicate(texto, voz, rate=velocidad, boundary="WordBoundary")
    palabras = []
    with open(salida, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                palabras.append((chunk["offset"] / 1e7, (chunk["offset"] + chunk["duration"]) / 1e7, chunk["text"]))
    return palabras


def generar_voz(texto, voz, velocidad, salida):
    for intento in range(3):
        try:
            return asyncio.run(_tts(texto, voz, velocidad, salida))
        except Exception:
            if intento == 2:
                raise
            time.sleep(3)


def voz_silenciosa(texto, salida):
    """Modo prueba sin internet: audio mudo con tiempos estimados por palabra."""
    palabras = texto.split()
    dur = max(2.0, len(palabras) * 0.38)
    run_ffmpeg(["-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", f"{dur:.2f}", "-c:a", "libmp3lame", str(salida)])
    paso = dur / max(1, len(palabras))
    return [(i * paso, (i + 1) * paso, w) for i, w in enumerate(palabras)]


# ---------------------------------------------------------------- visuales

def pexels_video(consulta, key, ancho, alto, salida):
    orient = "portrait" if alto > ancho else "landscape"
    r = requests.get("https://api.pexels.com/videos/search",
                     headers={"Authorization": key},
                     params={"query": consulta, "per_page": 8, "orientation": orient},
                     timeout=HTTP_TIMEOUT)
    r.raise_for_status()
    videos = r.json().get("videos", [])
    if not videos:
        return False
    v = random.choice(videos[:5])
    archivos = [f for f in v["video_files"] if f.get("width") and f["file_type"] == "video/mp4"]
    archivos.sort(key=lambda f: abs(f["width"] - ancho))
    if not archivos:
        return False
    with requests.get(archivos[0]["link"], stream=True, timeout=HTTP_TIMEOUT) as d:
        d.raise_for_status()
        with open(salida, "wb") as f:
            for parte in d.iter_content(1 << 16):
                f.write(parte)
    return True


def pollinations_imagen(prompt, ancho, alto, salida):
    url = ("https://image.pollinations.ai/prompt/" + urllib.parse.quote(prompt[:400]) +
           f"?width={ancho}&height={alto}&nologo=true&model=flux&seed={random.randint(1, 10**6)}")
    r = requests.get(url, timeout=180)
    r.raise_for_status()
    if not r.headers.get("content-type", "").startswith("image"):
        raise RuntimeError("Pollinations no devolvió imagen")
    Path(salida).write_bytes(r.content)
    Image.open(salida).convert("RGB").resize((ancho, alto)).save(salida, "JPEG", quality=92)


def imagen_respaldo(texto, ancho, alto, salida, indice=0):
    """Fondo degradado con el texto de la escena (si no hay internet o fallan los servicios)."""
    paletas = [((20, 30, 60), (90, 40, 120)), ((10, 60, 70), (20, 120, 90)), ((70, 20, 30), (160, 70, 30)),
               ((30, 30, 30), (80, 80, 100))]
    c1, c2 = paletas[indice % len(paletas)]
    img = Image.new("RGB", (ancho, alto))
    d = ImageDraw.Draw(img)
    for y in range(alto):
        t = y / alto
        d.line([(0, y), (ancho, y)], fill=tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)))
    f = font(int(min(ancho, alto) * 0.05))
    lineas = textwrap.wrap(texto, width=28 if alto > ancho else 40)[:6]
    y = alto // 2 - len(lineas) * f.size // 2
    for linea in lineas:
        w = d.textlength(linea, font=f)
        d.text(((ancho - w) / 2, y), linea, font=f, fill="white")
        y += int(f.size * 1.3)
    img.save(salida, "JPEG", quality=92)


# ----------------------------------------------------------------- escenas

def clip_de_imagen(imagen, audio, dur, ancho, alto, salida, indice):
    fps = 30
    frames = int(dur * fps) + 1
    # Efecto Ken Burns: zoom lento, alternando entrada / salida.
    if indice % 2 == 0:
        z = "min(zoom+0.0008,1.18)"
    else:
        z = "if(eq(on,0),1.18,max(zoom-0.0008,1.0))"
    vf = (f"scale={ancho * 2}:{alto * 2}:force_original_aspect_ratio=increase,crop={ancho * 2}:{alto * 2},"
          f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={ancho}x{alto}:fps={fps},"
          f"format=yuv420p")
    run_ffmpeg(["-i", str(imagen), "-i", str(audio), "-vf", vf, "-t", f"{dur:.3f}",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-r", str(fps),
                "-af", "apad", "-c:a", "aac", "-ar", "44100", "-ac", "2", "-b:a", "160k", str(salida)])


def clip_de_video(video, audio, dur, ancho, alto, salida):
    vf = f"scale={ancho}:{alto}:force_original_aspect_ratio=increase,crop={ancho}:{alto},fps=30,format=yuv420p"
    run_ffmpeg(["-stream_loop", "-1", "-i", str(video), "-i", str(audio), "-map", "0:v", "-map", "1:a",
                "-vf", vf, "-af", "apad", "-t", f"{dur:.3f}", "-c:v", "libx264", "-preset", "veryfast",
                "-crf", "22", "-c:a", "aac", "-ar", "44100", "-ac", "2", "-b:a", "160k", str(salida)])


# -------------------------------------------------------------- subtitulos

def ts(seg):
    h, r = divmod(seg, 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}".replace(".", ",")


def escribir_srt(palabras, salida, por_linea=5):
    bloques = []
    for i in range(0, len(palabras), por_linea):
        grupo = palabras[i:i + por_linea]
        bloques.append((grupo[0][0], grupo[-1][1], " ".join(w for _, _, w in grupo)))
    with open(salida, "w", encoding="utf-8") as f:
        for n, (a, b, t) in enumerate(bloques, 1):
            f.write(f"{n}\n{ts(a)} --> {ts(b)}\n{t}\n\n")


# --------------------------------------------------------------- miniatura

def generar_miniatura(titulo, prompt, ancho, alto, salida, online):
    base = str(salida) + ".base.jpg"
    try:
        if not online:
            raise RuntimeError("sin conexión")
        pollinations_imagen(prompt + ", dramatic youtube thumbnail, high contrast", ancho, alto, base)
    except Exception:
        imagen_respaldo("", ancho, alto, base, 3)
    img = Image.open(base).convert("RGB")
    capa = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)
    d.rectangle([0, int(alto * 0.55), ancho, alto], fill=(0, 0, 0, 150))
    img = Image.alpha_composite(img.convert("RGBA"), capa).convert("RGB")
    d = ImageDraw.Draw(img)
    f = font(int(min(ancho, alto) * 0.09))
    lineas = textwrap.wrap(titulo.upper(), width=18 if alto > ancho else 22)[:3]
    y = int(alto * 0.6)
    for linea in lineas:
        w = d.textlength(linea, font=f)
        d.text(((ancho - w) / 2, y), linea, font=f, fill=(255, 220, 0), stroke_width=6, stroke_fill="black")
        y += int(f.size * 1.15)
    img.save(salida, "JPEG", quality=92)
    os.remove(base)


# ------------------------------------------------------------ orquestador

def crear_video(guion, voz="es-MX-JorgeNeural", velocidad="+0%", formato=(1920, 1080),
                pexels_key="", musica=None, volumen_musica=0.12, subtitulos=True,
                carpeta_salida="videos", online=True, progress=None):
    ancho, alto = formato
    titulo = guion.get("titulo", "video")
    nombre = re.sub(r"[^A-Za-z0-9_-]+", "_", titulo)[:50].strip("_") or "video"
    salida_dir = Path(carpeta_salida) / f"{time.strftime('%Y%m%d_%H%M%S')}_{nombre}"
    trabajo = salida_dir / "trabajo"
    trabajo.mkdir(parents=True, exist_ok=True)

    clips, palabras_todas, t0 = [], [], 0.0
    escenas = guion["escenas"]
    for i, esc in enumerate(escenas):
        log(progress, f"Escena {i + 1}/{len(escenas)}: voz...")
        audio = trabajo / f"voz_{i:03d}.mp3"
        texto = esc["narracion"].strip()
        palabras = generar_voz(texto, voz, velocidad, audio) if online else voz_silenciosa(texto, audio)
        dur = media_duration(audio) + 0.25
        palabras_todas += [(a + t0, b + t0, w) for a, b, w in palabras]

        log(progress, f"Escena {i + 1}/{len(escenas)}: visual...")
        clip = trabajo / f"clip_{i:03d}.mp4"
        hecho = False
        if online and pexels_key:
            try:
                vid = trabajo / f"stock_{i:03d}.mp4"
                if pexels_video(esc.get("busqueda", ""), pexels_key, ancho, alto, vid):
                    clip_de_video(vid, audio, dur, ancho, alto, clip)
                    hecho = True
            except Exception as e:
                log(progress, f"  Pexels falló ({e}), uso imagen IA.")
        if not hecho:
            img = trabajo / f"img_{i:03d}.jpg"
            try:
                if not online:
                    raise RuntimeError("sin conexión")
                pollinations_imagen(esc.get("prompt_imagen") or texto, ancho, alto, img)
            except Exception as e:
                if online:
                    log(progress, f"  Imagen IA falló ({e}), uso fondo simple.")
                imagen_respaldo(texto, ancho, alto, img, i)
            clip_de_imagen(img, audio, dur, ancho, alto, clip, i)
        clips.append(clip)
        t0 += media_duration(clip)

    log(progress, "Uniendo escenas...")
    lista = trabajo / "lista.txt"
    lista.write_text("".join(f"file '{c.name}'\n" for c in clips), encoding="utf-8")
    unido = trabajo / "unido.mp4"
    run_ffmpeg(["-f", "concat", "-safe", "0", "-i", "lista.txt", "-c", "copy", "unido.mp4"], cwd=trabajo)

    actual = unido
    if subtitulos and palabras_todas:
        log(progress, "Agregando subtítulos...")
        escribir_srt(palabras_todas, trabajo / "subs.srt", por_linea=3 if alto > ancho else 5)
        tam = 13 if alto > ancho else 20
        estilo = (f"FontName=Arial,FontSize={tam},Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,"
                  f"BorderStyle=1,Outline=3,Shadow=0,Alignment=2,MarginV={40 if alto > ancho else 30}")
        run_ffmpeg(["-i", "unido.mp4", "-vf", f"subtitles=subs.srt:force_style='{estilo}'",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-c:a", "copy", "subtitulado.mp4"],
                   cwd=trabajo)
        actual = trabajo / "subtitulado.mp4"

    final = salida_dir / f"{nombre}.mp4"
    if musica:
        log(progress, "Mezclando música de fondo...")
        run_ffmpeg(["-i", str(actual), "-stream_loop", "-1", "-i", str(musica), "-filter_complex",
                    f"[1:a]volume={volumen_musica}[m];[0:a][m]amix=inputs=2:duration=first:dropout_transition=0[a]",
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", str(final)])
    else:
        shutil.copy(actual, final)

    log(progress, "Creando miniatura...")
    mini = salida_dir / "miniatura.jpg"
    generar_miniatura(titulo, escenas[0].get("prompt_imagen", titulo), 1280 if ancho > alto else 1080,
                      720 if ancho > alto else 1920, mini, online)

    (salida_dir / "guion.json").write_text(json.dumps(guion, ensure_ascii=False, indent=2), encoding="utf-8")
    shutil.rmtree(trabajo, ignore_errors=True)
    log(progress, f"Listo: {final}")
    return str(final), str(mini), guion
