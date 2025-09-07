// src/data/photoIdeas.ts
export type PhotoIdea = {
  id: string;
  city: "Osaka" | "Kioto" | "Tokio" | "Nara" | "Hiroshima" | "Miyajima" | "Hakone" | "Universal";
  place: string;            // nombre del sitio
  gmaps?: string;           // si no lo pones, se generará con city+place
  vibe: ("creativo" | "divertido" | "épico" | "nocturno" | "perspectiva" | "reflejo" | "documental")[];
  who: ("solo" | "pareja" | "grupo")[]; // para quién funciona
  idea: string;             // la idea resumida
  how: string;              // cómo ejecutarla (pasos)
  tips?: string;            // consejos extra (luz, etiqueta, seguridad)
  time?: "mañana" | "tarde" | "noche" | "cualquier";
};

export const PHOTO_IDEAS: PhotoIdea[] = [
  // ───────── OSAKA
  {
    id: "osaka-glico-reflejo",
    city: "Osaka",
    place: "Dotonbori (Cartel Glico)",
    vibe: ["nocturno", "reflejo", "divertido"],
    who: ["solo", "pareja", "grupo"],
    idea: "Reflejos en el canal + pose de victoria tipo Glico",
    how: "Busca barandilla con agua quieta; baja ángulo para coger el reflejo. Larga exposición 1/5–1/2s apoyando el móvil o usando modo noche.",
    tips: "Evita bloquear paso; cuidado con pertenencias. Mejor tras el anochecer.",
    time: "noche",
  },
  {
    id: "osaka-namba-yasaka-boca",
    city: "Osaka",
    place: "Namba Yasaka",
    vibe: ["épico", "perspectiva"],
    who: ["solo", "pareja"],
    idea: "Sujeto centrado ‘dentro’ de la boca del león",
    how: "Lente gran angular y simetría; alinea escalones y encuadre con la boca.",
    tips: "Respeta el templo. Evita trípode en horas punta.",
    time: "mañana",
  },
  {
    id: "osaka-umeda-silueta",
    city: "Osaka",
    place: "Umeda Sky Building (pasarela)",
    vibe: ["épico", "nocturno"],
    who: ["pareja", "grupo"],
    idea: "Siluetas con la ciudad de fondo",
    how: "Expon para las luces de la ciudad y coloca a la gente entre tú y el skyline.",
    tips: "Evita flash para mantener la silueta clara.",
    time: "noche",
  },

  // ───────── NARA
  {
    id: "nara-reverencia",
    city: "Nara",
    place: "Parque de Nara (cualquier claro)",
    vibe: ["documental", "divertido"],
    who: ["solo", "pareja", "grupo"],
    idea: "Reverencia mutua con el ciervo",
    how: "Sujeto frente al ciervo con cracker; inclínate despacio. Dispara ráfaga para capturar el gesto.",
    tips: "No fuerces al animal, sin comida en bolsillos; manos limpias después.",
    time: "mañana",
  },
  {
    id: "nara-linternas-kasuga",
    city: "Nara",
    place: "Kasuga Taisha (sendero de linternas)",
    vibe: ["creativo", "perspectiva"],
    who: ["solo", "pareja"],
    idea: "Profundidad entre linternas con persona centrada",
    how: "Encuadre a media altura, usa tele ligero (50–85mm o 2x). Fondo comprimido.",
    tips: "No toques ni te subas a las linternas.",
    time: "tarde",
  },

  // ───────── KIOTO
  {
    id: "kioto-fushimi-motion",
    city: "Kioto",
    place: "Fushimi Inari (túnel de torii)",
    vibe: ["creativo", "épico"],
    who: ["solo", "pareja"],
    idea: "Sujeto quieto + barrido de gente (motion blur)",
    how: "1/5–1/2s con móvil apoyado; sujeto quieto mirando a cámara; deja pasar gente.",
    tips: "Madruga para menos público. Respeta el paso.",
    time: "mañana",
  },
  {
    id: "kioto-arashiyama-bambu",
    city: "Kioto",
    place: "Bosque de bambú (camino central)",
    vibe: ["creativo", "perspectiva"],
    who: ["pareja", "grupo"],
    idea: "Contrapicado entre bambú con brazos extendidos",
    how: "Gran angular apuntando arriba; coloca a la pareja en tercio inferior.",
    tips: "Evita tocar el bambú.",
    time: "mañana",
  },
  {
    id: "kioto-kinkaku-reflejo",
    city: "Kioto",
    place: "Kinkaku-ji (estanque)",
    vibe: ["reflejo", "épico"],
    who: ["solo", "pareja"],
    idea: "Reflejo del pabellón dorado con sujeto de espaldas",
    how: "Encadre bajo para incluir espejo de agua; sujeto pequeño para dar escala.",
    tips: "Aguanta viento para mejor reflejo.",
    time: "tarde",
  },

  // ───────── HIROSHIMA / MIYAJIMA
  {
    id: "miyajima-torii-salto",
    city: "Miyajima",
    place: "Torii de Itsukushima",
    vibe: ["divertido", "épico"],
    who: ["grupo", "pareja"],
    idea: "Salto sincronizado con el torii alineado",
    how: "Cuenta 1-2-3 y dispara en ráfaga; alinea suelo y torii al centro.",
    tips: "Marea baja = te acercas; marea alta = silueta con agua.",
    time: "tarde",
  },
  {
    id: "miyajima-calle-ciervo",
    city: "Miyajima",
    place: "Calles comerciales",
    vibe: ["documental", "divertido"],
    who: ["solo", "pareja"],
    idea: "Deer photobomb (ciervo mirando a cámara y tú al fondo)",
    how: "Enfoca al ciervo en primer plano a f/2–2.8 (modo retrato).",
    tips: "No alimentar con papel/bolsas.",
    time: "cualquier",
  },

  // ───────── HAKONE
  {
    id: "hakone-fuji-ventana",
    city: "Hakone",
    place: "Ropeway / mirador Owakudani",
    vibe: ["épico", "creativo"],
    who: ["solo", "pareja"],
    idea: "Mont Fuji encuadrado en ventana / barandilla",
    how: "Busca marco geométrico y sitúa Fuji centrado; sujeto en silueta.",
    tips: "Día claro tras lluvia = mejor visibilidad.",
    time: "mañana",
  },

  // ───────── UNIVERSAL
  {
    id: "universal-hogsmeade-persp",
    city: "Universal",
    place: "Hogsmeade (calle principal)",
    vibe: ["creativo", "documental"],
    who: ["pareja", "grupo"],
    idea: "Perspectiva con varitas cruzadas y castillo al fondo",
    how: "Foco en varitas (primer plano), castillo desenfocado detrás.",
    tips: "Sin bloquear el paso.",
    time: "tarde",
  },
  {
    id: "universal-mario-warp",
    city: "Universal",
    place: "Super Nintendo World (tubería)",
    vibe: ["divertido", "creativo"],
    who: ["solo", "pareja"],
    idea: "Salida de tubería (ojo pez/gran angular) ‘saliendo’ de ella",
    how: "Acércate con gran angular y pon la tubería ocupando el marco.",
    tips: "Timed Entry: calcula hora con luz.",
    time: "cualquier",
  },

  // ───────── TOKIO
  {
    id: "tokio-shibuya-long",
    city: "Tokio",
    place: "Cruce de Shibuya",
    vibe: ["nocturno", "épico", "reflejo"],
    who: ["grupo", "pareja"],
    idea: "Larga exposición con paraguas (reflejos en suelo mojado)",
    how: "Apoya el móvil, 1/2–1s, paraguas traslúcido iluminado por neones.",
    tips: "Si llueve, mejor. Si no, busca charcos artificiales (poca agua).",
    time: "noche",
  },
  {
    id: "tokio-zojoji-tower-frame",
    city: "Tokio",
    place: "Zojo-ji + Tokyo Tower",
    vibe: ["perspectiva", "épico"],
    who: ["solo", "pareja"],
    idea: "Tokyo Tower ‘enmarcada’ por el templo",
    how: "Alinear simetría desde patio; sujeto centrado, torre en eje.",
    tips: "Atardecer con torre iluminada queda top.",
    time: "tarde",
  },
  {
    id: "tokio-akihabara-bokeh",
    city: "Tokio",
    place: "Akihabara (arcos y neones)",
    vibe: ["nocturno", "creativo"],
    who: ["solo", "pareja"],
    idea: "Umbrella bokeh (luces circulares detrás)",
    how: "Modo retrato f/1.8–2.8; sujeto cerca, luces lejos.",
    tips: "Paraguas transparente suma mucho.",
    time: "noche",
  },
  {
    id: "tokio-asakusa-linterna",
    city: "Tokio",
    place: "Senso-ji (linterna Kaminarimon)",
    vibe: ["documental", "perspectiva"],
    who: ["grupo", "pareja", "solo"],
    idea: "Bajo la linterna roja, contrapicado simétrico",
    how: "Gran angular mirando arriba; personas centradas mirando linterna.",
    tips: "Madruga para cero gente.",
    time: "mañana",
  },
];
