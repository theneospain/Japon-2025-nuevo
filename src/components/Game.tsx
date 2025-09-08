// src/components/Game.tsx
import React, { useEffect, useMemo, useState } from "react";
import { onSnapshot, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Trophy, Crown, Award, Star, User } from "lucide-react";

const NAME_KEY = "notes_name";

type Score = { id: string; name?: string; points?: number };

function medal(i: number) {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return "🎯";
}

function tier(points: number) {
  if (points >= 60) return { label: "Sensei", emoji: "🧘‍♂️" };
  if (points >= 30) return { label: "Samurái", emoji: "🗡️" };
  if (points >= 15) return { label: "Explorador", emoji: "🧭" };
  if (points >= 5)  return { label: "Novato", emoji: "🌱" };
  return { label: "Turista", emoji: "🧳" };
}

export default function Game({ tripId }: { tripId: string }) {
  const [myName, setMyName] = useState<string>(() => localStorage.getItem(NAME_KEY) || "Invitado");
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    // Guarda nombre local y súbelo a tu ficha si aún no existe
    localStorage.setItem(NAME_KEY, myName);
  }, [myName]);

  useEffect(() => {
    const col = collection(db, "trips", tripId, "game", "scores");
    return onSnapshot(col, (snap) => {
      const arr: Score[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }));
      arr.sort((a, b) => (b.points || 0) - (a.points || 0));
      setScores(arr);
    });
  }, [tripId]);

  // Asegura que existe tu doc con el nombre (sin tocar puntos)
  useEffect(() => {
    const id = localStorage.getItem("notes_device_id") || "anon";
    const ref = doc(db, "trips", tripId, "game", "scores", id);
    setDoc(ref, { name: myName }, { merge: true }).catch(() => {});
  }, [tripId, myName]);

  const meId = localStorage.getItem("notes_device_id") || "anon";
  const me = useMemo(() => scores.find((s) => s.id === meId), [scores, meId]);
  const idx = scores.findIndex((s) => s.id === meId);
  const pts = me?.points || 0;
  const tierInfo = tier(pts);
  const nextTarget = pts >= 60 ? null : pts >= 30 ? 60 : pts >= 15 ? 30 : pts >= 5 ? 15 : 5;
  const toNext = nextTarget !== null ? Math.max(0, nextTarget - pts) : 0;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={18} />
          <h3 className="text-base font-semibold">Ranking del viaje</h3>
        </div>

        {/* Mi perfil */}
        <div className="flex flex-col gap-2 mb-3">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">Tu nombre (aparece en ranking)</label>
          <input
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
            placeholder="Tu nombre…"
          />
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Estado: <b>{tierInfo.emoji} {tierInfo.label}</b> · Puntos: <b>{pts}</b>
            {nextTarget !== null && <> · Próxima medalla en <b>{toNext}</b> pts</>}
          </div>
        </div>

        {/* Tabla */}
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {scores.length === 0 && <li className="p-3 text-sm text-zinc-500 dark:text-zinc-400">Aún no hay puntuaciones.</li>}
          {scores.map((s, i) => {
            const self = s.id === meId;
            return (
              <li key={s.id} className={`p-3 flex items-center justify-between gap-3 ${self ? "bg-emerald-50/60 dark:bg-emerald-900/20" : "bg-transparent"}`}>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-center">{medal(i)}</span>
                  <div className="text-sm">
                    <div className="font-medium flex items-center gap-1">
                      {self && <Crown size={14} className="text-amber-500" />}
                      {s.name || "Invitado"}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">#{i + 1}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold">{s.points || 0} pts</div>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Cómo se suman puntos: marcar *Lo probé* en platos, *Comido* en lugares, etc. (1 punto por check).
        </div>
      </div>

      {/* Logros simples */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2 mb-2">
          <Award size={18} />
          <h3 className="text-base font-semibold">Logros</h3>
        </div>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          <li className={`p-3 rounded-xl border ${pts >= 5 ? "border-emerald-400" : "border-zinc-300 dark:border-zinc-700"}`}>🌱 Novato — 5 pts</li>
          <li className={`p-3 rounded-xl border ${pts >= 15 ? "border-emerald-400" : "border-zinc-300 dark:border-zinc-700"}`}>🧭 Explorador — 15 pts</li>
          <li className={`p-3 rounded-xl border ${pts >= 30 ? "border-emerald-400" : "border-zinc-300 dark:border-zinc-700"}`}>🗡️ Samurái — 30 pts</li>
          <li className={`p-3 rounded-xl border ${pts >= 60 ? "border-emerald-400" : "border-zinc-300 dark:border-zinc-700"}`}>🧘‍♂️ Sensei — 60 pts</li>
        </ul>
      </div>
    </div>
  );
}
