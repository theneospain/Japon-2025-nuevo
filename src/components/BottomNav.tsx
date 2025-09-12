// src/components/BottomNav.tsx
import React, { useRef } from "react";

type TabLike = {
  key: string;
  label: string;
  emoji?: string;
  icon: React.ComponentType<{ size?: number }>;
};

export default function BottomNav({
  tabs,
  current,
  onChange,
}: {
  tabs: TabLike[];
  current: string;
  onChange: (k: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dx: number) =>
    scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
        <div className="relative">
          {/* Flecha izquierda */}
          <button
            onClick={() => scrollBy(-160)}
            className="pointer-events-auto absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow flex items-center justify-center"
            aria-label="Anterior"
          >
            ‹
          </button>

          {/* Carrusel de pestañas */}
          <div
            ref={scrollerRef}
            className="pointer-events-auto flex gap-2 overflow-x-auto no-scrollbar p-2 bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg snap-x snap-mandatory"
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = current === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => onChange(t.key)}
                  className={`snap-start shrink-0 w-[84px] flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 ${
                    active
                      ? "bg-zinc-100 dark:bg-zinc-800"
                      : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70"
                  }`}
                  aria-current={active ? "page" : undefined}
                  aria-label={t.label}
                >
                  <Icon size={20} />
                  <span
                    className={`text-[11.5px] leading-none ${
                      active ? "font-semibold" : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {t.emoji ? `${t.emoji} ${t.label}` : t.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Flecha derecha */}
          <button
            onClick={() => scrollBy(160)}
            className="pointer-events-auto absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow flex items-center justify-center"
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      </div>
    </nav>
  );
}
