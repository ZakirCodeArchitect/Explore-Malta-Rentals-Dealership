export type BookingOption = Readonly<{
  value: string;
  label: string;
}>;

export const vehicleTypeOptions: readonly BookingOption[] = [
  { value: "all", label: "All vehicles" },
  { value: "scooter", label: "Scooters" },
  { value: "motorcycle", label: "Motorcycles" },
  { value: "atv", label: "ATVs" },
  { value: "bicycle", label: "Bicycles" },
] as const;

export const locationOptions: readonly BookingOption[] = [
  { value: "pieta", label: "Pietà, Malta" },
  { value: "valletta", label: "Valletta, Malta" },
  { value: "sliema", label: "Sliema, Malta" },
  { value: "st-julians", label: "St. Julian's, Malta" },
  { value: "gzira", label: "Gzira, Malta" },
  { value: "msida", label: "Msida, Malta" },
  { value: "san-gwann", label: "San Gwann, Malta" },
  { value: "swieqi", label: "Swieqi, Malta" },
  { value: "pembroke", label: "Pembroke, Malta" },
  { value: "bugibba", label: "Bugibba, Malta" },
  { value: "qawra", label: "Qawra, Malta" },
  { value: "st-pauls-bay", label: "St. Paul's Bay, Malta" },
  { value: "mellieha", label: "Mellieha, Malta" },
  { value: "golden-bay", label: "Golden Bay, Malta" },
  { value: "rabat", label: "Rabat, Malta" },
  { value: "mdina", label: "Mdina, Malta" },
  { value: "attard", label: "Attard, Malta" },
  { value: "balzan", label: "Balzan, Malta" },
  { value: "naxxar", label: "Naxxar, Malta" },
  { value: "mosta", label: "Mosta, Malta" },
  { value: "luqa-airport", label: "Luqa Airport, Malta" },
  { value: "marsaskala", label: "Marsaskala, Malta" },
  { value: "marsaxlokk", label: "Marsaxlokk, Malta" },
  { value: "birzebbuga", label: "Birzebbuga, Malta" },
  { value: "victoria-gozo", label: "Victoria (Rabat), Gozo" },
  { value: "xlendi-gozo", label: "Xlendi, Gozo" },
  { value: "marsalforn-gozo", label: "Marsalforn, Gozo" },
  { value: "mgarr-gozo", label: "Mgarr Harbour, Gozo" },
] as const;
