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

  // estado de "Comido ✅" por usuario
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

  // ✅ Comido en lugares suma/resta puntos
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
  // PLATOS (catálogo con filtros + puntos al marcar "Lo probé")
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
    "Todas", "arroz", "noodles", "sopas", "plancha", "frito",
    "street", "caliente", "frío", "carne", "mar", "dulce",
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

  // ✅ Lo probé en platos suma/resta puntos
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

        {/* Nombre del jugador */}
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="opacity-70">Jugador:</span>
          <input
            value={name}
            onChange={(e) => { 
              setName(e.target.value); 
              localStorage.setItem(NAME_KEY, e.target.value); 
            }}
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
          {/* ... mismo código ... */}
          {/* Lista de lugares */}
          {/* ... mismo código ... */}
        </>
      )}

      {/* PLATOS */}
      {subtab === "platos" && (
        <>
          {/* Filtros platos */}
          {/* ... mismo código ... */}
          {/* Lista de platos */}
          {/* ... mismo código ... */}
        </>
      )}
    </div>
  );
}
