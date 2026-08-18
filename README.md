# 17Labs — V3

Sito di [17Labs](https://17labs.it) — Carmine La Luna.
Stessi contenuti di `Master`, altro registro: questo e' il biglietto da visita da
mandare a un'azienda.

Italiano su `/`, inglese su `/en/`.

## Cos'e' cambiato rispetto a Master

Master e' un sito che si diverte: pixel art, sprite a 16 colori, trofei, sala giochi,
`PRESS START`. Funziona benissimo con chi conosce quell'ambiente, e rischia di lavorare
contro con chi non lo conosce — un responsabile acquisti che apre una schermata da
console a 16 bit non pensa "che bravo", pensa "e questo chi e'".

V3 tiene tutto il contenuto e cambia il registro.

| | Master | V3 |
|---|---|---|
| Carattere per i titoli | Press Start 2P | Inter 600 |
| 3D | risoluzione /5, senza antialiasing, bordi duri | piena risoluzione, antialiasing, linee sottili |
| Colori | viola, ciano, verde acido | inchiostro, un ottone solo, un acciaio nella scena |
| Sezioni | INVENTARIO, QUEST LOG, SALA GIOCHI | Competenze, Metodo, Lavori |
| Livelli di competenza | barre XP con valori da 1 a 10 | tolte |
| Trofei | sei trofei, sezione dedicata | tolti |
| Segreti | vari, dichiarati in pagina | uno solo, non dichiarato |

**Il "nerd" e' rimasto, ma ha cambiato forma.** Non e' piu' citazione pop, e' precisione:
etichette monospaziate, numeri di sezione, filetti da tavola tecnica, una scheda tecnica
al posto di un elenco puntato, e una scena 3D che si monta davanti a chi guarda invece di
limitarsi a girare. Chi conosce l'ambiente lo riconosce subito; chi non lo conosce vede
solo un sito curato.

I livelli di competenza sono stati tolti di proposito: erano segnaposto da tarare, e
un'autovalutazione da 1 a 10 davanti a un cliente e' un rischio, non una credenziale.

## Com'e' fatto

Niente framework, niente librerie di componenti, nessun passaggio di build.
Si apre, si legge, si modifica.

- **Intestazione 3D** — `three.js` disegna una geodetica ricavata da un icosaedro
  suddiviso: **162 nodi e 480 spigoli**. La libreria restituisce i vertici ripetuti
  (960 posizioni per 162 punti reali), quindi `assets/scene.js` li de-duplica
  arrotondando le coordinate e da li' ricava gli spigoli unici. I nodi partono sparsi
  fuori campo e convergono nella posizione esatta in poco piu' di un secondo.
  Attenzione al parametro `detail`: **non** e' un numero di raddoppi, e' il numero di
  suddivisioni per lato meno uno — ogni faccia diventa `(detail+1)²` triangoli. Servono
  quindi `detail: 3`, non 2.
- **Colori** — la scena non ha una palette propria: legge `--acc`, `--steel`, `--line-2`
  e `--bg` dal CSS a ogni cambio di tema. Pagina e 3D non possono andare fuori sincrono.
- **Icone** — 20 simboli SVG in linea, disegnati a tratto su griglia 24, richiamati con
  `<use>`. Nessuna libreria, nessuna richiesta in piu', e prendono il colore del testo.
- **Accessibilita'** — verificata misurando: uno script percorre ogni elemento di testo
  nei due temi e calcola il rapporto di contrasto contro lo sfondo reale. **269 elementi
  in italiano, 270 in inglese, nessuno sotto la soglia WCAG AA.** Ha trovato un errore
  invisibile a occhio: nel menu compatto il pulsante ereditava il colore della lista e
  finiva grigio su ottone, 1.01:1.
- **Senza JavaScript** — le comparse allo scorrimento restano nascoste solo se la classe
  `.js` c'e', e la mette lo script nel `<head>`. Senza quella riga un browser con JS
  disattivato mostrerebbe una pagina vuota.
- **Privacy** — nessuna chiamata a domini esterni per rendere la pagina: caratteri
  tipografici e `three.js` sono ospitati qui dentro. L'unica richiesta in uscita parte
  quando qualcuno invia il modulo di contatto.

## Il segreto

Ce n'e' uno solo, e non e' scritto da nessuna parte in pagina: il **codice Konami**
(↑ ↑ ↓ ↓ ← → ← → B A) passa le due scene in modalita' schematico — spigoli in ottone,
nodi spenti, anelli in evidenza. Si ripreme per tornare indietro.

Niente trofei, niente sezione dedicata, nessun indizio. Chi conosce la sequenza la prova
comunque; chi non la conosce non si accorge che esiste. E' la dose di nerd che un
biglietto da visita si puo' permettere.

## Struttura

```
index.html          italiano
en/index.html       inglese
privacy.html        informativa (IT), en/privacy.html (EN)
404.html            pagina di errore, volutamente autonoma:
                    nessun asset esterno, perche' viene servita
                    anche da percorsi profondi
assets/
  style.css         tutti gli stili, in nove blocchi numerati
  app.js            tema, menu, comparse, modulo, codice Konami
  scene.js          le due scene three.js
  fonts.css         @font-face locali
  fonts/            woff2, solo subset latin e latin-ext
  three.module.js   libreria, ospitata in proprio
```

Rispetto a Master mancano i font Press Start 2P: qui non servono.

## Da sistemare prima di pubblicare

- **`og.png`** e' ancora quella di Master, con la grafica pixel. Va rifatta con l'immagine
  di V3, 1200×630. Finche' resta cosi', l'anteprima nelle chat e sui social mostra il
  sito vecchio.
- **La riga sul lavoro dipendente** in "Chi sono" e nelle FAQ: verifica il contratto prima
  di pubblicarla, molti regolano l'attivita' autonoma parallela.
- **La P. IVA** va nel piè di pagina solo quando esiste davvero. Quando esiste, cambia
  anche `"@type": "Person"` in `"ProfessionalService"` nei dati strutturati.
- **`CNAME`** contiene `17labs.it`, uguale a Master: solo una delle due cartelle puo'
  essere pubblicata su quel dominio.

## In locale

```bash
python -m http.server 8179
```

Oppure doppio click su `anteprima.cmd`.

Serve un server: aprendo `index.html` dal disco il protocollo e' `file://` e i moduli
JavaScript vengono bloccati dal CORS, quindi la scena 3D non parte.

## Pubblicazione

GitHub Pages con dominio personalizzato: `CNAME` contiene il dominio, `.nojekyll`
disattiva Jekyll. Sul DNS l'apex punta ai record A di GitHub Pages, `www` a
`carminelaluna.github.io` via CNAME.

## Licenze

Il codice e' mio. I caratteri tipografici sono di terzi e ridistribuiti secondo le loro
licenze: Inter sotto SIL Open Font License, JetBrains Mono sotto Apache 2.0.
`three.js` e' sotto licenza MIT.
