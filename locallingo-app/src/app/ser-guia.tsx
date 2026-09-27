import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { api, apiUpload, API_URL, errorCode, type UploadAsset } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import type { Catalog, OwnGuideProfile } from "@/lib/types";
import { ACTIVE_CURRENCIES, CANCELLATION_POLICIES, LANGUAGE_LEVELS } from "@/shared/constants";
import { minutesToHHMM } from "@/shared/time";
import { Avatar } from "@/components/Avatar";
import { Button, Card, Chips, ErrorText, Field, H2, Label, Loading, P, Row, Screen } from "@/components/ui";

type Lang = { languageId: string; level: string };
type Svc = {
  id?: string; categoryId: string; title: string; description: string; pricingType: "FIXED" | "HOURLY"; price: string;
  durationMin: number; modality: "IN_PERSON" | "REMOTE"; meetingPoint: string; maxPeople: number; languageIds: string[];
};
type Slot = { weekday: number; startMinute: number; endMinute: number };

const STEPS = 6;
const toMajor = (minor: number | null) => (minor == null ? "" : (minor / 100).toFixed(2).replace(/\.00$/, ""));
const HALF_HOURS = Array.from({ length: 35 }, (_, i) => 6 * 60 + i * 30); // 06:00 … 23:00

async function pickImage(fromCamera: boolean): Promise<UploadAsset | null> {
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7 };
  if (fromCamera) {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
  }
  const r = fromCamera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (r.canceled || !r.assets?.[0]) return null;
  const a = r.assets[0];
  return { uri: a.uri, name: a.fileName, mimeType: a.mimeType, file: a.file };
}

async function pickDocument(): Promise<UploadAsset | null> {
  const r = await DocumentPicker.getDocumentAsync({ type: ["image/*", "application/pdf"], copyToCacheDirectory: true });
  if (r.canceled || !r.assets?.[0]) return null;
  const a = r.assets[0];
  return { uri: a.uri, name: a.name, mimeType: a.mimeType, file: a.file };
}

export default function GuideOnboarding() {
  const { t, weekdays, locale } = useI18n();
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("DRAFT");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const [basics, setBasics] = useState({ displayName: "", photoUrl: "", headline: "", countryId: "", cityId: "" });
  const [langs, setLangs] = useState<Lang[]>([]);
  const [about, setAbout] = useState({ bio: "", experience: "" });
  const [services, setServices] = useState<Svc[]>([]);
  const [pricing, setPricing] = useState({ hourlyRate: "", currency: "MXN", cancellationPolicy: "MODERATE" });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [docs, setDocs] = useState({ id: false, legal: false, idKey: "", legalKey: "" });

  useEffect(() => {
    if (!user) return;
    Promise.all([api<Catalog>("/catalog"), api<OwnGuideProfile>("/guide/profile")])
      .then(([c, p]) => {
        setCatalog(c);
        setBasics({ displayName: p.displayName, photoUrl: p.photoUrl ?? "", headline: p.headline, countryId: p.city?.countryId ?? (c.countries.find((x) => x.code === "MX") ?? c.countries[0])?.id ?? "", cityId: p.cityId ?? "" });
        setLangs(p.languages.map((l) => ({ languageId: l.languageId, level: l.level })));
        setAbout({ bio: p.bio, experience: p.experience });
        setServices(p.services.map((s) => ({ id: s.id, categoryId: s.categoryId, title: s.title, description: s.description, pricingType: s.pricingType, price: toMajor(s.priceMinor), durationMin: s.durationMin, modality: s.modality, meetingPoint: s.meetingPoint ?? "", maxPeople: s.maxPeople, languageIds: s.languages.map((l) => l.languageId) })));
        setPricing({ hourlyRate: toMajor(p.hourlyRateMinor), currency: p.currency, cancellationPolicy: p.cancellationPolicy });
        setSlots(p.availability.map((a) => ({ weekday: a.weekday, startMinute: a.startMinute, endMinute: a.endMinute })));
        setDocs((d) => ({ ...d, id: p.hasIdDocument, legal: p.hasLegalDocument }));
        setStatus(p.status);
        setStep(Math.min(Math.max(p.onboardingStep, 1), STEPS));
      })
      .catch((e) => setError(errorCode(e)));
  }, [user?.id]);

  if (!user || user.role !== "GUIDE") return <Screen><ErrorText code="FORBIDDEN" /></Screen>;
  if (!catalog) return error ? <Screen><ErrorText code={error} /></Screen> : <Loading />;

  const langName = (id: string) => catalog.languages.find((l) => l.id === id)?.name ?? id;
  const newService = (): Svc => ({
    categoryId: catalog.categories[0]?.id ?? "", title: "", description: "", pricingType: "FIXED", price: "", durationMin: 120,
    modality: "IN_PERSON", meetingPoint: "", maxPeople: 4, languageIds: langs.map((l) => l.languageId),
  });

  const upload = async (kind: "photo" | "document", asset: UploadAsset | null) => {
    if (!asset) return null;
    setError(null);
    try {
      return await apiUpload(kind, asset);
    } catch (e) {
      setError(errorCode(e));
      return null;
    }
  };

  const save = async () => {
    const put = (path: string, body: unknown) => api(path, { method: "PUT", body });
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
        await put("/guide/availability", slots);
        return put("/guide/profile", { onboardingStep: 6 });
      case 6:
        await put("/guide/profile", { idDocumentKey: docs.idKey || undefined, legalDocumentKey: docs.legalKey || undefined });
        return api("/guide/submit", { body: {} });
    }
  };

  const next = async () => {
    setBusy(true);
    setError(null);
    try {
      await save();
      if (step === STEPS) setDone(true);
      else setStep(step + 1);
    } catch (e) {
      setError(errorCode(e));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Screen>
        <Card>
          <H2>✅ {t("onboarding.submitted")}</H2>
          <P muted>{t("onboarding.pendingNotice")}</P>
          <Button title={t("app.tabProfile")} onPress={() => router.replace("/perfil")} />
        </Card>
      </Screen>
    );
  }

  const photoUri = basics.photoUrl ? (basics.photoUrl.startsWith("/") ? `${API_URL}${basics.photoUrl}` : basics.photoUrl) : null;

  return (
    <Screen>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {Array.from({ length: STEPS }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < step ? colors.primary : colors.border }} />
        ))}
      </View>
      <P small muted>{t("onboarding.step", { n: step })}</P>
      <H2>{t(`onboarding.s${step}`)}</H2>

      {step === 1 && (
        <Card>
          <Row>
            {photoUri ? <Image source={{ uri: photoUri }} style={{ width: 84, height: 84, borderRadius: 42 }} /> : <Avatar name={basics.displayName || user.name} size={84} />}
            <View style={{ gap: 6, flex: 1 }}>
              <Button small variant="outline" title={`📷 ${t("onboarding.photoUrl")}`} onPress={async () => { const r = await upload("photo", await pickImage(true)); if (r?.url) setBasics((b) => ({ ...b, photoUrl: r.url! })); }} />
              <Button small variant="outline" title={`🖼️ ${t("onboarding.upload")}`} onPress={async () => { const r = await upload("photo", await pickImage(false)); if (r?.url) setBasics((b) => ({ ...b, photoUrl: r.url! })); }} />
            </View>
          </Row>
          <Field label={t("onboarding.displayName")} value={basics.displayName} onChangeText={(v) => setBasics({ ...basics, displayName: v })} maxLength={60} />
          <Chips label={t("onboarding.country")} value={basics.countryId} onChange={(v) => setBasics({ ...basics, countryId: v, cityId: "" })} options={catalog.countries.map((c) => ({ value: c.id, label: c.name }))} />
          <Chips label={t("onboarding.city")} value={basics.cityId} onChange={(v) => setBasics({ ...basics, cityId: v })} options={catalog.cities.filter((c) => c.countryId === basics.countryId).map((c) => ({ value: c.id, label: c.name }))} />
          <Field label={t("onboarding.headline")} value={basics.headline} onChangeText={(v) => setBasics({ ...basics, headline: v })} maxLength={120} />
        </Card>
      )}

      {step === 2 && (
        <>
          {langs.map((l, i) => (
            <Card key={i}>
              <Chips label={t("guide.languages")} value={l.languageId} onChange={(v) => setLangs(langs.map((x, j) => (j === i ? { ...x, languageId: v } : x)))} options={catalog.languages.map((c) => ({ value: c.id, label: `${c.flag} ${c.name}` }))} />
              <Chips label={t("onboarding.level")} value={l.level} onChange={(v) => setLangs(langs.map((x, j) => (j === i ? { ...x, level: v } : x)))} options={LANGUAGE_LEVELS.map((lv) => ({ value: lv as string, label: t(`levels.${lv}`) }))} />
              <Button small variant="danger" title={t("onboarding.remove")} onPress={() => setLangs(langs.filter((_, j) => j !== i))} />
            </Card>
          ))}
          <Button
            variant="outline"
            title={`+ ${t("onboarding.addLanguage")}`}
            onPress={() => {
              // Primero propone el idioma de la app (probablemente el nativo) y luego inglés.
              const unused = catalog.languages.filter((c) => !langs.some((l) => l.languageId === c.id));
              const pick = unused.find((c) => c.code === (langs.length ? "en" : locale)) ?? unused[0] ?? catalog.languages[0];
              setLangs([...langs, { languageId: pick.id, level: langs.length ? "INTERMEDIATE" : "NATIVE" }]);
            }}
          />
        </>
      )}

      {step === 3 && (
        <>
          <Card>
            <Field label={t("onboarding.bio")} value={about.bio} onChangeText={(v) => setAbout({ ...about, bio: v })} multiline maxLength={3000} />
            <Field label={t("onboarding.experienceField")} value={about.experience} onChangeText={(v) => setAbout({ ...about, experience: v })} multiline maxLength={3000} />
          </Card>
          <H2>{t("guide.services")}</H2>
          {services.map((s, i) => {
            const upd = (patch: Partial<Svc>) => setServices(services.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <Card key={i}>
                <Field label={t("onboarding.serviceTitle")} value={s.title} onChangeText={(v) => upd({ title: v })} maxLength={100} />
                <Chips label={t("onboarding.category")} value={s.categoryId} onChange={(v) => upd({ categoryId: v })} options={catalog.categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))} />
                <Chips label={t("explore.modality")} value={s.modality} onChange={(v) => upd({ modality: v })} options={[{ value: "IN_PERSON" as const, label: t("modality.IN_PERSON") }, { value: "REMOTE" as const, label: t("modality.REMOTE") }]} />
                <Field label={t("onboarding.serviceDescription")} value={s.description} onChangeText={(v) => upd({ description: v })} multiline maxLength={2000} />
                <Chips label={t("guide.duration")} value={s.durationMin} onChange={(v) => upd({ durationMin: v })} options={[60, 90, 120, 180, 240, 360, 480].map((m) => ({ value: m, label: m % 60 ? `${m} min` : `${m / 60} h` }))} />
                <Chips label="👥 max" value={s.maxPeople} onChange={(v) => upd({ maxPeople: v })} options={[1, 2, 4, 6, 8, 10, 15].map((n) => ({ value: n, label: String(n) }))} />
                {s.modality === "IN_PERSON" && <Field label={t("booking.meetingPoint")} value={s.meetingPoint} onChangeText={(v) => upd({ meetingPoint: v })} maxLength={200} />}
                <Label>{t("guide.languages")}</Label>
                <Row>
                  {langs.map((l) => {
                    const on = s.languageIds.includes(l.languageId);
                    return (
                      <Pressable key={l.languageId} onPress={() => upd({ languageIds: on ? s.languageIds.filter((x) => x !== l.languageId) : [...s.languageIds, l.languageId] })} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                        <Text style={{ fontSize: 15, color: colors.ink }}>{on ? "☑" : "☐"} {langName(l.languageId)}</Text>
                      </Pressable>
                    );
                  })}
                </Row>
                <Button small variant="danger" title={t("onboarding.remove")} onPress={() => setServices(services.filter((_, j) => j !== i))} />
              </Card>
            );
          })}
          <Button variant="outline" title={`+ ${t("onboarding.addService")}`} onPress={() => setServices([...services, newService()])} />
        </>
      )}

      {step === 4 && (
        <>
          <Card>
            <Chips label={t("onboarding.currency")} value={pricing.currency} onChange={(v) => setPricing({ ...pricing, currency: v })} options={ACTIVE_CURRENCIES.map((c) => ({ value: c as string, label: c }))} />
            <Field label={`${t("onboarding.hourlyRate")} (${pricing.currency})`} value={pricing.hourlyRate} onChangeText={(v) => setPricing({ ...pricing, hourlyRate: v })} keyboardType="decimal-pad" placeholder="350" />
            <Label>{t("onboarding.cancellation")}</Label>
            {CANCELLATION_POLICIES.map((p) => (
              <Pressable key={p} onPress={() => setPricing({ ...pricing, cancellationPolicy: p })} accessibilityRole="radio" accessibilityState={{ checked: pricing.cancellationPolicy === p }}>
                <Text style={{ fontSize: 14, color: colors.ink, paddingVertical: 4 }}>{pricing.cancellationPolicy === p ? "◉" : "○"} {t(`policies.${p}`)}</Text>
              </Pressable>
            ))}
          </Card>
          {services.map((s, i) => (
            <Card key={i}>
              <Text style={{ fontWeight: "700", color: colors.ink }}>{s.title || `#${i + 1}`}</Text>
              <Field label={`${t("onboarding.servicePrice")} (${pricing.currency})`} value={s.price} onChangeText={(v) => setServices(services.map((x, j) => (j === i ? { ...x, price: v } : x)))} keyboardType="decimal-pad" placeholder="600" />
              <Chips label={t("onboarding.pricingType")} value={s.pricingType} onChange={(v) => setServices(services.map((x, j) => (j === i ? { ...x, pricingType: v } : x)))} options={[{ value: "FIXED" as const, label: t("guide.perService") }, { value: "HOURLY" as const, label: t("guide.perHourLong") }]} />
            </Card>
          ))}
        </>
      )}

      {step === 5 && (
        <>
          {slots.map((s, i) => {
            const upd = (patch: Partial<Slot>) => setSlots(slots.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <Card key={i}>
                <Chips label={t("onboarding.day")} value={s.weekday} onChange={(v) => upd({ weekday: v })} options={[1, 2, 3, 4, 5, 6, 0].map((d) => ({ value: d, label: weekdays[d] }))} />
                <Chips label={`${t("onboarding.from")}: ${minutesToHHMM(s.startMinute)}`} value={s.startMinute} onChange={(v) => upd({ startMinute: v })} options={HALF_HOURS.map((m) => ({ value: m, label: minutesToHHMM(m) }))} />
                <Chips label={`${t("onboarding.to")}: ${minutesToHHMM(s.endMinute)}`} value={s.endMinute} onChange={(v) => upd({ endMinute: v })} options={HALF_HOURS.filter((m) => m > s.startMinute).map((m) => ({ value: m, label: minutesToHHMM(m) }))} />
                <Button small variant="danger" title={t("onboarding.remove")} onPress={() => setSlots(slots.filter((_, j) => j !== i))} />
              </Card>
            );
          })}
          <Button variant="outline" title={`+ ${t("onboarding.addSlot")}`} onPress={() => setSlots([...slots, { weekday: 1, startMinute: 9 * 60, endMinute: 18 * 60 }])} />
        </>
      )}

      {step === 6 && (
        <Card>
          <P small>🔒 {t("onboarding.privateNote")}</P>
          {(["id", "legal"] as const).map((k) => (
            <View key={k} style={{ gap: 6, marginTop: 8 }}>
              <Label>{t(k === "id" ? "onboarding.idDocument" : "onboarding.legalDocument")}</Label>
              {docs[k] && <Text style={{ color: colors.success }}>{t("onboarding.uploaded")}</Text>}
              <Row>
                <Button small variant="outline" title="📷" onPress={async () => { const r = await upload("document", await pickImage(true)); if (r) setDocs((d) => ({ ...d, [k]: true, [k === "id" ? "idKey" : "legalKey"]: r.key })); }} />
                <Button small variant="outline" title={`📄 ${t("onboarding.upload")}`} onPress={async () => { const r = await upload("document", await pickDocument()); if (r) setDocs((d) => ({ ...d, [k]: true, [k === "id" ? "idKey" : "legalKey"]: r.key })); }} />
              </Row>
            </View>
          ))}
          {status !== "APPROVED" && <P small muted>{t("onboarding.pendingNotice")}</P>}
        </Card>
      )}

      <ErrorText code={error} />
      <Row style={{ flexWrap: "nowrap" }}>
        {step > 1 && <View style={{ flex: 1 }}><Button variant="outline" title={`← ${t("onboarding.back")}`} disabled={busy} onPress={() => setStep(step - 1)} /></View>}
        <View style={{ flex: 2 }}><Button title={step === STEPS ? t("onboarding.submit") : `${t("onboarding.next")} →`} loading={busy} onPress={next} /></View>
      </Row>
    </Screen>
  );
}
