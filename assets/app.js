/* ============================================================
   17Labs — V3 · app.js
   Tema, navigazione, comparse, validazione del modulo e l'unico
   segreto della pagina. Nessuna dipendenza: si legge dall'alto
   in basso e finisce qui.
   ============================================================ */
(function () {
  'use strict';

  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const html = document.documentElement;
  const IT = (html.lang || 'it').toLowerCase().indexOf('en') !== 0;

  /* ---------------------------------------------------------
     Bus minimo. Serve solo a far sapere alla scena 3D che il
     tema e' cambiato, senza che i due file si conoscano.
     --------------------------------------------------------- */
  const listeners = {};
  window.SB = {
    on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); },
    emit(evt, arg) { (listeners[evt] || []).forEach(fn => { try { fn(arg); } catch (e) {} }); }
  };

  /* ---------------------------------------------------------
     Tema. Lo script inline nel <head> ha gia' applicato la
     preferenza salvata prima del primo disegno, cosi' non si
     vede il lampo bianco. Qui c'e' solo l'interruttore.
     --------------------------------------------------------- */
  const themeBtn = $('#theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('v3-theme', next); } catch (e) {}
      // il colore CSS cambia subito, la scena deve rileggerlo dopo
      requestAnimationFrame(() => window.SB.emit('theme', next));
    });
  }

  /* ---------------------------------------------------------
     Navigazione: sfondo alla barra dopo lo scorrimento, menu
     compatto, voce attiva della sezione in vista.
     --------------------------------------------------------- */
  const nav = $('#nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = $('#nav-toggle');
  const panel = $('#nav-menu');
  if (burger && panel) {
    const setOpen = open => {
      panel.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open
        ? (IT ? 'Chiudi il menu' : 'Close the menu')
        : (IT ? 'Apri il menu' : 'Open the menu'));
    };
    burger.addEventListener('click', () => setOpen(panel.hidden));
    $$('a', panel).forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 940) setOpen(false); });
  }

  const navLinks = $$('.nav__links a');
  const targets = navLinks
    .map(a => ({ a, sec: document.getElementById(a.getAttribute('href').slice(1)) }))
    .filter(x => x.sec);
  if (targets.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.classList.remove('is-active'));
        const hit = targets.find(t => t.sec === e.target);
        if (hit) hit.a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => spy.observe(t.sec));
  }

  /* ---------------------------------------------------------
     Comparsa alla prima apparizione. Una volta sola, pochi pixel:
     serve a dare ritmo alla lettura, non a fare spettacolo.
     --------------------------------------------------------- */
  const reveals = $$('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  /* anno corrente nel piè di pagina, per non doverlo ricordare a mano */
  $$('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });

  /* ---------------------------------------------------------
     Modulo di contatto.
     Validazione lato client per dare errori chiari subito, invio
     in AJAX per non far uscire nessuno dalla pagina.
     --------------------------------------------------------- */
  const form = $('#contact-form');
  if (form) {
    const out = $('#form-out');
    const T = IT ? {
      nome:  'Serve un nome, anche solo quello di battesimo.',
      email: 'Serve un indirizzo email valido per poterti rispondere.',
      msg:   'Scrivi due righe su cosa ti serve: bastano davvero.',
      ok:    'Devi accettare il trattamento dei dati per poter inviare.',
      send:  'Invio in corso…',
      done:  'Ricevuto. Ti rispondo entro un giorno lavorativo.',
      fail:  'Invio non riuscito. Scrivimi a contact@17labs.it.'
    } : {
      nome:  'A name is required — a first name is enough.',
      email: 'A valid email address is required so I can reply.',
      msg:   'Two lines about what you need is genuinely enough.',
      ok:    'You need to accept data processing before sending.',
      send:  'Sending…',
      done:  'Received. I will reply within one working day.',
      fail:  'Sending failed. Write to contact@17labs.it.'
    };

    const rules = [
      { id: 'nome',  msg: T.nome,  test: v => v.trim().length >= 2 },
      { id: 'email', msg: T.email, test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) },
      { id: 'msg',   msg: T.msg,   test: v => v.trim().length >= 10 },
      { id: 'ok',    msg: T.ok,    test: (v, el) => el.checked }
    ];

    const check = (r, silent) => {
      const field = document.getElementById('f-' + r.id);
      const input = document.getElementById('i-' + r.id);
      const err = document.getElementById('e-' + r.id);
      const good = r.test(input.value, input);
      if (!silent) {
        field.classList.toggle('is-bad', !good);
        err.textContent = good ? '' : r.msg;
        input.setAttribute('aria-invalid', good ? 'false' : 'true');
      }
      return good;
    };

    rules.forEach(r => {
      const input = document.getElementById('i-' + r.id);
      if (!input) return;
      input.addEventListener('blur', () => check(r));
      input.addEventListener('input', () => {
        if (document.getElementById('f-' + r.id).classList.contains('is-bad')) check(r);
      });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const bad = rules.filter(r => !check(r));
      if (bad.length) {
        document.getElementById('i-' + bad[0].id).focus();
        return;
      }

      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      out.className = 'form__out';
      out.textContent = T.send;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success !== false) {
          out.className = 'form__out ok';
          out.textContent = T.done;
          form.reset();
        } else {
          throw new Error('rifiutato');
        }
      } catch (err) {
        out.className = 'form__out';
        out.textContent = T.fail;
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---------------------------------------------------------
     L'unico segreto del sito.
     Niente sezione dedicata, niente trofei, niente indizi: chi
     conosce la sequenza la prova comunque, chi non la conosce
     non si accorge che esiste. E' esattamente la dose di nerd
     che un biglietto da visita si puo' permettere.
     --------------------------------------------------------- */
  const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
               'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  let schematic = false;
  const readout = $('#readout');

  document.addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = (k === SEQ[pos]) ? pos + 1 : (k === SEQ[0] ? 1 : 0);
    if (pos < SEQ.length) return;
    pos = 0;
    schematic = !schematic;
    window.SB.emit('schematic', schematic);
    if (!readout) return;
    readout.textContent = schematic
      ? (IT ? 'Modalità schematico attiva' : 'Schematic mode on')
      : (IT ? 'Modalità schematico disattivata' : 'Schematic mode off');
    readout.classList.add('is-on');
    clearTimeout(readout._t);
    readout._t = setTimeout(() => readout.classList.remove('is-on'), 2600);
  });
})();
