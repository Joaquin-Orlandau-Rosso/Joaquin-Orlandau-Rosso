// Genera los SVG animados del perfil (banner, botones, tarjetas y pie).
// Usa la paleta y la tipografía (Hanken Grotesk) del portfolio.
// Uso: npm run build
import { writeFile, mkdir } from 'node:fs/promises';
import opentype from 'opentype.js';

const OUT = new URL('../assets/', import.meta.url);

const C = {
  ink: '#16130e',
  ink2: '#1d1913',
  line: '#2c261e',
  cream: '#faf7f1',
  sand: '#e9e1d4',
  mute: '#a39987',
  teal: '#0e6e7a',
  tealText: '#5cc8d4',
  terra: '#b04a2b',
  coral: '#e8876b',
  coralText: '#f0a088',
};

const FAMILY = "'HG','Hanken Grotesk','Segoe UI',Helvetica,Arial,sans-serif";

// ---------- fuentes: subconjunto de Google Fonts con solo los glifos usados ----------
async function loadFonts(textsByWeight) {
  const fonts = {};
  for (const [weight, texts] of Object.entries(textsByWeight)) {
    const chars = [...new Set(texts.join('') + ' ')].join('');
    const cssUrl = `https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@${weight}&text=${encodeURIComponent(chars)}`;
    const css = await (await fetch(cssUrl)).text();
    const url = css.match(/url\((.+?)\)/)?.[1];
    if (!url) throw new Error(`Sin fuente para peso ${weight}: ${css.slice(0, 200)}`);
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    fonts[weight] = { b64: buf.toString('base64'), font };
  }
  return fonts;
}

const fontFaces = (fonts) =>
  Object.entries(fonts)
    .map(([w, f]) => `@font-face{font-family:'HG';font-weight:${w};src:url(data:font/ttf;base64,${f.b64}) format('truetype')}`)
    .join('');

const measure = (fonts, weight, text, size, spacing = 0) =>
  fonts[weight].font.getAdvanceWidth(text, size, { kerning: true }) + spacing * text.length;

function wrap(fonts, weight, text, size, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(fonts, weight, next, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Onda periódica (período P) que se puede desplazar P px sin cortes.
function wavePath(P, A, B, width, height) {
  let d = `M0 ${B} Q${P / 4} ${B - A} ${P / 2} ${B}`;
  for (let x = P; x <= width + P + P / 2; x += P / 2) d += ` T${x} ${B}`;
  return `${d} V${height} H0 Z`;
}

const REDUCED = '@media (prefers-reduced-motion: reduce){*{animation:none!important}}';

// ---------- banner ----------
async function header() {
  const W = 1200, H = 320;
  const eyebrow = "HOLA, SOY  ·  HI, I'M";
  const name = 'Joaquín Orlandau Rosso';
  const role = 'Full Stack Developer  ·  Buenos Aires, Argentina';
  const pill = 'Disponible  ·  Open to work';
  const fonts = await loadFonts({ 600: [eyebrow], 700: [name], 500: [role, pill] });

  const roleW = measure(fonts, 500, role, 23);
  const pillW = measure(fonts, 500, pill, 15) + 52;
  const pillX = W - 64 - pillW;

  const waves = [
    { P: 600, A: 20, B: 260, fill: C.teal, op: 0.6, dur: 16, rev: false },
    { P: 420, A: 14, B: 280, fill: C.terra, op: 0.55, dur: 11, rev: true },
    { P: 800, A: 17, B: 299, fill: C.coral, op: 0.32, dur: 21, rev: false },
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(name)} · Full Stack Developer">
<title>${esc(name)} · Full Stack Developer</title>
<style>${fontFaces(fonts)}
text{font-family:${FAMILY}}
.in{animation:in 1s cubic-bezier(.2,.7,.2,1) both}
.d1{animation-delay:.1s}.d2{animation-delay:.28s}.d3{animation-delay:.46s}.d4{animation-delay:.7s}
@keyframes in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
${waves.map((w, i) => `.w${i}{animation:w${i} ${w.dur}s linear infinite}@keyframes w${i}{from{transform:translateX(${w.rev ? -w.P : 0}px)}to{transform:translateX(${w.rev ? 0 : -w.P}px)}}`).join('\n')}
.breathe{animation:breathe 7s ease-in-out infinite alternate}
.breathe2{animation:breathe 9s ease-in-out infinite alternate-reverse}
@keyframes breathe{from{opacity:.55}to{opacity:1}}
.caret{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
${REDUCED}
</style>
<defs>
  <clipPath id="clip"><rect width="${W}" height="${H}" rx="20"/></clipPath>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.ink2}"/><stop offset="1" stop-color="#110e0a"/></linearGradient>
  <radialGradient id="gTeal"><stop offset="0" stop-color="${C.teal}" stop-opacity=".55"/><stop offset="1" stop-color="${C.teal}" stop-opacity="0"/></radialGradient>
  <radialGradient id="gTerra"><stop offset="0" stop-color="${C.terra}" stop-opacity=".45"/><stop offset="1" stop-color="${C.terra}" stop-opacity="0"/></radialGradient>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.1" fill="${C.cream}" fill-opacity=".09"/></pattern>
  <linearGradient id="fade" x1="0" x2="1"><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
  <mask id="dotMask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
</defs>
<g clip-path="url(#clip)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle class="breathe" cx="1020" cy="20" r="360" fill="url(#gTeal)"/>
  <circle class="breathe2" cx="120" cy="330" r="320" fill="url(#gTerra)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#dotMask)"/>
  ${waves.map((w, i) => `<path class="w${i}" d="${wavePath(w.P, w.A, w.B, W, H)}" fill="${w.fill}" fill-opacity="${w.op}"/>`).join('\n  ')}
  <text class="in d1" x="72" y="98" font-size="15" font-weight="600" letter-spacing="3.5" fill="${C.coral}">${esc(eyebrow)}</text>
  <text class="in d2" x="69" y="166" font-size="68" font-weight="700" letter-spacing="-1.5" fill="${C.cream}">${esc(name)}</text>
  <g class="in d3">
    <text x="72" y="210" font-size="23" font-weight="500" fill="${C.sand}">${esc(role)}</text>
    <rect class="caret" x="${(72 + roleW + 8).toFixed(1)}" y="191" width="11" height="23" rx="2" fill="${C.coral}"/>
  </g>
  <g class="in d4">
    <rect x="${pillX.toFixed(1)}" y="46" width="${pillW.toFixed(1)}" height="36" rx="18" fill="${C.cream}" fill-opacity=".06" stroke="${C.cream}" stroke-opacity=".16"/>
    <circle cx="${(pillX + 22).toFixed(1)}" cy="64" r="9" fill="${C.tealText}" fill-opacity=".25"><animate attributeName="r" values="5;11;5" dur="2.4s" repeatCount="indefinite"/><animate attributeName="fill-opacity" values=".45;0;.45" dur="2.4s" repeatCount="indefinite"/></circle>
    <circle cx="${(pillX + 22).toFixed(1)}" cy="64" r="4.5" fill="${C.tealText}"/>
    <text x="${(pillX + 38).toFixed(1)}" y="69.5" font-size="15" font-weight="500" fill="${C.sand}">${esc(pill)}</text>
  </g>
</g>
</svg>`;
  await writeFile(new URL('header.svg', OUT), svg);
}

// ---------- pie ----------
async function footer() {
  const W = 1200, H = 130;
  const msg = 'Gracias por pasar  ·  Thanks for stopping by';
  const fonts = await loadFonts({ 500: [msg] });
  const waves = [
    { P: 600, A: 18, B: 54, fill: C.teal, op: 0.6, dur: 16, rev: true },
    { P: 420, A: 13, B: 38, fill: C.terra, op: 0.55, dur: 12, rev: false },
    { P: 800, A: 15, B: 22, fill: C.coral, op: 0.3, dur: 21, rev: true },
  ];
  // Las ondas se dibujan hacia arriba (espejadas) para que el pie cierre el banner.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(msg)}">
<style>${fontFaces(fonts)}
text{font-family:${FAMILY}}
${waves.map((w, i) => `.w${i}{animation:w${i} ${w.dur}s linear infinite}@keyframes w${i}{from{transform:translateX(${w.rev ? -w.P : 0}px)}to{transform:translateX(${w.rev ? 0 : -w.P}px)}}`).join('\n')}
${REDUCED}
</style>
<defs><clipPath id="clip"><rect width="${W}" height="${H}" rx="20"/></clipPath></defs>
<g clip-path="url(#clip)">
  <rect width="${W}" height="${H}" fill="${C.ink}"/>
  <g transform="translate(0 ${H}) scale(1 -1)">
  ${waves.map((w, i) => `<path class="w${i}" d="${wavePath(w.P, w.A, H - w.B, W, H)}" fill="${w.fill}" fill-opacity="${w.op}"/>`).join('\n  ')}
  </g>
  <text x="${W / 2}" y="${H - 28}" text-anchor="middle" font-size="16" font-weight="500" letter-spacing=".3" fill="${C.mute}">${esc(msg)}</text>
</g>
</svg>`;
  await writeFile(new URL('footer.svg', OUT), svg);
}

// ---------- botones de contacto ----------
const ICONS = {
  // Íconos de línea simples, dibujados a mano (24x24).
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.5V17M8 7.4v.1M12 17v-6.5M12 13.4c0-1.7 1.1-2.9 2.6-2.9S17 11.5 17 13.2V17"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
};

async function buttons() {
  const list = [
    { file: 'btn-portfolio', label: 'Portfolio', icon: 'globe', accent: C.tealText },
    { file: 'btn-linkedin', label: 'LinkedIn', icon: 'linkedin', accent: C.tealText },
    { file: 'btn-cv', label: 'CV', icon: 'file', accent: C.coral },
  ];
  const fonts = await loadFonts({ 600: list.map((b) => b.label) });
  for (const b of list) {
    const H = 44, size = 16;
    const W = Math.round(measure(fonts, 600, b.label, size, 0.3) + 74);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${b.label}">
<style>${fontFaces(fonts)}text{font-family:${FAMILY}}</style>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${H / 2 - 0.5}" fill="${C.ink}" stroke="${b.accent}" stroke-opacity=".55"/>
<g transform="translate(20 11) scale(.92)" fill="none" stroke="${b.accent}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[b.icon]}</g>
<text x="52" y="28" font-size="${size}" font-weight="600" letter-spacing=".3" fill="${C.cream}">${b.label}</text>
</svg>`;
    await writeFile(new URL(`${b.file}.svg`, OUT), svg);
  }
}

// ---------- tarjetas de proyectos ----------
const PROJECTS = [
  {
    file: 'elodiff', accent: 'teal', tag: 'PRODUCTO PROPIO  ·  WEB + WINDOWS', title: 'EloDiff',
    es: 'Coach de League of Legends con IA: analiza tus partidas, campeones y errores principales.',
    en: 'AI League of Legends coach that reviews your own games.',
    chips: ['Next.js', 'TypeScript', 'Electron', 'Riot API', 'IA'],
  },
  {
    file: 'despensa', accent: 'teal', tag: 'PRODUCTO PROPIO  ·  ANDROID + WEB', title: 'Despensa',
    es: 'Inventario del hogar con escaneo de tickets por IA, códigos de barras y listas compartidas.',
    en: 'Home inventory app with AI receipt scanning.',
    chips: ['React', 'Capacitor', 'Supabase', 'Gemini'],
  },
  {
    file: 'sistemas', accent: 'teal', tag: 'DEMOS  ·  SISTEMAS PARA NEGOCIOS', title: 'Turnos, consorcio y cotizador',
    es: 'Turnos online con seña, portal de consorcio y cotizador con stock por fecha.',
    en: 'Bookings with deposits, a building portal and a quote tool.',
    chips: ['React', 'TypeScript', 'Vite'],
  },
  {
    file: 'novagraf', accent: 'coral', tag: 'CLIENTE  ·  INDUSTRIA', title: 'Novagraf',
    es: 'Sitio de un fabricante argentino de máquinas para la industria del packaging.',
    en: 'Website for an Argentine packaging machinery maker.',
    chips: ['novagraf.com.ar'],
  },
  {
    file: 'marsela', accent: 'coral', tag: 'CLIENTE  ·  BIENESTAR', title: 'Marsela Rosso',
    es: 'Masajes terapéuticos, cosmiatría y tienda de aceites esenciales MARSSELA.',
    en: 'Wellness studio website with an essential-oils shop.',
    chips: ['marsselarosso.com'],
  },
  {
    file: 'maria', accent: 'coral', tag: 'CLIENTE  ·  COACHING', title: 'María Astro Coach',
    es: 'Carta natal, revolución solar y coaching ontológico con sesiones online.',
    en: 'Astrology and ontological coaching, online sessions.',
    chips: ['mariaasastrocoach.vercel.app'],
  },
];

async function cards() {
  const W = 440, H = 240, X = 28, MAXW = W - X * 2;
  const all = PROJECTS.flatMap((p) => [p.tag, p.title, p.es, p.en, ...p.chips]);
  const fonts = await loadFonts({ 400: all, 600: all, 700: all });

  for (const [i, p] of PROJECTS.entries()) {
    const base = p.accent === 'teal' ? C.teal : C.terra;
    const text = p.accent === 'teal' ? C.tealText : C.coralText;
    const esLines = wrap(fonts, 400, p.es, 15.5, MAXW).slice(0, 2);
    const enLines = wrap(fonts, 400, p.en, 13.5, MAXW).slice(0, 1);
    const titleSize = measure(fonts, 700, p.title, 30) > MAXW - 30 ? 25 : 30;

    let cx = X;
    const chips = p.chips.map((c) => {
      const w = measure(fonts, 600, c, 12, 0.2) + 22;
      const out = `<rect x="${cx.toFixed(1)}" y="${H - 52}" width="${w.toFixed(1)}" height="26" rx="13" fill="${base}" fill-opacity=".22" stroke="${text}" stroke-opacity=".4"/><text x="${(cx + 11).toFixed(1)}" y="${H - 34.5}" font-size="12" font-weight="600" letter-spacing=".2" fill="${text}">${esc(c)}</text>`;
      cx += w + 7;
      return out;
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(p.title)}: ${esc(p.es)}">
<title>${esc(p.title)}</title>
<style>${fontFaces(fonts)}
text{font-family:${FAMILY}}
.shine{animation:shine 5s ease-in-out ${(i * 0.6).toFixed(1)}s infinite}
@keyframes shine{0%{transform:translateX(-160px)}55%,100%{transform:translateX(${W + 40}px)}}
.glow{animation:glow 6s ease-in-out ${(i * 0.8).toFixed(1)}s infinite alternate}
@keyframes glow{from{opacity:.5}to{opacity:1}}
${REDUCED}
</style>
<defs>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <radialGradient id="g"><stop offset="0" stop-color="${base}" stop-opacity=".5"/><stop offset="1" stop-color="${base}" stop-opacity="0"/></radialGradient>
  <linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="${C.cream}" stop-opacity="0"/><stop offset=".5" stop-color="${C.cream}" stop-opacity=".9"/><stop offset="1" stop-color="${C.cream}" stop-opacity="0"/></linearGradient>
</defs>
<g clip-path="url(#c)">
  <rect width="${W}" height="${H}" fill="${C.ink}"/>
  <circle class="glow" cx="${W - 20}" cy="-10" r="230" fill="url(#g)"/>
  <rect width="${W}" height="3" fill="${text}" fill-opacity=".85"/>
  <rect class="shine" width="140" height="3" fill="url(#s)"/>
  <text x="${X}" y="44" font-size="11.5" font-weight="600" letter-spacing="2" fill="${text}">${esc(p.tag)}</text>
  <path d="M${W - 42} 46 L${W - 29} 33 M${W - 39} 33 H${W - 29} V43" fill="none" stroke="${C.cream}" stroke-opacity=".6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="${X - 1}" y="86" font-size="${titleSize}" font-weight="700" letter-spacing="-.4" fill="${C.cream}">${esc(p.title)}</text>
  ${esLines.map((l, k) => `<text x="${X}" y="${118 + k * 21}" font-size="15.5" font-weight="400" fill="${C.sand}">${esc(l)}</text>`).join('\n  ')}
  ${enLines.map((l) => `<text x="${X}" y="${118 + esLines.length * 21 + 4}" font-size="13.5" font-weight="400" fill="${C.mute}">${esc(l)}</text>`).join('')}
  ${chips.join('\n  ')}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" fill="none" stroke="${C.cream}" stroke-opacity=".1"/>
</svg>`;
    await writeFile(new URL(`cards/${p.file}.svg`, OUT), svg);
  }
}

await mkdir(new URL('cards/', OUT), { recursive: true });
await Promise.all([header(), footer(), buttons(), cards()]);
console.log('SVG generados en assets/');
