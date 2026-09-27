import { Image, Text, View } from "react-native";
import { API_URL } from "@/lib/api";
import { colors } from "@/lib/theme";

export function Avatar({ name, url, size = 56 }: { name: string; url?: string | null; size?: number }) {
  if (url) {
    const uri = url.startsWith("/") ? `${API_URL}${url}` : url;
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} accessibilityLabel={name} />;
  }
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size / 2.6 }}>{initials}</Text>
    </View>
  );
}
