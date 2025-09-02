// src/components/PhotoGallery.tsx
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Plus, Link2, ExternalLink, X, Upload } from "lucide-react";

// Guardamos fotos como dataURL comprimido en localStorage (rápido y offline).
// Nota: localStorage tiene límite (~5MB por dominio). Para empezar vale; si os quedáis cortos, luego pasamos a IndexedDB/Cloudinary.

type PlaceGallery = { photos: string[]; album?: string };

function usePlaceGallery() {
  const [store, setStore] = useState<Record<string, PlaceGallery>>(() => {
    try { return JSON.parse(localStorage.getItem("jp_gallery_v1") || "{}"); } catch { return {}; }
  });
  useEffect(() => { try { localStorage.setItem("jp_gallery_v1", JSON.stringify(store)); } catch {} }, [store]);

  const get = (id: string) => store[id] || { photos: [], album: undefined };
  const addPhoto = (id: string, dataUrl: string) =>
    setStore(prev => {
      const g = prev[id] || { photos: [], album: undefined };
      const photos = [dataUrl.trim(), ...(g.photos || [])].slice(0, 8); // máx 8 por galería
      return { ...prev, [id]: { ...g, photos } };
    });
  const removePhoto = (id: string, idx: number) =>
    setStore(prev => {
      const g = prev[id] || { photos: [], album: undefined };
      const photos = (g.photos || []).filter((_, i) => i !== idx);
      return { ...prev, [id]: { ...g, photos } };
    });
  const setAlbum = (id: string, album?: string) =>
    setStore(prev => ({ ...prev, [id]: { ...get(id), album: album?.trim() || undefined } }));

  return { get, addPhoto, removePhoto, setAlbum } as const;
}

// Comprime la imagen a máx. 1600px y calidad 0.82 → dataURL (webp si es posible)
async function compressToDataURL(file: File, maxSide = 1600, quality = 0.82): Promise<string> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = r.result as string;
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const { width, height } = img;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Intentamos webp, si no, jpg
  const tryTypes = ["image/webp", "image/jpeg"];
  for (const type of tryTypes) {
    const dataUrl = canvas.toDataURL(type, quality);
    if (dataUrl && dataUrl.startsWith("data:")) return dataUrl;
  }
  return canvas.toDataURL(); // fallback
}

function PhotoModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      {url && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.img
            src={url}
            alt="preview"
            className="max-h-[85vh] max-w-[90vw] rounded-xl shadow-2xl border border-white/10"
            initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-zinc-900 shadow" aria-label="Cerrar">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function PhotoGallery({ placeId, placeName }: { placeId: string; placeName: string }) {
  const { get, addPhoto, removePhoto, setAlbum } = usePlaceGallery();
  const g = get(placeId);
  const [viewer, setViewer] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addUrl = () => {
    const url = prompt("Pega la URL DIRECTA de la imagen (jpg/png/webp).");
    if (!url) return;
    // Si no es dataURL, la guardamos igual (se verá por red). Para iPhone/Drive/Photos, quizá no sea “directa”.
    addPhoto(placeId, url);
  };

  const linkAlbum = () => {
    const url = prompt("Pega el ENLACE del álbum compartido (p. ej. Google Photos).");
    setAlbum(placeId, url || undefined);
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const dataUrl = await compressToDataURL(f);
      addPhoto(placeId, dataUrl);
    } catch {
      alert("No se pudo procesar la imagen.");
    } finally {
      e.target.value = ""; // reset para poder volver a seleccionar la misma imagen si quieres
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-2">
          <ImageIcon size={14} /> Recuerdos (máx. 8)
        </div>
        <div className="flex items-center gap-2">
          {/* Subir del móvil (cámara/carrete) */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPickFile}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-[11px] px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
            title="Hacer foto o elegir del carrete"
          >
            <Upload size={12} /> Subir del móvil
          </button>

          {/* Pegar URL */}
          <button
            onClick={addUrl}
            className="text-[11px] px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
            title="Pegar URL directa (jpg/png/webp)"
          >
            <Plus size={12} /> Pegar URL
          </button>

          {/* Álbum compartido */}
          <button
            onClick={linkAlbum}
            className="text-[11px] px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
          >
            <Link2 size={12} /> Álbum
          </button>

          {g.album && (
            <a
              href={g.album}
              target="_blank" rel="noreferrer"
              className="text-[11px] px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
            >
              <ExternalLink size={12} /> Ver álbum
            </a>
          )}
        </div>
      </div>

      {g.photos.length === 0 ? (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Aún no hay fotos. Usa “Subir del móvil”, “Pegar URL” o enlaza un Álbum.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {g.photos.slice(0, 8).map((u, i) => (
            <div key={i} className="relative">
              <img
                src={u}
                alt={`${placeName} ${i + 1}`}
                className="h-20 w-full object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                onClick={() => setViewer(u)}
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0.35")}
              />
              <button
                onClick={() => removePhoto(placeId, i)}
                className="absolute top-1 right-1 p-1 rounded-md bg-white/85 dark:bg-zinc-900/85 border border-zinc-200 dark:border-zinc-700"
                aria-label="Eliminar" title="Eliminar"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {viewer && <PhotoModal url={viewer} onClose={() => setViewer(null)} />}
    </div>
  );
}

