/**
 * One-off helper: patches known identical-to-English keys in es/de/mt/pt.
 * Run: node scripts/apply-i18n-content-fixes.mjs
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MESSAGES = path.join(ROOT, "messages");

const patches = {
  es: {
    "Home.testimonials.t1.date": "01 jun 2024",
    "Home.testimonials.t2.location": "Conductor de fin de semana",
    "Home.testimonials.t2.date": "09 nov 2024",
    "Home.testimonials.t2.quote":
      "Instrucciones claras, trato amable y excelentes recomendaciones sobre dónde ir. ¡Muy recomendable!",
    "Home.testimonials.t3.location": "Viaje en familia",
    "Home.testimonials.t3.date": "17 oct 2024",
    "Footer.exploreFleet": "Flota y motos",
    "Footer.exploreServices": "Servicios y tours",
    "Footer.companyAbout": "Sobre nosotros",
    "Footer.companyHow": "Cómo funciona el alquiler",
    "Footer.supportHelp": "Centro de ayuda",
    "Footer.supportTalk": "Habla con nosotros",
    "Footer.supportBook": "Reservar un alquiler",
    "Footer.legalTerms": "Términos de servicio",
    "Footer.legalPrivacy": "Política de privacidad",
    "Footer.legalCookies": "Cookies y datos",
    "Footer.bookRental": "Reservar un alquiler",
    "Footer.seeFleetTours": "Ver flota y tours",
    "Footer.trustBookingTitle": "Reserva sencilla",
    "Footer.trustFleetTitle": "Flota bien cuidada",
    "Footer.trustFleetDesc":
      "Mantenimiento orientado a la seguridad y equipamiento práctico para que te centres en la ruta, no en el papeleo.",
    "Footer.trustSupportTitle": "Atención para visitantes",
    "Footer.newsletterTitle": "Mantente informado",
    "Footer.newsletterPlaceholder": "Correo electrónico",
    "Footer.newsletterSuccess": "Gracias — estás suscrito.",
    "Footer.followUs": "Síguenos",
    "Footer.copyright": "© {year} {brand}. Todos los derechos reservados.",
    "BookingPage.intro":
      "Completa todas las etapas de la reserva, desde la elección del vehículo hasta la aceptación de los términos. Los precios y el envío al sistema se gestionan en fases posteriores.",
    "BookingPage.ratesHeading": "Tarifas de un vistazo",
    "BookingPage.ratesDescription":
      "Importes orientativos por día natural para motos y scooters antes de extras; úsalos como guía mientras buscas.",
    "BookingPage.ratesLinkLead": "¿Quieres el detalle de lo incluido?",
    "BookingPage.ratesLink": "Servicios y ventajas",
    "VehiclesPage.heroDescription":
      "Compara scooters por cilindrada y color, luego confirma tus fechas. Precios transparentes y reserva rápida.",
    "BookingWizard.bookingSummary.subtotal": "Importe parcial:",
  },
  de: {
    "Home.testimonials.t1.date": "01. Jun. 2024",
    "Home.testimonials.t2.location": "Wochenendfahrer",
    "Home.testimonials.t2.date": "09. Nov. 2024",
    "Home.testimonials.t2.quote":
      "Klare Anweisungen, freundlicher Support und tolle Tipps, wohin man fahren sollte. Sehr empfehlenswert!",
    "Home.testimonials.t3.location": "Familienreise",
    "Home.testimonials.t3.date": "17. Okt. 2024",
    "Footer.exploreFleet": "Flotte & Motorräder",
    "Footer.exploreServices": "Service & Touren",
    "Footer.companyAbout": "Über uns",
    "Footer.companyHow": "So funktioniert die Miete",
    "Footer.supportHelp": "Hilfe-Center",
    "Footer.supportTalk": "Sprich mit uns",
    "Footer.supportBook": "Miete buchen",
    "Footer.legalTerms": "Nutzungsbedingungen",
    "Footer.legalPrivacy": "Datenschutz",
    "Footer.legalCookies": "Cookies & Daten",
    "Footer.bookRental": "Miete buchen",
    "Footer.seeFleetTours": "Flotte & Touren ansehen",
    "Footer.trustBookingTitle": "Unkomplizierte Buchung",
    "Footer.trustFleetTitle": "Gepflegte Flotte",
    "Footer.trustFleetDesc":
      "Sicherheitsbewusste Wartung und praktische Ausstattung — damit du dich auf die Fahrt konzentrieren kannst, nicht auf Papierkram.",
    "Footer.trustSupportTitle": "Gästefreundlicher Support",
    "Footer.newsletterTitle": "Bleib auf dem Laufenden",
    "Footer.newsletterPlaceholder": "E-Mail-Adresse",
    "Footer.newsletterSuccess": "Danke — du bist angemeldet.",
    "Footer.followUs": "Folge uns",
    "Footer.copyright": "© {year} {brand}. Alle Rechte vorbehalten.",
    "BookingPage.intro":
      "Schließe alle Buchungsschritte ab — von der Fahrzeugwahl bis zur Zustimmung zu den Bedingungen. Preise und Backend-Übermittlung folgen in späteren Phasen.",
    "BookingPage.ratesHeading": "Tarife auf einen Blick",
    "BookingPage.ratesDescription":
      "Richtwerte pro Kalendertag für Motorräder und Roller vor Extras — als Orientierung bei der Suche.",
    "BookingPage.ratesLinkLead": "Möchtest du das volle Bild der Leistungen?",
    "BookingPage.ratesLink": "Leistungen & Vorteile",
    "VehiclesPage.heroDescription":
      "Vergleiche Roller nach Hubraum und Farbe und sichere dann deine Daten. Transparente Preise und schnelle Buchung.",
  },
  mt: {
    "Home.heroFieldDateValue": "12 Ġun 2026",
    "VehicleCard.helmetsInline": "{count, plural, one {# kaskett} other {# kasketti}}",
    "BookingWizard.bookingSummary.subtotal": "Subtotali:",
  },
  pt: {
    "BookingWizard.bookingSummary.subtotal": "Subtotal parcial:",
  },
};

function setByPath(obj, dotPath, value) {
  const parts = dotPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur) || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const [locale, map] of Object.entries(patches)) {
  const file = path.join(MESSAGES, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [key, value] of Object.entries(map)) {
    setByPath(data, key, value);
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Patched ${locale}.json (${Object.keys(map).length} keys)`);
}
