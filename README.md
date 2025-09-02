# Viaje Japón 2025 — React + Vite + Tailwind

App móvil para organizar el viaje a Japón: itinerario con checks automáticos, info práctica (conversor, frases), lugares con filtros (GF/SL y favoritos) y gastos compartidos.

## Requisitos
- Node.js 18+
- npm 9+

## Ejecutar en local
```bash
npm i
npm run dev
```
Abre http://localhost:5173

## Desplegar en Vercel
1) Sube esta carpeta a un repo de GitHub (ej. `viaje-japon-2025`).
2) En Vercel: **Add New → Project → Import from GitHub**.
3) Build: `npm run build` — Output: `dist` (detecta Vite automáticamente).
4) Deploy y comparte la URL.

## Netlify (alternativa)
- Build command: `npm run build`
- Publish directory: `dist`
