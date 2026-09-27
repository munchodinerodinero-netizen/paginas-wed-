"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ACTIVE_CURRENCIES, CANCELLATION_POLICIES, LANGUAGE_LEVELS } from "@/lib/constants";
import { apiFetch, ApiError } from "@/lib/client/api";
import { hhmmToMinutes, minutesToHHMM } from "@/lib/time";
import { useI18n } from "@/i18n/client";
import type { Catalog } from "@/server/services/catalog";
import { ErrorText } from "./ErrorText";

type Lang = { languageId: string; level: string };
type Svc = {
  id?: string; categoryId: string; title: string; description: string; pricingType: "FIXED" | "HOURLY";
  price: string; durationMin: number; modality: "IN_PERSON" | "REMOTE"; meetingPoint: string; maxPeople: number; languageIds: string[];
};
type Slot = { weekday: number; start: string; end: string };

type OwnProfile = {
  displayName: string; photoUrl: string | null; headline: string; cityId: string | null; bio: string; experience: string;
  hourlyRateMinor: number | null; currency: string; cancellationPolicy: string; onboardingStep: number; status: string;
  hasIdDocument: boolean; hasLegalDocument: boolean;
  city: { countryId: string } | null;
  languages: Lang[];
  services: { id: string; categoryId: string; title: string; description: string; pricingType: "FIXED" | "HOURLY"; priceMinor: number; durationMin: number; modality: "IN_PERSON" | "REMOTE"; meetingPoint: string | null; maxPeople: number; languages: { languageId: string }[] }[];
  availability: { weekday: number; startMinute: number; endMinute: number }[];
};

const toMajor = (minor: number | null) => (minor == null ? "" : (minor / 100).toFixed(2).replace(/\.00$/, ""));

export function GuideWizard({ catalog, initialStep, weekdays }: { catalog: Catalog; initialStep?: number; weekdays: string[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(initialStep ?? 1);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const [basics, setBasics] = useState({ displayName: "", photoUrl: "", headline: "", countryId: catalog.countries[0]?.id ?? "", cityId: "" });
  const [langs, setLangs] = useState<Lang[]>([]);
  const [about, setAbout] = useState({ bio: "", experience: "" });
  const [services, setServices] = useState<Svc[]>([]);
  const [pricing, setPricing] = useState({ hourlyRate: "", currency: "MXN", cancellationPolicy: "MODERATE" });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [docs, setDocs] = useState({ id: false, legal: false, idKey: "", legalKey: "" });
  const [status, setStatus] = useState("DRAFT");

  useEffect(() => {
    apiFetch<OwnProfile>("/guide/profile").then((p) => {
      setBasics({ displayName: p.displayName, photoUrl: p.photoUrl ?? "", headline: p.headline, countryId: p.city?.countryId ?? catalog.countries[0]?.id ?? "", cityId: p.cityId ?? "" });
      setLangs(p.languages.map((l) => ({ languageId: l.languageId, level: l.level })));
      setAbout({ bio: p.bio, experience: p.experience });
      setServices(p.services.map((s) => ({ id: s.id, categoryId: s.categoryId, title: s.title, description: s.description, pricingType: s.pricingType, price: toMajor(s.priceMinor), durationMin: s.durationMin, modality: s.modality, meetingPoint: s.meetingPoint ?? "", maxPeople: s.maxPeople, languageIds: s.languages.map((l) => l.languageId) })));
      setPricing({ hourlyRate: toMajor(p.hourlyRateMinor), currency: p.currency, cancellationPolicy: p.cancellationPolicy });
      setSlots(p.availability.map((a) => ({ weekday: a.weekday, start: minutesToHHMM(a.startMinute), end: minutesToHHMM(a.endMinute) })));
      setDocs((d) => ({ ...d, id: p.hasIdDocument, legal: p.hasLegalDocument }));
      setStatus(p.status);
      if (!initialStep) setStep(Math.min(p.onboardingStep, 6));
      setLoaded(true);
    }).catch((e) => setError(e instanceof ApiError ? e.code : "INTERNAL_ERROR"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const upload = async (kind: "photo" | "document", file: File) => {
    const form = new FormData();
    form.set("kind", kind);
    form.set("file", file);
    return apiFetch<{ url?: string; key: string }>("/uploads", { form });
  };

  const newService = (): Svc => ({
    categoryId: catalog.categories[0]?.id ?? "", title: "", description: "", pricingType: "FIXED", price: "", durationMin: 120,
    modality: "IN_PERSON", meetingPoint: "", maxPeople: 4, languageIds: langs.map((l) => l.languageId),
  });

  const save = async () => {
    const put = (path: string, body: unknown) => apiFetch(path, { method: "PUT", body });
    switch (step) {
      case 1:
        return put("/guide/profile", { displayName: basics.displayName, photoUrl: basics.photoUrl, headline: basics.headline, cityId: basics.cityId || undefined, onboardingStep: 2 });
      case 2:
        await put("/guide/languages", langs);
        return put("/guide/profile", { onboardingStep: 3 });
      case 3:
        return put("/guide/profile", { ...about, onboardingStep: 4 });
      case 4:
        await put("/guide/profile", { ...pricing, onboardingStep: 5 });
        return put("/guide/services", services.map((s) => ({ ...s, meetingPoint: s.meetingPoint || undefined })));
      case 5:
        await put("/guide/availability", slots.map((s) => ({ weekday: s.weekday, startMinute: hhmmToMinutes(s.start), endMinute: hhmmToMinutes(s.end) })));
        return put("/guide/profile", { onboardingStep: 6 });
      case 6:
        await put("/guide/profile", { idDocumentKey: docs.idKey || undefined, legalDocumentKey: docs.legalKey || undefined });
        return apiFetch("/guide/submit", { body: {} });
    }
  };

  const next = async () => {
    setBusy(true);
    setError(null);
    try {
      await save();
      if (step === 6) {
        setDone(true);
        router.refresh();
      } else setStep(step + 1);
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "INTERNAL_ERROR");
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) return <p className="muted">{error ? t("common.error") : t("common.loading")}</p>;
  if (done) {
    return (
      <div className="card center">
        <h2>✅ {t("onboarding.submitted")}</h2>
        <p className="muted">{t("onboarding.pendingNotice")}</p>
        <a href="/panel" className="btn btn-primary">{t("nav.dashboard")}</a>
      </div>
    );
  }

  const cities = catalog.cities.filter((c) => c.countryId === basics.countryId);
  const langName = (id: string) => catalog.languages.find((l) => l.id === id)?.name ?? id;

  return (
    <div className="card">
      <div className="wizard-steps" aria-hidden>{[1, 2, 3, 4, 5, 6].map((n) => <span key={n} className={n <= step ? "done" : ""} />)}</div>
      <div className="muted small">{t("onboarding.step", { n: step })}</div>
      <h2>{t(`onboarding.s${step}`)}</h2>

      {step === 1 && (
        <>
          <div className="field">
            <label htmlFor="dn">{t("onboarding.displayName")}</label>
            <input id="dn" value={basics.displayName} onChange={(e) => setBasics({ ...basics, displayName: e.target.value })} maxLength={60} />
          </div>
          <div className="field">
            <label htmlFor="photo">{t("onboarding.photoUrl")}</label>
            {basics.photoUrl && <img src={basics.photoUrl} alt="" width={80} height={80} className="avatar" style={{ width: 80, height: 80, marginBottom: 8 }} />}
            <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try { const r = await upload("photo", f); setBasics((b) => ({ ...b, photoUrl: r.url ?? "" })); } catch (err) { setError(err instanceof ApiError ? err.code : "INTERNAL_ERROR"); }
            }} />
          </div>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="country">{t("onboarding.country")}</label>
              <select id="country" value={basics.countryId} onChange={(e) => setBasics({ ...basics, countryId: e.target.value, cityId: "" })}>
                {catalog.countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="cityId">{t("onboarding.city")}</label>
              <select id="cityId" value={basics.cityId} onChange={(e) => setBasics({ ...basics, cityId: e.target.value })}>
                <option value="">—</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="headline">{t("onboarding.headline")}</label>
            <input id="headline" value={basics.headline} onChange={(e) => setBasics({ ...basics, headline: e.target.value })} maxLength={120} />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {langs.map((l, i) => (
            <div key={i} className="row" style={{ flexWrap: "nowrap", marginBottom: 8 }}>
              <select value={l.languageId} onChange={(e) => setLangs(langs.map((x, j) => (j === i ? { ...x, languageId: e.target.value } : x)))}>
                {catalog.languages.map((c) => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
              </select>
              <select value={l.level} aria-label={t("onboarding.level")} onChange={(e) => setLangs(langs.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)))}>
                {LANGUAGE_LEVELS.map((lv) => <option key={lv} value={lv}>{t(`levels.${lv}`)}</option>)}
              </select>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLangs(langs.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setLangs([...langs, { languageId: catalog.languages.find((c) => !langs.some((l) => l.languageId === c.id))?.id ?? catalog.languages[0].id, level: langs.length ? "INTERMEDIATE" : "NATIVE" }])}>
            + {t("onboarding.addLanguage")}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <div className="field">
            <label htmlFor="bio">{t("onboarding.bio")}</label>
            <textarea id="bio" value={about.bio} onChange={(e) => setAbout({ ...about, bio: e.target.value })} maxLength={3000} />
          </div>
          <div className="field">
            <label htmlFor="exp">{t("onboarding.experienceField")}</label>
            <textarea id="exp" value={about.experience} onChange={(e) => setAbout({ ...about, experience: e.target.value })} maxLength={3000} />
          </div>
          <h3>{t("guide.services")}</h3>
          {services.map((s, i) => {
            const upd = (patch: Partial<Svc>) => setServices(services.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={i} className="repeat-item">
                <div className="field"><label>{t("onboarding.serviceTitle")}</label><input value={s.title} onChange={(e) => upd({ title: e.target.value })} maxLength={100} /></div>
                <div className="row" style={{ flexWrap: "nowrap" }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>{t("onboarding.category")}</label>
                    <select value={s.categoryId} onChange={(e) => upd({ categoryId: e.target.value })}>{catalog.categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>{t("explore.modality")}</label>
                    <select value={s.modality} onChange={(e) => upd({ modality: e.target.value as Svc["modality"] })}>
                      <option value="IN_PERSON">{t("modality.IN_PERSON")}</option>
                      <option value="REMOTE">{t("modality.REMOTE")}</option>
                    </select>
                  </div>
                </div>
                <div className="field"><label>{t("onboarding.serviceDescription")}</label><textarea value={s.description} onChange={(e) => upd({ description: e.target.value })} maxLength={2000} style={{ minHeight: 64 }} /></div>
                <div className="row" style={{ flexWrap: "nowrap" }}>
                  <div className="field" style={{ flex: 1 }}><label>{t("guide.duration")} (min)</label><input type="number" min={30} step={30} value={s.durationMin} onChange={(e) => upd({ durationMin: Number(e.target.value) })} /></div>
                  <div className="field" style={{ flex: 1 }}><label>👥 max</label><input type="number" min={1} max={50} value={s.maxPeople} onChange={(e) => upd({ maxPeople: Number(e.target.value) })} /></div>
                </div>
                {s.modality === "IN_PERSON" && <div className="field"><label>{t("booking.meetingPoint")}</label><input value={s.meetingPoint} onChange={(e) => upd({ meetingPoint: e.target.value })} maxLength={200} /></div>}
                <div className="field">
                  <label>{t("guide.languages")}</label>
                  {langs.map((l) => (
                    <label key={l.languageId} className="checkbox">
                      <input type="checkbox" checked={s.languageIds.includes(l.languageId)} onChange={(e) => upd({ languageIds: e.target.checked ? [...s.languageIds, l.languageId] : s.languageIds.filter((x) => x !== l.languageId) })} />
                      {langName(l.languageId)}
                    </label>
                  ))}
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => setServices(services.filter((_, j) => j !== i))}>{t("onboarding.remove")}</button>
              </div>
            );
          })}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setServices([...services, newService()])}>+ {t("onboarding.addService")}</button>
        </>
      )}

      {step === 4 && (
        <>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <div className="field" style={{ flex: 2 }}>
              <label htmlFor="hr">{t("onboarding.hourlyRate")}</label>
              <input id="hr" inputMode="decimal" value={pricing.hourlyRate} onChange={(e) => setPricing({ ...pricing, hourlyRate: e.target.value })} placeholder="350" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="cur">{t("onboarding.currency")}</label>
              <select id="cur" value={pricing.currency} onChange={(e) => setPricing({ ...pricing, currency: e.target.value })}>{ACTIVE_CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="pol">{t("onboarding.cancellation")}</label>
            <select id="pol" value={pricing.cancellationPolicy} onChange={(e) => setPricing({ ...pricing, cancellationPolicy: e.target.value })}>
              {CANCELLATION_POLICIES.map((p) => <option key={p} value={p}>{t(`policies.${p}`)}</option>)}
            </select>
          </div>
          {services.map((s, i) => (
            <div key={i} className="repeat-item">
              <strong>{s.title || `#${i + 1}`}</strong>
              <div className="row" style={{ flexWrap: "nowrap", marginTop: 8 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>{t("onboarding.servicePrice")} ({pricing.currency})</label>
                  <input inputMode="decimal" value={s.price} onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} placeholder="600" />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>{t("onboarding.pricingType")}</label>
                  <select value={s.pricingType} onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, pricingType: e.target.value as Svc["pricingType"] } : x)))}>
                    <option value="FIXED">{t("guide.perService")}</option>
                    <option value="HOURLY">{t("guide.perHourLong")}</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {step === 5 && (
        <>
          {slots.map((s, i) => (
            <div key={i} className="row" style={{ flexWrap: "nowrap", marginBottom: 8 }}>
              <select aria-label={t("onboarding.day")} value={s.weekday} onChange={(e) => setSlots(slots.map((x, j) => (j === i ? { ...x, weekday: Number(e.target.value) } : x)))}>
                {[1, 2, 3, 4, 5, 6, 0].map((d) => <option key={d} value={d}>{weekdays[d]}</option>)}
              </select>
              <input aria-label={t("onboarding.from")} type="time" step={1800} value={s.start} onChange={(e) => setSlots(slots.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} />
              <input aria-label={t("onboarding.to")} type="time" step={1800} value={s.end} onChange={(e) => setSlots(slots.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSlots(slots.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setSlots([...slots, { weekday: 1, start: "09:00", end: "18:00" }])}>+ {t("onboarding.addSlot")}</button>
        </>
      )}

      {step === 6 && (
        <>
          <p className="notice small">🔒 {t("onboarding.privateNote")}</p>
          {(["id", "legal"] as const).map((k) => (
            <div key={k} className="field" style={{ marginTop: 12 }}>
              <label>{t(k === "id" ? "onboarding.idDocument" : "onboarding.legalDocument")}</label>
              {docs[k] && <div className="success">{t("onboarding.uploaded")}</div>}
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const r = await upload("document", f);
                  setDocs((d) => ({ ...d, [k]: true, [k === "id" ? "idKey" : "legalKey"]: r.key }));
                } catch (err) { setError(err instanceof ApiError ? err.code : "INTERNAL_ERROR"); }
              }} />
            </div>
          ))}
          {status !== "APPROVED" && <p className="small muted">{t("onboarding.pendingNotice")}</p>}
        </>
      )}

      <ErrorText code={error} />
      <div className="row between" style={{ marginTop: 16 }}>
        <button type="button" className="btn btn-ghost" disabled={step === 1 || busy} onClick={() => setStep(step - 1)}>← {t("onboarding.back")}</button>
        <button type="button" className="btn btn-primary" disabled={busy} onClick={next}>{step === 6 ? t("onboarding.submit") : `${t("onboarding.next")} →`}</button>
      </div>
    </div>
  );
}
