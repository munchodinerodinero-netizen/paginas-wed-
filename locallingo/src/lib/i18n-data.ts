// Textos de catálogo guardados como JSON {"es": "...", "en": "..."}.
export function localized(names: string | null | undefined, locale: string): string {
  if (!names) return "";
  try {
    const obj = JSON.parse(names) as Record<string, string>;
    return obj[locale] ?? obj.es ?? obj.en ?? Object.values(obj)[0] ?? "";
  } catch {
    return names;
  }
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
