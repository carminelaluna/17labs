# Pubblicare 17labs.it su GitHub Pages

Non serve un redirect: GitHub Pages **serve direttamente** il tuo dominio.
Il traffico non passa da `username.github.io` per poi rimbalzare — punti il DNS
a GitHub e le pagine escono già su `17labs.it`, con il certificato HTTPS giusto.

---

## 1. Il repository

Crea un repository e caricaci il contenuto di questa cartella, **radice compresa**
(`index.html` deve stare al primo livello, non dentro una sottocartella).

```bash
git init
git add .
git commit -m "Sito 17Labs"
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/17labs.git
git push -u origin main
```

Due file sono già pronti e servono a questo:

| File | A cosa serve |
|---|---|
| `CNAME` | contiene `17labs.it`: dice a GitHub qual è il dominio del sito |
| `.nojekyll` | disattiva Jekyll, che altrimenti ignora file e cartelle che iniziano con `_` |

**Il repository sarà pubblico** (Pages su repo privati richiede un piano a pagamento).
Il contenuto del sito è pubblico comunque, ma tienilo a mente: dentro c'è la
`access_key` di Web3Forms. È pubblica per progetto, quindi va bene, ma se un domani
arriva spam la rigeneri dal loro pannello.

## 2. Attivare Pages

Nel repository: **Settings → Pages**

- Source: `Deploy from a branch`
- Branch: `main`, cartella `/ (root)`
- Salva

Dopo un minuto il sito è online su `TUO-UTENTE.github.io/17labs`.

## 3. Il DNS su Register.it

Entra nel pannello di Register.it, sezione DNS del dominio `17labs.it`, e imposta:

**Record A** per il dominio nudo (`@` oppure `17labs.it`), tutti e quattro:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Record AAAA**, se il pannello li supporta (IPv6, consigliati):

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**Record CNAME** per il sottodominio `www`:

```
www   ->   TUO-UTENTE.github.io
```

### ⚠ Non toccare i record MX

La posta di `contact@17labs.it` vive sui **record MX**, che sono indipendenti dai
record A. Cambiando A e AAAA la posta continua a funzionare.

Quello che invece **rompe la posta** è usare le funzioni di *"reindirizzamento web"*
o *"parcheggio dominio"* di Register.it al posto dei record DNS veri: alcune di
queste sostituiscono l'intera zona. Usa la gestione DNS avanzata e modifica solo
A, AAAA e il CNAME di `www`.

## 4. HTTPS

Torna su **Settings → Pages**, controlla che sotto "Custom domain" compaia
`17labs.it` con la spunta verde, poi attiva **Enforce HTTPS**.

La casella resta disabilitata finché GitHub non ha emesso il certificato
Let's Encrypt: serve che il DNS sia propagato. Da pochi minuti a qualche ora.
Se dopo 24 ore è ancora grigia, togli e rimetti il dominio in quel campo.

## 5. Verifiche dopo la messa online

- [ ] `https://17labs.it` risponde e mostra il lucchetto
- [ ] `https://www.17labs.it` redirige al dominio nudo
- [ ] `https://17labs.it/en/` carica la versione inglese
- [ ] Manda un messaggio dal form e controlla che arrivi
- [ ] Manda una mail **a** `contact@17labs.it` da un altro indirizzo: conferma che
      il cambio DNS non ha toccato la posta
- [ ] `https://17labs.it/pagina-inesistente` mostra la 404 "GAME OVER"

Sull'ultimo punto: GitHub Pages usa automaticamente `404.html` dalla radice,
non serve configurare nulla.

## Note

- **La sandbox non finisce online.** Vive in `TEST/`, fuori da questa cartella e fuori
  dal repository: puoi romperci quello che vuoi senza rischiare la produzione.
- Il sito **non contatta nessun dominio esterno** per rendersi: font e three.js sono
  ospitati qui dentro. L'unica chiamata in uscita è l'invio del modulo a Web3Forms,
  e parte solo quando qualcuno preme INVIA.
- `anteprima.cmd` apre il sito in locale su `http://localhost:8177` con la stessa
  struttura di percorsi che avrà online. Serve perché aprendo `index.html` con un
  doppio click il protocollo è `file://` e la scena 3D non parte.
