// src/data/gastro.ts
export type PriceLevel = 1 | 2 | 3 | 4;

export type GastroPlace = {
  id: string;              // slug único
  name: string;
  city: "Osaka" | "Kyoto" | "Tokyo";
  area: string;            // barrio/zonita (Namba, Gion, Shinjuku…)
  cuisine: string;         // Sushi, Ramen, Izakaya...
  price: PriceLevel;       // 1: barato ... 4: caro
  noReservation: boolean;  // sin reserva
  hours?: string;          // "11:30–15:00, 18:00–22:30"
  tags?: string[];         // ["ramen","tonkotsu","spicy"]
  gmaps: string;           // URL de Google Maps
  lat?: number;
  lng?: number;
};

export const GASTRO_PLACES: GastroPlace[] = [
  {
    id: "osaka-ichiran-namba",
    name: "Ichiran Ramen Namba",
    city: "Osaka",
    area: "Namba / Dotonbori",
    cuisine: "Ramen",
    price: 2,
    noReservation: true,
    hours: "24h (suele variar)",
    tags: ["ramen", "tonkotsu", "individual"],
    gmaps: "https://goo.gl/maps/2A6qk2nRf8w7S9Eo7",
    lat: 34.6689, lng: 135.5011,
  },
  {
    id: "osaka-kani-doraku",
    name: "Kani Doraku Dotonbori",
    city: "Osaka",
    area: "Dotonbori",
    cuisine: "Marisco",
    price: 3,
    noReservation: false,
    hours: "11:00–23:00",
    tags: ["cangrejo", "icónico"],
    gmaps: "https://goo.gl/maps/D4Kqk1e8K8b9V2mN9",
    lat: 34.6686, lng: 135.5019,
  },
  {
    id: "kyoto-nishiki-sushi",
    name: "Sushi en Mercado Nishiki",
    city: "Kyoto",
    area: "Nishiki Market",
    cuisine: "Sushi",
    price: 2,
    noReservation: true,
    hours: "10:00–18:00",
    tags: ["mercado", "picoteo"],
    gmaps: "https://goo.gl/maps/9M2ZfR3s7n3RZ4cB6",
    lat: 35.0053, lng: 135.7631,
  },
  {
    id: "kyoto-izakaya-gion",
    name: "Izakaya en Gion",
    city: "Kyoto",
    area: "Gion",
    cuisine: "Izakaya",
    price: 2,
    noReservation: true,
    hours: "18:00–24:00",
    tags: ["yakitori","beer"],
    gmaps: "https://goo.gl/maps/3Qh9p6VZcVd3Jk6c8",
    lat: 35.0038, lng: 135.7772,
  },
  {
    id: "tokyo-sushizanmai-tsukiji",
    name: "Sushizanmai (Tsukiji)",
    city: "Tokyo",
    area: "Tsukiji",
    cuisine: "Sushi",
    price: 2,
    noReservation: true,
    hours: "24h (algunas sucursales)",
    tags: ["clásico","cadena"],
    gmaps: "https://goo.gl/maps/At8rj7E7kH1PMWfV6",
    lat: 35.6653, lng: 139.7690,
  },
  {
    id: "tokyo-afuri-harajuku",
    name: "AFURI Harajuku",
    city: "Tokyo",
    area: "Harajuku",
    cuisine: "Ramen (yuzu)",
    price: 2,
    noReservation: true,
    hours: "11:00–22:00",
    tags: ["yuzu","ligero"],
    gmaps: "https://goo.gl/maps/yQqZQKQ8j1E2v8nP7",
    lat: 35.6705, lng: 139.7033,
  },
  {
    id: "tokyo-ichiran-shinjuku",
    name: "Ichiran Ramen Shinjuku",
    city: "Tokyo",
    area: "Shinjuku",
    cuisine: "Ramen",
    price: 2,
    noReservation: true,
    hours: "24h",
    tags: ["ramen","popular"],
    gmaps: "https://goo.gl/maps/6QnY6y2M9q1b1v5c6",
    lat: 35.6938, lng: 139.7034,
  },
  {
    id: "kyoto-vegan-toseda",
    name: "Toseda Vegan",
    city: "Kyoto",
    area: "Centro",
    cuisine: "Vegan",
    price: 2,
    noReservation: false,
    hours: "12:00–15:00, 18:00–21:30",
    tags: ["vegano"],
    gmaps: "https://goo.gl/maps/xxxxx",
  },
  {
    id: "osaka-okonomiyaki-mizuno",
    name: "Mizuno Okonomiyaki",
    city: "Osaka",
    area: "Dotonbori",
    cuisine: "Okonomiyaki",
    price: 2,
    noReservation: true,
    hours: "11:00–22:00",
    tags: ["okonomiyaki","famoso"],
    gmaps: "https://goo.gl/maps/xxxxx",
  },
  {
    id: "tokyo-gonpachi-nishi-azabu",
    name: "Gonpachi Nishi-Azabu",
    city: "Tokyo",
    area: "Nishi-Azabu",
    cuisine: "Izakaya",
    price: 3,
    noReservation: false,
    hours: "11:30–15:00, 17:00–23:00",
    tags: ["kill-bill vibes"],
    gmaps: "https://goo.gl/maps/xxxxx",
  },
];
