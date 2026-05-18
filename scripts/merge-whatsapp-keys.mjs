import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES = path.join(path.resolve(import.meta.dirname, ".."), "messages");
const KEYS = [
  "panelAriaLabel",
  "numberLabel",
  "openContact",
  "openApp",
  "envDisabledHint",
  "envSetupHint",
];

const en = JSON.parse(fs.readFileSync(path.join(MESSAGES, "en.json"), "utf8"));

const WA_I18N = {
  es: {
    panelAriaLabel: "Número de WhatsApp",
    numberLabel: "Número de WhatsApp",
    openContact: "Abrir contacto de WhatsApp",
    openApp: "Abrir WhatsApp",
    envDisabledHint: "WhatsApp (configura NEXT_PUBLIC_WHATSAPP_NUMBER para activar)",
    envSetupHint: "Configura whatsapp_number en tu archivo .env y reinicia el servidor de desarrollo.",
  },
  de: {
    panelAriaLabel: "WhatsApp-Nummer",
    numberLabel: "WhatsApp-Nummer",
    openContact: "WhatsApp-Kontakt öffnen",
    openApp: "WhatsApp öffnen",
    envDisabledHint: "WhatsApp (NEXT_PUBLIC_WHATSAPP_NUMBER setzen zum Aktivieren)",
    envSetupHint: "Setze whatsapp_number in deiner .env-Datei und starte den Dev-Server neu.",
  },
  fr: {
    panelAriaLabel: "Numéro WhatsApp",
    numberLabel: "Numéro WhatsApp",
    openContact: "Ouvrir le contact WhatsApp",
    openApp: "Ouvrir WhatsApp",
    envDisabledHint: "WhatsApp (définir NEXT_PUBLIC_WHATSAPP_NUMBER pour activer)",
    envSetupHint: "Définissez whatsapp_number dans votre fichier .env et redémarrez le serveur de développement.",
  },
};

for (const file of fs.readdirSync(MESSAGES)) {
  if (!file.endsWith(".json") || file === "en.json") continue;
  const locale = file.replace(".json", "");
  const data = JSON.parse(fs.readFileSync(path.join(MESSAGES, file), "utf8"));
  if (!data.WhatsApp) data.WhatsApp = {};
  const src = WA_I18N[locale] ?? {};
  for (const key of KEYS) {
    if (data.WhatsApp[key] === undefined) {
      data.WhatsApp[key] = src[key] ?? en.WhatsApp[key];
    } else if (data.WhatsApp[key] === en.WhatsApp[key] && src[key]) {
      data.WhatsApp[key] = src[key];
    }
  }
  fs.writeFileSync(path.join(MESSAGES, file), `${JSON.stringify(data, null, 2)}\n`);
}

console.log("Merged WhatsApp UI keys.");
