// src/data/mustEat.ts
export type MustEatItem = {
  id: string;
  city: "Osaka" | "Kyoto" | "Tokyo";
  dish: string;
  emoji?: string;
  description?: string;
  gf?: boolean; // Apto sin gluten (ojo a salsas/rebozados)
  lf?: boolean; // Apto sin lactosa (ojo a caldos/salsas)
  tip?: string; // recomendación o advertencia
};

export const MUST_EAT: MustEatItem[] = [
  // OSAKA
  {
    id: "osaka-takoyaki",
    city: "Osaka",
    dish: "Takoyaki",
    emoji: "🐙",
    description: "Bolitas de masa con pulpo; icónico de Dotonbori.",
    gf: false,
    lf: true,
    tip: "La masa suele llevar trigo; pregunta por opciones sin trigo (poco habitual).",
  },
  {
    id: "osaka-okonomiyaki",
    city: "Osaka",
    dish: "Okonomiyaki",
    emoji: "🥘",
    description: "Tortilla japonesa a la plancha con toppings.",
    gf: false,
    lf: true,
    tip: "Harina de trigo por defecto; algunas cadenas ofrecen base de arroz (poco común).",
  },
  {
    id: "osaka-kushikatsu",
    city: "Osaka",
    dish: "Kushikatsu (brochetas rebozadas)",
    emoji: "🍢",
    description: "Brochetas fritas con salsas.",
    gf: false,
    lf: true,
    tip: "Rebozado con harina de trigo; evita si buscas GF.",
  },

  // KYOTO
  {
    id: "kyoto-yudofu",
    city: "Kyoto",
    dish: "Yudōfu (tofu caliente)",
    emoji: "🍲",
    description: "Tofu en caldo suave, clásico cerca de templos.",
    gf: true,
    lf: true,
    tip: "Confirma ingredientes del caldo/salsa (evitar salsas con soja/gluten).",
  },
  {
    id: "kyoto-obanzai",
    city: "Kyoto",
    dish: "Obanzai (casera de Kioto)",
    emoji: "🥗",
    description: "Platos tradicionales de verduras/pescado.",
    gf: false,
    lf: true,
    tip: "Pregunta por platos sin harina/soja con gluten.",
  },
  {
    id: "kyoto-matcha",
    city: "Kyoto",
    dish: "Dulces de matcha",
    emoji: "🍵",
    description: "Tés y dulces icónicos en Gion/Nishiki.",
    gf: false,
    lf: false,
    tip: "Muchos llevan trigo/lácteos; pregunta variantes aptas.",
  },

  // TOKYO
  {
    id: "tokyo-sushi",
    city: "Tokyo",
    dish: "Sushi / Sashimi",
    emoji: "🍣",
    description: "Imprescindible; evita salsa de soja común si buscas GF.",
    gf: true,
    lf: true,
    tip: "Usa tamari o soja sin gluten (lleva botellita si puedes).",
  },
  {
    id: "tokyo-ramen",
    city: "Tokyo",
    dish: "Ramen",
    emoji: "🍜",
    description: "Variedades tonkotsu, shoyu, miso, shio…",
    gf: false,
    lf: false,
    tip: "Fideos de trigo; algunos caldos/largos pueden llevar lactosa.",
  },
  {
    id: "tokyo-tempura",
    city: "Tokyo",
    dish: "Tempura",
    emoji: "🍤",
    description: "Rebozado ligero y crujiente.",
    gf: false,
    lf: true,
    tip: "Harina de trigo en el rebozado; no apto GF.",
  },
  {
    id: "tokyo-yakiniku",
    city: "Tokyo",
    dish: "Yakiniku (barbacoa japonesa)",
    emoji: "🥩",
    description: "Carne a la parrilla; controla las salsas.",
    gf: true,
    lf: true,
    tip: "Pide sal/limón en lugar de salsas con soja.",
  },
];
