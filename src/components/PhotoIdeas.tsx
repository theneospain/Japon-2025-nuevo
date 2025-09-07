// src/components/PhotoIdeas.tsx
import React, { useMemo, useState, useEffect } from "react";
import { Camera, Heart, CheckCircle, MapPin, Search, Sun, Moon, Users } from "lucide-react";
import { PHOTO_IDEAS, PhotoIdea } from "../data/photoIdeas";

const FAVORITES_KEY = "jp_photoideas_favs_v1";
const DONE_KEY = "jp_photoideas_done_v1";

function useLocalDict(key: string) {
  const [dict, setDict] = useState<Record<string, true>>(() => {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(dict)); } catch {} }, [dict]);
  return {
    has: (id: string) => !!dict[id],
    toggle: (id: string) => setDict(d => ({ ...d, [id]: d[id] ? (undefined as any) : true })),
  } as const;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40">{children}</div>
  );
}

export default function PhotoIdeas() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<"Todas" | PhotoIdea["city"]>("Todas");
  const [who, setWho] = useState<"todos" | "solo" | "pareja" | "grupo">("todos");
  const [vibe, setVibe] = useState<"todas" | "creativo" | "divertido" | "épico" | "nocturno" | "perspectiva" | "reflejo" | "documental">("todas");
  const [time, setTime] = useState<"todas" | "mañana" | "tarde" | "noche" | "cualquier">("todas");

  const fav = useLocalDict(FAVORITES_KEY);
  const done = useLocalDict(DONE_KEY);

  const cities = useMemo(() => ["Todas", ...Array.from(new Set(PHOTO_IDEAS.map(i => i.city)))] as const, []);
  const query = q.trim().toLowerCase();

  const data = useMemo(() => {
    return PHOTO_IDEAS
      .filter(i => city === "Todas" || i.city === city)
      .filter(i => who === "todos" || i.who.includes(who))
      .filter(i => vibe === "todas" || i.vibe.includes(vibe))
      .filter(i => time === "todas" || (i.time || "cualquier") === time)
      .filter(i => !query || (i.place + " " + i.city + " " + i.idea + " " + i.how + " " + (i.tips || "")).toLowerCase().includes(query))
      .sort((a, b) => Number(fav.has(b.id)) - Number(fav.has(a.id)));
  }, [city, who, vibe, time, query, fav]);

  const openMap = (it: PhotoIdea) => {
    const url = it.gmaps || `https://maps.google.com/?q=${encodeURIComponent(`${it.place} ${it.city} Japan`)}`;
    window.open(url, "_blank");
  };

  const share = async (it: PhotoIdea) => {
    const text =
      `📷 IDEA FOTO — ${it.place} (${it.city})\n` +
      `• Idea: ${it.idea}\n` +
      `• Cómo: ${it.how}\n` +
      (it.tips ? `• Tips: ${it.tips}\n` : "") +
      (it.gmaps ? `• Mapa: ${it.gmaps}\n` : "");
    try { if (navigator.share) { await navigator.share({ title: "Idea foto", text }); return; } } catch {}
    try { await navigator.clipboard.writeText(text); alert("Idea copiada ✨"); } catch {}
  };

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[11px] px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">{children}</span>
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar lugar/idea…"
                className="w-full rounded-xl pl-9 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
              />
            </div>
            <select
              value={city}
              onChange={e => setCity(e.target.value as any)}
              className="rounded-xl px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <select value={who} onChange={e => setWho(e.target.value as any)} className="rounded-xl px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm">
              <option value="todos">👥 Todos</option>
              <option value="solo">🧍‍♂️ Solo</option>
              <option value="pareja">💑 Pareja</option>
              <option value="grupo">👨‍👩‍👧‍👦 Grupo</option>
            </select>
            <select value={vibe} onChange={e => setVibe(e.target.value as any)} className="rounded-xl px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm">
              <option value="todas">✨ Estilo</option>
              <option value="creativo">🎨 Creativo</option>
              <option value="divertido">😄 Divertido</option>
              <option value="épico">🏞️ Épico</option>
              <option value="nocturno">🌙 Nocturno</option>
              <option value="perspectiva">📐 Perspectiva</option>
              <option value="reflejo">🪞 Reflejo</option>
              <option value="documental">📸 Documental</option>
            </select>
            <select value={time} onChange={e => setTime(e.target.value as any)} className="rounded-xl px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm">
              <option value="todas">🕒 Cualquier hora</option>
              <option value="mañana">🌤 Mañana</option>
              <option value="tarde">🌇 Tarde</option>
              <option value="noche">🌃 Noche</option>
              <option value="cualquier">⏱ Cualquiera</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {data.map(it => (
          <Card key={it.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <MapPin size={14} /> {it.place} — {it.city}
                </div>
                <h3 className="text-base font-semibold leading-tight mt-0.5">{it.idea}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => done.toggle(it.id)} className={`p-2 rounded-lg border ${done.has(it.id) ? "border-emerald-400" : "border-zinc-200 dark:border-zinc-700"}`} aria-label="Hecha">
                  <CheckCircle size={18} className={done.has(it.id) ? "text-emerald-500" : "text-zinc-500"} />
                </button>
                <button onClick={() => fav.toggle(it.id)} className={`p-2 rounded-lg border ${fav.has(it.id) ? "border-rose-400" : "border-zinc-200 dark:border-zinc-700"}`} aria-label="Favorito">
                  <Heart size={18} className={fav.has(it.id) ? "text-rose-500" : "text-zinc-500"} />
                </button>
              </div>
            </div>

            <div className="mt-2 text-sm">
              <div className="mb-1"><span className="text-zinc-500 dark:text-zinc-400">Cómo:</span> {it.how}</div>
              {it.tips && <div className="text-zinc-500 dark:text-zinc-400">Tips: {it.tips}</div>}
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {it.vibe.map(v => <Badge key={v}>#{v}</Badge>)}
              {it.who.map(w => <Badge key={w}>{w === "solo" ? "🧍" : w === "pareja" ? "💑" : "👨‍👩‍👧‍👦"} {w}</Badge>)}
              <Badge>{it.time === "noche" ? <Moon size={12}/> : it.time === "mañana" ? <Sun size={12}/> : "⏱"} {it.time || "cualquier"}</Badge>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => openMap(it)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1">
                <MapPin size={14}/> Mapa
              </button>
              <button onClick={() => share(it)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1">
                <Camera size={14}/> Compartir
              </button>
            </div>
          </Card>
        ))}

        {!data.length && (
          <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-10">
            Sin resultados. Prueba a cambiar filtros o busca por otra palabra 🔎
          </div>
        )}
      </div>
    </div>
  );
}
