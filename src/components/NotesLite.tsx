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

type Props = {
  tripId: string;
  blockId: string;
  className?: string;
};

type Note = {
  id: string;
  content: string;
  authorName: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
  reactions?: Record<string, string[]>;
  deviceId?: string;
  localOnly?: boolean;
  hidden?: boolean; // soft delete
};

const NAME_KEY = "notes_name";
const DEVICE_KEY = "notes_device_id";

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export default function NotesLite({ tripId, blockId, className }: Props) {
  const [input, setInput] = useState("");
  const [name, setName] = useState(localStorage.getItem(NAME_KEY) || "Invitado");
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  const deviceId = useMemo(() => getDeviceId(), []);
  const notesRef = useMemo(
    () => collection(db, "trips", tripId, "blocks", blockId, "notes"),
    [tripId, blockId]
  );

  // clave de cola local por bloque
  const PENDING_KEY = useMemo(
    () => `notes_pending_${tripId}_${blockId}`,
    [tripId, blockId]
  );

  useEffect(() => {
    localStorage.setItem(NAME_KEY, (name || "Invitado").trim());
  }, [name]);

  // Reintento automático de la cola local al cargar el bloque
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem(PENDING_KEY);
        const pend: Array<Omit<Note, "id">> = raw ? JSON.parse(raw) : [];
        if (Array.isArray(pend) && pend.length) {
          for (const n of pend) {
            await addDoc(notesRef, {
              content: n.content,
              authorName: n.authorName,
              createdAt: serverTimestamp(),
              reactions: n.reactions || { "👍": [], "❤️": [], "🍜": [] },
              deviceId: n.deviceId || deviceId,
              hidden: n.hidden ?? false,
            });
          }
          localStorage.removeItem(PENDING_KEY);
        }
      } catch {
        // si falla, dejamos la cola para más tarde
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PENDING_KEY, notesRef]);

  // Suscripción a Firestore (y añadimos notas locales pendientes visibles)
  useEffect(() => {
    setError(null);
    const q = query(notesRef, orderBy("createdAt", "asc"), limit(400));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: Note[] = [];
        snap.forEach((d) =>
          arr.push({ id: d.id, ...(d.data() as Omit<Note, "id">) })
        );
        // Filtrar ocultas (soft delete)
        const visible = arr.filter((n) => !n.hidden);

        // Añadir visualmente las pendientes locales (si las hay)
        try {
          const raw = localStorage.getItem(PENDING_KEY);
          const pend: Array<Omit<Note, "id">>> = raw ? JSON.parse(raw) : [];
          if (Array.isArray(pend) && pend.length) {
            const locals: Note[] = pend.map((n, i) => ({
              id: `local-${i}`,
              ...n,
              localOnly: true,
              hidden: n.hidden ?? false,
              createdAt:
                n.createdAt ?? { seconds: Date.now() / 1000, nanoseconds: 0 },
            }));
            setNotes([...visible, ...locals.filter((n) => !n.hidden)]);
          } else {
            setNotes(visible);
          }
        } catch {
          setNotes(visible);
        }
      },
      (err) => {
        console.error("[Notes] onSnapshot error", err);
        setError(err.message || "No se pudieron cargar las notas.");
      }
    );
    return unsub;
  }, [notesRef, PENDING_KEY]);

  // Autogrow del textarea
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  function fmtDate(n: Note) {
    const d = n.createdAt?.seconds
      ? new Date(n.createdAt.seconds * 1000)
      : new Date();
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function queuePending(payload: Omit<Note, "id">) {
    try {
      const arr: Array<Omit<Note, "id">> = JSON.parse(
        localStorage.getItem(PENDING_KEY) || "[]"
      );
      arr.push(payload);
      localStorage.setItem(PENDING_KEY, JSON.stringify(arr));
      // Pintamos también en UI
      setNotes((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          ...payload,
          localOnly: true,
          createdAt:
            payload.createdAt ?? { seconds: Date.now() / 1000, nanoseconds: 0 },
        },
      ]);
    } catch {
      // ignorar errores de localStorage
    }
  }

  async function sendNote() {
    const content = input.trim();
    if (!content) return;
    if (content.length > 2000) {
      setError("La nota es demasiado larga (máx. 2000 caracteres).");
      return;
    }

    const author = (name || "Invitado").trim();
    setSending(true);
    setError(null);

    try {
      await addDoc(notesRef, {
        content,
        authorName: author,
        createdAt: serverTimestamp(),
        reactions: { "👍": [], "❤️": [], "🍜": [] },
        deviceId,
        hidden: false,
      });
      setInput("");
      areaRef.current?.focus();
    } catch (e) {
      console.error("[Notes] addDoc error", e);
      setError("No se pudo guardar ahora. Se intentará automáticamente.");
      // Guardar en cola local
      queuePending({
        content,
        authorName: author,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
        reactions: { "👍": [], "❤️": [], "🍜": [] },
        deviceId,
        hidden: false,
        localOnly: true,
      });
      setInput("");
    } finally {
      setSending(false);
    }
  }

  async function toggleReaction(noteId: string, emoji: string) {
    const n = notes.find((x) => x.id === noteId);
    if (!n) return;
    const has = (n.reactions?.[emoji] || []).includes(deviceId);
    try {
      await updateDoc(doc(notesRef, noteId), {
        [`reactions.${emoji}`]: has ? arrayRemove(deviceId) : arrayUnion(deviceId),
      });
    } catch (e) {
      console.error("[Notes] reaction error", e);
    }
  }

  async function deleteNote(n: Note) {
    // Si aún está en cola local, bórrala del localStorage y de la UI
    if (n.localOnly) {
      try {
        const raw = localStorage.getItem(PENDING_KEY) || "[]";
        const pend: any[] = JSON.parse(raw);
        const idx = pend.findIndex(
          (x) =>
            x.content === n.content &&
            x.authorName === n.authorName &&
            (x.deviceId || deviceId) === (n.deviceId || deviceId)
        );
        if (idx !== -1) {
          pend.splice(idx, 1);
          localStorage.setItem(PENDING_KEY, JSON.stringify(pend));
        }
      } catch {}
      setNotes((prev) => prev.filter((x) => x.id !== n.id));
      return;
    }

    // Seguridad básica en cliente: solo el “dueño” del dispositivo puede borrar
    if (n.deviceId !== deviceId) return;

    try {
      await updateDoc(doc(notesRef, n.id), { hidden: true });
    } catch (e) {
      console.error("[Notes] delete error", e);
      setError("No se pudo borrar la nota.");
    }
  }

  const EMOJIS = ["👍", "❤️", "🍜"];

  return (
    <div className={`rounded-2xl border border-white/10 p-3 ${className || ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-white/70">
          <span className="font-semibold">{name}</span> — Notas del bloque
        </div>
        {error && <div className="text-xs text-amber-400">⚠️ {error}</div>}
      </div>

      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {notes.length === 0 && (
          <div className="text-sm text-white/50">Sé el primero en dejar una nota 👍🏽</div>
        )}

        {notes.map((n) => (
          <div key={n.id} className="rounded-xl bg-white/5 px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{n.authorName}</div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-white/50">
                  {fmtDate(n)}
                  {n.localOnly && " • local"}
                </div>
                {(n.deviceId === deviceId || n.localOnly) && (
                  <button
                    onClick={() => deleteNote(n)}
                    className="text-xs text-red-300 hover:text-red-400"
                    title="Borrar mi nota"
                  >
                    🗑️ Borrar
                  </button>
                )}
              </div>
            </div>

            <div className="mt-1 whitespace-pre-wrap">{n.content}</div>

            <div className="mt-2 flex gap-2 text-xs">
              {EMOJIS.map((e) => {
                const users = n.reactions?.[e] || [];
                const active = users.includes(deviceId);
                return (
                  <button
                    key={e}
                    onClick={() => toggleReaction(n.id, e)}
                    className={`rounded-full px-2 py-1 ${
                      active ? "bg-white text-black" : "bg-white/10"
                    }`}
                  >
                    {e} {users.length || ""}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <input
          className="w-40 rounded-xl bg-black/30 px-3 py-2 text-sm"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          ref={areaRef}
          placeholder="Escribe una nota..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!sending && input.trim()) sendNote();
            }
          }}
          className="flex-1 resize-none rounded-xl bg-black/30 px-3 py-2 text-sm"
          rows={1}
        />
        <button
          onClick={sendNote}
          disabled={!input.trim() || sending}
          className="rounded-xl bg-white text-black px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}
