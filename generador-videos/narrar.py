#!/usr/bin/env python3
"""Narración gratis para MonoStudio con voces neuronales de Microsoft (edge-tts).

Uso:
    pip install edge-tts
    python narrar.py mi-video-guion.txt

Lee el guion exportado con el botón "📄 Guion para voz" (una escena por bloque,
separadas por línea en blanco; "B:" al inicio = segundo mono) y genera
voces/escena_01.mp3, escena_02.mp3, ... Súbelos todos juntos en "🎙 Subir audios".

Voces en español: es-MX-JorgeNeural, es-MX-DaliaNeural, es-ES-AlvaroNeural,
es-ES-ElviraNeural, es-AR-TomasNeural, es-CO-GonzaloNeural (lista: edge-tts --list-voices).
"""
import argparse
import asyncio
import pathlib
import re

import edge_tts


async def main() -> None:
    ap = argparse.ArgumentParser(description="Genera un mp3 por escena con edge-tts.")
    ap.add_argument("guion", help="archivo .txt exportado desde MonoStudio")
    ap.add_argument("--voz", default="es-MX-JorgeNeural", help="voz del Mono A")
    ap.add_argument("--voz-b", default="es-MX-DaliaNeural", help="voz del Mono B")
    ap.add_argument("--velocidad", default="+5%", help="ej. -10%%, +0%%, +15%%")
    ap.add_argument("--salida", default="voces", help="carpeta de salida")
    args = ap.parse_args()

    texto = pathlib.Path(args.guion).read_text(encoding="utf-8")
    bloques = [b.strip() for b in re.split(r"\n\s*\n", texto) if b.strip()]
    salida = pathlib.Path(args.salida)
    salida.mkdir(exist_ok=True)

    for i, bloque in enumerate(bloques, 1):
        lineas = [l for l in bloque.splitlines() if not l.strip().startswith("#")]
        frase = " ".join(lineas).strip()
        voz = args.voz
        m = re.match(r"^([AB])\s*:\s*", frase, re.I)
        if m:
            voz = args.voz_b if m.group(1).upper() == "B" else args.voz
            frase = frase[m.end():]
        if not frase:
            continue
        destino = salida / f"escena_{i:02d}.mp3"
        await edge_tts.Communicate(frase, voz, rate=args.velocidad).save(str(destino))
        print(f"✓ {destino}  ({voz})")

    print(f"\nListo: sube todos los mp3 de '{salida}/' en MonoStudio → 🎙 Subir audios.")


if __name__ == "__main__":
    asyncio.run(main())
