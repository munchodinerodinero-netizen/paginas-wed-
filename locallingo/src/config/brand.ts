// Identidad de marca centralizada. El nombre "LocalLingo" es PROVISIONAL:
// cambiar nombre, logo, colores o dominio se hace solo aquí (y en variables de entorno).
export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "LocalLingo",
  domain: process.env.APP_URL ?? "http://localhost:3000",
  logoMark: "LL",
  supportEmail: "soporte@locallingo.example",
  colors: {
    primary: "#0e7c86", // teal: viajes + confianza
    primaryDark: "#0a5c63",
    accent: "#f2994a", // cálido, cercanía (uso mínimo)
    ink: "#12202b",
    muted: "#5b6b78",
    surface: "#ffffff",
    background: "#f6f8f9",
    border: "#e2e8ec",
  },
} as const;
