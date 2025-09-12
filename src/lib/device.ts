// src/lib/device.ts
export const DEVICE_KEY = "notes_device_id";

export function getDeviceId(): string {
  try {
    // getItem puede devolver null ⇒ estrechamos el tipo
    const stored = localStorage.getItem(DEVICE_KEY);
    if (typeof stored === "string" && stored.length > 0) {
      return stored;
    }

    // Genera un id estable (usa crypto.randomUUID si existe)
    const generated =
      (typeof crypto !== "undefined" &&
        (crypto as any)?.randomUUID?.()) ||
      `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(DEVICE_KEY, generated);
    return generated;
  } catch {
    // SSR / modo privado extremo
    return "anon";
  }
}
