// Datos de ejemplo para la beta en Mazatlán. Ejecutar: npm run db:reset
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const n = (es: string, en: string) => JSON.stringify({ es, en });
const H = (h: number, m = 0) => h * 60 + m;

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  await db.setting.createMany({
    data: [
      { key: "commission_bps", value: "1500" },
      { key: "fx_MXN_USD", value: "55000" }, // 1 MXN ≈ 0.055 USD (solo para mostrar)
      { key: "fx_USD_MXN", value: "18200000" },
    ],
  });

  const mx = await db.country.create({ data: { code: "MX", slug: "mexico", names: n("México", "Mexico") } });
  const jp = await db.country.create({ data: { code: "JP", slug: "japon", names: n("Japón", "Japan") } });

  const mazatlan = await db.city.create({ data: { slug: "mazatlan", names: n("Mazatlán", "Mazatlan"), countryId: mx.id, lat: 23.2494, lng: -106.4111, timezone: "America/Mazatlan" } });
  const cdmx = await db.city.create({ data: { slug: "ciudad-de-mexico", names: n("Ciudad de México", "Mexico City"), countryId: mx.id, lat: 19.4326, lng: -99.1332, timezone: "America/Mexico_City" } });
  const tokio = await db.city.create({ data: { slug: "tokio", names: n("Tokio", "Tokyo"), countryId: jp.id, lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo" } });

  const langDefs = [
    ["es", "espanol", "Español", "Spanish", "🇲🇽"],
    ["en", "ingles", "Inglés", "English", "🇺🇸"],
    ["fr", "frances", "Francés", "French", "🇫🇷"],
    ["de", "aleman", "Alemán", "German", "🇩🇪"],
    ["it", "italiano", "Italiano", "Italian", "🇮🇹"],
    ["pt", "portugues", "Portugués", "Portuguese", "🇧🇷"],
    ["ja", "japones", "Japonés", "Japanese", "🇯🇵"],
    ["ko", "coreano", "Coreano", "Korean", "🇰🇷"],
    ["zh", "chino", "Chino", "Chinese", "🇨🇳"],
  ] as const;
  const L: Record<string, string> = {};
  for (const [code, slug, es, en, flag] of langDefs) {
    L[code] = (await db.language.create({ data: { code, slug, flag, names: n(es, en) } })).id;
  }

  const catDefs = [
    ["translation", "Traducción", "Translation", "🗣️"],
    ["local-guide", "Guías locales", "Local guides", "🗺️"],
    ["companion", "Acompañamiento", "Travel companion", "🤝"],
    ["experiences", "Experiencias locales", "Local experiences", "🍜"],
    ["business", "Traducción empresarial", "Business interpreting", "💼"],
  ] as const;
  const C: Record<string, string> = {};
  for (const [slug, es, en, icon] of catDefs) {
    C[slug] = (await db.category.create({ data: { slug, icon, names: n(es, en) } })).id;
  }

  await db.user.create({ data: { email: "admin@demo.com", name: "Admin", role: "ADMIN", passwordHash } });
  const tourist = await db.user.create({ data: { email: "turista@demo.com", name: "Emily Carter", role: "TOURIST", passwordHash, locale: "en", currency: "USD" } });
  const tourist2 = await db.user.create({ data: { email: "lucas@demo.com", name: "Lucas Moreau", role: "TOURIST", passwordHash, locale: "en" } });

  type GuideSeed = {
    email: string; name: string; slug: string; city: string; headline: string; bio: string; experience: string;
    hourly: number | null; policy: string; status?: string;
    langs: [string, string][];
    services: { cat: string; title: string; desc: string; type: "FIXED" | "HOURLY"; price: number; dur: number; mode?: string; langs: string[]; meeting?: string }[];
    avail: [number, number, number][];
    featured?: boolean;
  };

  const weekdays = (from: number, to: number, days: number[]) => days.map((d) => [d, from, to] as [number, number, number]);

  const guides: GuideSeed[] = [
    {
      email: "guia@demo.com", name: "María López", slug: "maria-lopez", city: mazatlan.id,
      headline: "Guía local y acompañamiento",
      bio: "Nací en Mazatlán y me encanta mostrar mi ciudad: el Centro Histórico, el malecón, los mercados y los mejores lugares para comer mariscos.",
      experience: "6 años acompañando turistas de cruceros y viajeros independientes. Licenciada en Turismo.",
      hourly: 35000, policy: "MODERATE", featured: true,
      langs: [["es", "NATIVE"], ["en", "C1"]],
      services: [
        { cat: "local-guide", title: "Tour por Mazatlán", desc: "Recorrido por diferentes puntos turísticos de la ciudad.", type: "FIXED", price: 60000, dur: 120, langs: ["es", "en"], meeting: "Plazuela Machado" },
        { cat: "companion", title: "Traducción y acompañamiento", desc: "Te acompaño a trámites, farmacia, doctor o compras.", type: "HOURLY", price: 30000, dur: 60, langs: ["es", "en"] },
      ],
      avail: weekdays(H(9), H(18), [1, 2, 3, 4, 5, 6]),
    },
    {
      email: "jorge@demo.com", name: "Jorge Ramírez", slug: "jorge-ramirez", city: mazatlan.id,
      headline: "Experiencias gastronómicas y pesca",
      bio: "Chef y pescador. Te llevo a probar el aguachile de verdad y a conocer la vida del puerto.",
      experience: "10 años en restaurantes del puerto; guía gastronómico desde 2021.",
      hourly: null, policy: "FLEXIBLE",
      langs: [["es", "NATIVE"], ["en", "ADVANCED"], ["fr", "INTERMEDIATE"]],
      services: [
        { cat: "experiences", title: "Ruta del marisco", desc: "Cuatro paradas para probar lo mejor de la cocina sinaloense.", type: "FIXED", price: 85000, dur: 180, langs: ["es", "en", "fr"], meeting: "Mercado Pino Suárez" },
      ],
      avail: weekdays(H(11), H(20), [3, 4, 5, 6, 0]),
    },
    {
      email: "ana@demo.com", name: "Ana Kowalski", slug: "ana-kowalski", city: mazatlan.id,
      headline: "Intérprete empresarial EN/DE/ES",
      bio: "Intérprete certificada. Apoyo en reuniones, visitas a planta y negociaciones.",
      experience: "Intérprete para empresas del sector acuícola y turístico.",
      hourly: 60000, policy: "STRICT",
      langs: [["de", "NATIVE"], ["en", "C2"], ["es", "C1"]],
      services: [
        { cat: "business", title: "Interpretación en reuniones", desc: "Interpretación consecutiva presencial o por videollamada.", type: "HOURLY", price: 60000, dur: 60, langs: ["de", "en", "es"] },
        { cat: "translation", title: "Traducción remota", desc: "Llamada de apoyo para comunicarte con proveedores, hoteles o médicos.", type: "HOURLY", price: 40000, dur: 60, mode: "REMOTE", langs: ["de", "en", "es"] },
      ],
      avail: weekdays(H(8), H(16), [1, 2, 3, 4, 5]),
    },
    {
      email: "luis@demo.com", name: "Luis Tanaka", slug: "luis-tanaka", city: mazatlan.id,
      headline: "Acompañamiento para viajeros asiáticos",
      bio: "Mexicano-japonés. Ayudo a viajeros de Japón y Corea a moverse por Mazatlán sin estrés.",
      experience: "3 años como guía independiente.",
      hourly: 40000, policy: "MODERATE",
      langs: [["es", "NATIVE"], ["ja", "NATIVE"], ["en", "ADVANCED"], ["ko", "BASIC"]],
      services: [
        { cat: "companion", title: "Acompañamiento de día completo", desc: "Transporte, compras, restaurantes y todo lo que necesites.", type: "FIXED", price: 250000, dur: 480, langs: ["ja", "es", "en"] },
      ],
      avail: weekdays(H(8), H(20), [0, 5, 6]),
    },
    {
      email: "sofia@demo.com", name: "Sofía Hernández", slug: "sofia-hernandez", city: cdmx.id,
      headline: "Museos y Centro Histórico",
      bio: "Historiadora del arte. Recorridos por museos y barrios de la CDMX.",
      experience: "Guía en el Museo Nacional de Antropología durante 4 años.",
      hourly: 45000, policy: "MODERATE",
      langs: [["es", "NATIVE"], ["en", "C1"], ["it", "ADVANCED"]],
      services: [
        { cat: "local-guide", title: "Centro Histórico a pie", desc: "Zócalo, Templo Mayor, Bellas Artes y cantinas históricas.", type: "FIXED", price: 90000, dur: 180, langs: ["es", "en", "it"], meeting: "Catedral Metropolitana" },
      ],
      avail: weekdays(H(9), H(17), [2, 3, 4, 5, 6]),
    },
    {
      email: "kenji@demo.com", name: "Kenji Sato", slug: "kenji-sato", city: tokio.id,
      headline: "Guía en Tokio que habla español",
      bio: "Viví 5 años en Guadalajara. Te muestro Tokio en español.",
      experience: "Guía con licencia nacional de Japón.",
      hourly: null, policy: "MODERATE",
      langs: [["ja", "NATIVE"], ["es", "C1"], ["en", "ADVANCED"]],
      services: [
        { cat: "local-guide", title: "Asakusa y Akihabara", desc: "Templos, comida callejera y cultura otaku en un día.", type: "FIXED", price: 250000, dur: 300, langs: ["es", "ja", "en"], meeting: "Estación Asakusa" },
      ],
      avail: weekdays(H(9), H(18), [1, 2, 3, 4, 5, 6, 0]),
    },
    {
      email: "pendiente@demo.com", name: "Carlos Núñez", slug: "carlos-nunez", city: mazatlan.id,
      headline: "Guía de naturaleza", bio: "Isla de la Piedra, Isla de Venados y avistamiento de aves.", experience: "Biólogo marino.",
      hourly: 30000, policy: "FLEXIBLE", status: "PENDING",
      langs: [["es", "NATIVE"], ["en", "INTERMEDIATE"]],
      services: [{ cat: "experiences", title: "Isla de Venados", desc: "Kayak y snorkel.", type: "FIXED", price: 70000, dur: 240, langs: ["es", "en"] }],
      avail: weekdays(H(7), H(14), [1, 3, 5]),
    },
  ];

  const created: Record<string, { guideId: string; userId: string; serviceIds: string[] }> = {};
  for (const g of guides) {
    const user = await db.user.create({ data: { email: g.email, name: g.name, role: "GUIDE", passwordHash } });
    const approved = (g.status ?? "APPROVED") === "APPROVED";
    const profile = await db.guideProfile.create({
      data: {
        userId: user.id, slug: g.slug, displayName: g.name.split(" ")[0], headline: g.headline, bio: g.bio, experience: g.experience,
        cityId: g.city, status: g.status ?? "APPROVED", onboardingStep: 6, hourlyRateMinor: g.hourly,
        currency: g.city === tokio.id ? "MXN" : "MXN", cancellationPolicy: g.policy,
        idDocumentKey: "private/seed-id.pdf", verifiedAt: approved ? new Date() : null,
        featuredUntil: g.featured ? new Date(Date.now() + 90 * 86400_000) : null,
        languages: { create: g.langs.map(([code, level]) => ({ languageId: L[code], level })) },
        availability: { create: g.avail.map(([weekday, startMinute, endMinute]) => ({ weekday, startMinute, endMinute })) },
      },
    });
    const serviceIds: string[] = [];
    for (const s of g.services) {
      const svc = await db.service.create({
        data: {
          guideId: profile.id, categoryId: C[s.cat], title: s.title, description: s.desc, pricingType: s.type, priceMinor: s.price,
          currency: "MXN", durationMin: s.dur, modality: s.mode ?? "IN_PERSON", cityId: s.mode === "REMOTE" ? null : g.city,
          meetingPoint: s.meeting, languages: { create: s.langs.map((c) => ({ languageId: L[c] })) },
        },
      });
      serviceIds.push(svc.id);
    }
    created[g.slug] = { guideId: profile.id, userId: user.id, serviceIds };
  }

  // Historial: reservas completadas con reseñas para que la beta no se vea vacía.
  const reviewsSeed: [string, string, number, string][] = [
    ["maria-lopez", tourist.id, 5, "María made our day in Mazatlán unforgettable. Super punctual and knows every corner!"],
    ["maria-lopez", tourist2.id, 5, "Excellent guide, very kind, great English."],
    ["jorge-ramirez", tourist.id, 5, "Best seafood of my life. Jorge is a legend."],
    ["ana-kowalski", tourist2.id, 4, "Very professional interpreter for our business meeting."],
    ["sofia-hernandez", tourist.id, 5, "Sofía's knowledge of art history is amazing."],
  ];
  let i = 0;
  for (const [slug, touristId, rating, comment] of reviewsSeed) {
    const g = created[slug];
    const svc = await db.service.findUniqueOrThrow({ where: { id: g.serviceIds[0] } });
    const subtotal = svc.pricingType === "HOURLY" ? svc.priceMinor * 2 : svc.priceMinor;
    const commission = Math.round(subtotal * 0.15);
    const startAt = new Date(Date.now() - (10 + i++ * 3) * 86400_000);
    const booking = await db.booking.create({
      data: {
        code: `LL-SEED0${i}`, touristId, guideId: g.guideId, serviceId: svc.id, startAt, durationMin: svc.pricingType === "HOURLY" ? 120 : svc.durationMin,
        people: 2, status: "COMPLETED", currency: "MXN", subtotalMinor: subtotal, totalMinor: subtotal, commissionBps: 1500,
        commissionMinor: commission, guideNetMinor: subtotal - commission, acceptedAt: startAt, completedAt: startAt,
        payments: { create: { provider: "mock", providerRef: `mock_seed_${i}`, amountMinor: subtotal, currency: "MXN", status: "CAPTURED" } },
      },
    });
    await db.review.create({
      data: { bookingId: booking.id, authorId: touristId, targetUserId: g.userId, rating, communication: rating, punctuality: 5, knowledge: rating, experience: rating, comment },
    });
    await db.guideProfile.update({ where: { id: g.guideId }, data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 }, completedBookings: { increment: 1 } } });
  }

  console.log("Seed listo. Cuentas: turista@demo.com / guia@demo.com / admin@demo.com (contraseña demo1234)");
}

main().finally(() => db.$disconnect());
