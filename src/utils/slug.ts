// Normaliza un texto para usarlo en IDs de Firestore
export function slug(s: string | undefined | null) {
  const base = (s || "").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")     // quita acentos
    .replace(/[^a-z0-9]+/gi, "-")        // sólo letras/números/guiones
    .replace(/^-+|-+$/g, "")             // limpia bordes
    .toLowerCase();
  return base || "sin-titulo";
}

// ID estable por bloque: yyyy-mm-dd + ciudad
export function makeBlockId(dateISO: string, titleLike: string | undefined | null) {
  return `${dateISO}-${slug(titleLike)}`;  // ej: 2025-10-21-llegada-y-osaka-5-noches
}
