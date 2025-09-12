import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Tab = {
  key: string;
  label: string;
  emoji?: string;
  // Icono tipo lucide-react u otro componente que acepte {size?: number}
  icon: React.ComponentType<{ size?: number }>;
};

type Props = {
  tabs: Tab[];
  current: string;
  onChange: (key: string) => void;
};

export default function BottomNav({ tabs, current, onChange }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Comprobar si hay overflow para mostrar flechas
  const checkOverflow = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkOverflow();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => checkOverflow();
    const onResize = () => checkOverflow();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollBy = (dx: number) => {
    scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40">
      <div className="max-w-md mx-auto px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
        <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/90 shadow-lg overflow-hidden">
          {/* Flechas */}
          {canLeft && (
            <button
              onClick={() => scrollBy(-140)}
              aria-label="Anterior"
              className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 rounded-xl border border-zinc-300/60 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-900/70 backdrop-blur"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {canRight && (
            <button
              onClick={() => scrollBy(140)}
              aria-label="Siguiente"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-xl border border-zinc-300/60 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-900/70 backdrop-blur"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Carrusel horizontal */}
          <div
            ref={scrollerRef}
            className="flex gap-2 px-2 py-2 overflow-x-auto scrollbar-none scroll-smooth"
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = t.key === current;
              return (
                <button
                  key={t.key}
                  onClick={() => onChange(t.key)}
                  className={[
                    "shrink-0 min-w-[88px] px-3 py-1.5 rounded-xl",
                    "flex flex-col items-center justify-center gap-1",
                    "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600",
                    active
                      ? "bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 dark:from-indigo-400/20 dark:to-fuchsia-400/20 border border-indigo-300/50 dark:border-indigo-500/40"
                      : "border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                  aria-label={t.label}
                >
                  <Icon size={20} />
                  <span
                    className={[
                      "text-[11px] leading-none",
                      active ? "font-semibold" : "text-zinc-500 dark:text-zinc-400",
                    ].join(" ")}
                  >
                    {t.emoji ? `${t.emoji} ${t.label}` : t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
