/* ============================================================
   17Labs — V3 · scene.js
   three.js ospitato in proprio: nessuna chiamata a CDN esterne.

   Una scena sola: l'intestazione.

   HERO — un reticolo geodetico che si monta davanti a chi apre
   la pagina. I nodi partono sparsi e convergono nelle loro
   posizioni esatte in poco piu' di un secondo. E' letteralmente
   il mestiere: prendere pezzi sparsi e farne una struttura.
   Niente bagliori, niente colori acidi: filo sottile, un ottone
   solo, nebbia che spegne la profondita'.

   Qui, al contrario di Master, si renderizza a piena risoluzione
   e con antialiasing: la resa netta e' parte del registro sobrio.
   ============================================================ */
import * as THREE from './three.module.js';

const SB = window.SB || { on() {}, emit() {} };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- palette: viene dal CSS, cosi' i due temi restano allineati ---------- */
const cssVar = (n, fallback) =>
  (getComputedStyle(document.documentElement).getPropertyValue(n).trim() || fallback);

const palette = () => ({
  acc:   new THREE.Color(cssVar('--acc', '#d9a441')),
  steel: new THREE.Color(cssVar('--steel', '#7fa8d4')),
  line:  new THREE.Color(cssVar('--line-2', '#333c4b')),
  faint: new THREE.Color(cssVar('--text-faint', '#79828f')),
  bg:    new THREE.Color(cssVar('--bg', '#0b0d11'))
});

const scenes = [];
let schematic = false;

/* punto rotondo invece del quadrato di default: un dettaglio, ma i
   quadrati fanno "particellare anni Duemila" e qui non serve */
function dotTexture() {
  const S = 64;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(.45, 'rgba(255,255,255,.95)');
  grad.addColorStop(.75, 'rgba(255,255,255,.18)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}
const DOT = dotTexture();

function makeRenderer(host) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);
  return renderer;
}

function fit(renderer, cam, host) {
  const w = Math.max(1, host.clientWidth);
  const h = Math.max(1, host.clientHeight);
  renderer.setSize(w, h, false);
  cam.aspect = w / h;
  cam.updateProjectionMatrix();
}

/* ============================================================
   Geodetica: l'icosaedro suddiviso di three.js e' non indicizzato,
   quindi ogni vertice compare piu' volte — con detail 3 sono 960
   posizioni per 162 punti reali. Qui si de-duplica a mano
   arrotondando le coordinate al millesimo, e da li' si ricavano
   gli spigoli unici.

   Nota sul parametro: in three.js detail non e' un numero di
   raddoppi, e' il numero di suddivisioni per lato meno uno. Ogni
   faccia viene divisa in (detail+1)^2 triangoli, quindi detail 3
   da' 320 facce, 162 nodi e 480 spigoli. Verificato, non dedotto.
   ============================================================ */
function geodesic(radius, detail) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  const map = new Map();
  const nodes = [];
  const index = [];

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const key = `${Math.round(x * 1e3)},${Math.round(y * 1e3)},${Math.round(z * 1e3)}`;
    let j = map.get(key);
    if (j === undefined) {
      j = nodes.length;
      map.set(key, j);
      nodes.push(new THREE.Vector3(x, y, z));
    }
    index.push(j);
  }

  const seen = new Set();
  const edges = [];
  for (let f = 0; f < index.length; f += 3) {
    const tri = [index[f], index[f + 1], index[f + 2]];
    for (let k = 0; k < 3; k++) {
      const a = tri[k], b = tri[(k + 1) % 3];
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      if (!seen.has(key)) { seen.add(key); edges.push([a, b]); }
    }
  }

  geo.dispose();
  return { nodes, edges };
}

const easeOutQuint = x => 1 - Math.pow(1 - x, 5);
const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);

/* ============================================================
   HERO — reticolo che si assembla
   ============================================================ */
function buildHero(host) {
  const renderer = makeRenderer(host);
  if (!renderer) return null;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 90);
  cam.position.set(0, 0, 13.6);

  const p0 = palette();
  scene.fog = new THREE.Fog(p0.bg, 11, 30);

  const group = new THREE.Group();
  scene.add(group);

  const R = 3.35;
  const { nodes, edges } = geodesic(R, 3);   // 162 nodi, 480 spigoli
  const N = nodes.length;

  /* posizione di partenza: fuori dal riquadro, lungo la direzione
     del nodo. Cosi' la struttura "collassa" verso il centro invece
     di apparire, e l'occhio segue il movimento. */
  const start = new Float32Array(N * 3);
  const delay = new Float32Array(N);
  const phase = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const n = nodes[i];
    const dist = 4.2 + Math.random() * 9;
    start[i * 3]     = n.x / R * dist + (Math.random() - .5) * 5;
    start[i * 3 + 1] = n.y / R * dist + (Math.random() - .5) * 5;
    start[i * 3 + 2] = n.z / R * dist + (Math.random() - .5) * 5;
    // i nodi bassi partono per primi: la struttura cresce dal basso
    delay[i] = (1 - (n.y + R) / (2 * R)) * 0.52 + Math.random() * 0.16;
    phase[i] = Math.random() * Math.PI * 2;
  }

  const live = new Float32Array(N * 3);

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(live, 3));
  const nodeMat = new THREE.PointsMaterial({
    size: 0.088, map: DOT, transparent: true, opacity: .95,
    depthWrite: false, sizeAttenuation: true, fog: true
  });
  const points = new THREE.Points(nodeGeo, nodeMat);
  group.add(points);

  const edgePos = new Float32Array(edges.length * 6);
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
  const edgeMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0, fog: true });
  const mesh = new THREE.LineSegments(edgeGeo, edgeMat);
  group.add(mesh);

  /* tre anelli su assi diversi: strumento, non orbita spaziale */
  const rings = [];
  const ringMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0, fog: true });
  [[4.55, .95, .2], [5.15, -.4, 1.15], [5.75, 1.5, -.6]].forEach(([r, rx, rz], i) => {
    const pts = [];
    const SEG = 168;
    for (let s = 0; s <= SEG; s++) {
      const a = (s / SEG) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(g, ringMat);
    line.rotation.set(rx, 0, rz);
    line.userData = { spin: (i % 2 ? -1 : 1) * (0.045 + i * 0.02) };
    rings.push(line);
    group.add(line);
  });

  /* pulviscolo: profondita' a costo zero */
  const DUST = 700;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    const r = 7 + Math.random() * 15;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    dustPos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
    dustPos[i * 3 + 1] = r * Math.cos(ph) * .55;
    dustPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.055, map: DOT, transparent: true, opacity: .34,
    depthWrite: false, sizeAttenuation: true, fog: true
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  function recolor() {
    const p = palette();
    scene.fog.color.copy(p.bg);
    nodeMat.color.copy(schematic ? p.steel : p.acc);
    edgeMat.color.copy(schematic ? p.acc : p.line);
    ringMat.color.copy(schematic ? p.acc : p.steel);
    dustMat.color.copy(p.faint);
  }
  recolor();

  /* parallasse: il puntatore inclina appena la struttura.
     Poco: deve sembrare stabile, non un giocattolo. */
  const aim = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  window.addEventListener('pointermove', e => {
    aim.x = (e.clientX / window.innerWidth - .5) * 2;
    aim.y = (e.clientY / window.innerHeight - .5) * 2;
  }, { passive: true });

  const t0 = performance.now() / 1000;
  const DUR = 1.15;

  function layout() {
    // su desktop la struttura sta a destra, lasciando la colonna di testo pulita
    const wide = host.clientWidth / Math.max(1, host.clientHeight) > 1.15;
    group.position.x = wide ? 2.6 : 0;
    group.position.y = wide ? 0 : 0.4;
    dust.position.x = group.position.x * .6;
  }
  layout();

  function frame(t, dt) {
    const age = reduce ? 99 : t - t0;

    let assembled = 0;
    for (let i = 0; i < N; i++) {
      const k = easeOutQuint(clamp01((age - delay[i]) / DUR));
      if (k >= 1) assembled++;
      const n = nodes[i];
      // respiro: appena percettibile, tiene viva la struttura a regime
      const br = 1 + Math.sin(t * .55 + phase[i]) * .012 * k;
      live[i * 3]     = start[i * 3]     + (n.x * br - start[i * 3])     * k;
      live[i * 3 + 1] = start[i * 3 + 1] + (n.y * br - start[i * 3 + 1]) * k;
      live[i * 3 + 2] = start[i * 3 + 2] + (n.z * br - start[i * 3 + 2]) * k;
    }
    nodeGeo.attributes.position.needsUpdate = true;

    for (let e = 0; e < edges.length; e++) {
      const a = edges[e][0] * 3, b = edges[e][1] * 3, o = e * 6;
      edgePos[o]     = live[a];
      edgePos[o + 1] = live[a + 1];
      edgePos[o + 2] = live[a + 2];
      edgePos[o + 3] = live[b];
      edgePos[o + 4] = live[b + 1];
      edgePos[o + 5] = live[b + 2];
    }
    edgeGeo.attributes.position.needsUpdate = true;

    const ratio = assembled / N;
    edgeMat.opacity = ratio * (schematic ? .85 : .55);
    ringMat.opacity = clamp01((age - 1.25) / .9) * (schematic ? .6 : .3);
    nodeMat.opacity = schematic ? .25 : .95;

    cur.x += (aim.x - cur.x) * .045;
    cur.y += (aim.y - cur.y) * .045;

    group.rotation.y += dt * .085;
    group.rotation.x = -cur.y * .18;
    group.rotation.z = cur.x * .05;
    rings.forEach(r => { r.rotation.y += dt * r.userData.spin; });
    dust.rotation.y -= dt * .012;

    cam.position.x = cur.x * .55;
    cam.position.y = -cur.y * .35;
    cam.lookAt(group.position.x * .35, 0, 0);

    renderer.render(scene, cam);
  }

  return { renderer, cam, host, frame, recolor, layout, always: true };
}

/* ============================================================
   Avvio
   ============================================================ */
const heroHost = document.getElementById('hero-gl');
const hero = heroHost ? buildHero(heroHost) : null;
if (hero) scenes.push(hero);

if (scenes.length) {
  // si disegna solo quello che si vede: fuori schermo la GPU sta ferma
  const visible = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const s = scenes.find(x => x.host === e.target);
      if (!s) return;
      if (e.isIntersecting) visible.add(s); else visible.delete(s);
    });
  }, { rootMargin: '120px' });

  scenes.forEach(s => {
    io.observe(s.host);
    fit(s.renderer, s.cam, s.host);
    s.layout();
    new ResizeObserver(() => { fit(s.renderer, s.cam, s.host); s.layout(); }).observe(s.host);
  });

  let last = performance.now() / 1000;
  function loop(now) {
    const t = now / 1000;
    const dt = Math.min(.05, t - last);
    last = t;
    visible.forEach(s => s.frame(t, dt));
    requestAnimationFrame(loop);
  }

  if (reduce) {
    // un fotogramma solo, con la struttura gia' montata
    scenes.forEach(s => s.frame(performance.now() / 1000, 0));
  } else {
    requestAnimationFrame(loop);
  }

  SB.on('theme', () => scenes.forEach(s => s.recolor()));
  SB.on('schematic', on => {
    schematic = on;
    scenes.forEach(s => s.recolor());
  });
}
