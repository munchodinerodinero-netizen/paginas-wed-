const { MODELS, apiKey } = require("./_muapi");

// Solo se animan imágenes generadas por el propio estudio (personajes ficticios),
// nunca fotos subidas de personas reales.
const ALLOWED_SOURCE = /^https:\/\/image\.pollinations\.ai\//;
const BLOCKED = /\b(nud[eoa]s?|naked|desnud[oa]s?|nsfw|porn\w*|sex\w*|xxx|topless|lingerie|lencer[ií]a|erotic\w*|er[oó]tic\w*|teen\w*|child\w*|niñ[oa]s?|underage)\b/i;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const key = apiKey(req);
  if (!key) return res.status(400).json({ error: "Falta la API key de MuAPI." });

  const { model, prompt, image_url, duration, aspect_ratio } = req.body || {};
  const endpoint = MODELS[model];
  if (!endpoint) return res.status(400).json({ error: "Modelo no válido." });
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 400) {
    return res.status(400).json({ error: "Describe el movimiento (máx. 400 caracteres)." });
  }
  if (BLOCKED.test(prompt)) return res.status(400).json({ error: "Contenido no permitido." });
  if (typeof image_url !== "string" || !ALLOWED_SOURCE.test(image_url)) {
    return res.status(400).json({ error: "La imagen debe venir de tu galería de Musa AI." });
  }

  const payload = { prompt, image_url, images_list: [image_url], aspect_ratio };
  if (Number.isFinite(duration)) payload.duration = Math.min(Math.max(duration, 3), 10);

  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key },
      body: JSON.stringify(payload)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data.detail || data.error || `MuAPI respondió ${r.status}` });
    const id = data.request_id || data.id;
    if (!id) return res.status(502).json({ error: "MuAPI no devolvió un ID de trabajo." });
    return res.status(200).json({ id });
  } catch (err) {
    return res.status(502).json({ error: "No se pudo contactar a MuAPI." });
  }
};
