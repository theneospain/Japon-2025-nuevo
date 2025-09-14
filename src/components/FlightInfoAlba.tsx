import React, { useMemo } from "react";
import { PlaneTakeoff, PlaneLanding, Copy } from "lucide-react";

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-2">
      <div>
        <h3 className="text-base font-semibold leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function FlightInfoAlba() {
  const shareText = useMemo(
    () =>
      [
        "🛫 Vuelos Ida y Vuelta Japón 2025 🇯🇵",
        "",
        "✈ VUELO DE IDA – Lunes 20 de octubre 2025",
        "• Salida: 11:05 desde Madrid-Barajas T1 (MAD)",
        "• Vuelo MU710 (Airbus A350 XWB – avión grande)",
        "• Llegada a Shanghái-Pudong (PVG T1): 21 oct, 05:50  ·  Duración: 12 h 45 min",
        "• Escala en Shanghái: 2 h 05 min  ·  No hace falta recoger equipaje ni volver a facturarlo",
        "• Conexión: MU727 (Airbus A321 – avión mediano)",
        "• Salida PVG T1: 21 oct, 07:55",
        "• Llegada Tokio-Narita (NRT T2): 21 oct, 12:00  ·  Duración tramo 2: 3 h 05 min",
        "→ Total ida: 17 h 55 min (incluye escala)",
        "",
        "✈ VUELO DE VUELTA – Martes 4 de noviembre 2025",
        "• Salida: 16:55 desde Tokio-Narita T2 (NRT)",
        "• Vuelo MU522 (Airbus A320neo – avión mediano)",
        "• Llegada Shanghái-Pudong (PVG T1): 19:45  ·  Duración: 3 h 50 min",
        "• Escala en Shanghái: 5 h 15 min (🌙 nocturna)  ·  No hace falta recoger equipaje",
        "• Conexión: MU709 (Airbus A350 XWB – avión grande)",
        "• Salida PVG T1: 5 nov, 00:50",
        "• Llegada Madrid-Barajas T1 (MAD): 5 nov, 08:00  ·  Duración tramo 2: 14 h 10 min",
        "→ Total vuelta: 23 h 05 min (incluye escala)",
        "",
        "🔎 Detalles:",
        "• Aerolínea: China Eastern Airlines",
        "• Maleta facturada: incluida (sin volver a facturar en escalas)",
        "• Comidas: incluidas en ambos tramos",
        "• Escalas: Ida corta (2 h 05) · Vuelta larga (5 h 15, nocturna)",
      ].join("\n"),
    []
  );

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Información de vuelos copiada ✨");
    } catch {}
  };

  return (
    <div className="space-y-4">
      <Card title="🛫 Vuelos Ida y Vuelta Japón 2025 🇯🇵">
        {/* Ida */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
          <div className="flex items-center gap-2 mb-1">
            <PlaneTakeoff size={18} />
            <h4 className="font-semibold">✈ VUELO DE IDA — Lunes 20 de octubre 2025</h4>
          </div>
          <ul className="text-sm space-y-1">
            <li>⏰ Salida: <b>11:05</b> desde Madrid-Barajas <b>T1 (MAD)</b> 🛄</li>
            <li>🛩 Vuelo <b>MU710</b> (Airbus A350 XWB – avión grande)</li>
            <li>🕐 Llegada a Shanghái-Pudong <b>(PVG T1)</b>: <b>21 oct, 05:50</b> · ⏳ <b>12 h 45 min</b></li>
            <li>🔄 Escala en Shanghái: <b>2 h 05 min</b> · ✅ sin recoger equipaje</li>
            <li>🛩 Conexión: <b>MU727</b> (Airbus A321 – avión mediano)</li>
            <li>⏰ Salida PVG T1: <b>21 oct, 07:55</b></li>
            <li>🕐 Llegada a Tokio-Narita <b>(NRT T2)</b>: <b>21 oct, 12:00</b> · ⏳ tramo 2: <b>3 h 05 min</b></li>
          </ul>
          <div className="mt-2 text-sm">➡ <b>Duración total ida</b>: <b>17 h 55 min</b> (incluye escala)</div>
        </div>

        {/* Vuelta */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
          <div className="flex items-center gap-2 mb-1">
            <PlaneLanding size={18} />
            <h4 className="font-semibold">✈ VUELO DE VUELTA — Martes 4 de noviembre 2025</h4>
          </div>
          <ul className="text-sm space-y-1">
            <li>⏰ Salida: <b>16:55</b> desde Tokio-Narita <b>T2 (NRT)</b> 🛄</li>
            <li>🛩 Vuelo <b>MU522</b> (Airbus A320neo – avión mediano)</li>
            <li>🕐 Llegada a Shanghái-Pudong <b>(PVG T1)</b>: <b>19:45</b> · ⏳ <b>3 h 50 min</b></li>
            <li>🔄 Escala en Shanghái: <b>5 h 15 min</b> (🌙 nocturna) · ✅ sin recoger equipaje</li>
            <li>🛩 Conexión: <b>MU709</b> (Airbus A350 XWB – avión grande)</li>
            <li>⏰ Salida PVG T1: <b>5 nov, 00:50</b></li>
            <li>🕐 Llegada a Madrid-Barajas <b>T1 (MAD)</b>: <b>5 nov, 08:00</b> · ⏳ tramo 2: <b>14 h 10 min</b></li>
          </ul>
          <div className="mt-2 text-sm">➡ <b>Duración total vuelta</b>: <b>23 h 05 min</b> (incluye escala)</div>
        </div>

        {/* Detalles */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
          <h4 className="font-semibold mb-1">🔎 Detalles importantes</h4>
          <ul className="text-sm space-y-1">
            <li>🏷 Aerolínea: <b>China Eastern Airlines</b></li>
            <li>🧳 Maleta facturada: <b>incluida</b> (sin volver a facturar en escalas)</li>
            <li>🍱 Comidas: <b>incluidas</b> en ambos tramos</li>
            <li>🔄 Escalas: Ida <b>corta (2 h 05)</b> · Vuelta <b>larga (5 h 15, 🌙 nocturna)</b></li>
          </ul>
        </div>

        <div className="pt-1">
          <button
            onClick={copyAll}
            className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
          >
            <Copy size={14} /> Copiar toda la info
          </button>
        </div>
      </Card>
    </div>
  );
}
