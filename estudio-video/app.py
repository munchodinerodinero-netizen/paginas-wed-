"""Estudio de Video IA — interfaz web local (se abre en el navegador).

Uso: python app.py  ->  abre http://127.0.0.1:7860
"""
import json
import os
import sys

import gradio as gr

import pipeline as pl
import youtube as yt

CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")


def cargar_config():
    try:
        with open(CONFIG, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def guardar_config(**kw):
    cfg = cargar_config()
    cfg.update(kw)
    with open(CONFIG, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)


def paso_guion(tema, guion_propio, minutos, estilo, idioma, proveedor, modelo_ollama):
    if guion_propio.strip():
        data = pl.guion_desde_texto(guion_propio, tema)
    else:
        if not tema.strip():
            raise gr.Error("Escribe un tema o pega tu propio guion.")
        data = pl.generar_guion(tema, minutos, estilo, idioma, proveedor, modelo_ollama)
    return json.dumps(data, ensure_ascii=False, indent=2)


def paso_video(guion_json, voz, velocidad, formato, pexels_key, musica, volumen, subtitulos,
               auto_subir, privacidad, programar, progress=gr.Progress()):
    try:
        guion = json.loads(guion_json)
    except ValueError:
        raise gr.Error("El guion no es JSON válido. Genéralo de nuevo o corrige el texto.")
    if pexels_key:
        guardar_config(pexels_key=pexels_key)
    pasos = {"n": 0}
    total = len(guion.get("escenas", [])) * 2 + 4

    def avance(msg):
        pasos["n"] += 1
        progress(min(pasos["n"] / total, 0.99), desc=msg)

    video, mini, _ = pl.crear_video(
        guion, voz=pl.VOCES[voz], velocidad=f"{int(velocidad):+d}%", formato=pl.FORMATOS[formato],
        pexels_key=pexels_key.strip(), musica=musica, volumen_musica=volumen, subtitulos=subtitulos,
        carpeta_salida=os.path.join(os.path.dirname(os.path.abspath(__file__)), "videos"),
        online="--offline" not in sys.argv, progress=avance,
    )
    estado = f"Guardado en: {os.path.dirname(video)}"
    if auto_subir:
        progress(0.99, desc="Subiendo a YouTube...")
        estado += "\n\n" + subir_a_youtube(video, mini, formato, guion, privacidad, programar)
    return video, mini, estado, {"video": video, "mini": mini, "formato": formato, "guion": guion}


def subir_a_youtube(video, mini, formato, guion, privacidad, programar):
    try:
        url, aviso = yt.subir(
            video, guion.get("titulo", "Video"), guion.get("descripcion", ""), guion.get("etiquetas", []),
            privacidad=yt.PRIVACIDAD[privacidad], miniatura=mini, publicar_en=programar or None,
            es_short=formato.startswith("Vertical"),
        )
        extra = f" Programado para {programar}." if programar else ""
        return f"Subido a YouTube: {url}{extra}{aviso}"
    except Exception as e:
        return f"No se pudo subir a YouTube: {e}"


def paso_subir_ultimo(ultimo, privacidad, programar):
    if not ultimo:
        raise gr.Error("Primero crea un video.")
    return subir_a_youtube(ultimo["video"], ultimo["mini"], ultimo["formato"], ultimo["guion"],
                           privacidad, programar)


def paso_conectar():
    try:
        return f"Canal conectado: **{yt.conectar()}**"
    except Exception as e:
        raise gr.Error(str(e))


def construir():
    cfg = cargar_config()
    with gr.Blocks(title="Estudio de Video IA") as app:
        gr.Markdown("# Estudio de Video IA\nDe un tema a un video terminado: guion, voz, imágenes, "
                    "subtítulos, música y miniatura. Gratis.")
        with gr.Row():
            with gr.Column():
                gr.Markdown("### 1. Guion")
                tema = gr.Textbox(label="Tema del video", placeholder="Ej: 5 errores que hacen perder clientes a un techero")
                guion_propio = gr.Textbox(label="…o pega tu propio guion (opcional, un párrafo por escena)", lines=4)
                with gr.Row():
                    minutos = gr.Slider(0.5, 15, value=1, step=0.5, label="Duración (minutos)")
                    estilo = gr.Dropdown(list(pl.ESTILOS), value="Documental", label="Estilo")
                with gr.Row():
                    idioma = gr.Dropdown(["español de México", "español", "inglés"], value="español de México",
                                         label="Idioma del guion")
                    proveedor = gr.Dropdown(["Pollinations (gratis, en línea)", "Ollama (local)"],
                                            value="Pollinations (gratis, en línea)", label="IA para el guion")
                modelo_ollama = gr.Textbox(value="llama3.1", label="Modelo de Ollama (solo si usas Ollama)")
                btn_guion = gr.Button("Generar guion", variant="primary")
                guion = gr.Code(label="Guion (puedes editarlo antes de crear el video)", language="json", lines=16)
            with gr.Column():
                gr.Markdown("### 2. Video")
                voz = gr.Dropdown(list(pl.VOCES), value=list(pl.VOCES)[0], label="Voz")
                velocidad = gr.Slider(-30, 30, value=0, step=5, label="Velocidad de la voz (%)")
                formato = gr.Radio(list(pl.FORMATOS), value=list(pl.FORMATOS)[0], label="Formato")
                pexels = gr.Textbox(value=cfg.get("pexels_key", ""), type="password",
                                    label="API key de Pexels (opcional: video real de stock; sin ella usa imágenes IA)")
                musica = gr.Audio(label="Música de fondo (opcional, mp3)", type="filepath")
                volumen = gr.Slider(0.02, 0.4, value=0.12, step=0.02, label="Volumen de la música")
                subtitulos = gr.Checkbox(value=True, label="Subtítulos quemados en el video")
                btn_video = gr.Button("Crear video", variant="primary")
                video = gr.Video(label="Resultado")
                mini = gr.Image(label="Miniatura", type="filepath")
                estado = gr.Markdown()
                gr.Markdown("### 3. YouTube")
                canal = yt.canal_conectado()
                estado_canal = gr.Markdown(f"Canal conectado: **{canal}**" if canal else
                                           "Sin canal conectado. Usa el botón (la primera vez se abre Google).")
                btn_conectar = gr.Button("Conectar mi canal de YouTube")
                auto_subir = gr.Checkbox(value=cfg.get("auto_subir", False),
                                         label="Subir automáticamente al terminar cada video")
                privacidad = gr.Radio(list(yt.PRIVACIDAD), value="Privado", label="Visibilidad")
                programar = gr.Textbox(label="Programar publicación (opcional, AAAA-MM-DD HH:MM, hora local)",
                                       placeholder="2026-10-01 18:00")
                btn_subir = gr.Button("Subir el último video a YouTube")
                ultimo = gr.State(None)

        btn_guion.click(paso_guion, [tema, guion_propio, minutos, estilo, idioma, proveedor, modelo_ollama], guion)
        btn_video.click(paso_video, [guion, voz, velocidad, formato, pexels, musica, volumen, subtitulos,
                                     auto_subir, privacidad, programar], [video, mini, estado, ultimo])
        btn_conectar.click(paso_conectar, None, estado_canal)
        btn_subir.click(paso_subir_ultimo, [ultimo, privacidad, programar], estado)
        auto_subir.change(lambda v: guardar_config(auto_subir=v), auto_subir, None)
    return app


if __name__ == "__main__":
    construir().queue().launch(inbrowser="--no-browser" not in sys.argv)
