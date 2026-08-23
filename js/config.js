/**
 * config.js
 * ─────────────────────────────────────────────────────────────
 * ÚNICA fuente de verdad para los datos del negocio.
 * Para clonar esta plantilla a un cliente nuevo, edita SOLO este
 * archivo (nombre, teléfono, WhatsApp, dirección, redes, horario).
 * Todo el sitio (nav, hero, botón flotante, footer, formulario)
 * se actualiza automáticamente porque lee de aquí.
 *
 * El copy largo (títulos, párrafos, servicios, testimonios) vive
 * directamente en index.html — edítalo ahí cuando cambie de cliente.
 * ─────────────────────────────────────────────────────────────
 */

const CONFIG = {
  // Nombre del negocio, tal como debe aparecer en todo el sitio
  businessName: "Techos Querétaro",

  // Eslogan corto (aparece junto al logo en pantallas grandes)
  tagline: "Roofing & Remodelación",

  // Teléfono para mostrar en pantalla (formato legible)
  phoneDisplay: "442 123 4567",

  // Teléfono en formato E.164 (para el enlace tel:)
  phoneLink: "+524421234567",

  // Número de WhatsApp en formato internacional SIN signos (para wa.me)
  whatsappNumber: "524421234567",

  // Mensaje precargado al abrir WhatsApp desde los botones genéricos
  whatsappDefaultMessage:
    "Hola, vi su página y me interesa una cotización para mi techo 🙌",

  // Correo de contacto
  email: "hola@techosqueretaro.mx",

  // Zona de servicio
  city: "Querétaro, Qro.",
  serviceArea: "Querétaro, El Marqués, Corregidora y San Juan del Río",

  // Dirección (opcional, placeholder)
  address: "Av. Constituyentes 1200, Centro, Querétaro, Qro.",

  // Horario de atención
  hours: "Lunes a sábado, 8:00 am – 7:00 pm",

  // Años de experiencia (se usa en el badge de confianza y en "Nosotros")
  yearsExperience: 12,

  // Proyectos completados (placeholder, redondeado)
  projectsCompleted: "300+",

  // Redes sociales (deja vacío "" para ocultar el ícono correspondiente)
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
  },
};

// No editar debajo de esta línea: construye los enlaces derivados.
CONFIG.whatsappLink = (mensaje) =>
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
    mensaje || CONFIG.whatsappDefaultMessage
  )}`;
