# 17labs.it

Sito di [17Labs](https://17labs.it) — Carmine La Luna.
Sviluppo software su misura: siti, portali, gestionali e integrazioni con modelli linguistici.

Italiano su `/`, inglese su `/en/`.

## Com'è fatto

Niente framework, niente librerie di componenti, nessun passaggio di build.
Si apre, si legge, si modifica.

- **Icone** — 21 sprite `16×16` disegnati a mano su una palette di 16 colori, il vincolo
  di una tile SNES. Vivono come griglie di caratteri in `assets/app.js`, vengono
  renderizzati su canvas e animati con il *palette cycling*, la tecnica dell'epoca:
  invece di ridisegnare, si cambia il colore assegnato a uno slot.
- **3D** — `three.js` che renderizza a un quinto della risoluzione reale, senza
  antialiasing, e lascia che sia il CSS a riportare l'immagine in scala. I poligoni
  prendono così gli stessi bordi duri degli sprite.
- **Accessibilità** — verificata misurando: uno script percorre ogni elemento di testo
  nei due temi e calcola il rapporto di contrasto contro lo sfondo reale. 562 elementi
  in italiano, 564 in inglese, nessuno sotto la soglia WCAG AA.
- **Privacy** — nessuna chiamata a domini esterni per rendere la pagina: caratteri
  tipografici e `three.js` sono ospitati qui dentro. L'unica richiesta in uscita parte
  quando qualcuno invia il modulo di contatto.

## Struttura

```
index.html          italiano
en/index.html       inglese
privacy.html        informativa (IT), en/privacy.html (EN)
404.html            pagina di errore, autonoma
assets/
  style.css         tutti gli stili
  app.js            motore sprite, easter egg, form, i18n
  scene.js          scene three.js
  fonts.css         @font-face locali
  fonts/            woff2, solo subset latin e latin-ext
```

## In locale

```bash
python -m http.server 8177
```

Oppure doppio click su `anteprima.cmd`.

Serve un server: aprendo `index.html` dal disco il protocollo è `file://` e i moduli
JavaScript vengono bloccati dal CORS, quindi la scena 3D non parte.

## Pubblicazione

GitHub Pages con dominio personalizzato: `CNAME` contiene il dominio, `.nojekyll`
disattiva Jekyll. Sul DNS l'apex punta ai record A di GitHub Pages, `www` a
`carminelaluna.github.io` via CNAME.

## Licenze

Il codice è mio. I caratteri tipografici sono di terzi e ridistribuiti secondo le loro
licenze: Press Start 2P e Inter sotto SIL Open Font License, JetBrains Mono sotto
Apache 2.0. `three.js` è sotto licenza MIT.
