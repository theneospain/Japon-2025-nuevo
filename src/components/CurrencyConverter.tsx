import { useState } from "react";
import { Copy } from "lucide-react";

export default function CurrencyConverter() {
  const rate = 173; // tasa fija
  const [eur, setEur] = useState<string>("1");
  const [jpy, setJpy] = useState<string>((173).toString());

  const handleEurChange = (v: string) => {
    setEur(v);
    const num = parseFloat(v || "0");
    setJpy((num * rate).toFixed(2));
  };

  const handleJpyChange = (v: string) => {
    setJpy(v);
    const num = parseFloat(v || "0");
    setEur((num / rate).toFixed(2));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${eur} € = ${jpy} ¥`);
      alert("Resultado copiado ✅");
    } catch {}
  };

  return (
    <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 shadow-sm space-y-3">
      <h3 className="text-base font-semibold">Conversor EUR ↔ JPY</h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Tasa fija · 1 € = {rate} ¥
      </p>

      <div className="flex flex-col gap-2">
        <label className="text-sm">
          Euros (€)
          <input
            type="number"
            value={eur}
            onChange={(e) => handleEurChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800"
          />
        </label>
        <label className="text-sm">
          Yenes (¥)
          <input
            type="number"
            value={jpy}
            onChange={(e) => handleJpyChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800"
          />
        </label>
      </div>

      <button
        onClick={copy}
        className="text-sm px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
      >
        <Copy size={14} /> Copiar resultado
      </button>
    </div>
  );
}
