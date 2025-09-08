// src/components/GastroMustEat.tsx
import { useEffect, useMemo, useState } from "react";
import { MUST_EAT } from "../data/mustEat";
import { Copy } from "lucide-react";
import { db } from "../lib/firebase";
import { doc, setDoc, increment } from "firebase/firestore";

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
      <div className="mb-2">
        <h3 className="text-base font-semibold leading-tight">{title}</h3>
        {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

type Props = { tripId: string; className?: string };
type State = Record<string, true>; // ids marcados

// 🔥 Suma puntos en Firebase
async function addPoint(tripId: string, deviceId: string) {
  try {
    const ref = doc(db, "trips", tripId, "game", "scores", deviceId);
    await setDoc(ref, { points: increment(1) }, { merge: true });
  } catch (e) {
    console.error("Error al sumar punto", e);
  }
}

export default function GastroMustEat({ tripId, className }: Props) {
  const [city, setCity] = useState<"Osaka" | "Kyoto" | "Tokyo">("Osaka");
  const [gf, setGF] = useState(false);
  const [lf, setLF] = useState(false);
  const KEY = useMemo(() => `jp_musteat_${tripId}_${city}_v1`, [tripId, city]);
  const deviceId = localStorage.getItem("notes_device_id") || "anon";

  const items = useMemo(
    () =>
      MUST_EAT.filter((x) => x.city === city).filter((x) => {
        if (gf && !x.gf) return false;
        if (lf && !x.lf) return false;
        return true;
      }),
    [city, gf, lf]
  );

  const [checked, setChecked] = useState<State>(() => {
    try {
      return JSON.parse(localStorage.getItem(`jp_musteat_${tripId}_Osaka_v1`) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setChecked(raw ? JSON.parse(raw) : {});
    } catch {
      setChecked({});
    }
  }, [KEY]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(checked));
    } catch {}
  }, [KEY, checked]);

  // ✅ toggle ahora suma punto al marcar algo nuevo
  const toggle = async (id: string) => {
    setChecked((s) => {
      const already = !!s[id];
      const next = { ...s };
      if (already) {
        delete next[id];
      } else {
        next[id] = true;
        addPoint(tripId, deviceId); // 👈 suma punto solo al marcar
      }
      return next;
    });
  };

  const markAll = () =>
    setChecked((s) => {
      const next: State = { ...s };
      items.forEach((i) => (next[i.id] = true));
      return next;
    });

  const reset = () =>
    setChecked((s) => {
      const next: State = { ...s };
      items.forEach((i) => delete next[i.id]);
      return next;
    });

  const done = items.filter((i) => checked[i.id]).length;
  const total = items.length || 1;
  const pct = Math.round((done / total) * 100);

  const shareText = [
    `🍣 Imprescindibles en ${city} — ${done}/${items.length}`,
    ...items.map((i) => `• ${i.emoji || "•"} ${i.dish}${checked[i.id] ? " ✅" : ""}`),
    gf ? "Filtro: sin gluten" : "",
    lf ? "Filtro: sin lactosa" : "",
  ]
    .filter(Boolean)
    .join("\n");

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Imprescindibles ${city}`, text: shareText });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Checklist copiada ✨");
    } catch {}
  };

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <SectionCard title="Imprescindibles a comer" subtitle="Marca lo que probéis · Filtros GF/SL">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value as any)}
            className="rounded-xl px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
          >
            <option value="Osaka">Osaka</option>
            <option value="Kyoto">Kyoto</option>
            <option value="Tokyo">Tokyo</option>
          </select>

          <label className="text-xs inline-flex items-center gap-2">
            <input type="checkbox" checked={gf} onChange={() => setGF(!gf)} />
            Sin gluten
          </label>
          <label className="text-xs inline-flex items-center gap-2">
            <input type="checkbox" checked={lf} onChange={() => setLF(!lf)} />
            Sin lactosa
          </label>

          <div className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">{pct}%</div>
        </div>

        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${pct}%` }} />
        </div>

        <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          {items.map((i) => (
            <li key={i.id} className="p-3 flex items-start gap-3 bg-white/60 dark:bg-zinc-900/40">
              <input
                type="checkbox"
                checked={!!checked[i.id]}
                onChange={() => toggle(i.id)}
                className="w-5 h-5 rounded-md border-zinc-300 dark:border-zinc-700"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {i.emoji || "🍽️"} {i.dish}
                  <span className="ml-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {i.gf ? "GF" : ""}{i.gf && i.lf ? " · " : ""}{i.lf ? "SL" : ""}
                  </span>
                </div>
                {i.description && <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{i.description}</div>}
                {i.tip && <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">💡 {i.tip}</div>}
              </div>
            </li>
          ))}
          {!items.length && (
            <li className="p-3 text-sm text-zinc-500 dark:text-zinc-400">
              No hay elementos con los filtros seleccionados.
            </li>
          )}
        </ul>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={markAll}
            className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Marcar todo
          </button>
          <button
            onClick={reset}
            className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
          <button
            onClick={share}
            className="ml-auto text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
          >
            <Copy size={14} /> Compartir
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
