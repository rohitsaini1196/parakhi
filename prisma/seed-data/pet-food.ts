import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Pet food (dog/cat dry & wet food, treats).
 * Mixed-IVC: global brands dominate (Pedigree, Whiskas, Royal Canin → Mars US),
 * but India's own Drools (and Purepet) now manufactures domestically from local
 * chicken/maize/rice, scoring much higher. Imported premium kibble + some
 * vitamins/palatants drag. GST 18% (HSN 2309). Needs human review.
 */
export const PET_FOOD_TEMPLATE: CategoryTemplate = {
  slug: "pet_food",
  displayName: "Pet Food",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["2309", "23091000", "23099090"],
  keywords: [
    "dog food", "cat food", "pet food", "puppy food", "kitten food",
    "pedigree", "drools", "whiskas", "royal canin", "purepet", "meat up",
    "dog treats", "dog biscuits", "kibble", "dry dog food", "cat treats",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 42, highPct: 58 },
    packaging: {
      lowPct: 8,
      highPct: 14,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    manufacturing: { lowPct: 7, highPct: 12 },
    logistics: { lowPct: 6, highPct: 10 },
    retailMargin: { lowPct: 9, highPct: 15 },
    brandMargin: { lowPct: 4, highPct: 9 },
    advertising: { lowPct: 3, highPct: 8 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "US", countryName: "United States", probabilityPct: 50, notes: "Pedigree, Whiskas, Royal Canin owned by Mars." },
        { country: "IN", countryName: "India", probabilityPct: 45, notes: "Drools, Purepet (Drools), Meat Up — Indian, domestically manufactured." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 5 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Meat/poultry meal, maize, rice, soy",
      sharePct: { low: 72, high: 88 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 75, notes: "Chicken/poultry meal, maize, rice and soy are domestic; Drools sources locally." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 25, notes: "Premium imported kibble (Royal Canin) and some specialty proteins imported." },
      ],
    },
    {
      name: "Vitamins, minerals, palatants",
      sharePct: { low: 10, high: 24 },
      typicalOrigin: [
        { country: "MIXED", countryName: "Mixed", probabilityPct: 60, notes: "Vitamin/mineral premixes and palatants frequently imported (China/EU)." },
        { country: "IN", countryName: "India", probabilityPct: 40 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 52, highPct: 76 },
  llmGuidance:
    "Pet food is mixed-IVC and brand-dependent. Mars brands (Pedigree, Whiskas, Royal Canin) dominate and Royal Canin premium kibble is often imported, dragging IVC. But Drools and Purepet manufacture domestically from local chicken/maize/rice and score much higher — a real Indian-vs-foreign split. Vitamin premixes/palatants are imported. GST 18% under HSN 2309.",
  sources: [
    { title: "GST on pet food — HSN 2309 (18%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST on pet food" },
    { title: "Drools — domestic pet-food manufacturing", url: "https://drools.in/", relevance: "Indian sourcing & manufacturing" },
  ],
};
