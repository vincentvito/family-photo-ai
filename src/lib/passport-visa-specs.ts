import type { AspectRatio } from "@/lib/providers/types";

export type PassportVisaDocumentType = "passport" | "visa";

export type PassportVisaSpec = {
  id: string;
  countryCode: string;
  countryName: string;
  documentType: PassportVisaDocumentType;
  documentLabel: string;
  sizeLabel: string;
  dimensions: {
    width: number;
    height: number;
    unit: "in" | "mm";
  };
  outputPixels: string;
  printableSheet: string;
  background: string;
  nearestAspectRatio: AspectRatio;
  notes: string[];
};

export const PASSPORT_VISA_THEME_ID = "passport-visa-photo";

export const PASSPORT_VISA_SPECS = [
  {
    id: "us-passport",
    countryCode: "US",
    countryName: "United States",
    documentType: "passport",
    documentLabel: "Passport photo",
    sizeLabel: "2 x 2 in",
    dimensions: { width: 2, height: 2, unit: "in" },
    outputPixels: "600 x 600 px at 300 DPI",
    printableSheet: "Print as 2 x 2 in photos; six copies fit on a 4 x 6 in sheet.",
    background: "plain white or off-white",
    nearestAspectRatio: "1:1",
    notes: [
      "Head centered and facing camera",
      "Neutral expression or natural smile",
      "No glasses, hats, or uniforms",
    ],
  },
  {
    id: "us-visa",
    countryCode: "US",
    countryName: "United States",
    documentType: "visa",
    documentLabel: "Visa photo",
    sizeLabel: "2 x 2 in",
    dimensions: { width: 2, height: 2, unit: "in" },
    outputPixels: "600 x 600 px at 300 DPI",
    printableSheet: "Print as 2 x 2 in photos; six copies fit on a 4 x 6 in sheet.",
    background: "plain white or off-white",
    nearestAspectRatio: "1:1",
    notes: ["Full face view", "Neutral expression", "No glasses, hats, or heavy shadows"],
  },
  {
    id: "uk-passport",
    countryCode: "GB",
    countryName: "United Kingdom",
    documentType: "passport",
    documentLabel: "Passport photo",
    sizeLabel: "35 x 45 mm",
    dimensions: { width: 35, height: 45, unit: "mm" },
    outputPixels: "413 x 531 px at 300 DPI",
    printableSheet: "Print at 35 x 45 mm; arrange several copies on a 10 x 15 cm / 4 x 6 in sheet.",
    background: "plain light grey, cream, white, or off-white",
    nearestAspectRatio: "2:3",
    notes: [
      "Close-up head and shoulders",
      "Plain expression, mouth closed",
      "No head covering unless worn for religious/medical reasons",
    ],
  },
  {
    id: "schengen-visa",
    countryCode: "EU",
    countryName: "Schengen Area",
    documentType: "visa",
    documentLabel: "Schengen visa photo",
    sizeLabel: "35 x 45 mm",
    dimensions: { width: 35, height: 45, unit: "mm" },
    outputPixels: "413 x 531 px at 300 DPI",
    printableSheet: "Print at 35 x 45 mm; arrange several copies on a 10 x 15 cm / 4 x 6 in sheet.",
    background: "plain light, white, or off-white",
    nearestAspectRatio: "2:3",
    notes: [
      "Face centered and looking directly at camera",
      "Neutral expression",
      "Even lighting without shadows",
    ],
  },
  {
    id: "canada-passport",
    countryCode: "CA",
    countryName: "Canada",
    documentType: "passport",
    documentLabel: "Passport photo",
    sizeLabel: "50 x 70 mm",
    dimensions: { width: 50, height: 70, unit: "mm" },
    outputPixels: "591 x 827 px at 300 DPI",
    printableSheet: "Print at 50 x 70 mm; two copies usually fit comfortably on a 4 x 6 in sheet.",
    background: "plain white or light-coloured",
    nearestAspectRatio: "2:3",
    notes: ["Neutral facial expression", "No glare or shadows", "Shoulders squared to camera"],
  },
  {
    id: "india-passport",
    countryCode: "IN",
    countryName: "India",
    documentType: "passport",
    documentLabel: "Passport photo",
    sizeLabel: "51 x 51 mm",
    dimensions: { width: 51, height: 51, unit: "mm" },
    outputPixels: "600 x 600 px at 300 DPI",
    printableSheet: "Print at 51 x 51 mm; arrange multiple copies on a 4 x 6 in sheet.",
    background: "plain white or off-white",
    nearestAspectRatio: "1:1",
    notes: [
      "Full front view of face",
      "Neutral expression",
      "No dark glasses or headwear except religious reasons",
    ],
  },
  {
    id: "india-visa",
    countryCode: "IN",
    countryName: "India",
    documentType: "visa",
    documentLabel: "Visa photo",
    sizeLabel: "51 x 51 mm",
    dimensions: { width: 51, height: 51, unit: "mm" },
    outputPixels: "600 x 600 px at 300 DPI",
    printableSheet: "Print at 51 x 51 mm; arrange multiple copies on a 4 x 6 in sheet.",
    background: "plain white or off-white",
    nearestAspectRatio: "1:1",
    notes: ["Face clearly visible", "Neutral expression", "No shadows on face or background"],
  },
  {
    id: "australia-passport",
    countryCode: "AU",
    countryName: "Australia",
    documentType: "passport",
    documentLabel: "Passport photo",
    sizeLabel: "35 x 45 mm",
    dimensions: { width: 35, height: 45, unit: "mm" },
    outputPixels: "413 x 531 px at 300 DPI",
    printableSheet: "Print at 35 x 45 mm; arrange several copies on a 4 x 6 in sheet.",
    background: "plain white or light grey",
    nearestAspectRatio: "2:3",
    notes: [
      "Neutral expression and mouth closed",
      "No glasses in most cases",
      "Even lighting and no shadows",
    ],
  },
  {
    id: "china-passport",
    countryCode: "CN",
    countryName: "China",
    documentType: "passport",
    documentLabel: "Passport photo",
    sizeLabel: "33 x 48 mm",
    dimensions: { width: 33, height: 48, unit: "mm" },
    outputPixels: "390 x 567 px at 300 DPI",
    printableSheet: "Print at 33 x 48 mm; arrange multiple copies on a 4 x 6 in sheet.",
    background: "plain white or light blue depending on request",
    nearestAspectRatio: "2:3",
    notes: [
      "Front-facing head-and-shoulders crop",
      "Neutral expression",
      "No hat, glasses, or heavy makeup",
    ],
  },
  {
    id: "china-visa",
    countryCode: "CN",
    countryName: "China",
    documentType: "visa",
    documentLabel: "Visa photo",
    sizeLabel: "33 x 48 mm",
    dimensions: { width: 33, height: 48, unit: "mm" },
    outputPixels: "390 x 567 px at 300 DPI",
    printableSheet: "Print at 33 x 48 mm; arrange multiple copies on a 4 x 6 in sheet.",
    background: "plain white",
    nearestAspectRatio: "2:3",
    notes: ["Full face and upper shoulders", "Neutral expression", "No shadows, hats, or glasses"],
  },
  {
    id: "japan-passport",
    countryCode: "JP",
    countryName: "Japan",
    documentType: "passport",
    documentLabel: "Passport photo",
    sizeLabel: "35 x 45 mm",
    dimensions: { width: 35, height: 45, unit: "mm" },
    outputPixels: "413 x 531 px at 300 DPI",
    printableSheet: "Print at 35 x 45 mm; arrange several copies on a 4 x 6 in sheet.",
    background: "plain white or light neutral",
    nearestAspectRatio: "2:3",
    notes: [
      "Face centered and looking straight ahead",
      "Neutral expression",
      "No hat, sunglasses, or background pattern",
    ],
  },
] as const satisfies readonly PassportVisaSpec[];

export type PassportVisaSpecId = (typeof PASSPORT_VISA_SPECS)[number]["id"];

export const PASSPORT_VISA_SPEC_IDS = PASSPORT_VISA_SPECS.map((spec) => spec.id) as [
  PassportVisaSpecId,
  ...PassportVisaSpecId[],
];

export function getPassportVisaSpec(id: string): PassportVisaSpec | null {
  return PASSPORT_VISA_SPECS.find((spec) => spec.id === id) ?? null;
}

export function specsByCountry() {
  return PASSPORT_VISA_SPECS.reduce<Record<string, PassportVisaSpec[]>>((groups, spec) => {
    groups[spec.countryName] = [...(groups[spec.countryName] ?? []), spec];
    return groups;
  }, {});
}
