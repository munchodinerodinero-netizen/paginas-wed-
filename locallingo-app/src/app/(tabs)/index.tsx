import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, RefreshControl } from "react-native";
import { useI18n } from "@/lib/i18n";
import { useApi } from "@/lib/useApi";
import { brandName, colors, space } from "@/lib/theme";
import type { Catalog, GuideCard as Card } from "@/lib/types";
import { GuideCard } from "@/components/GuideCard";
import { Chips, ErrorText, Loading, P, Button } from "@/components/ui";

const SORTS = ["relevance", "rating", "price_asc", "popular", "new"] as const;
const SORT_KEY: Record<string, string> = { relevance: "sortRelevance", rating: "sortRating", price_asc: "sortPriceAsc", popular: "sortPopular", new: "sortNew" };

export default function Explore() {
  const { t } = useI18n();
  const [city, setCity] = useState("mazatlan");
  const [language, setLanguage] = useState("");
  const [service, setService] = useState("");
  const [sort, setSort] = useState<string>("relevance");
  const catalog = useApi<Catalog>("/catalog");
  const q = new URLSearchParams({ ...(city && { city }), ...(language && { language }), ...(service && { service }), sort });
  const results = useApi<Card[]>(`/guides?${q}`);
  const any = { value: "", label: t("hero.any") };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={results.loading && !!results.data} onRefresh={results.reload} tintColor={colors.primary} />}
      >
        <View style={{ backgroundColor: colors.primary, padding: space, paddingTop: space + 4, paddingBottom: 24, gap: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16, opacity: 0.9 }}>{brandName}</Text>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 26, lineHeight: 31 }}>{t("hero.title")}</Text>
          <Text style={{ color: "#fff", opacity: 0.9, fontSize: 15 }}>{t("hero.subtitle")}</Text>
        </View>
        <View style={{ padding: space, gap: 14 }}>
          {catalog.data && (
            <>
              <Chips label={t("hero.where")} value={city} onChange={setCity} options={[any, ...catalog.data.cities.map((c) => ({ value: c.slug, label: c.name }))]} />
              <Chips label={t("hero.whichLanguage")} value={language} onChange={setLanguage} options={[any, ...catalog.data.languages.map((l) => ({ value: l.code, label: `${l.flag} ${l.name}` }))]} />
              <Chips label={t("hero.whatNeed")} value={service} onChange={setService} options={[any, ...catalog.data.categories.map((c) => ({ value: c.slug, label: `${c.icon} ${c.name}` }))]} />
              <Chips label={t("explore.sort")} value={sort} onChange={setSort} options={SORTS.map((s) => ({ value: s, label: t(`explore.${SORT_KEY[s]}`) }))} />
            </>
          )}
          <ErrorText code={catalog.error ?? results.error} />
          {(catalog.error || results.error) && <Button title={t("app.retry")} variant="outline" onPress={() => { catalog.reload(); results.reload(); }} />}
          {results.loading && !results.data ? <Loading /> : results.data && (
            <>
              <P muted>{t("explore.results", { count: results.data.length })}</P>
              {results.data.length === 0 && <P muted>{t("explore.empty")}</P>}
              {results.data.map((g) => <GuideCard key={g.id} g={g} />)}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
