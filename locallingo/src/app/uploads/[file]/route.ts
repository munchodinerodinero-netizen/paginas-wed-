import { readFile } from "node:fs/promises";
import path from "node:path";
import { PUBLIC_DIR, PUBLIC_FILE_RE } from "@/server/services/storage";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

// Sirve fotos públicas del almacenamiento local (solo desarrollo/beta; en producción usar S3/R2 + CDN).
// Nunca sirve documentos privados: solo nombres UUID con extensión de imagen, dentro de storage/public.
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!PUBLIC_FILE_RE.test(file)) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readFile(path.join(PUBLIC_DIR, file));
    return new Response(bytes, {
      headers: { "Content-Type": TYPES[file.split(".").pop()!], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
