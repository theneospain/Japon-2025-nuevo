// src/components/PhotoGallery.tsx
import React, { useRef, useState } from "react";
import { Image as ImageIcon, Link as LinkIcon, FolderOpen } from "lucide-react";

type Props = {
  placeId: string;
  placeName?: string;

  /** Modo minimal: solo botones, sin títulos ruidosos, con estilo “pill” */
  compact?: boolean;
  /** Mostrar/ocultar botones secundarios */
  showUrl?: boolean;     // default true
  showAlbum?: boolean;   // default true

  className?: string;
};

export default function PhotoGallery({
  placeId,
  placeName,
  compact = false,
  showUrl = true,
  showAlbum = true,
  className = "",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<string[]>([]); // simplificado

  const onPick = () => fileRef.current?.click();

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Aquí meterías tu lógica real para subir/guardar
    const urls = files.map((f) => URL.createObjectURL(f));
    setItems((arr) => [...urls, ...arr].slice(0, 8));
    e.target.value = "";
  };

  const onPasteUrl = () => {
    const url = prompt("Pega una URL de imagen");
    if (!url) return;
    setItems((arr) => [url, ...arr].slice(0, 8));
  };

  const openAlbum = () => {
    const url = prompt("Pega la URL del álbum");
    if (!url) return;
    // Guarda el álbum como nota/enlace si quieres
    alert("Álbum enlazado ✅");
  };

  /** ——— BOTONES ——— */
  const Buttons = (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-2"
          : "flex flex-wrap items-center gap-2"
      }
    >
      {/* Subir desde galería (único obligatorio) */}
      <button
        onClick={onPick}
        className={`text-sm px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 
                    ${compact ? "bg-white/80 dark:bg-zinc-900/60" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"} 
                    inline-flex items-center gap-1`}
        title="Subir desde galería"
      >
        <ImageIcon size={16} /> Subir desde galería
      </button>

      {showUrl && (
        <button
          onClick={onPasteUrl}
          className={`text-sm px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 
                      hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1`}
          title="Pegar URL"
        >
          <LinkIcon size={16} /> Pegar URL
        </button>
      )}

      {showAlbum && (
        <button
          onClick={openAlbum}
          className={`text-sm px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 
                      hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1`}
          title="Enlazar álbum"
        >
          <FolderOpen size={16} /> Álbum
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onFiles}
      />
    </div>
  );

  return (
    <div className={className}>
      {/* Cabecera/contador solo si NO es compacto */}
      {!compact && (
        <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          {placeName ? <b>{placeName}</b> : "Recuerdos"} &nbsp;
          <span>(máx. 8)</span>
        </div>
      )}

      {/* Botones */}
      {Buttons}

      {/* Grid de fotos, siempre visible si hay elementos */}
      {items.length > 0 && (
        <div className={`mt-3 grid grid-cols-4 gap-2`}>
          {items.map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


