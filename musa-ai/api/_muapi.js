// Utilidades compartidas para hablar con MuAPI (https://muapi.ai).
const MODELS = {
  "grok-video": "https://api.muapi.ai/api/v1/grok-imagine-image-to-video",
  "veo-3-1": "https://api.muapi.ai/api/v1/veo3.1-image-to-video",
  "happy-horse": "https://api.muapi.ai/api/v1/happy-horse-1-image-to-video-720p",
  "seedance-2": "https://api.muapi.ai/api/v1/seedance-2-image-to-video"
};

// La key del usuario (header) tiene prioridad; si no, la del servidor.
function apiKey(req) {
  const fromHeader = (req.headers["x-muapi-key"] || "").trim();
  return fromHeader || process.env.MUAPI_KEY || "";
}

module.exports = { MODELS, apiKey };
