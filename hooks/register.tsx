import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Ciel d'orage bleu nuit, texte crème, accent or.
const { theme, problems } = makeColors({
  label: 'Saiyan transformation',
  only: 'dark',
  roles: { accent: '#f5c518', danger: '#e5484d', success: '#5fbf4a', warning: '#ff9f1a', pro: '#4fc3ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#080d1a',
        'surface-1': '#0d1424',
        'surface-2': '#121b2e',
        'surface-3': '#162036',
        'text-primary': '#fff4d6',
        'text-secondary': '#e6d8b0',
        'text-muted': '#b9ad8a',
      },
    },
  },
})

// --- Scène : orage, éclairs, aura dorée en pointes, sol rocheux, mascotte. ---
// La scène est un seul SVG animé en SMIL, dessiné en mode interactif : l'app le
// joue elle-même, de façon fluide, sans que le mod ait à le redessiner.

type Timing = { k?: string; begin?: number; discrete?: boolean }
type Wrap = (content: string) => string

const scene = () => {
// Attributs SMIL d'une suite de valeurs-clés qui boucle sur `dur` secondes.
const smil = (values: string, dur: number, o: Timing) =>
  ` values="${values}" dur="${dur}s" begin="${o.begin ?? 0}s"` +
  (o.k ? ` keyTimes="${o.k}"` : '') +
  (o.discrete ? ' calcMode="discrete"' : '') +
  ' repeatCount="indefinite"'

// Un <animate>, à placer dans l'élément qu'il anime.
const anim = (attr: string, values: string, dur: number, o: Timing = {}) =>
  `<animate attributeName="${attr}"${smil(values, dur, o)}/>`

// Un groupe animé par une transformation, autour de `content`.
const move =
  (type: 'translate' | 'scale' | 'rotate', values: string, dur: number, o: Timing = {}): Wrap =>
  content =>
    `<g><animateTransform attributeName="transform" type="${type}"${smil(values, dur, o)}/>${content}</g>`

// Applique `m` à `content` autour du point (x, y).
const pivot = (x: number, y: number, m: Wrap, content: string) =>
  `<g transform="translate(${x} ${y})">${m(`<g transform="translate(${-x} ${-y})">${content}</g>`)}</g>`

const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0

  return seed / 4294967296
}

const n0 = (v: number) => v.toFixed(0)

// Silhouette de flamme hérissée de pointes, de la base jusqu'à la cime.
const aura = (cx: number, base: number, halfW: number, height: number, n: number, seed: number) => {
  const r = rng(seed)
  const j = () => 0.82 + r() * 0.42
  const left: string[] = []
  const right: string[] = []

  for (let i = 0; i < n; i++) {
    const t = i / n
    const w = halfW * (1 - Math.pow(t, 1.5)) + 10
    const y = base - height * t
    const step = (height / n) * 1.6

    left.push(`${n0(cx - w * 0.66 * j())},${n0(y)}`, `${n0(cx - w * 1.14 * j())},${n0(y - step * j())}`)
    right.push(`${n0(cx + w * 0.66 * j())},${n0(y)}`, `${n0(cx + w * 1.14 * j())},${n0(y - step * j())}`)
  }

  return [`${n0(cx - halfW)},${base}`, ...left, `${cx},${n0(base - height * 1.1)}`, ...right.reverse(), `${n0(cx + halfW)},${base}`].join(' ')
}

// Trois images par couche, alternées comme en animation traditionnelle, et la
// couche entière qui enfle et retombe.
const auraLayer = (halfW: number, height: number, n: number, seed: number, fill: string, opacity: number, dur: number) =>
  pivot(
    800,
    930,
    move('scale', '1 1;1.05 1.07;0.97 0.95;1 1', dur, { k: '0;0.35;0.7;1' }),
    [0, 1, 2]
      .map(
        k =>
          `<polygon points="${aura(800, 930, halfW, height, n, seed + k * 7)}" fill="${fill}" fill-opacity="${opacity}">` +
          `${anim('opacity', '1;0;0', 1.5, { k: '0;0.334;1', begin: -1.5 + k * 0.5, discrete: true })}</polygon>`,
      )
      .join(''),
  )

// Grand éclair du ciel jusqu'à l'horizon, avec deux branches.
const boltLines = (x: number, seed: number) => {
  const r = rng(seed)
  let px = x
  const main = [`${n0(px)},-20`]
  const branches: string[] = []

  for (let i = 1; i <= 16; i++) {
    px += (r() - 0.5) * 110
    const y = i * 49
    main.push(`${n0(px)},${y}`)

    if (i === 5 || i === 10) {
      const dir = r() > 0.5 ? 1 : -1
      let bx = px
      const b = [`${n0(bx)},${y}`]

      for (let k = 1; k <= 4; k++) {
        bx += dir * (30 + r() * 50)
        b.push(`${n0(bx)},${n0(y + k * 38 + r() * 20)}`)
      }
      branches.push(b.join(' '))
    }
  }
  const lines = [main.join(' '), ...branches]

  return (
    lines.map((p, i) => `<polyline pathLength="1" points="${p}" stroke="#4aa8ff" stroke-width="${i ? 14 : 30}" stroke-opacity="0.3"/>`).join('') +
    lines.map((p, i) => `<polyline pathLength="1" points="${p}" stroke="#eaf7ff" stroke-width="${i ? 4 : 9}"/>`).join('')
  )
}

const BOLT_ATTRS = 'fill="none" stroke-linejoin="round" stroke-linecap="round"'

// Éclair du ciel : il se trace de haut en bas, clignote, puis s'éteint.
const skyBolt = (x: number, seed: number, dur: number, begin: number, thin = false) =>
  `<g ${BOLT_ATTRS}${thin ? ` transform="translate(${x} 0) scale(0.6 1) translate(${-x} 0)"` : ''}>` +
  `${anim('opacity', '1;1;0.2;1;0.35;1;0;0', dur, { k: '0;0.03;0.045;0.06;0.08;0.1;0.15;1', begin })}` +
  `${boltLines(x, seed)}</g>`

const BOLTS =
  `<g class="bl">${skyBolt(250, 5, 5.2, 0)}</g>` +
  `<g class="br">${skyBolt(1350, 9, 6.4, -2.3)}</g>` +
  [[560, 21, 7.3, -1.1], [1060, 33, 8.1, -4.7], [70, 41, 9.2, -6], [1530, 57, 6.9, -3.5]]
    .map(([x, s, t, d]) => skyBolt(x, s, t, d, true))
    .join('')

const flash = (dur: number, begin: number) =>
  `<rect width="1600" height="1000" fill="#bfe6ff" opacity="0">${anim('opacity', '0.14;0;0.1;0;0', dur, { k: '0;0.03;0.05;0.09;1', begin, discrete: true })}</rect>`

// Petit arc électrique en zigzag, qui crépite.
const arc = (x: number, y: number, seed: number, delay: number, dur: number) => {
  const r = rng(seed)
  const pts = [`${x},${y}`]
  let px = x
  let py = y
  const dx = (r() - 0.5) * 2

  for (let i = 0; i < 5; i++) {
    px += dx * 34 + (r() - 0.5) * 70
    py += 26 + r() * 34
    pts.push(`${n0(px)},${n0(py)}`)
  }

  return `<polyline points="${pts.join(' ')}" opacity="0">${anim('opacity', '1;0;1;0;0', dur, { k: '0;0.05;0.08;0.13;1', begin: delay - dur, discrete: true })}</polyline>`
}

const arcs = (list: number[][], width: number) =>
{
  const lines = list.map(([x, y, s, d, t]) => arc(x, y, s, d, t)).join('')

  return (
    `<g fill="none" stroke-linejoin="miter" stroke-linecap="round">` +
    `<g stroke="#3aa0ff" stroke-opacity="0.75" stroke-width="${width + 9}">${lines}</g>` +
    `<g stroke="#ffffff" stroke-width="${width}">${lines}</g></g>`
  )
}

const ARCS = arcs(
  [
    [560, 170, 11, 0.0, 2.3], [1030, 120, 12, 0.7, 2.9], [500, 420, 13, 1.3, 2.6], [1090, 380, 14, 0.3, 3.1],
    [620, 640, 15, 1.9, 2.4], [990, 620, 16, 1.1, 2.7], [700, 60, 17, 2.2, 3.3], [900, 250, 18, 1.6, 2.5],
    [450, 700, 19, 0.5, 3.4], [1140, 690, 20, 2.5, 2.8], [760, 480, 21, 0.9, 3.0], [860, 720, 22, 2.0, 2.2],
  ],
  7,
)

// Arcs qui courent sur la mascotte une fois transformée.
const BODY_ARCS = arcs(
  [
    [-30, -150, 61, 0.0, 1.3], [250, -170, 62, 0.4, 1.7], [-50, -20, 63, 0.9, 1.5], [290, -40, 64, 0.2, 1.9],
    [60, -210, 65, 1.1, 1.4], [190, -90, 66, 0.6, 1.6], [20, 30, 67, 1.4, 1.8], [230, 20, 68, 0.8, 1.2],
  ],
  5,
)

const SPARKS = [
  [640, 0, 2.8, 4], [720, 0.9, 2.2, 3], [880, 0.4, 2.5, 3], [960, 1.4, 3.0, 4], [800, 1.8, 2.0, 3],
  [560, 2.1, 3.4, 2.5], [1040, 0.2, 3.2, 2.5], [690, 2.6, 2.6, 2], [910, 2.9, 2.4, 2], [770, 1.2, 3.6, 2],
]
  .map(
    ([x, d, t, r]) =>
      move('translate', '0 0;0 -820', t, { begin: d - t })(
        `<circle cx="${x}" cy="900" r="${r}" fill="#fff3a0" opacity="0">${anim('opacity', '0;1;0', t, { k: '0;0.1;1', begin: d - t })}</circle>`,
      ),
  )
  .join('')

const CLOUDS = (
  [
    [200, 90, 420, 110, '#0b1c33', 38, 0], [760, 40, 520, 100, '#102a47', 46, -8], [1350, 110, 460, 120, '#0a1a30', 42, -15],
    [480, 250, 380, 80, '#16395c', 52, -20], [1120, 280, 420, 90, '#143352', 58, -5], [820, 400, 520, 80, '#1c4a70', 64, -28],
    [120, 420, 360, 80, '#17405f', 50, -12], [1500, 450, 380, 80, '#17405f', 56, -32],
  ] as [number, number, number, number, string, number, number][]
)
  .map(
    ([x, y, rx, ry, c, t, d]) =>
      `<radialGradient id="cl${x}"><stop offset="0.25" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>` +
      move('translate', '-70 0;70 0;-70 0', t, { begin: d })(
        `<ellipse cx="${x}" cy="${y}" rx="${rx * 1.35}" ry="${ry * 1.5}" fill="url(#cl${x})"/>`,
      ),
  )
  .join('')

// Une mèche : lame courbe de la racine à la pointe, avec un reflet, qui ondule seule.
const lock = (bx: number, w: number, tx: number, ty: number, fill: string, i: number) => {
  const dx = tx - bx
  const d =
    `M${n0(bx - w / 2)},8 Q${n0(bx - w / 2 + dx * 0.1 - w * 0.25)},${n0(ty * 0.55)} ${tx},${ty} ` +
    `Q${n0(bx + w / 2 + dx * 0.45)},${n0(ty * 0.4)} ${n0(bx + w / 2)},8 Z`
  const shine = `M${n0(bx - w * 0.12)},-6 Q${n0(bx + dx * 0.3 - w * 0.12)},${n0(ty * 0.5)} ${n0(bx + dx * 0.82)},${n0(ty * 0.84)}`
  const dur = 0.9 + (i % 4) * 0.18

  return pivot(
    bx,
    8,
    move('rotate', '-4;4;-4', dur, { begin: -i * 0.13 - dur }),
    `<path d="${d}" fill="${fill}" stroke="#b97a00" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="${shine}" fill="none" stroke="#fff8c4" stroke-width="${n0(w / 12)}" stroke-linecap="round" stroke-opacity="0.85"/>`,
  )
}

// Les cheveux jaillissent à la transformation (cycle de 10 s) puis retombent.
const hairRise = (content: string) =>
  `<g opacity="0">${anim('opacity', '0;1', 10, { k: '0;0.255', discrete: true })}` +
  `${pivot(128, 6, move('scale', '1 0;1 0;1.06 1.18;1 1;1 1;1 0', 10, { k: '0;0.25;0.285;0.32;0.94;1' }), content)}</g>`

// Mèches dressées en éventail : un rang sombre derrière, un rang clair devant.
const HAIR = hairRise(
  [[36, 52, -34, -78], [66, 58, 14, -158], [104, 62, 84, -226], [152, 62, 176, -236], [190, 58, 246, -166], [222, 52, 292, -84]]
    .map(([bx, w, tx, ty], i) => lock(bx, w, tx, ty, 'url(#hairB)', i))
    .join('') +
    [[54, 46, -4, -44], [86, 50, 50, -128], [128, 56, 126, -182], [170, 50, 208, -132], [204, 46, 262, -48]]
      .map(([bx, w, tx, ty], i) => lock(bx, w, tx, ty, 'url(#hairF)', i + 6))
      .join(''),
)

const FRINGE = hairRise(
  pivot(
    96,
    0,
    move('rotate', '-5;5;-5', 1.2),
    '<path d="M76,-4 Q82,26 100,46 Q112,22 118,-4 Z" fill="url(#hairF)" stroke="#b97a00" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M92,2 Q94,20 100,34" fill="none" stroke="#fff8c4" stroke-width="3" stroke-linecap="round"/>',
  ),
)

const ARM_UP = move('translate', '0 0;0 0;0 -10;0 8;0 -22;0 -14;0 -14;0 0', 10, { k: '0;0.13;0.17;0.24;0.28;0.34;0.92;1' })
const ARM_JAB = move(
  'translate',
  '0 0;0 0;0 -10;0 8;0 -22;0 -14;0 -14;-40 -14;0 -14;-40 -14;0 -14;0 -14;-48 -14;0 -14;0 -14;0 0',
  10,
  { k: '0;0.13;0.17;0.24;0.28;0.34;0.4;0.42;0.45;0.47;0.51;0.68;0.705;0.75;0.92;1' },
)
const leg = (x: number, begin: number) => move('translate', '0 0;0 -5;0 0', 1.4, { begin })(`<rect x="${x}" y="96" width="16" height="32"/>`)
const eye = (x: number) =>
  `<rect x="${x}" y="20" width="16" height="32" fill="#1b1b1b">${anim('fill', '#1b1b1b;#22e0d0;#1b1b1b', 10, { k: '0;0.26;0.97', discrete: true })}</rect>`

// Mascotte en pixels : forme normale, puis cheveux dorés dressés, regard turquoise.
// Trois mouvements emboîtés : flottement et charges, tremblement, puis le corps.
const MASCOT =
  `<g transform="translate(672 772)">` +
  move('translate', '0 0;0 0;0 -22;10 -14;-46 -16;0 -14;-46 -16;0 -20;12 -12;-60 -18;0 -14;0 -22;0 -16;0 0', 10, {
    k: '0;0.26;0.34;0.4;0.42;0.45;0.47;0.51;0.68;0.705;0.75;0.86;0.94;1',
  })(
    move('translate', '0 0;0 0;-5 0;5 0;-7 0;7 0;-8 0;8 0;-5 0;0 0;0 0', 10, { k: '0;0.14;0.155;0.17;0.185;0.2;0.215;0.23;0.245;0.26;1' })(
      HAIR +
        `<g shape-rendering="crispEdges" fill="#e9525c">` +
        `<rect x="32" y="0" width="192" height="96"/>` +
        ARM_JAB('<rect x="0" y="48" width="32" height="32"/>') +
        ARM_UP('<rect x="224" y="48" width="32" height="32"/>') +
        leg(48, 0) + leg(80, -0.7) + leg(160, -0.7) + leg(192, 0) +
        eye(48) + eye(144) +
        `</g>` +
        FRINGE +
        `<g stroke="#5a1620" stroke-width="8" stroke-linecap="square" opacity="0">${anim('opacity', '0;1;0', 10, { k: '0;0.15;0.97', discrete: true })}` +
        `<line x1="34" y1="4" x2="74" y2="18"/><line x1="178" y1="4" x2="138" y2="18"/></g>` +
        `<g opacity="0">${anim('opacity', '0;0.6;1;0', 10, { k: '0;0.16;0.26;0.95', discrete: true })}${BODY_ARCS}</g>` +
        `<g opacity="0">${anim('opacity', '0;0;0.95;0;0', 10, { k: '0;0.24;0.26;0.33;1' })}` +
        `${pivot(128, 40, move('scale', '0.2;0.2;0.6;3.2;0.2', 10, { k: '0;0.24;0.26;0.33;1' }), '<circle cx="128" cy="40" r="120" fill="#fffbe0"/>')}</g>`,
    ),
  ) +
  `</g>`

// L'aura et les arcs enflent avec la transformation.
const power = (content: string) =>
  `<g>${anim('opacity', '0.55;0.55;1;1;1;0.55', 10, { k: '0;0.18;0.28;0.32;0.94;1' })}` +
  `${pivot(800, 930, move('scale', '0.4;0.4;1.1;1;1;0.4', 10, { k: '0;0.18;0.28;0.32;0.94;1' }), content)}</g>`

// Tout ce qui suit la mascotte : sur 20 s elle décolle, traverse l'écran, se
// pose à gauche en se retournant, puis revient à droite.
const HERO =
  `<g class="hero" transform="translate(540 0) translate(800 930) scale(0.85) translate(-800 -930)">` +
  move('translate', '0 0;0 0;-150 -300;-1150 -260;-1200 0;-1200 0;-1050 -300;-100 -280;0 0;0 0', 20, {
    k: '0;0.3;0.36;0.44;0.48;0.8;0.84;0.92;0.96;1',
  })(pivot(
    800,
    0,
    move('scale', '1 1;1 1;-1 1;-1 1;1 1;1 1', 20, { k: '0;0.48;0.5;0.96;0.98;1' }),
    `<ellipse cx="800" cy="925" rx="560" ry="90" fill="url(#floor)"/>` +
      `<g ${BOLT_ATTRS} opacity="0">${anim('opacity', '0;1;0.3;1;0.5;0;0.9;0;0.7;0', 10, { k: '0;0.245;0.26;0.27;0.29;0.305;0.6;0.61;0.62;0.63', discrete: true })}${boltLines(800, 77)}</g>` +
      power(
        auraLayer(330, 830, 9, 101, '#ffb000', 0.6, 1.7) +
          auraLayer(250, 730, 8, 202, 'url(#gold)', 0.85, 1.3) +
          auraLayer(150, 560, 7, 303, '#fffbe0', 0.8, 1.1) +
          `<g>${anim('opacity', '0.75;1;0.75', 2.2)}${pivot(800, 640, move('scale', '1;1.1;1', 2.2), '<ellipse cx="800" cy="640" rx="210" ry="330" fill="url(#core)"/>')}</g>`,
      ) +
      MASCOT +
      SPARKS +
      power(ARCS),
  )) +
  `</g>`

return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#050b17"/><stop offset="0.55" stop-color="#123a5e"/><stop offset="0.78" stop-color="#3f9ec4"/><stop offset="0.8" stop-color="#bff3ff"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#fff7b0"/><stop offset="0.5" stop-color="#ffd91a"/><stop offset="1" stop-color="#ffa800"/>
  </linearGradient>
  <linearGradient id="hairB" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#c98a00"/><stop offset="0.6" stop-color="#f2b705"/><stop offset="1" stop-color="#ffd84a"/>
  </linearGradient>
  <linearGradient id="hairF" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#f0a800"/><stop offset="0.45" stop-color="#ffd91a"/><stop offset="1" stop-color="#fff59a"/>
  </linearGradient>
  <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#c9a24a"/><stop offset="1" stop-color="#4a3413"/>
  </linearGradient>
  <radialGradient id="core" cx="50%" cy="60%" r="50%">
    <stop offset="0" stop-color="#fffbe0" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ffe45c" stop-opacity="0.5"/><stop offset="1" stop-color="#ffcf33" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="floor" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#ffe45c" stop-opacity="0.7"/><stop offset="1" stop-color="#ffb300" stop-opacity="0"/>
  </radialGradient>
</defs>
<style>
  @media (max-aspect-ratio:3/4){.hero{transform-origin:800px 930px;transform:translateX(120px) scale(.6)}.bl{transform:translateX(350px)}.br{transform:translateX(-350px)}}
</style>
<rect width="1600" height="1000" fill="url(#sky)"/>
<g>${CLOUDS}</g>
${flash(5.2, 0)}${flash(6.4, -2.3)}
${BOLTS}
<polygon points="0,800 0,740 180,690 330,730 470,665 640,745 800,720 960,750 1120,670 1290,735 1440,695 1600,745 1600,800" fill="#1d4660"/>
<polygon points="0,800 0,770 240,735 420,765 700,750 900,768 1180,738 1400,765 1600,750 1600,800" fill="#2a6c88"/>
<rect y="792" width="1600" height="14" fill="#c9f6ff" opacity="0.85"/>
<rect y="800" width="1600" height="200" fill="url(#rock)"/>
<g stroke="#2a1c08" stroke-width="5" stroke-linejoin="round">
  <polygon points="0,830 210,812 330,850 250,905 60,915 0,890" fill="#b58d3c"/>
  <polygon points="330,850 560,822 690,862 600,925 380,935 250,905" fill="#d1ab55"/>
  <polygon points="690,862 900,838 1010,872 940,930 720,945 600,925" fill="#e3c26a"/>
  <polygon points="1010,872 1230,826 1370,858 1300,925 1060,938 940,930" fill="#cfa850"/>
  <polygon points="1370,858 1600,820 1600,905 1450,928 1300,925" fill="#ae8637"/>
  <polygon points="0,915 250,905 380,935 320,1000 0,1000" fill="#8a6626"/>
  <polygon points="380,935 600,925 720,945 760,1000 320,1000" fill="#a57d30"/>
  <polygon points="720,945 940,930 1060,938 1120,1000 760,1000" fill="#b88e3a"/>
  <polygon points="1060,938 1300,925 1450,928 1600,905 1600,1000 1120,1000" fill="#86621f"/>
</g>
${HERO}
</svg>`
}

// La scène ne change jamais : elle est calculée une seule fois.
const SCENE = scene()

const GLASS = { blur: 10, tint: '#080d1a', opacity: 0.6 }

// Les hôtes n'acceptent pas tous les mêmes attributs de `$.theme.set` : un
// attribut inconnu fait refuser tout l'appel. On essaie donc du plus complet au
// plus simple, et le premier accepté gagne.
const LOOKS = [
  { colors: theme, overrideColorScheme: 'dark', backdrop: { scene: 'aura', glass: GLASS } },
  { colors: theme, backdrop: { id: 'aura', colorScheme: 'dark', glass: GLASS } },
  { backdrop: { id: 'aura', colorScheme: 'dark', glass: GLASS } },
] as unknown as ThemeSetArgs[]

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    for (const look of LOOKS) {
      try {
        await $.theme.set(look)
        break
      } catch {
        // Attribut refusé par cet hôte : forme suivante.
      }
    }
    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    const props = e.props as { id?: string; scene?: string }

    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || (props.id ?? props.scene) !== 'aura') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} isInteractive alt="La mascotte en pixels se transforme : cheveux dorés dressés, aura en pointes, éclairs sous un ciel d'orage" />
  })
}
