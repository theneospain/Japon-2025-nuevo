// src/components/Gastro.tsx
import React, { useEffect, useMemo, useState } from "react";
import { GASTRO_PLACES, GastroPlace, PriceLevel } from "../data/gastro";
import { getDeviceId } from "../lib/device";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Heart, ThumbsUp, MapPin, Search } from "lucide-react";

type Props = { tripId: string; className?: string };

type Counts = { votes: number; favs: number; myVote: boolean; myFav: boolean };

// util: precio a €€
function priceLabel(p: PriceLevel) {
  return "€".repeat(p);
}

// util: barrios por ciudad (derivado de data)
function areasByCity(city: string) {
  return Array.from(
    new Set(GASTRO_PLACES.filter(p => p.city === city).map(p => p.area))
  ).sort();
}

// util: sorpresa del día (determinística por fecha y ponderada por votos)
function pickSurprise(places: (GastroPlace & { counts?: Counts })[], seedStr: string) {
  if (places.length === 0) return null;
  const seed = [...seedStr].reduce((a,c)=>a+c.charCodeAt(0),0);
  // peso = votos + 1 (para no dejar a cero)
  const weighted: GastroPlace[] = [];
  places.forEach(p => {
    const w = (p.counts?.votes ?? 0) + 1;
    for (let i=0;i<w;i++) weighted.push(p);
  });
  const idx = seed % weighted.length;
  return weighted[idx];
}

export default function Gastro({ tripId, className }: Props) {
  const deviceId = useMemo(() => getDeviceId(), []);
  const todaySeed = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
  const [city, setCity] = useState<"Osaka"|"Kyoto"|"Tokyo">("Osaka");
  const [area, setArea] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [price, setPrice] = useState<PriceLevel | 0>(0); // 0 = todos
  const [onlyNoResv, setOnlyNoResv] = useState<boolean>(false);

  // Conteos por placeId (votos/favs y si yo voté/faveé)
  const [counts, setCounts] = useState<Record<string, Counts>>({});

  // snapshot de votos/favs por place (simple y suficiente para dataset pequeño)
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    const placesInCity = GASTRO_PLACES.filter(p => p.city === city);
    placesInCity.forEach((p) => {
      const votesRef = collection(db, "trips", tripId, "gastro", p.id, "votes");
      const favsRef  = collection(db, "trips", tripId, "gastro", p.id, "favs");

      const u1 = onSnapshot(votesRef, (snap) => {
        const voters = new Set<string>();
        snap.forEach((d) => voters.add(d.id));
        setCounts((c) => ({
          ...c,
          [p.id]: {
            votes: voters.size,
            favs: c[p.id]?.favs ?? 0,
            myVote: voters.has(deviceId),
            myFav: c[p.id]?.myFav ?? false,
          }
        }));
      });

      const u2 = onSnapshot(favsRef, (snap) => {
        const favvers = new Set<string>();
        snap.forEach((d) => favvers.add(d.id));
        setCounts((c) => ({
          ...c,
          [p.id]: {
            votes: c[p.id]?.votes ?? 0,
            favs: favvers.size,
            myVote: c[p.id]?.myVote ?? false,
            myFav: favvers.has(deviceId),
          }
        }));
      });

      unsubs.push(u1, u2);
    });

    return () => unsubs.forEach((u) => u());
  }, [tripId, city, deviceId]);

  // lista filtrada
  const filtered = useMemo(() => {
    const byCity = GASTRO_PLACES.filter(p => p.city === city);
    return byCity.filter(p => {
      if (area && p.area !== area) return false;
      if (price && p.price !== price) return false;
      if (onlyNoResv && !p.noReservation) return false;
      if (q) {
        const hay = `${p.name} ${p.area} ${p.cuisine} ${p.tags?.join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [city, area, price, onlyNoResv, q]);

  const surprise = useMemo(
    () => pickSurprise(filtered.map(p => ({...p, counts: counts[p.id]})), todaySeed),
    [filtered, counts, todaySeed]
  );

  async function toggleVote(p: GastroPlace) {
    const ref = doc(db, "trips", tripId, "gastro", p.id, "votes", deviceId);
    const mine = counts[p.id]?.myVote;
    try {
      if (mine) await deleteDoc(ref);
      else await setDoc(ref, { at: Date.now() });
    } catch (e) { console.error("vote error", e); }
  }

  async function toggleFav(p: GastroPlace) {
    const ref = doc(db, "trips", tripId, "gastro", p.id, "favs", deviceId);
    const mine = counts[p.id]?.myFav;
    try {
      if (mine) await deleteDoc(ref);
      else await setDoc(ref, { at: Date.now() });
    } catch (e) { console.error("fav error", e); }
  }

  const cities: Array<"Osaka"|"Kyoto"|"Tokyo"> = ["Osaka","Kyoto","Tokyo"];
  const areas = useMemo(() => ["", ...areasByCity(city)], [city]);

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <select
          className="rounded-xl bg-black/30 px-3 py-2 text-sm"
          value={city}
          onChange={(e)=>{ setCity(e.target.value as any); setArea(""); }}
        >
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="rounded-xl bg-black/30 px-3 py-2 text-sm"
          value={area}
          onChange={(e)=>setArea(e.target.value)}
        >
          {areas.map(a => <option key={a} value={a}>{a || "Todos los barrios"}</option>)}
        </select>

        <select
          className="rounded-xl bg-black/30 px-3 py-2 text-sm"
          value={price}
          onChange={(e)=>setPrice(Number(e.target.value) as PriceLevel | 0)}
        >
          <option value={0}>Precio: todos</option>
          <option value={1}>€</option>
          <option value={2}>€€</option>
          <option value={3}>€€€</option>
          <option value={4}>€€€€</option>
        </select>

        <label className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-sm cursor-pointer">
          <input type="checkbox" checked={onlyNoResv} onChange={(e)=>setOnlyNoResv(e.target.checked)} />
          Sin reserva
        </label>

        <div className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-sm">
          <Search size={16} />
          <input
            className="bg-transparent flex-1 outline-none"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Buscar (ramen, sushi, vegan...)"
          />
        </div>
      </div>

      {/* Sorpresa del día */}
      {surprise && (
        <div className="rounded-2xl border border-white/10 p-3">
          <div className="text-xs text-white/60 mb-1">🎲 Sorpresa del día</div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-lg font-semibold">{surprise.name}</div>
              <div className="text-sm text-white/60">
                {surprise.city} • {surprise.area} • {surprise.cuisine} • {priceLabel(surprise.price)}
              </div>
            </div>
            <a
              className="rounded-xl bg-white text-black px-3 py-2 text-sm font-semibold"
              href={surprise.gmaps}
              target="_blank" rel="noreferrer"
            >
              <span className="inline-flex items-center gap-1"><MapPin size={16}/> Abrir en Maps</span>
            </a>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const c = counts[p.id];
          return (
            <div key={p.id} className="rounded-2xl bg-white/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-white/60">
                    {p.city} • {p.area} • {p.cuisine} • {priceLabel(p.price)} {p.noReservation ? "• sin reserva" : ""}
                    {p.tags?.length ? ` • ${p.tags.join(", ")}` : ""}
                  </div>
                  {p.hours && <div className="text-xs text-white/50 mt-1">🕒 {p.hours}</div>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={()=>toggleVote(p)}
                    className={`rounded-full px-3 py-1 text-sm flex items-center gap-1 ${c?.myVote ? "bg-white text-black" : "bg-white/10"}`}
                    title="Votar"
                  >
                    <ThumbsUp size={14}/> {c?.votes ?? 0}
                  </button>
                  <button
                    onClick={()=>toggleFav(p)}
                    className={`rounded-full px-3 py-1 text-sm flex items-center gap-1 ${c?.myFav ? "bg-white text-black" : "bg-white/10"}`}
                    title="Favorito"
                  >
                    <Heart size={14}/> {c?.favs ?? 0}
                  </button>
                  <a
                    className="rounded-full px-3 py-1 text-sm bg-white text-black flex items-center gap-1"
                    href={p.gmaps} target="_blank" rel="noreferrer" title="Abrir en Google Maps"
                  >
                    <MapPin size={14}/> Mapa
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-sm text-white/60">Sin resultados con esos filtros.</div>
        )}
      </div>
    </div>
  );
}
