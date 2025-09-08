import React, { useEffect, useMemo, useState } from "react";
import { Heart, ThumbsUp, MapPin, Search, CheckCircle } from "lucide-react";

import { GASTRO_PLACES, GastroPlace, PriceLevel } from "../data/gastro";
import GastroMustEat from "./GastroMustEat";
import { getDeviceId } from "../lib/device";

import { DISHES, Dish } from "../data/dishes";

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDoc,
  writeBatch,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../lib/firebase";

type Props = { tripId: string; className?: string };

type Counts = { votes: number; favs: number; myVote: boolean; myFav: boolean };

const NAME_KEY = "notes_name";

function priceLabel(p: PriceLevel) {
  return "€".repeat(p);
}
function areasByCity(city: string) {
  return Array.from(
    new Set(GASTRO_PLACES.filter((p) => p.city === city).map((p) => p.area))
  ).sort();
}
function pickSurprise(
  places: (GastroPlace & { counts?: Counts })[],
  seedStr: string
) {
  if (places.length === 0) return null;
  const seed = [...seedStr].reduce((a, c) => a + c.charCodeAt(0), 0);
  const weighted: GastroPlace[] = [];
  places.forEach((p) => {
    const w = (p.counts?.votes ?? 0) + 1;
    for (let i = 0; i < w; i++) weighted.push(p);
  });
  const idx = seed % weighted.length;
  return weighted[idx];
}

type Subtab = "lugares" | "imprescindibles" | "platos";

export default function Gastro({ tripId, className }: Props) {
  const deviceId = useMemo(() => getDeviceId(), []);
  const todaySeed = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
  const [subtab, setSubtab] = useState<Subtab>("lugares");
  const [name, setName] = useState<string>(() => localStorage.getItem(NAME_KEY) || "Invitado");

  // ────────────────────────────────────────────────────────────────────────────
  // LUGARES (votos, favs, filtros por ciudad/barrio/precio/sin reserva)
  // ────────────────────────────────────────────────────────────────────────────
  const [city, setCity] = useState<"Osaka" | "Kyoto" | "Tokyo">("Osaka");
  const [area, setArea] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [price, setPrice] = useState<PriceLevel | 0>(0);
  const [onlyNoResv, setOnlyNoResv] = useState<boolean>(false);
  const [counts, setCounts] = useState<Record<string, Counts>>({});
  const [placeChecked, setPlaceChecked] = useState<Record<string, boolean>>({});

  // snapshots de votos/favs
  useEffect(() => {
    if (subtab !== "lugares") return;
    const unsubs: Array<() => void> = [];
    const placesInCity = GASTRO_PLACES.filter((p) => p.city === city);

    placesInCity.forEach((p) => {
      const votesRef = collection(db, "trips", tripId, "gastro", p.id, "votes");
      const favsRef = collection(db, "trips", tripId, "gastro", p.id, "favs");

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
          },
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
          },
        }));
      });

      unsubs.push(u1, u2);
    });

    return () => unsubs.forEach((u) => u());
  }, [tripId, city, deviceId, subtab]);

  // estado de "Comido ✅" por usuario para la lista filtrada
  const filteredPlaces = useMemo(() => {
    const byCity = GASTRO_PLACES.filter((p) => p.city === city);
    return byCity.filter((p) => {
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

  useEffect(() => {
    if (subtab !== "lugares") return;
    let cancelled = false;
    (async () => {
      const map: Record<string, boolean> = {};
      for (const p of filteredPlaces) {
        const ref = doc(db, "trips", tripId, "game_places", p.id, "checks", deviceId);
        const snap = await getDoc(ref);
        if (cancelled) return;
        map[p.id] = snap.exists();
      }
      setPlaceChecked(map);
    })();
    return () => { cancelled = true; };
  }, [filteredPlaces, subtab, tripId, deviceId]);

  const surprise = useMemo(
    () =>
      pickSurprise(
        filteredPlaces.map((p) => ({ ...p, counts: counts[p.id] })),
        todaySeed
      ),
    [filteredPlaces, counts, todaySeed]
  );

  async function toggleVote(p: GastroPlace) {
    const ref = doc(db, "trips", tripId, "gastro", p.id, "votes", deviceId);
    const mine = counts[p.id]?.myVote;
    try {
      mine ? await deleteDoc(ref) : await setDoc(ref, { at: Date.now() });
    } catch (e) {
      console.error("vote error", e);
    }
  }
  async function toggleFav(p: GastroPlace) {
    const ref = doc(db, "trips", tripId, "gastro", p.id, "favs", deviceId);
    const mine = counts[p.id]?.myFav;
    try {
      mine ? await deleteDoc(ref) : await setDoc(ref, { at: Date.now() });
    } catch (e) {
      console.error("fav error", e);
    }
  }

  async function togglePlaceCheck(p: GastroPlace) {
    const checkRef = doc(db, "trips", tripId, "game_places", p.id, "checks", deviceId);
    const scoreRef = doc(db, "trips", tripId, "game", "scores", deviceId);
    const snap = await getDoc(checkRef);
    const batch = writeBatch(db);
    if (snap.exists()) {
      batch.delete(checkRef);
      batch.set(scoreRef, { name, points: increment(-1) }, { merge: true });
      setPlaceChecked((m) => ({ ...m, [p.id]: false }));
    } else {
      batch.set(checkRef, { at: serverTimestamp(), name }, { merge: true });
      batch.set(scoreRef, { name, points: increment(1) }, { merge: true });
      setPlaceChecked((m) => ({ ...m, [p.id]: true }));
    }
    await batch.commit();
  }

  const cities: Array<"Osaka" | "Kyoto" | "Tokyo"> = ["Osaka", "Kyoto", "Tokyo"];
  const areas = useMemo(() => ["", ...areasByCity(city)], [city]);

  // ────────────────────────────────────────────────────────────────────────────
  // PLATOS (catálogo con filtros: búsqueda, ciudad/región, categoría, GF/LF)
  // ────────────────────────────────────────────────────────────────────────────
  const [qDish, setQDish] = useState("");
  const [cityDish, setCityDish] = useState<string>("Todas");
  const [cat, setCat] = useState<string>("Todas");
  const [onlyGFDish, setOnlyGFDish] = useState(false);
  const [onlyLFDish, setOnlyLFDish] = useState(false);
  const [dishChecked, setDishChecked] = useState<Record<string, boolean>>({});

  const dishCities = useMemo(() => {
    const set = new Set<string>();
    DISHES.forEach((d) => (d.regions || []).forEach((r) => set.add(r)));
    return ["Todas", ...Array.from(set).sort()];
  }, []);
  const dishCats = [
    "Todas",
    "arroz",
    "noodles",
    "sopas",
    "plancha",
    "frito",
    "street",
    "caliente",
    "frío",
    "carne",
    "mar",
    "dulce",
  ];

  const filteredDishes = useMemo(() => {
    const t = (s: string) => s.toLowerCase();
    return DISHES.filter((d) => {
      const okQ =
        !qDish ||
        (d.name + " " + (d.jp || "") + " " + d.description).toLowerCase().includes(t(qDish));
      const okCity = cityDish === "Todas" || (d.regions || []).includes(cityDish);
      const okCat = cat === "Todas" || d.category === (cat as Dish["category"]);
      const glutenFlag = d.contains?.gluten === true;
      const dairyFlag = d.contains?.dairy === true;
      const okGF = !onlyGFDish || d.gfPossible || !glutenFlag;
      const okLF = !onlyLFDish || d.lfPossible || !dairyFlag;
      return okQ && okCity && okCat && okGF && okLF;
    });
  }, [qDish, cityDish, cat, onlyGFDish, onlyLFDish]);

  useEffect(() => {
    if (subtab !== "platos") return;
    let cancelled = false;
    (async () => {
      const map: Record<string, boolean> = {};
      for (const d of filteredDishes) {
        const ref = doc(db, "trips", tripId, "game_dishes", d.id, "checks", deviceId);
        const snap = await getDoc(ref);
        if (cancelled) return;
        map[d.id] = snap.exists();
      }
      setDishChecked(map);
    })();
    return () => { cancelled = true; };
  }, [filteredDishes, subtab, tripId, deviceId]);

  async function toggleDishCheck(d: Dish) {
    const checkRef = doc(db, "trips", tripId, "game_dishes", d.id, "checks", deviceId);
    const scoreRef = doc(db, "trips", tripId, "game", "scores", deviceId);
    const snap = await getDoc(checkRef);
    const batch = writeBatch(db);
    if (snap.exists()) {
      batch.delete(checkRef);
      batch.set(scoreRef, { name, points: increment(-1) }, { merge: true });
      setDishChecked((m) => ({ ...m, [d.id]: false }));
    } else {
      batch.set(checkRef, { at: serverTimestamp(), name }, { merge: true });
      batch.set(scoreRef, { name, points: increment(1) }, { merge: true });
      setDishChecked((m) => ({ ...m, [d.id]: true }));
    }
    await batch.commit();
  }

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Subpestañas */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSubtab("lugares")}
          className={`text-sm px-3 py-1.5 rounded-lg border ${
            subtab === "lugares"
              ? "border-zinc-900 dark:border-zinc-100"
              : "border-zinc-200 dark:border-zinc-700"
          } hover:bg-zinc-100 dark:hover:bg-zinc-800`}
        >
          📍 Lugares
        </button>
        <button
          onClick={() => setSubtab("imprescindibles")}
          className={`text-sm px-3 py-1.5 rounded-lg border ${
            subtab === "imprescindibles"
              ? "border-zinc-900 dark:border-zinc-100"
              : "border-zinc-200 dark:border-zinc-700"
          } hover:bg-zinc-100 dark:hover:bg-zinc-800`}
        >
          ⭐ Imprescindibles
        </button>
        <button
          onClick={() => setSubtab("platos")}
          className={`text-sm px-3 py-1.5 rounded-lg border ${
            subtab === "platos"
              ? "border-zinc-900 dark:border-zinc-100"
              : "border-zinc-200 dark:border-zinc-700"
          } hover:bg-zinc-100 dark:hover:bg-zinc-800`}
        >
          🍱 Platos
        </button>

        {/* Nombre del jugador (rápido, reutiliza el de notas) */}
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="opacity-70">Jugador:</span>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); localStorage.setItem(NAME_KEY, e.target.value); }}
            className="rounded-lg px-2 py-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            placeholder="Tu nombre"
          />
        </div>
      </div>

      {/* IMPRESCINDIBLES */}
      {subtab === "imprescindibles" && <GastroMustEat tripId={tripId} />}

      {/* LUGARES */}
      {subtab === "lugares" && (
        <>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <select
              className="rounded-xl bg-black/30 px-3 py-2 text-sm"
              value={city}
              onChange={(e) => {
                setCity(e.target.value as any);
                setArea("");
              }}
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl bg-black/30 px-3 py-2 text-sm"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a || "Todos los barrios"}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl bg-black/30 px-3 py-2 text-sm"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) as PriceLevel | 0)}
            >
              <option value={0}>Precio: todos</option>
              <option value={1}>€</option>
              <option value={2}>€€</option>
              <option value={3}>€€€</option>
              <option value={4}>€€€€</option>
            </select>

            <label className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={onlyNoResv}
                onChange={(e) => setOnlyNoResv(e.target.checked)}
              />
              Sin reserva
            </label>

            <div className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-sm">
              <Search size={16} />
              <input
                className="bg-transparent flex-1 outline-none"
                value={q}
                onChange={(e) => setQ(e.target.value)}
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
                    {surprise.city} • {surprise.area} • {surprise.cuisine} •{" "}
                    {priceLabel(surprise.price)}
                  </div>
                </div>
                <a
                  className="rounded-xl bg-white text-black px-3 py-2 text-sm font-semibold"
                  href={surprise.gmaps}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={16} /> Abrir en Maps
                  </span>
                </a>
              </div>
            </div>
          )}

          {/* Lista de lugares */}
          <div className="space-y-3">
            {filteredPlaces.map((p) => {
              const c = counts[p.id];
              const checked = !!placeChecked[p.id];
              return (
                <div key={p.id} className="rounded-2xl bg-white/5 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-white/60">
                        {p.city} • {p.area} • {p.cuisine} • {priceLabel(p.price)}{" "}
                        {p.noReservation ? "• sin reserva" : ""}
                        {p.tags?.length ? ` • ${p.tags.join(", ")}` : ""}
                      </div>
                      {p.hours && (
                        <div className="text-xs text-white/50 mt-1">🕒 {p.hours}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleVote(p)}
                        className={`rounded-full px-3 py-1 text-sm flex items-center gap-1 ${
                          c?.myVote ? "bg-white text-black" : "bg-white/10"
                        }`}
                        title="Votar"
                      >
                        <ThumbsUp size={14} /> {c?.votes ?? 0}
                      </button>
                      <button
                        onClick={() => toggleFav(p)}
                        className={`rounded-full px-3 py-1 text-sm flex items-center gap-1 ${
                          c?.myFav ? "bg-white text-black" : "bg-white/10"
                        }`}
                        title="Favorito"
                      >
                        <Heart size={14} /> {c?.favs ?? 0}
                      </button>
                      <a
                        className="rounded-full px-3 py-1 text-sm bg-white text-black flex items-center gap-1"
                        href={p.gmaps}
                        target="_blank"
                        rel="noreferrer"
                        title="Abrir en Google Maps"
                      >
                        <MapPin size={14} /> Mapa
                      </a>
                      <button
                        onClick={() => togglePlaceCheck(p)}
                        className={`rounded-full px-3 py-1 text-sm flex items-center gap-1 ${
                          checked ? "bg-emerald-400 text-black" : "bg-white/10"
                        }`}
                        title="Marcar comido"
                      >
                        <CheckCircle size={14} /> {checked ? "Comido" : "Marcar"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPlaces.length === 0 && (
              <div className="text-sm text-white/60">Sin resultados con esos filtros.</div>
            )}
          </div>
        </>
      )}

      {/* PLATOS */}
      {subtab === "platos" && (
        <>
          {/* Filtros platos */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                value={qDish}
                onChange={(e) => setQDish(e.target.value)}
                placeholder="Buscar plato…"
                className="w-full rounded-xl pl-9 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
              />
            </div>
            <select
              value={cityDish}
              onChange={(e) => setCityDish(e.target.value)}
              className="rounded-xl px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
            >
              {dishCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="rounded-xl px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
            >
              {dishCats.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="text-xs inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyGFDish}
                onChange={() => setOnlyGFDish((v) => !v)}
              />{" "}
              GF
            </label>
            <label className="text-xs inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyLFDish}
                onChange={() => setOnlyLFDish((v) => !v)}
              />{" "}
              SL
            </label>
          </div>

          {/* Lista de platos */}
          <ul className="space-y-3">
            {filteredDishes.map((d) => {
              const checked = !!dishChecked[d.id];
              return (
                <li
                  key={d.id}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {(d.regions || []).join(" · ") || "—"}
                      </div>
                      <h3 className="text-base font-semibold leading-tight">
                        {d.name}
                        {d.jp ? (
                          <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                            {d.jp}
                          </span>
                        ) : null}
                      </h3>
                    </div>
                    <span className="text-[11px] px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      {d.category}
                    </span>
                  </div>

                  <p className="mt-1 text-sm">{d.description}</p>

                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    {d.contains?.gluten && (
                      <span className="px-2 py-1 rounded-lg bg-rose-100/60 dark:bg-rose-900/30 border border-rose-300/60">
                        gluten
                      </span>
                    )}
                    {d.contains?.dairy && (
                      <span className="px-2 py-1 rounded-lg bg-amber-100/60 dark:bg-amber-900/30 border border-amber-300/60">
                        lácteos
                      </span>
                    )}
                    {d.contains?.soy && (
                      <span className="px-2 py-1 rounded-lg bg-sky-100/60 dark:bg-sky-900/30 border border-sky-300/60">
                        soja
                      </span>
                    )}
                    {d.contains?.egg && (
                      <span className="px-2 py-1 rounded-lg bg-yellow-100/60 dark:bg-yellow-900/30 border border-yellow-300/60">
                        huevo
                      </span>
                    )}
                    {d.contains?.fish && (
                      <span className="px-2 py-1 rounded-lg bg-teal-100/60 dark:bg-teal-900/30 border border-teal-300/60">
                        pescado
                      </span>
                    )}
                    {d.contains?.shellfish && (
                      <span className="px-2 py-1 rounded-lg bg-purple-100/60 dark:bg-purple-900/30 border border-purple-300/60">
                        marisco
                      </span>
                    )}
                    {d.gfPossible && (
                      <span className="px-2 py-1 rounded-lg border border-emerald-300/70 bg-emerald-100/50 dark:bg-emerald-900/30">
                        GF posible
                      </span>
                    )}
                    {d.lfPossible && (
                      <span className="px-2 py-1 rounded-lg border border-emerald-300/70 bg-emerald-100/50 dark:bg-emerald-900/30">
                        Sin lácteos
                      </span>
                    )}
                  </div>

                  {d.tips && (
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      💡 {d.tips}
                    </div>
                  )}

                  <div className="mt-3">
                    <button
                      onClick={() => toggleDishCheck(d)}
                      className={`rounded-full px-3 py-1 text-sm inline-flex items-center gap-1 ${
                        checked ? "bg-emerald-400 text-black" : "bg-white/10"
                      }`}
                      title="Marcar probado"
                    >
                      <CheckCircle size={14} /> {checked ? "Lo probé" : "Marcar 'lo probé'"}
                    </button>
                  </div>
                </li>
              );
            })}

            {!filteredDishes.length && (
              <li className="p-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No hay resultados con esos filtros.
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
