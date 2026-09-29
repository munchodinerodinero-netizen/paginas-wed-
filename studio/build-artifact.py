# Genera studio/artifact.html (versión para publicar en Claude) a partir de studio/index.html:
# Claude agrega su propio <html>/<head>/<body>, así que se quitan esas etiquetas.
import re, pathlib
src = pathlib.Path(__file__).with_name('index.html').read_text()
out = src[src.index('<title>'):]
out = re.sub(r'<meta name="description"[^\n]*\n', '', out)
out = out.replace('</head>\n<body>\n', '').replace('</body>\n</html>\n', '')
pathlib.Path(__file__).with_name('artifact.html').write_text(out)
