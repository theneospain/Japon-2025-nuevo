import React, { useEffect, useMemo, useState } from "react"; 
import {
  CalendarRange,
  Info,
  MapPin,
  Wallet,
  Sun,
  Moon,
  CheckCircle,
  ChevronDown,
  Heart,
  Star,
  Utensils,
  Share2,
  Calculator,
  Users,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Map,
  Train,
  Languages,
  Wifi,
  Download,
  ListChecks,
  Shuffle,
  BookOpen,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import PhotoGallery from "./components/PhotoGallery";
import MapDayButton from "./components/MapDayButton";
import NotesLite from "./components/NotesLite";
import { makeBlockId } from "./utils/slug";
import Gastro from "./components/Gastro";
import { Camera /* …ya tienes más iconos aquí */ } from "lucide-react";
import PhotoIdeas from "./components/PhotoIdeas";
import Game from "./components/Game";
import { Trophy } from "lucide-react";
import BottomNav from "./components/BottomNav";
import CurrencyConverter from "./components/CurrencyConverter";





// ──────────────────────────────────────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────────────────────────────────────
function lines(...xs: Array<string | undefined | null | false>) {
  return xs.filter(Boolean).join("\n");
}
function formatEUR(n: number) {
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n || 0);
  } catch {
    return `${(n || 0).toFixed(2)} €`;
  }
}

const TABS = [
  { key: "itinerary", label: "Itinerario", icon: CalendarRange, emoji: "🗓️" },
  { key: "info", label: "Info práctica", icon: Info, emoji: "ℹ️" },
  { key: "places", label: "Lugares", icon: MapPin, emoji: "📍" },
  { key: "expenses", label: "Gastos", icon: Wallet, emoji: "💶" },
  { key: "gastro", label: "Gastronomía", icon: Utensils, emoji: "🍣" },
  { key: "photo", label: "Ideas foto", icon: Camera, emoji: "📷" },
  { key: "game", label: "Ranking", icon: Trophy, emoji: "🏆" },
] as const;


type TabKey = typeof TABS[number]["key"];

function useTheme() {
  const getInitial = () => {
    if (typeof window === "undefined") return "light" as const;
    const saved = localStorage.getItem("jp_theme");
    if (saved === "light" || saved === "dark") return saved as "light" | "dark";
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };
  const [theme, setTheme] = useState<"light" | "dark">(getInitial);
  useEffect(() => {
    try {
      localStorage.setItem("jp_theme", theme);
    } catch {}
  }, [theme]);
  return { theme, setTheme } as const;
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 shadow-sm
                    bg-white border border-zinc-200
                    dark:bg-[var(--card-bg)] dark:border-[var(--card-border)]">
      <div className="mb-2">
        <h3 className="text-[17px] font-semibold leading-tight">{title}</h3>
        {subtitle && <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Bloque 1: Meta del viaje
// ──────────────────────────────────────────────────────────────────────────────
function TripMeta() {
  const start = useMemo(() => new Date(2025, 9, 20), []); // 20 oct 2025
  const end   = useMemo(() => new Date(2025, 10, 4), []); // 4 nov 2025
  const today = new Date();

  const days    = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
  const elapsed = today < start ? 0 : today > end ? days : Math.min(days, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
  const progress = Math.round((elapsed / days) * 100);
  const status = today < start
    ? `Comienza en ${Math.ceil((start.getTime() - today.getTime()) / 86400000)} días`
    : today > end
      ? "Viaje finalizado"
      : "¡Viaje en curso!";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-300">
        <span>20 oct → 4 nov 2025</span>
        <span>Grupo: 11 personas</span>
      </div>
      <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-300">Progreso</span>
        <span className="font-medium">{progress}% · {status}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Bloque 2: Itinerario con checks
// ──────────────────────────────────────────────────────────────────────────────
type Activity = { time?: string | null; text: string };
type DayPlan  = { date: string; city: string; emoji?: string; activities: Activity[] };

const ITINERARY: DayPlan[] = [
  { date: "2025-10-20", city: "Vuelos a Japón", emoji: "✈️", activities: [
    { time: "09:30–17:40", text: "Vuelo Madrid → Doha" },
    { time: "20:25–12:55 (+1)", text: "Vuelo Doha → Tokio (NRT)" },
  ]},
  { date: "2025-10-21", city: "Llegada y Osaka (5 noches)", emoji: "🇯🇵", activities: [
    { time: "12:55", text: "Llegada a Narita (NRT)" },
    { time: "14:00–17:00", text: "Shinkansen a Osaka" },
    { time: null, text: "Check-in hotel Osaka" },
    { time: "Tarde/Noche", text: "Namba, Den-Den Town, Dotonbori, Kuromon, Glico, Don Quijote, Namba Yasaka, Shinsaibashi, Karaoke" },
  ]},
  { date: "2025-10-22", city: "Osaka", emoji: "🏯", activities: [
    { text: "Castillo de Osaka" },{ text: "Umeda Sky" },{ text: "Acuario Kaiyukan" },{ text: "Templo Shitennoji" },{ text: "Isshinji" },{ text: "Sumiyoshi Taisha" }
  ]},
  { date: "2025-10-23", city: "Universal + Shinsekai", emoji: "🎢", activities: [{ text: "Universal Studios Japan" },{ text: "Shinsekai (Tsutenkaku)" }]},
  { date: "2025-10-24", city: "Hiroshima + Miyajima", emoji: "⛩️", activities: [{ text: "Excursión a Hiroshima" },{ text: "Miyajima (torii flotante)" }]},
  { date: "2025-10-25", city: "Nara", emoji: "🦌", activities: [{ text: "Templo Todai-ji" },{ text: "Parque de ciervos" },{ text: "Kasuga Taisha" }]},
  { date: "2025-10-26", city: "Traslado a Kioto (3 noches)", emoji: "🚄", activities: [{ text: "Osaka → Kioto" },{ time:"Tarde", text: "Castillo de Nijo" },{ text: "Kyoto Tower" }]},
  { date: "2025-10-27", city: "Kioto", emoji: "⛩️", activities: [{ text: "Fushimi Inari" },{ text: "Sannenzaka & Ninenzaka" },{ text: "Kinkaku-ji" },{ text: "Heian" },{ text: "Gion y Pontocho" }]},
  { date: "2025-10-28", city: "Arashiyama + opciones", emoji: "🎋", activities: [{ text: "Bosque de bambú" },{ text: "Otagi Nenbutsu-ji" },{ text: "Opcional: Ginkaku-ji / Kiyomizudera / Ryoan-ji / Kibune" }]},
  { date: "2025-10-29", city: "Traslado a Tokio (6 noches)", emoji: "🚄", activities: [{ text: "Kioto → Tokio" },{ text: "Opcional: Shirakawa-go" },{ text: "Godzilla Shinjuku" },{ text: "Mirador Gobierno Metropolitano" },{ text: "Kabukicho, Cruce Shibuya, Hachiko" }]},
  { date: "2025-10-30", city: "Harajuku + Akihabara + Kart", emoji: "🎮", activities: [{ text: "Harajuku (Takeshita)" },{ text: "Akihabara (maid café, figuras)" },{ time:"Noche", text: "Kart (con PIC)" }]},
  { date: "2025-10-31", city: "Hakone (Monte Fuji)", emoji: "🗻", activities: [{ text: "Hakone" },{ text: "Teleférico Owakudani" },{ text: "Vistas del Fuji (si clima)" }]},
  { date: "2025-11-01", city: "Asakusa + Roppongi + Tokyo Tower", emoji: "🏮", activities: [{ text: "Asakusa (Sensō-ji + Nakamise)" },{ text: "Roppongi" },{ text: "Tokyo Tower" }]},
  { date: "2025-11-02", city: "Parques / Nikkō / Kasukabe", emoji: "🎢", activities: [{ text: "Disneyland / DisneySea" },{ text: "Nikkō" },{ text: "Kasukabe" }]},
  { date: "2025-11-03", city: "Meiji + Ginza + Odaiba", emoji: "🛍️", activities: [{ text: "Santuario Meiji" },{ text: "Ginza (sushi)" },{ text: "Shiodome → Yurikamome a Odaiba" },{ text: "Rainbow Bridge, Gundam, barco Sumida" }]},
  { date: "2025-11-04", city: "Tokio (libre) + Vuelo", emoji: "🧳", activities: [{ time:"Mañana", text: "Libre (TeamLab o compras)" },{ time:"21:55–04:40 (+1)", text: "Vuelo Tokio → Doha" }]},
];

function DayHeader({ dateISO, city, emoji, isToday, isPast }: { dateISO: string; city: string; emoji?: string; isToday: boolean; isPast: boolean }) {
  const d  = new Date(dateISO + "T00:00:00");
  const df = d.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short" });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isPast ? "bg-zinc-100 dark:bg-zinc-800" : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"}`}>{emoji ?? "📅"}</div>
        <div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">{df}</div>
          <h3 className="text-base font-semibold leading-tight">{city}</h3>
        </div>
      </div>
      {isToday && <span className="text-[11px] px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">HOY</span>}
    </div>
  );
}

function DayCard({
  day, done, toggle, setAll, clearAll, defaultOpen,
}: {
  day: DayPlan;
  done: Record<string, boolean>;
  toggle: (id: string) => void;
  setAll: () => void;
  clearAll: () => void;
  defaultOpen?: boolean;
}) {
  const d = new Date(day.date + "T00:00:00");
  const now = new Date();
  const isPast  = d < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isToday = d.toDateString() === new Date().toDateString();

  const [open, setOpen] = useState(!!defaultOpen);
  const total     = day.activities.length;
  const completed = day.activities.reduce((acc, _a, i) => acc + (done[`${day.date}-${i}`] ? 1 : 0), 0);
  const pct       = Math.round((completed / Math.max(1, total)) * 100);

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-zinc-200 dark:bg-zinc-800" />
      <div className="pl-10">
        <div className="relative mb-3">
          <div
            className={`absolute -left-[11px] top-2 w-5 h-5 rounded-full border-2 ${
              isToday
                ? "border-emerald-500"
                : isPast
                ? "border-zinc-400 dark:border-zinc-600"
                : "border-zinc-300 dark:border-zinc-700"
            } bg-white dark:bg-zinc-900`}
          />

          <SectionCard title="" subtitle="">
            <div className="space-y-3">
              <DayHeader
                dateISO={day.date}
                city={day.city}
                emoji={day.emoji}
                isToday={isToday}
                isPast={isPast}
              />

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>{completed}/{total} hechas</span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{pct}%</div>
              </div>

              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${pct}%` }} />
              </div>

              {/* Toolbar minimal: solo Ver actividades + Mapa del día */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setOpen(!open)}
                  className="text-[13px] sm:text-sm px-3 py-1.5 leading-tight rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1"
                >
                  <ChevronDown
                    size={16}
                    className={`${open ? "rotate-180" : ""} transition-transform`}
                  />
                  {open ? "Ocultar" : "Ver actividades"}
                </button>

                <div className="min-w-[130px] max-w-full">
                  <MapDayButton
                    day={day}
                    places={PLACES.map(p => ({ name: p.name, gmaps: p.links.gmaps }))}
                  />
                </div>
              </div>

              {open && (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                  {day.activities.map((a, i) => {
                    const id = `${day.date}-${i}`;
                    const checked = !!done[id];
                    return (
                      <li key={id} className="flex items-center gap-3 p-3 bg-white/60 dark:bg-zinc-900/40">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(id)}
                          className="w-5 h-5 rounded-md border-zinc-300 dark:border-zinc-700"
                        />
                        <div className="flex-1 text-sm">
                          {a.time && (
                            <span className="text-zinc-500 dark:text-zinc-400 mr-2">
                              {a.time}
                            </span>
                          )}
                          <span>{a.text}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Subir desde galería — versión compacta (solo ese botón) */}
            <div className="mt-2">
              <PhotoGallery
                placeId={`day-${day.date}`}
                placeName={`Fotos de ${day.city}`}
                compact
                showUrl={false}
                showAlbum={false}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}



function Itinerary() {
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("jp_done_v1") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem("jp_done_v1", JSON.stringify(done)); } catch {}
  }, [done]);

  // YYYY-MM-DD en horario local (evita desfases por UTC)
  const todayISO = useMemo(() => new Date().toLocaleDateString("en-CA"), []);

  return (
    <div className="space-y-4">
      <SectionCard title="Itinerario 🇯🇵" subtitle="20 oct → 4 nov 2025">
        <TripMeta />
      </SectionCard>

      <div className="space-y-6">
        {ITINERARY.map((day) => { // <- corregido
          const toggle = (id: string) =>
            setDone((d) => ({ ...d, [id]: !d[id] }));

          const setAll = () =>
            setDone((d0) => {
              const c = { ...d0 } as Record<string, boolean>;
              day.activities.forEach((_a, i) => { c[`${day.date}-${i}`] = true; });
              return c;
            });

          const clearAll = () =>
            setDone((d0) => {
              const c = { ...d0 } as Record<string, boolean>;
              day.activities.forEach((_a, i) => { delete c[`${day.date}-${i}`]; });
              return c;
            });

          const blockId = makeBlockId(day.date, day.city);

          return (
            <div key={blockId} className="space-y-3">
              <DayCard
                day={day}
                done={done}
                toggle={toggle}
                setAll={setAll}
                clearAll={clearAll}
                defaultOpen={day.date === todayISO}
              />

              {/* Panel de notas del día (key para remount limpio) */}
              <NotesLite
                key={blockId}
                tripId="japon-2025"
                blockId={blockId}
                className="mt-2"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}



// ──────────────────────────────────────────────────────────────────────────────
// Bloque 3: Info práctica
// ──────────────────────────────────────────────────────────────────────────────
function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const onCopy = async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); } catch {} };
  return (
    <button onClick={onCopy} className={`text-xs px-2.5 py-1.5 rounded-lg border ${ok ? "border-emerald-500 text-emerald-700 dark:text-emerald-300" : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"} hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1`}>
      <Copy size={14} />{ok ? "¡Copiado!" : label}
    </button>
  );
}

function ConverterCard() {
  const FIXED_RATE = 173; // Tasa fija
  const [eur, setEur] = useState<string>("1");   // guardamos como string
  const [jpy, setJpy] = useState<string>(() => String(FIXED_RATE));

  // actualizar yenes cuando cambia EUR
  useEffect(() => {
    if (eur === "") {
      setJpy("");
    } else {
      const n = Number(eur);
      if (!isNaN(n)) setJpy(String(Math.round(n * FIXED_RATE)));
    }
  }, [eur]);

  // actualizar euros cuando cambia JPY
  useEffect(() => {
    if (jpy === "") {
      setEur("");
    } else {
      const n = Number(jpy);
      if (!isNaN(n)) setEur((n / FIXED_RATE).toFixed(2));
    }
  }, [jpy]);

  return (
    <SectionCard title="Conversor EUR ↔ JPY" subtitle="Tasa fija · 1 € = 173 ¥">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Input Euros */}
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">Euros (€)</label>
            <input
              value={eur}
              onChange={(e) => setEur(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 
                         bg-white dark:bg-zinc-900 px-3 py-2"
            />
          </div>

          {/* Input Yenes */}
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">Yenes (¥)</label>
            <input
              value={jpy}
              onChange={(e) => setJpy(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 
                         bg-white dark:bg-zinc-900 px-3 py-2"
            />
          </div>
        </div>

        <CopyButton
          text={`${eur || "0"} € ≈ ${jpy || "0"} ¥ (tasa fija ${FIXED_RATE})`}
          label="Copiar resultado"
        />
      </div>
    </SectionCard>
  );
}


function EmergencyCard() {
  const items = [
    { label: "Policía", num: "110" },
    { label: "Bomberos / Ambulancia", num: "119" },
    { label: "Emergencias marítimas", num: "118" },
    { label: "Japan Visitor Hotline (24/7)", num: "+81 50-3816-2787" },
  ];
  return (
    <SectionCard title="Teléfonos de emergencia" subtitle="Útiles en Japón">
      <ul className="grid grid-cols-1 gap-2">
        {items.map(it => (
          <li key={it.label} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40">
            <div>
              <div className="text-sm font-medium">{it.label}</div>
              <a href={`tel:${it.num.replace(/[^+\d]/g, "")}`} className="text-xs underline text-zinc-500 dark:text-zinc-400">{it.num}</a>
            </div>
            <CopyButton text={`${it.label}: ${it.num}`} />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

const PHRASES = [
  { cat: "Transporte", items: [
    { jp: "駅はどこですか？", romaji: "Eki wa doko desu ka?", es: "¿Dónde está la estación?" },
    { jp: "◯◯駅までいくらですか？", romaji: "__ hasta ___ ikura desu ka?", es: "¿Cuánto cuesta hasta la estación ___?" },
    { jp: "この電車は◯◯に行きますか？", romaji: "Kono densha wa ___ ni ikimasu ka?", es: "¿Este tren va a ___?" },
    { jp: "切符を二枚ください", romaji: "Kippu o nimai kudasai", es: "Dos billetes, por favor" },
  ] },
  { cat: "Restaurantes", items: [
    { jp: "おすすめは何ですか？", romaji: "Osusume wa nan desu ka?", es: "¿Qué recomiendas?" },
    { jp: "英語のメニューはありますか？", romaji: "Eigo no menyū wa arimasu ka?", es: "¿Tienen menú en inglés?" },
    { jp: "グルテンを含みますか？", romaji: "Guruten o fukumi-masu ka?", es: "¿Contiene gluten?" },
    { jp: "乳製品なしでお願いします", romaji: "Nyūseihin nashi de onegaishimasu", es: "Sin lácteos, por favor" },
    { jp: "お会計お願いします", romaji: "Okaikei onegaishimasu", es: "La cuenta, por favor" },
  ] },
  { cat: "Emergencias", items: [
    { jp: "助けてください！", romaji: "Tasukete kudasai!", es: "¡Ayuda, por favor!" },
    { jp: "病院はどこですか？", romaji: "Byōin wa doko desu ka?", es: "¿Dónde está el hospital?" },
    { jp: "警察を呼んでください", romaji: "Keisatsu o yonde kudasai", es: "Llame a la policía, por favor" },
    { jp: "道に迷いました", romaji: "Michi ni mayoimashita", es: "Me he perdido" },
  ] },
] as const;

function PhraseCard({ p }: { p: { jp: string; romaji: string; es: string } }) {
  const text = lines(p.jp + " (" + p.romaji + ") — " + p.es);
  return (
    <li className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 flex items-start justify-between gap-3">
      <div>
        <div className="text-base font-medium">{p.jp}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{p.romaji}</div>
        <div className="text-sm mt-1">{p.es}</div>
      </div>
      <CopyButton text={text} />
    </li>
  );
}
function PhrasesSection() {
  const [tab, setTab] = useState(0);
  return (
    <SectionCard title="Frases útiles" subtitle="JP + rōmaji + español · Copia rápida">
      <div className="flex items-center gap-2 mb-3">{PHRASES.map((g, i) => (<button key={g.cat} onClick={() => setTab(i)} className={`text-xs px-3 py-1.5 rounded-lg border ${tab === i ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-700"} hover:bg-zinc-100 dark:hover:bg-zinc-800`}>{g.cat}</button>))}</div>
      <ul className="space-y-2">{PHRASES[tab].items.map((p, idx) => <PhraseCard key={idx} p={p} />)}</ul>
    </SectionCard>
  );
}

const APPS = [
  { cat: "Transporte", name: "Japan Transit Planner (Jorudan)", icon: Train, desc: "Rutas de tren/metro con precios y tiempos.", link: "https://world.jorudan.co.jp/mln/en/" },
  { cat: "Transporte", name: "NAVITIME Japan Travel", icon: Train, desc: "Horarios en tiempo real y JR Pass.", link: "https://japantravel.navitime.com/en/" },
  { cat: "Mapas offline", name: "Google Maps (descargar zonas)", icon: Map, desc: "Descarga áreas para usarlas sin datos.", link: "https://maps.google.com" },
  { cat: "Mapas offline", name: "MAPS.ME", icon: Map, desc: "Mapas offline con POIs.", link: "https://maps.me" },
  { cat: "Traducción", name: "Google Translate", icon: Languages, desc: "Traducción por cámara, voz y texto.", link: "https://translate.google.com" },
  { cat: "Conectividad", name: "Japan Wi‑Fi auto‑connect", icon: Wifi, desc: "Auto-conexión a hotspots.", link: "https://wifi-cloud.jp/en/auto/" },
  { cat: "Dinero", name: "XE Currency", icon: Download, desc: "Conversor y seguimiento de tasas.", link: "https://www.xe.com/apps/" },
] as const;
function AppsSection() {
  return (
    <SectionCard title="Apps recomendadas" subtitle="Transporte · Mapas offline · Traductor · Conectividad">
      <div className="grid grid-cols-1 gap-2">
        {APPS.map(a => { const Icon = a.icon as any; return (
          <a key={a.name} href={a.link} target="_blank" rel="noreferrer" className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"><Icon size={18} /></div>
            <div className="flex-1"><div className="text-sm font-medium">{a.name}</div><div className="text-xs text-zinc-500 dark:text-zinc-400">{a.cat} · {a.desc}</div></div>
            <ExternalLink size={16} className="text-zinc-400" />
          </a>
        ); })}
      </div>
    </SectionCard>
  );
}

function InfoPractical() {
  return (
    <div className="space-y-4">
      <ConverterCard />
      <EmergencyCard />
      <PhrasesSection />
      <AppsSection />
      <ChecklistSection />
      <CuriositiesSection />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Bloque 4: Lugares
// ──────────────────────────────────────────────────────────────────────────────
 type Food = { name: string; gf?: boolean; lf?: boolean; note?: string };
 type Place = { id: string; name: string; city: "Osaka" | "Kioto" | "Tokio" | "Hiroshima" | "Miyajima" | "Hakone" | "Nara"; emoji?: string; brief: string; rating: number; links: { official?: string; gmaps?: string }; foods?: Food[] };
 const PLACES: Place[] = [
  { id: "osaka-castle", name: "Castillo de Osaka", city: "Osaka", emoji: "🏯", brief: "Fortaleza del período Azuchi‑Momoyama con museo y vistas.", rating: 4.6, links: { official: "https://www.osakacastle.net", gmaps: "https://maps.google.com/?q=Osaka+Castle" }, foods: [{ name: "Tako-yaki en Dotonbori", lf: true }, { name: "Okonomiyaki (opción GF)", gf: true, note: "Harina de arroz" }] },
  { id: "umeda-sky", name: "Umeda Sky Building", city: "Osaka", emoji: "🌆", brief: "Mirador 360º ideal al atardecer.", rating: 4.5, links: { official: "https://www.skybldg.co.jp/en/", gmaps: "https://maps.google.com/?q=Umeda+Sky+Building" }, foods: [{ name: "Shin‑Umeda Shokudogai (opciones SL)", lf: true }] },
  { id: "miyajima", name: "Santuario Itsukushima (Miyajima)", city: "Miyajima", emoji: "⛩️", brief: "Famoso torii flotante.", rating: 4.8, links: { official: "https://www.miyajima.or.jp/english/", gmaps: "https://maps.google.com/?q=Itsukushima+Shrine" }, foods: [{ name: "Ostras a la parrilla", gf: true, lf: true }, { name: "Momiji‑manju", gf: false, lf: false }] },
  { id: "fushimi-inari", name: "Fushimi Inari Taisha", city: "Kioto", emoji: "⛩️", brief: "Miles de torii rojos por la colina Inari.", rating: 4.8, links: { official: "https://inari.jp/en/", gmaps: "https://maps.google.com/?q=Fushimi+Inari+Taisha" }, foods: [{ name: "Inari‑zushi", gf: true, lf: true }] },
  { id: "sensoji", name: "Templo Sensō‑ji", city: "Tokio", emoji: "🏮", brief: "Templo budista más antiguo de Tokio.", rating: 4.7, links: { official: "https://www.senso-ji.jp/english/", gmaps: "https://maps.google.com/?q=Senso-ji" }, foods: [{ name: "Karaage sin rebozado", gf: true }, { name: "Dangos (salsa con gluten)", gf: false, lf: true }] },
  { id: "tokyo-tower", name: "Tokyo Tower", city: "Tokio", emoji: "🗼", brief: "Torre con miradores y vistas.", rating: 4.5, links: { official: "https://www.tokyotower.co.jp/en.html", gmaps: "https://maps.google.com/?q=Tokyo+Tower" } },
 ];
 function Stars({ value }: { value: number }) { const full = Math.floor(value); return (<div className="flex items-center gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={14} fill={i < full ? "currentColor" : "none"} className={i < full ? "" : "opacity-40"} />))}<span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">{value.toFixed(1)}</span></div>); }
 function useFavorites() {
  const [favs, setFavs] = useState<Record<string, true>>(() => { try { return JSON.parse(localStorage.getItem("jp_favs_v1") || "{}"); } catch { return {}; } });
  useEffect(() => { try { localStorage.setItem("jp_favs_v1", JSON.stringify(favs)); } catch {} }, [favs]);
  return { isFav: (id: string) => !!favs[id], toggle: (id: string) => setFavs(f => ({ ...f, [id]: f[id] ? (undefined as any) : true })) } as const;
 }
 function FoodBadges({ f }: { f?: Food[] }) { if (!f || !f.length) return null; return (<div className="flex flex-wrap gap-2 mt-2">{f.map((x, i) => (<span key={i} className="text-[11px] px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700"><span className="inline-flex items-center gap-1"><Utensils size={12} />{x.name}</span>{(x.gf || x.lf) && <span className="ml-1 text-[10px] text-zinc-500 dark:text-zinc-400">{x.gf ? " · GF" : ""}{x.lf ? " · SL" : ""}</span>}</span>))}</div>); }
 function PlaceCard({ p, gf, lf, fav, onFav }: { p: Place; gf: boolean; lf: boolean; fav: boolean; onFav: () => void }) {
  const foods = (p.foods || []).filter(x => (!gf || x.gf) && (!lf || x.lf));
  const shareText = lines((p.emoji || "📍") + " " + p.name + " — " + p.city, p.brief, p.links.official ? "Oficial: " + p.links.official : "", p.links.gmaps ? "Mapa: " + p.links.gmaps : "", foods.length ? "Comida cerca: " + foods.slice(0, 2).map(f => f.name).join(", ") : "");
  const share = async () => { const payload: any = { title: p.name, text: shareText }; if (p.links.gmaps) payload.url = p.links.gmaps; try { if (navigator.share) { await navigator.share(payload); return; } } catch { } try { await navigator.clipboard.writeText(shareText); alert("Copiado para compartir ✨"); } catch { } };
  return (
    <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl">{p.emoji || "📍"}</div><div><div className="text-sm text-zinc-500 dark:text-zinc-400">{p.city}</div><h3 className="text-base font-semibold leading-tight">{p.name}</h3></div></div>
        <button onClick={onFav} aria-label="Favorito" className={`p-2 rounded-lg border ${fav ? "border-rose-400" : "border-zinc-200 dark:border-zinc-700"} hover:bg-zinc-100 dark:hover:bg-zinc-800`}><Heart size={16} className={fav ? "text-rose-500" : "text-zinc-500"} /></button>
      </div>
      <div className="text-sm">{p.brief}</div>
      <div className="flex items-center justify-between"><Stars value={p.rating} /><div className="flex items-center gap-2 text-xs">{p.links.official && <a href={p.links.official} target="_blank" rel="noreferrer" className="underline">Oficial</a>}{p.links.gmaps && <a href={p.links.gmaps} target="_blank" rel="noreferrer" className="underline">Mapa</a>}</div></div>
      {foods.length ? (<div><div className="text-xs text-zinc-500 dark:text-zinc-400">Recomendaciones cerca</div><FoodBadges f={foods} /></div>) : (p.foods && p.foods.length ? <div className="text-xs text-zinc-500 dark:text-zinc-400">*No hay resultados que cumplan los filtros*</div> : null)}
      <PhotoGallery placeId={p.id} placeName={p.name} />
      <div className="flex items-center gap-2 pt-1"><button onClick={share} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"><Share2 size={14} />Compartir</button>{p.links.gmaps && (<a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">WhatsApp</a>)}</div>
    </div>
  );
 }
 function PlacesSection() {
  const [q, setQ] = useState(""); const [city, setCity] = useState<string>("Todas"); const [gf, setGF] = useState(false); const [lf, setLF] = useState(false); const { isFav, toggle } = useFavorites();
  const cities = ["Todas", "Osaka", "Kioto", "Tokio", "Hiroshima", "Miyajima", "Hakone", "Nara"] as const;
  const filtered = useMemo(() => PLACES.filter(p => { const text = (p.name + " " + p.city + " " + p.brief).toLowerCase(); const okQ = !q || text.includes(q.toLowerCase()); const okCity = city === "Todas" || p.city === city; if (!okQ || !okCity) return false; if (gf || lf) { const foods = (p.foods || []).filter(x => (!gf || x.gf) && (!lf || x.lf)); return foods.length > 0; } return true; }).sort((a, b) => Number(isFav(b.id)) - Number(isFav(a.id)) || b.rating - a.rating), [q, city, gf, lf, isFav]);
  return (
    <div className="space-y-4">
      <SectionCard title="Lugares" subtitle="Historia breve, enlaces y comida cerca (GF/SL)">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar…" className="w-full rounded-xl pl-9 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm" /></div>
            <select value={city} onChange={e => setCity(e.target.value)} className="rounded-xl px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm">{cities.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div className="flex items-center gap-2"><label className="text-xs inline-flex items-center gap-2"><input type="checkbox" checked={gf} onChange={() => setGF(!gf)} /> Gluten‑free</label><label className="text-xs inline-flex items-center gap-2"><input type="checkbox" checked={lf} onChange={() => setLF(!lf)} /> Sin lactosa</label></div>
        </div>
      </SectionCard>
      <div className="space-y-3">{filtered.map(p => (<PlaceCard key={p.id} p={p} gf={gf} lf={lf} fav={isFav(p.id)} onFav={() => toggle(p.id)} />))}{!filtered.length && (<div className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6">No hay resultados.</div>)}</div>
    </div>
  );
 }

// ──────────────────────────────────────────────────────────────────────────────
// Bloque 5: Gastos
// ──────────────────────────────────────────────────────────────────────────────
 type Expense = { id: string; concept: string; amount: number; split: number; payer?: string };
 function QuickCalcCard({ onAdd }: { onAdd: (e: Expense) => void }) {
  const [concept, setConcept] = useState("Hotel"); const [pricePerPerson, setPPP] = useState<number>(40); const [nights, setNights] = useState<number>(1); const [people, setPeople] = useState<number>(11);
  const total = (pricePerPerson || 0) * (nights || 0) * (people || 0); const perPerson = (pricePerPerson || 0) * (nights || 0);
  const add = () => onAdd({ id: `${Date.now()}`, concept: `${concept} (${nights} noche/s)`, amount: Number(total.toFixed(2)), split: people });
  return (
    <SectionCard title="Calculadora rápida" subtitle="Ej.: hotel a 40€/persona/noche">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-zinc-500 dark:text-zinc-400">Concepto</label><input value={concept} onChange={e => setConcept(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2" /></div>
          <div><label className="text-xs text-zinc-500 dark:text-zinc-400">€/persona/noche</label><input type="number" value={pricePerPerson} onChange={e => setPPP(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2" /></div>
          <div><label className="text-xs text-zinc-500 dark:text-zinc-400">Noches</label><input type="number" value={nights} onChange={e => setNights(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2" /></div>
          <div><label className="text-xs text-zinc-500 dark:text-zinc-400">Personas</label><input type="number" value={people} onChange={e => setPeople(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2" /></div>
        </div>
        <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><Calculator size={16} />Total</div><div className="font-medium">{formatEUR(total)}</div></div>
        <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><Users size={16} />Por persona</div><div className="font-medium">{formatEUR(perPerson)}</div></div>
        <div className="flex items-center gap-2"><button onClick={add} className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"><Plus size={16} />Añadir como gasto</button><CopyButton text={`${concept}: ${formatEUR(total)} (split ${people}) · ${formatEUR(perPerson)} pp`} label="Copiar" /></div>
      </div>
    </SectionCard>
  );
 }
 function ExpensesSection() {
  const [items, setItems] = useState<Expense[]>(() => { try { return JSON.parse(localStorage.getItem("jp_expenses_v1") || "[]"); } catch { return []; } });
  const [concept, setConcept] = useState("Gasto"); const [amount, setAmount] = useState<number>(0); const [split, setSplit] = useState<number>(11); const [payer, setPayer] = useState("");
  useEffect(() => { try { localStorage.setItem("jp_expenses_v1", JSON.stringify(items)); } catch { } }, [items]);
  const add = (e?: Expense) => { const entry = e ?? { id: `${Date.now()}`, concept, amount: Number(amount) || 0, split: Math.max(1, Number(split) || 11), payer: payer || undefined }; if (!entry.concept || !entry.amount) return; setItems(arr => [entry, ...arr]); if (!e) { setConcept("Gasto"); setAmount(0); setSplit(11); setPayer(""); } };
  const del = (id: string) => setItems(arr => arr.filter(x => x.id !== id)); const clear = () => { if (confirm("¿Borrar todos los gastos?")) setItems([]); };
  const total = items.reduce((s, x) => s + (x.amount || 0), 0); const perPerson = items.reduce((s, x) => s + (x.amount || 0) / (x.split || 1), 0);
  const summaryText = lines("🧾 GASTOS COMPARTIDOS", ...items.map(x => `• ${x.concept}: ${formatEUR(x.amount)} (split ${x.split}${x.payer ? ", pagó " + x.payer : ""}) → ${formatEUR((x.amount || 0) / (x.split || 1))} pp`), `— Total: ${formatEUR(total)}`, `— Por persona: ${formatEUR(perPerson)}`);
  const share = async () => { try { if (navigator.share) { await navigator.share({ title: "Gastos", text: summaryText }); return; } } catch { } try { await navigator.clipboard.writeText(summaryText); alert("Resumen copiado ✨"); } catch { } };
  return (
    <div className="space-y-4">
      <QuickCalcCard onAdd={e => add(e)} />
      <SectionCard title="Gastos compartidos" subtitle="Registra, divide entre el grupo y comparte">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-zinc-500 dark:text-zinc-400">Concepto</label><input value={concept} onChange={e => setConcept(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2" /></div>
            <div><label className="text-xs text-zinc-500 dark:text-zinc-400">Importe (€)</label><input type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2" /></div>
            <div><label className="text-xs text-zinc-500 dark:text-zinc-400">Dividir entre</label><input type="number" value={split} onChange={e => setSplit(Number(e.target.value) || 1)} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2" /></div>
            <div><label className="text-xs text-zinc-500 dark:text-zinc-400">Pagado por (opcional)</label><input value={payer} onChange={e => setPayer(e.target.value)} placeholder="Nombre" className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2" /></div>
          </div>
          <div className="flex items-center gap-2"><button onClick={() => add()} className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"><Plus size={16} />Añadir</button><CopyButton text={`${concept}: ${formatEUR(amount)} (split ${split})`} label="Copiar línea" />{items.length > 0 && <button onClick={clear} className="ml-auto text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Borrar todo</button>}</div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            {items.length === 0 && <li className="p-4 text-sm text-zinc-500 dark:text-zinc-400">Aún no hay gastos.</li>}
            {items.map(x => (
              <li key={x.id} className="p-3 flex items-center gap-3 bg-white/60 dark:bg-zinc-900/40">
                <div className="flex-1"><div className="text-sm font-medium">{x.concept}</div><div className="text-xs text-zinc-500 dark:text-zinc-400">{formatEUR(x.amount)} · split {x.split}{x.payer ? ` · pagó ${x.payer}` : ""} → <span className="font-medium">{formatEUR((x.amount || 0) / (x.split || 1))}</span> pp</div></div>
                <button onClick={() => del(x.id)} className="p-2 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Eliminar"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
          <div className="pt-1 space-y-2">
            <div className="flex items-center justify-between text-sm"><span>Total</span><span className="font-medium">{formatEUR(total)}</span></div>
            <div className="flex items-center justify-between text-sm"><span>Por persona</span><span className="font-medium">{formatEUR(perPerson)}</span></div>
            <div className="flex items-center gap-2 pt-1"><button onClick={share} className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Compartir</button><a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`} target="_blank" rel="noreferrer" className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">WhatsApp</a><CopyButton text={summaryText} label="Copiar resumen" /></div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
 }

// ──────────────────────────────────────────────────────────────────────────────
// Bloque 6: Checklist por viajero + Curiosidades
// ──────────────────────────────────────────────────────────────────────────────
 const TRAVELLERS = ["Moi", "Jani", "Encarni", "MAngel", "Tani", "Isaac", "Aaron", "Elisa", "Josué", "Yacelly", "Alba"] as const;
// Sustituye TODO el contenido actual de DEFAULT_CHECK_ITEMS por este:
const DEFAULT_CHECK_ITEMS = [
  // 🧾 PAPELES & RESERVAS (hacer YA)
  "🛂 Pasaporte en vigor (mín. 6 meses) + foto + copia en nube",
  "🩺 Seguro médico: póliza en PDF + teléfono 24/7 guardados offline",
  "🧳 Visit Japan Web: QRs inmigración/aduanas en PDF + captura",
  "🚄 Shinkansen: asientos juntos + espacio maletas (>160 cm total)",
  "🎢 Universal Studios (23/10): Entradas + Express Pass + Timed Entry SNW",
  "🏎 Kart Akihabara (30/10): reservar turno (mejor nocturno)",
  "🗻 Hakone Free Pass (31/10): comprar con antelación",
  "🏰 Disney (2/11): entradas online con fecha (si vais)",
  "🌊 teamLab Planets (si interesa): entradas online",
  "🍣 Restaurantes especiales/sushi top: reservar mesa",
  "📶 Conectividad: eSIM o Pocket Wi-Fi (mín. 1 por pareja)",
  "💳 Suica/Welcome Suica/ICOCA lista (física o en Apple/Google Wallet)",
  "🧾 JR Pass (si aplica): activación/fechas planificadas",
  "🛏 Reservas de hoteles confirmadas + direcciones en japonés/inglés",
  "🗺 Mapas offline descargados (Tokyo, Kyoto, Osaka + Hakone/Nara)",
  "👛 Presupuesto por día (efectivo + tarjeta sin comisiones)",
  "🧾 Copia de reservas (vuelos/hoteles/actividades) en Drive/Dropbox",

  // 🧳 MALETA (facturada)
  "🧥 Capas: camisetas técnicas + sudadera ligera + cortavientos impermeable",
  "👖 1 pantalón cómodo + 1 vaquero + 1 ‘arreglado’",
  "👟 Zapatillas cómodas + 🩴 chanclas de ducha",
  "🥿 Pantuflas (no siempre las dan)",
  "🧦 Ropa interior y calcetines extra (añade compresión para vuelo)",
  "☔ Chubasquero/poncho + paraguas mini",
  "🧼 Bolsa de lavandería + 2–3 sobres de detergente o tiras",
  "😴 Pijama fino (habitaciones ~20–23 °C)",
  "🧵 Toalla microfibra + mini kit costura + imperdibles + cinta americana",
  "📸 1 outfit bonito para fotos nocturnas (Tokio/Ginza)",

  // 🎒 MOCHILA DE DÍA
  "🛂 Pasaporte + 💳 tarjeta física + IC (Suica/Welcome Suica)",
  "📱 Móvil con mapas offline + 🔋 batería externa + 🔌 cable",
  "💧 Botella reutilizable (fuentes/konbini)",
  "🧻 Tissues/toallitas + 🧴 gel hidroalcohólico",
  "💊 Mini botiquín: paracetamol, ibuprofeno, tiritas, antirozaduras, sales, biodramina, colirio",
  "🥜 Snacks seguros (barritas/ frutos secos / galletas GF)",
  "📝 Tarjeta de alergias impresa (JP/ES) + sobres de tamari sin gluten",
  "🗑 Bolsa de basura pequeña (hay pocas papeleras)",
  "☔ Paraguas mini o chubasquero",
  "🛍 Tote plegable para compras",

  // 🔌 TECH & CARGA
  "🔌 Adaptadores Tipo A (100 V) — lleva 2 + ladrón pequeño",
  "⚡ Cargadores USB-C/USB-A (móvil, reloj, cámara)",
  "🔋 Power bank 10–20k (uno por pareja)",
  "🎧 Auriculares + tapones (vuelo/tren)",
  "📚 Kindle/Tablet con pelis/libros offline",
  "📷 Cámara/GoPro + tarjetas + baterías",

  // 💊 SALUD & MEDICACIÓN
  "💊 Medicación personal en cabina, con receta y caja original",
  "📄 Certificados impresos si llevas fármacos ‘sensibles’ o en cantidad",
  "🌤 Crema solar ligera + 💄 cacao de labios + aftersun mini",
  "🧪 Enzimas lactasa y carbón activo (por si ‘accidentes’ de comida)",
  "🧾 Seguro: copia en papel + PDF offline",

  // 🍣 INTOLERANCIAS (gluten/lactosa)
  "🔍 En etiquetas: 小麦 (trigo) y 乳 / 乳製品 (lácteos)",
  "🚫 Evitar: shōyu con trigo, tempura, katsu, udon, okonomiyaki, currys espesados",
  "✅ Más seguros: yakitori a la sal (shio), sashimi, arroz, onigiri simples (umeboshi/salmón sin salsa), soba 100% 十割 (confirmar)",
  "🗣 Frase rápida (imprimir/guardar): ‘私はグルテン（小麦）と乳製品が食べられません。小麦/乳や同じ油・器具での混入も避けたいです。’",

  // 💸 DINERO & PAGOS
  "💴 Efectivo inicial: ¥20,000–30,000 por persona",
  "🏧 ATM 7-Eleven para retirar con tarjeta extranjera (por si acaso)",
  "💳 Tarjeta sin comisiones activada + PIN recordado",
] as const;

// slug igual que antes
const slug = (s: string) =>
  s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();

type CheckItem = { id: string; label: string; done: boolean };

// ── Versión del checklist (cámbiala a "v3" si amplías el default en el futuro)
const CHECK_VERSION = "v2";
const KEY     = (name: string) => `jp_checklist_${slug(name)}_${CHECK_VERSION}`;
const OLD_KEY = (name: string) => `jp_checklist_${slug(name)}_v1`;

// Construye la lista base desde DEFAULT_CHECK_ITEMS, respetando "done" por etiqueta si existía
function freshFromDefaults(existing?: CheckItem[]): CheckItem[] {
  const doneByLabel = new globalThis.Map<string, boolean>();
  (existing || []).forEach(i => doneByLabel.set(i.label, !!i.done));

  const base = DEFAULT_CHECK_ITEMS.map((label, i) => ({
    id: String(i),
    label,
    done: doneByLabel.get(label) ?? false,
  }));

  // Añade ítems personalizados del usuario que no estén en el default
  const extras = (existing || []).filter(i => !DEFAULT_CHECK_ITEMS.includes(i.label as any));
  return [...base, ...extras];
}


function loadChecklist(name: string): CheckItem[] {
  try {
    // v2 ya guardado
    const raw = localStorage.getItem(KEY(name));
    if (raw) {
      const parsed: CheckItem[] = JSON.parse(raw);
      // por si añadiste nuevos ítems al default, fusiona con lo guardado
      const merged = freshFromDefaults(parsed);
      if (merged.length !== parsed.length) localStorage.setItem(KEY(name), JSON.stringify(merged));
      return merged;
    }

    // Migración automática desde v1 → v2
    const old = localStorage.getItem(OLD_KEY(name));
    if (old) {
      const migrated = freshFromDefaults(JSON.parse(old));
      localStorage.setItem(KEY(name), JSON.stringify(migrated));
      return migrated;
    }
  } catch {}

  // Primera vez: default puro (todo en false)
  return freshFromDefaults();
}

function saveChecklist(name: string, items: CheckItem[]) {
  try {
    localStorage.setItem(KEY(name), JSON.stringify(items));
  } catch {}
}

function ChecklistSection() {
  const [person, setPerson] = useState<typeof TRAVELLERS[number]>(TRAVELLERS[0]);
  const [items, setItems] = useState<CheckItem[]>(() => loadChecklist(TRAVELLERS[0]));
  const [newItem, setNewItem] = useState("");

  useEffect(() => { setItems(loadChecklist(person)); }, [person]);
  useEffect(() => { saveChecklist(person, items); }, [person, items]);

  const toggle   = (id: string) => setItems(arr => arr.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const add      = () => {
    const label = newItem.trim();
    if (!label) return;
    setItems(arr => [{ id: `u${Date.now()}`, label, done: false }, ...arr]);
    setNewItem("");
  };
  const markAll  = () => setItems(arr => arr.map(x => ({ ...x, done: true })));
  const reset    = () => setItems(freshFromDefaults()); // vuelve al default actualizado

  const doneCount = items.filter(i => i.done).length;
  const total     = items.length || 1;
  const pct       = Math.round((doneCount / total) * 100);
  const pending   = items.filter(i => !i.done).map(i => "• " + i.label);
  const summary   = lines(
    `Checklist de ${person}`,
    `${doneCount}/${items.length} completados`,
    pending.length ? "Pendiente:" : "Todo listo ✅",
    ...pending
  );

  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ title: `Checklist de ${person}`, text: summary }); return; }
    } catch {}
    try { await navigator.clipboard.writeText(summary); alert("Checklist copiada ✨"); } catch {}
  };

  return (
    <SectionCard title="Checklist personal" subtitle="Marca lo que ya tienes listo · por viajero">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ListChecks size={18} />
          <select
            value={person}
            onChange={e => setPerson(e.target.value as any)}
            className="rounded-xl px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
          >
            {TRAVELLERS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <div className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">{pct}%</div>
        </div>

        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${pct}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            placeholder="Añadir ítem…"
            className="col-span-2 rounded-xl px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
          />
          <button onClick={add} className="text-sm px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            Añadir
          </button>
        </div>

        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          {items.map(i => (
            <li key={i.id} className="flex items-center gap-3 p-3 bg-white/60 dark:bg-zinc-900/40">
              <input
                type="checkbox"
                checked={i.done}
                onChange={() => toggle(i.id)}
                className="w-5 h-5 rounded-md border-zinc-300 dark:border-zinc-700"
              />
              <div className={`flex-1 text-sm ${i.done ? "line-through text-zinc-400 dark:text-zinc-500" : ""}`}>
                {i.label}
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 pt-1">
          <button onClick={markAll} className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Marcar todo</button>
          <button onClick={reset}   className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Reset</button>
          <button onClick={share}   className="ml-auto text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Compartir</button>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(summary)}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            WhatsApp
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(summary)}
            className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Copiar
          </button>
        </div>
      </div>
    </SectionCard>
  );
}


// Sustituye TODO el array FACTS por este:
const FACTS = [
  "🍶 Japón tiene >5 millones de máquinas expendedoras: ~1 por 25 personas.",
  "🚆 La puntualidad de los trenes es extrema: retrasos de segundos generan disculpas.",
  "🍜 Sorber el ramen (slurping) no es de mala educación: indica que lo disfrutas.",
  "🏪 Los konbini venden de todo: comida fresca, pagos, tickets y paquetes 24/7.",
  "🍱 Muchos restaurantes muestran réplicas de comida (shokuhin sampuru) en el escaparate.",
  "🛏️ Los hoteles cápsula nacieron para viajeros y trabajadores nocturnos.",
  "♨️ En algunos onsen, los tatuajes se piden cubrir (cada vez más permisivos).",
  "🟨 En estaciones hay marcas en el suelo para formar filas exactas al subir.",
  "🍵 El té verde (ocha) suele ser gratis con la comida.",
  "🧹 Calles limpísimas y pocas papeleras: lleva tu basura contigo.",
  "🎌 El emoji 🎌 representa banderas cruzadas usadas en festivales.",
  "🙇 Inclinarse (ojigi) es señal de respeto; sigue el flujo local.",
  "💴 Cultura aún muy ‘cash’: aunque el pago sin contacto crece rápido.",
  "♻️ Separación estricta de basura; podrás ver calendarios por barrios.",
  "☔ Muchos comercios tienen ‘lockers’ para paraguas en la entrada.",
  "🗓️ Golden Week (finales de abril–principios de mayo) es pico de viajes internos.",
  "🍡 Dulces estacionales: sabores sakura en primavera y castaña en otoño.",
  "🚽 Los w.c. japoneses tienen chorros, secado y música para privacidad.",
  "🚫💸 No se deja propina: un ‘gracias’ es suficiente.",
  "🚲 Bicis por acera en algunas zonas; ojo a los parkings de bicis.",
  "📳 Alerta sísmica en móviles/TV: práctica normal y muy efectiva.",
  "🍉 Existen sandías cuadradas (sobre todo decorativas y carísimas).",
  "🎤 Karaoke en boxes privados es plan clásico entre amigos/empresa.",
  "📚 Manga y anime son parte cotidiana: librerías y cafés temáticos por doquier.",
  "🧸 Gachapon (máquinas de cápsulas) con coleccionables de todo tipo.",
  "📸 Purikura: cabinas de fotos con filtros, muy populares.",
  "🛤️ ‘Stamp rally’: sellos coleccionables en estaciones/atracciones.",
  "🎴 Omikuji: papelitos de fortuna en templos; ata la mala suerte al soporte.",
  "🧿 Omamori: amuletos de buena suerte para coche, estudios o salud.",
  "⛩️ Budismo y sintoísmo conviven; verás templos y santuarios muy cercanos.",
  "🍱 Cultura bento: cajas de comida preciosas en estaciones (ekiben).",
  "🌸 Temporadas muy marcadas: hanami en primavera y momiji en otoño.",
  "🤫 En trenes se habla bajo y se evita el manos libres.",
  "🚬 Hay zonas designadas para fumar; fuera de ellas, multa.",
  "🏧 7-Eleven/JP Bank suelen aceptar tarjetas extranjeras en cajeros.",
  "🔐 Coin-lockers en estaciones/centros comerciales para dejar maletas.",
  "🪪 Tarjetas IC (Suica/PASMO/ICOCA) sirven para tren, bus y combis.",
  "🕒 Check-in hotel típico a las 15:00; check-out a las 10:00–11:00.",
  "👟 En casas/ryokan y algunos locales: zapatos fuera → zapatillas.",
  "🛍️ Mucho embalaje individual: útil para regalos, menos para el planeta.",
  "🎶 Semáforos con sonidos distintos para personas invidentes.",
  "🎰 Pachinko: salas ruidosas de recreativas muy populares.",
  "🔥❄️ Máquinas expendedoras venden bebidas frías y también calientes.",
  "✨ Iluminaciones de invierno espectaculares en parques y barrios.",
  "🐟 El mercado interior de pescado se movió a Toyosu; Tsukiji ‘outer’ sigue vivo.",
] as const;

 function CuriositiesSection() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx(i => (i + 1) % FACTS.length);
  const rand = () => setIdx(i => { let r = i; while (r === i && FACTS.length > 1) { r = Math.floor(Math.random() * FACTS.length); } return r; });
  const fact = `• ${FACTS[idx]}`; const all = lines("CURIOSIDADES DE JAPÓN", ...FACTS.map(f => "• " + f));
  const share = async (txt: string) => { try { if (navigator.share) { await navigator.share({ title: "Curiosidades de Japón", text: txt }); return; } } catch { } try { await navigator.clipboard.writeText(txt); alert("Copiado ✨"); } catch { } };
  return (
    <SectionCard title="Curiosidades de Japón" subtitle="Datos ligeros para el trayecto 🚆">
      <div className="space-y-3">
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 text-sm">{fact}</div>
        <div className="flex items-center gap-2">
          <button onClick={next} className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Siguiente</button>
          <button onClick={rand} className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"><Shuffle size={16} />Aleatorio</button>
          <button onClick={() => share(fact)} className="ml-auto text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Compartir</button>
          <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(fact)}`} target="_blank" rel="noreferrer" className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">WhatsApp</a>
        </div>
        <details className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
          <summary className="cursor-pointer text-sm inline-flex items-center gap-2"><BookOpen size={16} /> Ver lista completa</summary>
          <ul className="mt-2 space-y-1 text-sm list-disc pl-5">{FACTS.map((f, i) => (<li key={i}>• {f}</li>))}</ul>
          <div className="mt-2 flex items-center gap-2"><button onClick={() => share(all)} className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Compartir todo</button><a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(all)}`} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hoverbg-zinc-800">WhatsApp</a></div>
        </details>
      </div>
    </SectionCard>
  );
 }

// ──────────────────────────────────────────────────────────────────────────────
// App principal
// ──────────────────────────────────────────────────────────────────────────────
export default function JapanTripApp() {
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState<TabKey>("itinerary");

  // 👉 Normalizamos TABS aquí para evitar el error "never"
  type TabLike = {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    emoji?: string;
  };
  const tabs = (TABS as unknown as TabLike[]);

  useEffect(() => {
    // Smoke tests básicos (no rompen la UI)
    try {
      console.assert(lines("a", "b") === "a\nb", "lines une con \\n");
      console.assert(lines("a", "", null, "c") === "a\nc", "lines filtra vacíos");
      const sample = formatEUR(10);
      console.assert(/€/.test(sample), "formatEUR incluye €");
      console.assert(Array.isArray(TRAVELLERS) && TRAVELLERS.length === 11, "Hay 11 viajeros");
      console.assert(Array.isArray(FACTS) && FACTS.length >= 8, "Curiosidades suficientes");
      console.assert(ITINERARY.length >= 10, "Itinerario cargado");
      console.assert(PLACES.length >= 5, "Hay lugares");
    } catch {}
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const currentTab = tabs.find(t => t.key === tab);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
        <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇯🇵</span>
              <h1 className="text-lg font-semibold leading-tight">Viaje Japón 2025</h1>
              {/* Píldora con el tab activo */}
              <span className="ml-2 text-[11px] px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                {currentTab?.emoji} {currentTab?.label}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Más padding abajo para el nuevo nav + tipografía un pelín mayor en móvil */}
        <main className="max-w-md mx-auto px-4 pt-4 pb-24 text-[15.5px] sm:text-[15px] md:text-base">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {tab === "itinerary" && <Itinerary />}
              {tab === "info" && <InfoPractical />}
              {tab === "places" && <PlacesSection />}
              {tab === "expenses" && <ExpensesSection />}

              {/* GASTRONOMÍA */}
              {tab === "gastro" && (
                <section id="gastro">
                  <SectionCard
                    title="Gastronomía 🍣"
                    subtitle="Listado por ciudad/barrio con filtros, votos y favoritos del grupo"
                  >
                    <Gastro tripId="japon-2025" />
                  </SectionCard>
                </section>
              )}

              {/* IDEAS FOTO */}
              {tab === "photo" && (
                <section id="photo">
                  <SectionCard
                    title="Ideas foto 📷"
                    subtitle="Inspiración por ciudad/estilo · favoritos · ‘hechas’"
                  >
                    <PhotoIdeas />
                  </SectionCard>
                </section>
              )}

              {/* RANKING / GAME */}
              {tab === "game" && (
                <section id="game">
                  <SectionCard
                    title="Ranking & Medallas 🏆"
                    subtitle="Descubre quién es el viajero más top del grupo"
                  >
                    <Game tripId="japon-2025" />
                  </SectionCard>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Nuevo menú inferior con carrusel + flechas */}
        <BottomNav
          tabs={tabs}
          current={tab}
          onChange={(k) => setTab(k as TabKey)}
        />
      </div>
    </div>
  );
}

