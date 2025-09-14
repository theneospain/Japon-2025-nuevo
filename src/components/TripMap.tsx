import React from "react";
import { ExternalLink } from "lucide-react";

type Props = {
  /** URL de Google My Maps (viewer o embed) */
  myMapsUrl?: string;
};

/** Tu mapa (puedes pegar aquí otro URL si cambia) */
const DEFAULT_URL =
  "https://www.google.com/maps/d/u/0/viewer?mid=1Or4fHGEm9zQP0oxTXkJ7JGrgNBVovns&ll=35.375985905939594,135.82507178797033&z=6";

/** Convierte /viewer?mid=... → /embed?mid=... manteniendo ll y z si existen */
function toEmbed(url: string) {
  try {
    const u = new URL(url);
    const mid = u.searchParams.get("mid") || "";
    const ll = u.searchParams.get("ll");
    const z = u.searchParams.get("z");
    let embed = `https://www.google.com/maps/d/u/0/embed?mid=${mid}`;
    if (ll) embed += `&ll=${encodeURIComponent(ll)}`;
    if (z) embed += `&z=${encodeURIComponent(z)}`;
    return embed;
  } catch {
    return url.replace("/viewer?mid=", "/embed?mid=");
  }
}

export default function TripMap({ myMapsUrl = DEFAULT_URL }: Props) {
  const embed = toEmbed(myMapsUrl);
  return (
    <div className="space-y-3">
      {/* Contenedor responsive con relación 3:4 en móvil y 16:9 en pantallas anchas */}
      <div className="aspect-[3/4] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
        <iframe
          src={embed}
          title="Mapa del viaje"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>

      <a
        href={myMapsUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
      >
        <ExternalLink size={16} />
        Abrir en Google My Maps
      </a>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Consejo: dentro del mapa puedes activar/desactivar capas por ciudades o
        categorías.
      </p>
    </div>
  );
}
