export const ROLES = ["TOURIST", "GUIDE", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUS = ["ACTIVE", "SUSPENDED"] as const;

export const GUIDE_STATUS = ["DRAFT", "PENDING", "APPROVED", "REJECTED"] as const;
export type GuideStatus = (typeof GUIDE_STATUS)[number];

export const LANGUAGE_LEVELS = ["NATIVE", "BASIC", "INTERMEDIATE", "ADVANCED", "C1", "C2"] as const;
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

export const MODALITIES = ["IN_PERSON", "REMOTE"] as const;
export const PRICING_TYPES = ["FIXED", "HOURLY"] as const;
export const CANCELLATION_POLICIES = ["FLEXIBLE", "MODERATE", "STRICT"] as const;
export type CancellationPolicy = (typeof CANCELLATION_POLICIES)[number];

export const BOOKING_STATUS = [
  "PENDING_PAYMENT",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export const REPORT_REASONS = ["SPAM", "FRAUD", "HARASSMENT", "UNSAFE", "NO_SHOW", "OTHER"] as const;

export const SUPPORTED_LOCALES = ["es", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

// Monedas activas hoy y planeadas. Agregar una moneda = agregarla aquí + su tasa en settings.
export const ACTIVE_CURRENCIES = ["MXN", "USD"] as const;
export const PLANNED_CURRENCIES = ["EUR", "GBP", "JPY", "CAD", "AUD"] as const;
export type Currency = (typeof ACTIVE_CURRENCIES)[number];

export const DEFAULT_COMMISSION_BPS = 1500; // 15%
