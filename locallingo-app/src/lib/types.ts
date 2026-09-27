// Tipos de las respuestas de la API v1 (espejo de locallingo/src/server/services).
export interface GuideCard {
  id: string;
  slug: string;
  displayName: string;
  photoUrl: string | null;
  headline: string;
  city: string;
  country: string;
  languages: { code: string; name: string; flag: string; level: string }[];
  rating: number | null;
  reviewCount: number;
  categories: string[];
  fromPriceMinor: number | null;
  fromIsHourly: boolean;
  currency: string;
  availableWeekdays: number[];
  verified: boolean;
  completedBookings: number;
}

export interface PublicService {
  id: string;
  title: string;
  description: string;
  category: string;
  pricingType: "FIXED" | "HOURLY";
  priceMinor: number;
  currency: string;
  durationMin: number;
  modality: "IN_PERSON" | "REMOTE";
  city: string | null;
  meetingPoint: string | null;
  maxPeople: number;
  languages: string[];
}

export interface PublicGuide extends GuideCard {
  bio: string;
  experience: string;
  status: string;
  cancellationPolicy: string;
  cityTimezone: string;
  photos: string[];
  availability: { weekday: number; startMinute: number; endMinute: number }[];
  services: PublicService[];
}

export interface Catalog {
  countries: { id: string; code: string; slug: string; name: string }[];
  cities: { id: string; slug: string; name: string; country: string; countryId: string }[];
  languages: { id: string; code: string; flag: string; name: string }[];
  categories: { id: string; slug: string; icon: string; name: string }[];
}

export interface BookingRow {
  id: string;
  code: string;
  startAt: string;
  durationMin: number;
  status: string;
  currency: string;
  totalMinor: number;
  guideNetMinor: number;
  service: { title: string };
  guide: { displayName: string; slug: string; photoUrl: string | null; city: { timezone: string } | null };
  tourist: { name: string };
}

export interface BookingDetail extends BookingRow {
  people: number;
  meetingPoint: string | null;
  notes: string | null;
  subtotalMinor: number;
  commissionBps: number;
  commissionMinor: number;
  refundMinor: number;
  touristId: string;
  guide: BookingRow["guide"] & { userId: string; cancellationPolicy: string };
  reviews: { direction: string }[];
}

export interface Quote {
  subtotalMinor: number;
  commissionMinor: number;
  totalMinor: number;
  commissionBps: number;
  durationMin: number;
}

export interface OwnGuideProfile {
  displayName: string;
  photoUrl: string | null;
  headline: string;
  cityId: string | null;
  bio: string;
  experience: string;
  hourlyRateMinor: number | null;
  currency: string;
  cancellationPolicy: string;
  onboardingStep: number;
  status: string;
  slug: string;
  ratingSum: number;
  ratingCount: number;
  rejectionReason: string | null;
  hasIdDocument: boolean;
  hasLegalDocument: boolean;
  city: { countryId: string } | null;
  languages: { languageId: string; level: string }[];
  services: {
    id: string; categoryId: string; title: string; description: string; pricingType: "FIXED" | "HOURLY"; priceMinor: number;
    durationMin: number; modality: "IN_PERSON" | "REMOTE"; meetingPoint: string | null; maxPeople: number; languages: { languageId: string }[];
  }[];
  availability: { weekday: number; startMinute: number; endMinute: number }[];
}
