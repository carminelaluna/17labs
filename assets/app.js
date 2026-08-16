"use strict";
/* ============================================================
   <pixel-icon> — 16x16 hand-drawn sprites on a 16-colour palette.
   Each sprite is 16 strings of 16 characters; every character is a
   palette key ('.' = transparent). The canvas is sized to the sprite's
   native pixels and blown up by CSS with image-rendering:pixelated,
   so it stays crisp at any size and never resamples.
   ============================================================ */
(function () {

/* 16 slots, the way a SNES tile palette worked: one transparent + 15 colours */
const PAL = {
  '1': '#10101a', // ink
  '2': '#24243a', // shadow
  '3': '#43436b', // slate
  '4': '#7b7ba6', // steel
  '5': '#c9c9e8', // silver
  '6': '#f2f2ff', // white
  '7': '#1f6fd0', // blue
  '8': '#4ec9f5', // cyan
  '9': '#1f9e57', // green
  'a': '#7ee787', // mint
  'b': '#f5c451', // gold
  'c': '#ef8b3c', // amber
  'd': '#d94a5f', // red
  'e': '#b98cf5', // violet
  'h': '#f7d5a8'  // skin
};

/* Sprites. `cycle` swaps a palette key's colour on each tick — palette
   cycling, the cheapest animation trick the era had. */
const SPRITES = {

  chip: { cycle: { '6': ['#f2f2ff', '#7ee787', '#4ec9f5'] }, rows: [
    '................',
    '....3.3..3.3....',
    '....3.3..3.3....',
    '..111111111111..',
    '..1eeeeeeeeee1..',
    '3.1e88888888e1.3',
    '3.1e81111118e1.3',
    '3.1e81655a18e1.3',
    '3.1e81a55618e1.3',
    '3.1e81111118e1.3',
    '3.1e88888888e1.3',
    '..1eeeeeeeeee1..',
    '..111111111111..',
    '....3.3..3.3....',
    '....3.3..3.3....',
    '................'
  ]},

  browser: { rows: [
    '................',
    '.11111111111111.',
    '.13d3b3a3333331.',
    '.11111111111111.',
    '.16666666666661.',
    '.16111111166661.',
    '.16188888166661.',
    '.16111111166661.',
    '.16666666666661.',
    '.16111111111661.',
    '.16144444441661.',
    '.16666666666661.',
    '.11111111111111.',
    '.....1bbbb1.....',
    '....11111111....',
    '................'
  ]},

  key: { rows: [
    '................',
    '.....111111.....',
    '....11bbbb11....',
    '...11b1111b11...',
    '...1b1....1b1...',
    '...1b1....1b1...',
    '...11b1111b11...',
    '....11bbbb11....',
    '.....11bb11.....',
    '......1bb1......',
    '......1bb1......',
    '......1bb111....',
    '......1bbbb1....',
    '......1bb111....',
    '......1bbb1.....',
    '.......111......'
  ]},

  ledger: { rows: [
    '................',
    '..111111111111..',
    '..1cccccccccc1..',
    '..1c11111111c1..',
    '..1c16666661c1..',
    '..1c16111161c1..',
    '..1c16155161c1..',
    '..1c16111161c1..',
    '..1c16555561c1..',
    '..1c16111161c1..',
    '..1c16555561c1..',
    '..1c16666661c1..',
    '..1c11111111c1..',
    '..1cccccccccc1..',
    '..111111111111..',
    '................'
  ]},

  bag: { rows: [
    '................',
    '......1111......',
    '.....11..11.....',
    '.....1....1.....',
    '..111111111111..',
    '..1dddddddddd1..',
    '..1d11dddd11d1..',
    '..1d1dddddd1d1..',
    '..1dddddddddd1..',
    '..1dddddddddd1..',
    '..1d66dddd66d1..',
    '..1dddddddddd1..',
    '..1dddddddddd1..',
    '..111111111111..',
    '................',
    '................'
  ]},

  robot: { cycle: { '8': ['#4ec9f5', '#4ec9f5', '#d94a5f'] }, rows: [
    '................',
    '.......81.......',
    '.......11.......',
    '..111111111111..',
    '..144444444441..',
    '..141111111141..',
    '..141881188141..',
    '..141111111141..',
    '..144411114441..',
    '..144444444441..',
    '..111111111111..',
    '.....111111.....',
    '.11111111111111.',
    '.13333333333331.',
    '.13333333333331.',
    '.11111111111111.'
  ]},

  chart: { rows: [
    '................',
    '.11111111111111.',
    '.12222222222221.',
    '.12222222222221.',
    '.12222222222dd1.',
    '.12222222222dd1.',
    '.12222aa2222dd1.',
    '.12222aa2222dd1.',
    '.12222aa2bb2dd1.',
    '.12882aa2bb2dd1.',
    '.12882aa2bb2dd1.',
    '.12882aa2bb2dd1.',
    '.12882aa2bb2dd1.',
    '.13333333333331.',
    '.11111111111111.',
    '................'
  ]},

  server: { cycle: { 'a': ['#7ee787', '#1f9e57', '#7ee787'] }, rows: [
    '................',
    '..111111111111..',
    '..1a3333333331..',
    '..111111111111..',
    '..1a3333333331..',
    '..111111111111..',
    '..1b3333333331..',
    '..111111111111..',
    '..1a3333333331..',
    '..111111111111..',
    '..1b3333333331..',
    '..111111111111..',
    '..1a3333333331..',
    '..111111111111..',
    '...1........1...',
    '................'
  ]},

  terminal: { cycle: { '6': ['#f2f2ff', '#f2f2ff', '#24243a'] }, rows: [
    '................',
    '.11111111111111.',
    '.13333333333331.',
    '.12222222222221.',
    '.1a222222222221.',
    '.12a22222222221.',
    '.122a2222222221.',
    '.12a22222222221.',
    '.1a222222222221.',
    '.12222222222221.',
    '.12222666622221.',
    '.12222222222221.',
    '.12222222222221.',
    '.11111111111111.',
    '....11111111....',
    '................'
  ]},

  db: { rows: [
    '................',
    '.....111111.....',
    '...1188888811...',
    '..188888888881..',
    '..177777777771..',
    '..111111111111..',
    '..188888888881..',
    '..177777777771..',
    '..111111111111..',
    '..188888888881..',
    '..177777777771..',
    '..111111111111..',
    '...1177777711...',
    '.....111111.....',
    '................',
    '................'
  ]},

  code: { rows: [
    '................',
    '.11111111111111.',
    '.13333333333331.',
    '.12222222222221.',
    '.12222222222221.',
    '.1222a22a2a2221.',
    '.122a222a22a221.',
    '.12a222a2222a21.',
    '.122a22a222a221.',
    '.1222aa222a2221.',
    '.12222222222221.',
    '.12222222222221.',
    '.11111111111111.',
    '....11111111....',
    '................',
    '................'
  ]},

  magnifier: { rows: [
    '................',
    '....111111......',
    '..1188888811....',
    '..18888888881...',
    '.18886666888881.',
    '.18866666688881.',
    '.18866666688881.',
    '.18886666888881.',
    '..18888888881...',
    '..1188888811....',
    '....111111b1....',
    '.........1bb1...',
    '..........1bb1..',
    '...........1bb1.',
    '............1bb1',
    '.............11.'
  ]},

  blueprint: { rows: [
    '................',
    '.11111111111111.',
    '.17777777777771.',
    '.17666666666771.',
    '.17677777776771.',
    '.17677777776771.',
    '.17677777776771.',
    '.17666666666771.',
    '.17777777777771.',
    '.16666677777771.',
    '.17777777666671.',
    '.17777777777771.',
    '.11111111111111.',
    '................',
    '................',
    '................'
  ]},

  rocket: { cycle: { 'c': ['#ef8b3c', '#f5c451', '#d94a5f'] }, rows: [
    '................',
    '.......11.......',
    '......1661......',
    '......1661......',
    '.....166661.....',
    '.....168861.....',
    '.....168861.....',
    '.....166661.....',
    '....11666611....',
    '...1d166661d1...',
    '...1dd1661dd1...',
    '....11166111....',
    '......1cc1......',
    '......1bb1......',
    '.......11.......',
    '................'
  ]},

  star: { cycle: { 'b': ['#f5c451', '#f2f2ff', '#f5c451'] }, rows: [
    '................',
    '.......11.......',
    '......1bb1......',
    '......1bb1......',
    '.....1bbbb1.....',
    '.....1bbbb1.....',
    '.1111bbbbbb1111.',
    '.1bbbbbbbbbbbb1.',
    '..1bbbbbbbbbb1..',
    '...1bbbbbbbb1...',
    '...1bbbbbbbb1...',
    '..1bbbb11bbbb1..',
    '..1bbb1..1bbb1..',
    '.1bb11....11bb1.',
    '.111........111.',
    '................'
  ]},

  mail: { rows: [
    '................',
    '................',
    '.11111111111111.',
    '.16666666666661.',
    '.11666666666611.',
    '.1d1666666661d1.',
    '.1dd16666661dd1.',
    '.1ddd166661ddd1.',
    '.1dddd1661dddd1.',
    '.1ddddd11ddddd1.',
    '.1dddddddddddd1.',
    '.1dddddddddddd1.',
    '.1dddddddddddd1.',
    '.11111111111111.',
    '................',
    '................'
  ]},

  qblock: { cycle: { '6': ['#f2f2ff', '#ef8b3c', '#f2f2ff'] }, rows: [
    '1111111111111111',
    '1bbbbbbbbbbbbbb1',
    '1b6bbbbbbbbbb6b1',
    '1bbbbb2222bbbbb1',
    '1bbbb22bb22bbbb1',
    '1bbbbbbbb22bbbb1',
    '1bbbbbbb22bbbbb1',
    '1bbbbbb22bbbbbb1',
    '1bbbbbb22bbbbbb1',
    '1bbbbbbbbbbbbbb1',
    '1bbbbbb22bbbbbb1',
    '1bbbbbb22bbbbbb1',
    '1bbbbbbbbbbbbbb1',
    '1b6bbbbbbbbbb6b1',
    '1bbbbbbbbbbbbbb1',
    '1111111111111111'
  ]},

  dev1: { rows: [
    '................',
    '.....111111.....',
    '...1133333311...',
    '..133333333331..',
    '..133333333331..',
    '.11311111111311.',
    '1ee1hhhhhhhh1ee1',
    '1ee1h1hhhh1h1ee1',
    '1ee1hhhhhhhh1ee1',
    '1ee1hh1111hh1ee1',
    '1ee11hhhhhh11ee1',
    '.1111hhhhhh1111.',
    '....1hhhhhh1....',
    '....11hhhh11....',
    '.11777777777711.',
    '.17777777777771.'
  ]},

  trophy: { cycle: { '6': ['#f2f2ff', '#f5c451', '#f2f2ff'] }, rows: [
    '................',
    '..111111111111..',
    '..1bbbbbbbbbb1..',
    '.11bbbb66bbbb11.',
    '11b1bbbbbbbb1b11',
    '1b11bbbbbbbb11b1',
    '1b11bbbbbbbb11b1',
    '11b11bbbbbb11b11',
    '.11b1bbbbbb1b11.',
    '..111bbbbbb111..',
    '....1bbbbbb1....',
    '.....1bbbb1.....',
    '......1bb1......',
    '....11111111....',
    '...1bbbbbbbb1...',
    '...1111111111...'
  ]},

  lock: { rows: [
    '................',
    '......1111......',
    '.....114411.....',
    '....11411411....',
    '....14111141....',
    '....14....41....',
    '..111111111111..',
    '..144444444441..',
    '..144441144441..',
    '..144411114441..',
    '..144411114441..',
    '..144441144441..',
    '..144441144441..',
    '..144444444441..',
    '..111111111111..',
    '................'
  ]},

  heart: { cycle: { '6': ['#f2f2ff', '#d94a5f', '#f2f2ff'] }, rows: [
    '................',
    '...1111..1111...',
    '..1dddd11dddd1..',
    '.1dd6ddddddddd1.',
    '.1d6dddddddddd1.',
    '.1dddddddddddd1.',
    '.1dddddddddddd1.',
    '..1dddddddddd1..',
    '..1dddddddddd1..',
    '...1dddddddd1...',
    '....1dddddd1....',
    '.....1dddd1.....',
    '......1dd1......',
    '.......11.......',
    '................',
    '................'
  ]}
};

/* expose so sprites can be inspected or extended */
window.PixelIcons = { palette: PAL, sprites: SPRITES };

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* One slow ticker for every icon — 16-bit animation ran at a handful of
   frames per second, and redrawing 55 tiny canvases 6 times a second is
   nothing compared to doing it 60 times. */
const animated = new Set();
let tick = 0, timer = null;

function startTicker() {
  if (timer !== null || reduceMotion) return;
  timer = setInterval(() => {
    tick++;
    for (const el of animated) el.paint();
  }, 220);
}
function stopTicker() { if (timer !== null) { clearInterval(timer); timer = null; } }

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopTicker(); else if (animated.size) startTicker();
});

const io = ('IntersectionObserver' in window) ? new IntersectionObserver(entries => {
  for (const e of entries) {
    const el = e.target;
    if (!el.def || !el.def.cycle) continue;
    if (e.isIntersecting) { animated.add(el); startTicker(); }
    else { animated.delete(el); if (!animated.size) stopTicker(); }
  }
}, { rootMargin: '140px' }) : null;

class PixelIcon extends HTMLElement {
  static get observedAttributes() { return ['sprite', 'size']; }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML =
      '<style>:host{display:inline-block;width:var(--px-size,64px);height:var(--px-size,64px);' +
      'line-height:0;vertical-align:middle}' +
      'canvas{display:block;width:100%;height:100%;image-rendering:pixelated;' +
      'image-rendering:crisp-edges;-ms-interpolation-mode:nearest-neighbor;' +
      'animation:bob 1.8s steps(1) infinite}' +
      '@keyframes bob{0%,50%{transform:translateY(0)}51%,100%{transform:translateY(-2.5%)}}' +
      '@media (prefers-reduced-motion: reduce){canvas{animation:none}}' +
      '</style><canvas></canvas>';
    this.canvas = root.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  connectedCallback() {
    if (!this.hasAttribute('aria-label') && !this.hasAttribute('aria-hidden')) {
      this.setAttribute('aria-hidden', 'true');
    }
    this._load();
    if (io) io.observe(this);
    else if (this.def && this.def.cycle && !reduceMotion) { animated.add(this); startTicker(); }
  }

  disconnectedCallback() {
    animated.delete(this);
    if (io) io.unobserve(this);
    if (!animated.size) stopTicker();
  }

  attributeChangedCallback(name, oldV, newV) {
    if (oldV === newV) return;
    if (name === 'size') { this.style.setProperty('--px-size', parseFloat(newV) + 'px'); return; }
    if (this.isConnected) this._load();
  }

  _load() {
    const key = this.getAttribute('sprite');
    this.def = SPRITES[key] || SPRITES.chip;
    const rows = this.def.rows;
    this.canvas.width = rows[0].length;
    this.canvas.height = rows.length;
    this.paint();
  }

  paint() {
    const rows = this.def.rows, ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);
    const cyc = this.def.cycle;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const c = row[x];
        if (c === '.') continue;
        let col = PAL[c];
        if (cyc && cyc[c]) { const list = cyc[c]; col = list[tick % list.length]; }
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}
customElements.define('pixel-icon', PixelIcon);


/* ============================================================
   Page wiring
   ============================================================ */

const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

function debounce(fn, ms) {
  let id; return function () { clearTimeout(id); id = setTimeout(fn, ms); };
}

/* ============================================================
   Stringhe. Questo file è condiviso fra la versione italiana e
   quella inglese, quindi ogni testo generato in JS va preso da qui
   in base a <html lang>. Aggiungere una lingua = aggiungere una chiave.
   ============================================================ */
const LANG = (document.documentElement.lang || 'it').slice(0, 2) === 'en' ? 'en' : 'it';

const STR = {
  it: {
    xp: (lv) => 'Livello ' + lv + ' su 10',
    menuOpen: 'Apri il menu',
    menuClose: 'Chiudi il menu',
    boot: ['CARICAMENTO SPRITE... OK', 'PALETTE 16 COLORI... OK', 'WEBGL... OK', 'PRONTO'],
    errName: 'Serve un nome.',
    errMail: 'Controlla l’indirizzo email.',
    errMsg: 'Scrivi almeno due righe.',
    errOk: 'Serve il consenso per poterti rispondere.',
    noEndpoint: 'FORM NON ANCORA COLLEGATO — configura action="" con un servizio di invio.',
    sending: 'INVIO IN CORSO...',
    sent: 'MESSAGGIO INVIATO. Ti rispondo entro un giorno lavorativo.',
    sendFail: 'INVIO NON RIUSCITO. Scrivimi direttamente a contact@17labs.it',
    glFile: 'Stai aprendo il file direttamente dal disco.<br>I moduli JavaScript non partono su <code>file://</code>: serve un server.<br>Online, o in locale con un server statico, la scena 3D funziona.',
    console: 'Se stai leggendo qui dentro sei dei nostri.\nIndizio: ↑ ↑ ↓ ↓ ← → ← → B A',
    marquee: [
      'Intelligenza artificiale', 'TypeScript', 'Siti web', 'Next.js',
      'Gestionali', 'API REST', 'Portali aziendali', 'PostgreSQL',
      'Automazioni', 'Python', 'E-commerce', 'Docker',
      'Dashboard', 'CI/CD', 'Integrazioni', 'Assistenti IA'
    ],
    trophies: [
      ['CODICE ANTICO', 'Un tasto alla volta, come nel 1986.',     'Konami code inserito. God mode attivo.'],
      ['MANI IN PASTA', 'Qui dentro qualcosa gira, se lo spingi.', 'Hai ruotato il nucleo con le mani.'],
      ['RAGGI X',       'Il logo in alto non è soltanto un logo.', 'Wireframe attivato: sotto ci sono solo triangoli.'],
      ['PERMESSI',      'Scrivi il comando che risolve tutto.',    'sudo digitato. Purtroppo non basta mai.'],
      ['INDECISO',      'Chiaro o scuro? Deciditi.',               'Cinque cambi di tema. Va bene così.'],
      ['ESPLORATORE',   'Guarda dove finisce davvero la pagina.',  'Sei arrivato in fondo. Grazie di esserci.']
    ]
  },
  en: {
    xp: (lv) => 'Level ' + lv + ' out of 10',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    boot: ['LOADING SPRITES... OK', '16-COLOUR PALETTE... OK', 'WEBGL... OK', 'READY'],
    errName: 'A name is required.',
    errMail: 'Check the email address.',
    errMsg: 'Write at least a couple of lines.',
    errOk: 'Consent is required so I can reply to you.',
    noEndpoint: 'FORM NOT CONNECTED YET — point action="" at a form service.',
    sending: 'SENDING...',
    sent: 'MESSAGE SENT. I will reply within one working day.',
    sendFail: 'SENDING FAILED. Email me directly at contact@17labs.it',
    glFile: 'You are opening the file straight from disk.<br>JavaScript modules do not run over <code>file://</code>: a server is required.<br>Online, or locally behind a static server, the 3D scene works.',
    console: 'If you are reading in here, you are one of us.\nHint: ↑ ↑ ↓ ↓ ← → ← → B A',
    marquee: [
      'Artificial intelligence', 'TypeScript', 'Websites', 'Next.js',
      'Business software', 'REST API', 'Client portals', 'PostgreSQL',
      'Automation', 'Python', 'E-commerce', 'Docker',
      'Dashboards', 'CI/CD', 'Integrations', 'AI assistants'
    ],
    trophies: [
      ['ANCIENT CODE',  'One key at a time, like it is 1986.',       'Konami code entered. God mode on.'],
      ['HANDS ON',      'Something in here spins, if you push it.',  'You rotated the core by hand.'],
      ['X-RAY',         'The logo up there is not only a logo.',     'Wireframe on: it is triangles all the way down.'],
      ['PERMISSIONS',   'Type the command that fixes everything.',   'sudo typed. Sadly it is never enough.'],
      ['UNDECIDED',     'Light or dark? Make up your mind.',         'Five theme switches. That is fine.'],
      ['EXPLORER',      'See where the page actually ends.',         'You reached the bottom. Thanks for coming.']
    ]
  }
}[LANG];

/* ---- XP bars ---- */
$$('.xp').forEach(el => {
  const lv = Math.max(0, Math.min(10, parseInt(el.dataset.level, 10) || 0));
  const bar = $('.xp__bar', el);
  for (let i = 0; i < 10; i++) {
    const b = document.createElement('i');
    if (i < lv) b.className = 'on';
    bar.appendChild(b);
  }
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', STR.xp(lv));
});

/* ---- hero marquee ---- */
/* forma, sprite e sfalsamento restano uguali fra le lingue: cambia solo l'etichetta */
const SEQUENCE = [
  ['lg', 'chip',      '1%'],  ['sm', 'terminal',  '38%'],
  ['lg', 'browser',   '7%'],  ['sm', 'code',      '13%'],
  ['lg', 'ledger',    '0%'],  ['sm', 'db',        '41%'],
  ['lg', 'key',       '4%'],  ['sm', 'db',        '19%'],
  ['lg', 'robot',     '0%'],  ['sm', 'terminal',  '9%'],
  ['lg', 'bag',       '9%'],  ['sm', 'server',    '23%'],
  ['lg', 'chart',     '2%'],  ['sm', 'rocket',    '17%'],
  ['lg', 'server',    '5%'],  ['sm', 'chip',      '15%']
].map((s, i) => [s[0], s[1], STR.marquee[i], s[2]]);

const track = $('#track');
function makeSlot(size, sprite, label, x) {
  const slot = document.createElement('div');
  slot.className = 'slot slot--' + size;
  if (x) slot.style.setProperty('--x', x);
  const icon = document.createElement('pixel-icon');
  icon.setAttribute('sprite', sprite);
  icon.setAttribute('aria-hidden', 'true');
  const span = document.createElement('span');
  span.textContent = label;
  slot.append(icon, span);
  return slot;
}

for (let copy = 0; copy < 2; copy++) {
  SEQUENCE.forEach(item => {
    const slot = makeSlot(item[0], item[1], item[2], item[3]);
    // the second copy exists only to make the loop seamless
    if (copy === 1) slot.setAttribute('aria-hidden', 'true');
    track.appendChild(slot);
  });
}

function sizeMarquee() {
  const kids = track.children;
  if (kids.length < SEQUENCE.length + 1) return;
  const shift = kids[SEQUENCE.length].offsetTop - kids[0].offsetTop;
  if (!shift) return;
  track.style.setProperty('--shift', shift + 'px');
  track.style.setProperty('--dur', Math.max(16, shift / 68).toFixed(2) + 's');
}
addEventListener('resize', debounce(sizeMarquee, 150));
addEventListener('load', sizeMarquee);
sizeMarquee();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeMarquee);

/* ============================================================
   Trofei ed easter egg.
   Vive nello script classico, non nel modulo three.js: i segreti
   devono funzionare anche se la CDN è irraggiungibile.
   ============================================================ */

const TROPHY_IDS = ['konami', 'core', 'wire', 'sudo', 'theme', 'bottom'];
const TROPHIES = TROPHY_IDS.map((id, i) => ({
  id, name: STR.trophies[i][0], hint: STR.trophies[i][1], done: STR.trophies[i][2]
}));

const listeners = {};
const found = new Set();
try {
  const saved = JSON.parse(localStorage.getItem('sb-trophies') || '[]');
  if (Array.isArray(saved)) saved.forEach(id => { if (TROPHIES.some(t => t.id === id)) found.add(id); });
} catch (e) {}

const trophyList = $('#trophies');
const trophyCount = $('#tr-count');

function renderTrophies() {
  trophyList.innerHTML = '';
  TROPHIES.forEach(t => {
    const open = found.has(t.id);
    const li = document.createElement('li');
    li.className = 'trophy' + (open ? ' is-open' : '');
    li.innerHTML =
      '<pixel-icon sprite="' + (open ? 'trophy' : 'lock') + '" aria-hidden="true"></pixel-icon>' +
      '<span class="trophy__txt">' +
        '<span class="trophy__name">' + (open ? t.name : '???') + '</span>' +
        '<span class="trophy__desc">' + (open ? t.done : t.hint) + '</span>' +
      '</span>';
    trophyList.appendChild(li);
  });
  trophyCount.textContent = found.size + '/' + TROPHIES.length;
}
renderTrophies();

const toast = $('#toast'), toastName = $('#toast-name');
let toastTimer = null;

function unlock(id) {
  if (found.has(id)) return;
  const t = TROPHIES.find(x => x.id === id);
  if (!t) return;
  found.add(id);
  try { localStorage.setItem('sb-trophies', JSON.stringify([...found])); } catch (e) {}
  renderTrophies();
  toastName.textContent = t.name;
  toast.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-on'), 3200);
  emit('unlock', id);
}

function on(evt, cb) { (listeners[evt] = listeners[evt] || []).push(cb); }
function emit(evt, data) { (listeners[evt] || []).forEach(cb => { try { cb(data); } catch (e) {} }); }

/* the 3D module talks to the page through this */
window.SB = { unlock, on, emit, get godMode() { return godMode; }, get wireframe() { return wireframe; } };

/* --- god mode: cycles the accent colour through the spectrum --- */
let godMode = false, hue = 100, hueTimer = null;
function enableGodMode() {
  if (godMode) return;
  godMode = true;
  hueTimer = setInterval(() => {
    hue = (hue + 12) % 360;
    root.style.setProperty('--acc', 'hsl(' + hue + ' 72% 62%)');
    root.style.setProperty('--acc-2', 'hsl(' + ((hue + 140) % 360) + ' 72% 62%)');
  }, 120);
  emit('godmode', true);
}

/* --- Konami --- */
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let kIdx = 0;
addEventListener('keydown', e => {
  const want = KONAMI[kIdx];
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  kIdx = (key === want) ? kIdx + 1 : (key === KONAMI[0] ? 1 : 0);
  if (kIdx === KONAMI.length) { kIdx = 0; unlock('konami'); enableGodMode(); }
});

/* --- typing "sudo" anywhere --- */
let buf = '';
addEventListener('keydown', e => {
  if (e.key.length !== 1) return;
  buf = (buf + e.key.toLowerCase()).slice(-8);
  if (buf.indexOf('sudo') >= 0) { buf = ''; unlock('sudo'); }
});

/* --- seven clicks on the logo toggle wireframe --- */
let wireframe = false, logoHits = 0, logoTimer = null;
$('.brand').addEventListener('click', () => {
  // no preventDefault: the logo stays a working "back to top" link
  logoHits++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => { logoHits = 0; }, 1200);
  if (logoHits >= 7) {
    logoHits = 0;
    wireframe = !wireframe;
    unlock('wire');
    emit('wireframe', wireframe);
  }
});

/* --- theme ---- */
const root = document.documentElement;
let themeFlips = 0;
$('#theme-toggle').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('dev-theme', next); } catch (e) {}
  emit('theme', next);
  if (++themeFlips >= 5) unlock('theme');
});

/* --- reaching the bottom --- */
addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 80) unlock('bottom');
}, { passive: true });

/* --- a note for whoever opens the console --- */
console.log('%c 17LABS ', 'background:#7ee787;color:#0a0a12;font:bold 16px monospace;padding:6px 12px');
console.log('%c' + STR.console, 'color:#4ec9f5;font:13px monospace;line-height:1.6');

/* ---- boot screen: solo alla prima visita della sessione ---- */
(function () {
  const boot = $('#boot'), line = $('#boot-line');
  let seen = false;
  try { seen = sessionStorage.getItem('sb-boot') === '1'; } catch (e) {}
  if (seen || reduceMotion) return;

  const steps = STR.boot;
  boot.hidden = false;
  document.body.style.overflow = 'hidden';
  let i = 0;
  const t = setInterval(() => {
    line.textContent = steps[i++] || '';
    if (i >= steps.length) clearInterval(t);
  }, 380);

  function close() {
    clearInterval(t);
    boot.hidden = true;
    document.body.style.overflow = '';
    try { sessionStorage.setItem('sb-boot', '1'); } catch (e) {}
    removeEventListener('keydown', close);
    removeEventListener('pointerdown', close);
  }
  addEventListener('keydown', close);
  addEventListener('pointerdown', close);
  setTimeout(close, 3200);   // non blocca mai chi non tocca niente
})();

/* ---- form contatti ---- */
(function () {
  const form = $('#contact-form');
  if (!form) return;
  const rules = [
    { f: 'f-nome',  i: 'i-nome',  e: 'e-nome',  test: v => v.trim().length >= 2,          msg: STR.errName },
    { f: 'f-email', i: 'i-email', e: 'e-email', test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: STR.errMail },
    { f: 'f-msg',   i: 'i-msg',   e: 'e-msg',   test: v => v.trim().length >= 10,         msg: STR.errMsg },
    { f: 'f-ok',    i: 'i-ok',    e: 'e-ok',    test: (v, el) => el.checked,              msg: STR.errOk }
  ];

  function validate(r, silent) {
    const el = document.getElementById(r.i), box = document.getElementById(r.f), err = document.getElementById(r.e);
    const ok = r.test(el.value, el);
    if (!silent) {
      err.textContent = ok ? '' : r.msg;
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (ok) box.removeAttribute('data-err'); else box.setAttribute('data-err', '');
      if (!ok) el.setAttribute('aria-describedby', r.e); else el.removeAttribute('aria-describedby');
    }
    return ok;
  }

  rules.forEach(r => {
    const el = document.getElementById(r.i);
    el.addEventListener('blur', () => validate(r));
    el.addEventListener('input', () => { if (document.getElementById(r.f).hasAttribute('data-err')) validate(r); });
  });

  form.addEventListener('submit', e => {
    const bad = rules.filter(r => !validate(r));
    if (bad.length) {
      e.preventDefault();
      document.getElementById(bad[0].i).focus();
      return;
    }
    e.preventDefault();
    const action = form.getAttribute('action');

    if (!action) {
      // nessun endpoint configurato: non fingere un invio riuscito
      form.replaceChildren(note(STR.noEndpoint));
      return;
    }

    // invio in AJAX: il visitatore resta sulla pagina invece di finire
    // sulla schermata di ringraziamento del servizio esterno.
    // Funziona con Formspree e Web3Forms, che rispondono JSON con questo header.
    const btn = form.querySelector('button[type=submit]');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = STR.sending;

    fetch(action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(r => {
        if (!r.ok) throw new Error(r.status);
        form.replaceChildren(note(STR.sent));
      })
      .catch(() => {
        btn.disabled = false;
        btn.textContent = label;
        const old = form.querySelector('.form__ok');
        if (old) old.remove();
        form.appendChild(note(STR.sendFail));
      });
  });

  function note(text) {
    const p = document.createElement('p');
    p.className = 'form__ok';
    p.setAttribute('role', 'status');
    p.textContent = text;
    return p;
  }
})();

/* ---- diagnosi onesta quando la scena 3D non parte ----
   Aprendo il sito con un doppio click il protocollo è file://, e i moduli
   JavaScript sono bloccati dal CORS. Questo file però viene caricato lo stesso
   (è uno script classico), quindi può correggere il messaggio: senza, il
   riquadro accusa WebGL o la CDN, che non c'entrano niente. */
if (location.protocol === 'file:') {
  const fb = $('.screen__fallback');
  if (fb) fb.innerHTML = STR.glFile;
}

/* ---- menu mobile ---- */
const navToggle = $('#nav-toggle'), navMenu = $('#nav-menu');
function setMenu(open) {
  navMenu.hidden = !open;
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? STR.menuClose : STR.menuOpen);
}
navToggle.addEventListener('click', () => setMenu(navMenu.hidden));
navMenu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => {
  if (e.key === 'Escape' && !navMenu.hidden) { setMenu(false); navToggle.focus(); }
});
// se si torna a desktop il menu non deve restare aperto e orfano
matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

/* ---- nav background on scroll ---- */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

})();
