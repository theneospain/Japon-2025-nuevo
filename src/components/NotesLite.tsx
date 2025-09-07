import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";


type Reaction = "👍" | "❤️" | "🍜";
type Note = {
  id: string;
  content: string;
  authorName: string;
  reactions?: Record<Reaction, string[]>;
};

// Genera un id único por dispositivo (para que no se dupliquen reacciones)
function getDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = Math.random().toString(36).slice(2);
    localStorage.setItem("deviceId", id);
  }
  return id;
}

export default function NotesLite({
  tripId,
  blockId,
  className = "",
}: {
  tripId: string;
  blockId: string;
  className?: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState(localStorage.getItem("displayName") || "");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const deviceId = getDeviceId();

  // referencia a Firestore
  const notesRef = useMemo(
    () => collection(db, "trips", tripId, "blocks", blockId, "notes"),
    [tripId, blockId]
  );

  // leer en tiempo real
  useEffect(() => {
    const q = query(notesRef, orderBy("createdAt", "asc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const arr: Note[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }));
      setNotes(arr);
    });
    return () => unsub();
  }, [notesRef]);

  // enviar nueva nota
  async function sendNote() {
    if (!input.trim()) return;
    const authorName = name || "Invitado";
    await addDoc(notesRef, {
      content: input.trim(),
      authorName,
      createdAt: serverTimestamp(),
      reactions: { "👍": [], "❤️": [], "🍜": [] },
      deviceId,
    });
    setInput("");
    areaRef.current?.focus();
  }

  // reacciones
  async function toggleReaction(noteId: string, emoji: Reaction) {
    const n = notes.find((x) => x.id === noteId);
    const hasIt = n?.reactions?.[emoji]?.includes(deviceId) ?? false;
    await updateDoc(doc(notesRef, noteId), {
      [`reactions.${emoji}`]: hasIt
        ? arrayRemove(deviceId)
        : arrayUnion(deviceId),
    });
  }

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-3 mt-3 ${className}`}
    >
      {/* nombre del usuario */}
      <div className="flex gap-2 mb-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => localStorage.setItem("displayName", name)}
          placeholder="Tu nombre"
          className="flex-1 rounded-lg bg-black/30 px-3 py-2 text-sm"
        />
      </div>

      {/* lista de notas */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {notes.map((n) => (
          <div key={n.id} className="rounded-xl bg-black/20 p-2">
            <div className="text-[11px] opacity-70">{n.authorName}</div>
            <div className="text-sm">{n.content}</div>
            <div className="flex gap-2 pt-1">
              {(["👍", "❤️", "🍜"] as Reaction[]).map((e) => {
                const count = n.reactions?.[e]?.length ?? 0;
                const active = n.reactions?.[e]?.includes(deviceId);
                return (
                  <button
                    key={e}
                    onClick={() => toggleReaction(n.id, e)}
                    className={`px-2 py-1 rounded-full text-xs border ${
                      active
                        ? "bg-white/20 border-white"
                        : "bg-white/5 border-white/20"
                    }`}
                  >
                    {e} {count}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="text-sm opacity-60">
            Sé el primero en dejar una nota ✍️
          </div>
        )}
      </div>

      {/* caja para escribir */}
      <div className="mt-3 flex gap-2">
        <textarea
          ref={areaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe una nota…"
          className="flex-1 resize-none rounded-xl bg-black/30 px-3 py-2 text-sm"
          rows={1}
        />
        <button
          onClick={sendNote}
          disabled={!input.trim()}
          className="rounded-xl bg-white text-black px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
