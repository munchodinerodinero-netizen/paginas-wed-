# 🐒 MonoStudio — generador gratis de videos animados para YouTube

Videos explicativos con monos animados (estilo canal de economía tipo *Ecomonos*), hechos
100% en el navegador. Sin cuenta, sin marca de agua, sin pagar.

## Cómo se usa

1. Abre `index.html` en Chrome o Edge (doble clic basta).
2. Escribe o pega el guion. Una **línea en blanco** separa escenas.
   - `B: texto` → habla el segundo mono (diálogo).
   - `# Texto` → cartel amarillo arriba de la escena.
3. **✨ Generar escenas.** El fondo (ciudad, oficina, banco, mercado, casa, pizarra), el objeto
   animado (gráfico que sube/baja, monedas, billetes, %, casa, banco, fábrica, dólar…) y la
   emoción del mono se eligen solos por palabras clave. Cámbialos en cada escena si quieres.
4. Voz (elige una):
   - **Sin voz**: subtítulos animados + música.
   - **Archivos de audio**: uno por escena o uno solo para todo el video. Cada escena dura lo
     que dura su audio y la boca del mono se mueve con la voz.
   - **Micrófono**: cuenta regresiva y lees los subtítulos en vivo mientras se graba.
5. **⏺ Grabar y descargar video** → MP4 o WebM a 720p/1080p. Deja la pestaña visible mientras graba
   (es en tiempo real).
6. **🖼 Miniatura** → PNG 16:9 con el título grande y el mono sorprendido.

## Voz con IA gratis

```bash
pip install edge-tts
python narrar.py mi-video-guion.txt          # el .txt sale del botón "📄 Guion para voz"
python narrar.py guion.txt --voz es-ES-AlvaroNeural --voz-b es-ES-ElviraNeural --velocidad +10%
```

Genera `voces/escena_01.mp3`, `escena_02.mp3`… Súbelos todos juntos en **🎙 Subir audios**.

## Incluye

- 2 personajes (Mono A con traje y lentes, Mono B con camiseta), parpadeo, cola, gestos por emoción.
- 7 fondos, 12 objetos animados, zoom de cámara, subtítulos tipo karaoke, música generada (sin copyright).
- Cierre automático "Suscríbete" con campana, marca de agua con el nombre del canal.
- Guardar / abrir proyecto (`.json`) y autoguardado en el navegador.
