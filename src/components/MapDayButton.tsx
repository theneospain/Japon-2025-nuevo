// src/components/MapDayButton.tsx
import React from "react";
import { MapPin } from "lucide-react";

// Tipos ligeros compatibles con tu App.tsx
type ActivityLite = {
  time?: string | null;
  text: string;
  stop?: { gmaps: string; placeId?: string };
};
type DayPlanLite = {
  date: string;
  city: string;
  activities: ActivityLite[];
};

type Props = {
  day: DayPlanLite;
  /** Fallback opcional: lista genérica de lugares con gmaps */
  places?: { name: string; gmaps: string }[];
  className?: string;
};

/** Quita duplicados básicos por URL normalizada */
function dedupe(urls: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const k = u.trim().toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(u);
    }
  }
  return out;
}

/** Extrae un parámetro “buscable” de un link de Google Maps (query o place_id) */
function extractQueryOrPlace(link: string): string {
  try {
    const u = new URL(link);
    const pid =
      u.searchParams.get("query_place_id") ||
      u.searchParams.get("place_id");
    if (pid) return `place_id:${pid}`;

    // ‘query’ es el más común en links tipo /maps/search/?api=1&query=...
    const q =
      u.searchParams.get("query") ||
      u.searchParams.get("destination") ||
      u.searchParams.get("q");

    if (q) return q;
  } catch {
    // Si no es URL válida, devolvemos tal cual (por si ya es un texto buscable)
  }
  return link;
}

/** Construye una URL de Google Maps:
 *  - 0 puntos: abre Maps genérico
 *  - 1 punto: abre el link tal cual (o un search=)
 *  - 2+ puntos: ruta con origin/destination y waypoints (modo a pie)
 */
function buildMapsUrl(points: string[]): string {
  if (points.length === 0) {
    return "https://www.google.com/maps";
  }
  if (points.length === 1) {
    // Abrimos directamente el link original para conservar fotos/fichas oficiales
    return points[0];
  }

  // 2 o más → Directions con waypoints (a pie)
  const params = points.map(extractQueryOrPlace);
  const origin = encodeURIComponent(params[0]);
  const destination = encodeURIComponent(params[params.length - 1]);
  const mids = params.slice(1, -1).map(encodeURIComponent).join("|");

  const base = "https://www.google.com/maps/dir/?api=1";
  const travel = "travelmode=walking";
  const wp = mids ? `&waypoints=${mids}` : "";
  return `${base}&origin=${origin}&destination=${destination}&${travel}${wp}`;
}

/** Botón compacto para abrir el “Mapa del día”
 *  Prioriza stops del día (activities[].stop.gmaps). Si no hay, usa fallback.
 */
export default function MapDayButton({ day, places, className }: Props) {
  // 1) Reunir stops del día (si existen)
  const stopLinks = dedupe(
    day.activities
      .map((a) => a.stop?.gmaps)
      .filter(Boolean) as string[]
  ).slice(0, 10); // cap de seguridad

  // 2) Fallback: si no hay stops, usamos los ‘places’ (máx 5 para no saturar)
  const fallbackLinks = dedupe((places || []).map((p) => p.gmaps)).slice(0, 5);

  const points = stopLinks.length > 0 ? stopLinks : fallbackLinks;
  const href = buildMapsUrl(points);

  // Si no hay nada, desactiva visualmente
  const disabled = points.length === 0;

  return (
    <a
      href={disabled ? undefined : href}
      target="_blank"
      rel="noreferrer"
      aria-disabled={disabled}
      className={
        className ??
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm " +
          (disabled
            ? "cursor-not-allowed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600"
            : "border-zinc-200 dark:border-zinc-700 bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800")
      }
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
      title={
        disabled
          ? "No hay puntos para mostrar hoy"
          : `Abrir mapa del día (${points.length} punto${points.length === 1 ? "" : "s"})`
      }
    >
      <MapPin size={16} />
      <span className="whitespace-nowrap">Mapa del día</span>
    </a>
  );
}
