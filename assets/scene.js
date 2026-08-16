/* ============================================================
   three.js — 3D come lo facevano le console a 16 bit.
   Il trucco è tutto qui: si renderizza a un quinto della
   risoluzione reale, senza antialiasing, e si lascia che il CSS
   riporti l'immagine in scala con image-rendering: pixelated.
   I poligoni prendono così gli stessi bordi duri degli sprite.
   three.js e' ospitato in proprio: nessuna chiamata a CDN esterne.
   ============================================================ */
import * as THREE from './three.module.js';

const SB = window.SB || { on() {}, unlock() {} };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const css = (n, f) => (getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f);
const palette = () => ({
  acc:  new THREE.Color(css('--acc', '#7ee787')),
  acc2: new THREE.Color(css('--acc-2', '#4ec9f5')),
  acc3: new THREE.Color(css('--acc-3', '#f5c451')),
  line: new THREE.Color(css('--line-strong', '#45456b'))
});

const scenes = [];
let godMode = false, wireframe = false;

function makeRenderer(host, scale) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
  } catch (e) { return null; }
  renderer.setPixelRatio(1);           // never oversample: the chunk is the point
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);
  renderer.userData = { scale };
  return renderer;
}

function fit(renderer, cam, host) {
  const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
  const s = renderer.userData.scale;
  renderer.setSize(Math.max(24, Math.round(w / s)), Math.max(24, Math.round(h / s)), false);
  cam.aspect = w / h;
  cam.updateProjectionMatrix();
}

/* ---------------- hero: griglia che scorre + solidi che ruzzolano ------------- */
function buildHero(host) {
  const renderer = makeRenderer(host, 5);
  if (!renderer) return null;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 140);
  cam.position.set(0, 2.6, 10);
  cam.lookAt(0, 3.4, -10);   // tilt up so the grid stays in the lower third

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(4, 8, 6);
  scene.add(key);

  const STEP = 4;
  let grid = null;
  function buildGrid(p) {
    if (grid) { scene.remove(grid); grid.geometry.dispose(); grid.material.dispose(); }
    grid = new THREE.GridHelper(120, 120 / STEP, p.acc, p.line);
    grid.position.y = -2.6;
    grid.material.transparent = true;
    grid.material.opacity = 0.42;
    scene.add(grid);
  }

  const shapes = [];
  const geos = [
    new THREE.IcosahedronGeometry(1.5, 0),
    new THREE.OctahedronGeometry(1.5, 0),
    new THREE.TorusGeometry(1.1, 0.42, 6, 9),
    new THREE.TetrahedronGeometry(1.7, 0),
    new THREE.DodecahedronGeometry(1.35, 0)
  ];
  for (let i = 0; i < 5; i++) {
    const mat = new THREE.MeshPhongMaterial({ flatShading: true, shininess: 0 });
    const mesh = new THREE.Mesh(geos[i], mat);
    mesh.position.set((i % 2 ? -1 : 1) * (2.5 + Math.random() * 4), 1 + Math.random() * 5, -6 - i * 9);
    mesh.userData = {
      spin: new THREE.Vector3((Math.random() - .5) * .5, (Math.random() - .5) * .5, (Math.random() - .5) * .3),
      speed: 1.1 + Math.random() * 0.9
    };
    shapes.push(mesh);
    scene.add(mesh);
  }

  function recolor() {
    const p = palette();
    buildGrid(p);
    const cols = [p.acc, p.acc2, p.acc3, p.acc, p.acc2];
    shapes.forEach((m, i) => { m.material.color.copy(cols[i]); m.material.wireframe = wireframe; });
  }
  recolor();

  function frame(t, dt) {
    const boost = godMode ? 3.4 : 1;
    grid.position.z = ((t * 3.2 * boost) % STEP);
    shapes.forEach(m => {
      const u = m.userData;
      m.rotation.x += u.spin.x * dt * boost;
      m.rotation.y += u.spin.y * dt * boost;
      m.rotation.z += u.spin.z * dt * boost;
      m.position.z += u.speed * dt * boost;
      if (m.position.z > 12) {           // recycle past the camera
        m.position.z = -48;
        m.position.x = (Math.random() - .5) * 13;
        m.position.y = 0.5 + Math.random() * 5.5;
      }
    });
    renderer.render(scene, cam);
  }

  return { renderer, cam, host, frame, recolor,
           setWire: w => shapes.forEach(m => { m.material.wireframe = w; }) };
}

/* ---------------- core: solido interattivo ------------------------------------ */
function buildCore(host) {
  const renderer = makeRenderer(host, 4);
  if (!renderer) return null;
  host.closest('.screen').classList.add('gl-ok');   // hides the fallback message

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(46, 4 / 3, 0.1, 60);
  cam.position.set(0, 0, 7.4);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(3, 5, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.7);
  rim.position.set(-5, -2, -3);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  const coreMat = new THREE.MeshPhongMaterial({ flatShading: true, shininess: 0 });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.85, 1), coreMat);
  group.add(core);

  const shellMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: .38 });
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(2.65, 0), shellMat);
  group.add(shell);

  const bits = [];
  const bitGeo = new THREE.BoxGeometry(.34, .34, .34);
  for (let i = 0; i < 17; i++) {                     // diciassette, ovviamente
    const m = new THREE.Mesh(bitGeo, new THREE.MeshPhongMaterial({ flatShading: true, shininess: 0 }));
    const a = (i / 17) * Math.PI * 2;
    m.userData = { a, r: 3.5, y: Math.sin(i * 1.7) * 1.5 };
    bits.push(m);
    group.add(m);
  }

  function recolor() {
    const p = palette();
    coreMat.color.copy(p.acc);
    shellMat.color.copy(p.acc2);
    bits.forEach((m, i) => m.material.color.copy(i % 3 === 0 ? p.acc3 : (i % 3 === 1 ? p.acc2 : p.acc)));
  }
  recolor();

  /* drag to spin, with a bit of inertia */
  let vx = 0.32, vy = 0.16, dragging = false, lx = 0, ly = 0;
  host.addEventListener('pointerdown', e => {
    dragging = true; lx = e.clientX; ly = e.clientY;
    host.setPointerCapture(e.pointerId);
    SB.unlock('core');
  });
  host.addEventListener('pointermove', e => {
    if (!dragging) return;
    vy = (e.clientX - lx) * 0.012;
    vx = (e.clientY - ly) * 0.012;
    group.rotation.y += vy;
    group.rotation.x += vx;
    lx = e.clientX; ly = e.clientY;
  });
  const stop = () => { dragging = false; };
  host.addEventListener('pointerup', stop);
  host.addEventListener('pointercancel', stop);

  function frame(t, dt) {
    const boost = godMode ? 3 : 1;
    if (!dragging) {
      group.rotation.y += vy * dt * 2.2 * boost;
      group.rotation.x += vx * dt * 2.2 * boost;
      vy += (0.32 - vy) * 0.02;                      // ease back to the idle spin
      vx += (0.16 - vx) * 0.02;
    }
    shell.rotation.y -= dt * 0.35 * boost;
    shell.rotation.z += dt * 0.18 * boost;
    bits.forEach((m, i) => {
      const u = m.userData;
      const a = u.a + t * 0.45 * boost;
      m.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * 1.3 + i) * 0.25, Math.sin(a) * u.r);
      m.rotation.x += dt * 1.2 * boost;
      m.rotation.y += dt * 0.9 * boost;
    });
    renderer.render(scene, cam);
  }

  return { renderer, cam, host, frame, recolor,
           setWire: w => { coreMat.wireframe = w; bits.forEach(m => { m.material.wireframe = w; }); } };
}

/* ---------------- avvio ------------------------------------------------------- */
const heroHost = document.getElementById('hero-gl');
const coreHost = document.getElementById('core-gl');

const hero = heroHost ? buildHero(heroHost) : null;
const core = coreHost ? buildCore(coreHost) : null;
[hero, core].forEach(s => { if (s) scenes.push(s); });

if (scenes.length) {
  const visible = new Set();
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      const s = scenes.find(x => x.host === e.target);
      if (!s) return;
      if (e.isIntersecting) visible.add(s); else visible.delete(s);
    });
  }, { rootMargin: '80px' });
  scenes.forEach(s => io.observe(s.host));

  scenes.forEach(s => {
    fit(s.renderer, s.cam, s.host);
    new ResizeObserver(() => fit(s.renderer, s.cam, s.host)).observe(s.host);
  });

  let last = performance.now() / 1000;
  function loop(now) {
    const t = now / 1000;
    const dt = Math.min(0.05, t - last);
    last = t;
    visible.forEach(s => s.frame(t, dt));
    requestAnimationFrame(loop);
  }
  if (reduce) {
    scenes.forEach(s => s.frame(0, 0));               // one still frame, no motion
  } else {
    requestAnimationFrame(loop);
  }

  SB.on('theme', () => scenes.forEach(s => s.recolor()));
  SB.on('wireframe', w => { wireframe = w; scenes.forEach(s => s.setWire(w)); });
  SB.on('godmode', () => {
    if (godMode) return;
    godMode = true;
    // only now start following the cycling accent — no idle timer before this
    setInterval(() => scenes.forEach(s => s.recolor()), 200);
  });
}
