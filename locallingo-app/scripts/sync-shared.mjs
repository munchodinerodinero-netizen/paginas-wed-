// Copia el código compartido desde la web (fuente única de verdad) a la app móvil:
// traducciones, dinero en centavos, zonas horarias y constantes.
// Ejecutar después de cambiar cualquiera de esos archivos en ../locallingo: npm run sync-shared
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "..", "locallingo", "src");
const files = [
  ["i18n/messages/es.json", "messages/es.json"],
  ["i18n/messages/en.json", "messages/en.json"],
  ["lib/money.ts", "money.ts"],
  ["lib/time.ts", "time.ts"],
  ["lib/constants.ts", "constants.ts"],
  ["lib/policies.ts", "policies.ts"],
];
for (const [from, to] of files) {
  const dest = join(root, "src", "shared", to);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(web, from), dest);
  console.log(`✓ ${to}`);
}
