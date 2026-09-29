const { apiKey } = require("./_muapi");

module.exports = async (req, res) => {
  const id = String(req.query.id || "");
  if (!/^[\w-]{6,80}$/.test(id)) return res.status(400).json({ error: "ID no válido." });

  const key = apiKey(req);
  if (!key) return res.status(400).json({ error: "Falta la API key de MuAPI." });

  try {
    const r = await fetch(`https://api.muapi.ai/api/v1/predictions/${id}/result`, { headers: { "x-api-key": key } });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data.error || `MuAPI respondió ${r.status}` });
    const url = Array.isArray(data.outputs) && data.outputs.length ? data.outputs[0] : null;
    return res.status(200).json({ status: data.status || "processing", url, error: data.error || null });
  } catch {
    return res.status(502).json({ error: "No se pudo contactar a MuAPI." });
  }
};
