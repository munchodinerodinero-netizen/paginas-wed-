"""Subida automática a YouTube con la API oficial (YouTube Data API v3, gratis).

Configuración única: descargar `client_secret.json` de Google Cloud y ponerlo en esta
carpeta (ver LEEME.md). La primera vez se abre el navegador para autorizar tu canal;
después el permiso queda guardado en `token_youtube.json`.
"""
import os
from datetime import datetime, timezone

CARPETA = os.path.dirname(os.path.abspath(__file__))
CLIENT_SECRET = os.path.join(CARPETA, "client_secret.json")
TOKEN = os.path.join(CARPETA, "token_youtube.json")
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"]

PRIVACIDAD = {"Privado": "private", "No listado": "unlisted", "Público": "public"}


def _credenciales(interactivo=True):
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow

    creds = None
    if os.path.exists(TOKEN):
        creds = Credentials.from_authorized_user_file(TOKEN, SCOPES)
    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        if not interactivo:
            return None
        if not os.path.exists(CLIENT_SECRET):
            raise RuntimeError("Falta client_secret.json en la carpeta estudio-video. Sigue la sección "
                               "'Subir a YouTube' del LEEME.md.")
        flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET, SCOPES)
        creds = flow.run_local_server(port=0, prompt="consent")
    with open(TOKEN, "w", encoding="utf-8") as f:
        f.write(creds.to_json())
    return creds


def _servicio(interactivo=True):
    from googleapiclient.discovery import build
    creds = _credenciales(interactivo)
    return build("youtube", "v3", credentials=creds, cache_discovery=False) if creds else None


def conectar():
    """Abre el navegador para autorizar el canal y devuelve su nombre."""
    yt = _servicio(interactivo=True)
    canal = yt.channels().list(part="snippet", mine=True).execute()
    items = canal.get("items", [])
    return items[0]["snippet"]["title"] if items else "(cuenta sin canal de YouTube)"


def canal_conectado():
    if not os.path.exists(TOKEN):  # sin autorizar: no cargar las librerías de Google al arrancar
        return None
    try:
        yt = _servicio(interactivo=False)
        if not yt:
            return None
        items = yt.channels().list(part="snippet", mine=True).execute().get("items", [])
        return items[0]["snippet"]["title"] if items else None
    except Exception:
        return None


def subir(video, titulo, descripcion="", etiquetas=None, privacidad="private", miniatura=None,
          publicar_en=None, es_short=False, categoria="22", progress=None):
    """Sube el video. publicar_en: 'AAAA-MM-DD HH:MM' (hora local) para programarlo."""
    from googleapiclient.http import MediaFileUpload

    yt = _servicio(interactivo=True)
    titulo = titulo.strip()[:100]
    if es_short and "#shorts" not in (titulo + descripcion).lower():
        descripcion = (descripcion + "\n\n#Shorts").strip()
    status = {"privacyStatus": privacidad, "selfDeclaredMadeForKids": False,
              "containsSyntheticMedia": True}  # declara contenido hecho con IA, como pide YouTube
    if publicar_en:
        fecha = datetime.strptime(publicar_en.strip(), "%Y-%m-%d %H:%M").astimezone(timezone.utc)
        status["privacyStatus"] = "private"  # YouTube exige 'private' para programar
        status["publishAt"] = fecha.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    body = {
        "snippet": {"title": titulo, "description": descripcion[:4900],
                    "tags": [t.strip() for t in (etiquetas or []) if t.strip()][:30], "categoryId": categoria},
        "status": status,
    }
    media = MediaFileUpload(video, mimetype="video/mp4", chunksize=8 * 1024 * 1024, resumable=True)
    req = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    resp = None
    while resp is None:
        estado, resp = req.next_chunk()
        if estado and progress:
            progress(f"Subiendo a YouTube: {int(estado.progress() * 100)}%")
    video_id = resp["id"]

    aviso = ""
    if miniatura and os.path.exists(miniatura) and not es_short:
        try:
            yt.thumbnails().set(videoId=video_id, media_body=MediaFileUpload(miniatura)).execute()
        except Exception:
            aviso = (" (La miniatura no se pudo poner: YouTube pide verificar el canal por teléfono en "
                     "youtube.com/verify para usar miniaturas personalizadas.)")
    return f"https://youtu.be/{video_id}", aviso
