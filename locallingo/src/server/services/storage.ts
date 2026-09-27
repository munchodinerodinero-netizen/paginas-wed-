import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Almacenamiento de archivos. `local` es solo para desarrollo; en producción usar un
// servicio externo (S3, Cloudflare R2, Cloudinary) implementando la misma interfaz.
// Las fotos van a un bucket público; los documentos de identidad a uno PRIVADO.
const ALLOWED = {
  photo: { types: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  document: { types: ["image/jpeg", "image/png", "image/webp", "application/pdf"], maxBytes: 10 * 1024 * 1024 },
} as const;

export type UploadKind = keyof typeof ALLOWED;

export const PUBLIC_DIR = path.join(process.cwd(), "storage", "public");
export const PUBLIC_FILE_RE = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };

export async function saveUpload(kind: UploadKind, file: File): Promise<{ url?: string; key: string }> {
  const rules = ALLOWED[kind];
  if (!(rules.types as readonly string[]).includes(file.type)) throw new Error("INVALID_FILE_TYPE");
  if (file.size > rules.maxBytes) throw new Error("FILE_TOO_LARGE");
  const name = `${randomUUID()}.${EXT[file.type]}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (kind === "photo") {
    // Se sirven por la ruta /uploads/[file] (Next no sirve archivos agregados a public/ tras el build).
    const dir = PUBLIC_DIR;
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), bytes);
    return { url: `/uploads/${name}`, key: `photo/${name}` };
  }
  const dir = path.join(process.cwd(), "storage", "private");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return { key: `private/${name}` };
}
