// src/components/MapDayButton.tsx
import React, { useMemo } from "react";
import { Map } from "lucide-react";

// Normaliza texto para comparar (quita acentos y pasa a minúsculas)
const norm = (s: string) =>
  (s || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type Activity = { time?: string | null; text: string };
type DayPlan = { date: string; city: string; emoji?: string; activities: Activity[] };

type PlaceRef = { name: string; gmaps?: string };
type Props = { day: DayPlan; places: PlaceRef[] };

export default function MapDayButton({ day, places }: Props) {
  // 1) Sugerimos paradas buscando nombres de PLACES dentro de actividades del día
  const stops = useMemo(() => {
    const acts = day.activities?.map(a => a.text) || [];
    const out: string[] = [];
    for (const p of places) {
      const n = norm(p.name);
      if (acts.some(t => norm(t).includes(n))) out.push(p.gmaps || p.name);
    }
    // si no detecta nada, al menos usa la ciudad como destino
    if (out.length === 0) out.push(day.city);
    return out.slice(0, 9); // Google Maps suele aceptar hasta 10 puntos (origen+8 waypoints+destino aprox.)
  }, [day, places]);

  // 2) Construimos la URL de Google Maps Directions
  const href = useMemo(() => {
    const [origin, ...rest] = stops;
    const destination = rest.length ? rest[rest.length - 1] : origin;
    const waypoints = rest.length > 1 ? rest.slice(0, -1).join("|") : "";
    const params = new URLSearchParams({
      api: "1",
      travelmode: "walking",
      origin: origin,
      destination: destination,
      ...(waypoints ? { waypoints } : {}),
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [stops]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
      title="Abrir mapa del día en Google Maps"
    >
      <Map size={16} /> Mapa del día
    </a>
  );
}
