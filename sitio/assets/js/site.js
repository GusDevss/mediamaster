/* =====================================================================
   MEDIAMASTER · JavaScript único del sitio
   ===================================================================== */
(function () {
  var WHATSAPP = '524421589486';
  var CORREO = 'coordinacionventas@mediamaster.mx';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var wa = function (t) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(t); };

  /* ---------- enlaces de WhatsApp ---------- */
  $$('[data-wa]').forEach(function (a) {
    a.href = wa(a.getAttribute('data-wa') || 'Hola, me gustaría cotizar una campaña con Mediamaster.');
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* ---------- header, barra de progreso y botón subir ---------- */
  var hdr = $('.hdr'), prog = $('.progress'), top = $('.totop'), lastY = 0;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    var p = h > 0 ? y / h : 0;
    if (prog) prog.style.setProperty('--p', p.toFixed(4));
    if (top) { top.style.setProperty('--p', p.toFixed(4)); top.classList.toggle('is-on', y > 700); }
    if (hdr) {
      hdr.classList.toggle('is-solid', y > 30);
      if (!document.body.classList.contains('menu-open')) hdr.classList.toggle('is-hidden', y > 500 && y > lastY + 4);
      if (y < lastY - 4) hdr.classList.remove('is-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- menú móvil ---------- */
  var burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.documentElement.style.overflow = open ? 'hidden' : '';
    });
    $$('.mnav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
      });
    });
  }

  /* ---------- títulos que aparecen palabra por palabra ---------- */
  $$('.split').forEach(function (el) {
    var i = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'); o.className = 'w';
            var s = document.createElement('span'); s.textContent = w;
            s.style.transitionDelay = (i++ * 0.06) + 's';
            o.appendChild(s); frag.appendChild(o);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
  });

  /* ---------- aparición al hacer scroll + contadores ---------- */
  function count(el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    var t0 = performance.now(), dur = 1800;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  var revealEls = $$('.rv, .split, .stat, [data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (e.target.hasAttribute('data-count')) count(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- videos: se cargan y reproducen solo si están en pantalla ---------- */
  $$('video[data-src]').forEach(function (v) {
    if (!('IntersectionObserver' in window)) { v.src = v.getAttribute('data-src'); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) v.src = v.getAttribute('data-src');
          if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        } else if (v.getAttribute('src')) v.pause();
      });
    }, { rootMargin: '200px' }).observe(v);
  });

  /* ---------- parallax suave ---------- */
  var para = $$('[data-parallax]');
  if (para.length && !reduce) {
    var tick = false;
    var run = function () {
      para.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = 'translate3d(0,' + (k * -parseFloat(el.getAttribute('data-parallax'))).toFixed(1) + 'px,0)';
      });
      tick = false;
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- preguntas: solo una abierta ---------- */
  $$('.acc').forEach(function (acc) {
    var ds = $$('details', acc);
    ds.forEach(function (d) {
      d.addEventListener('toggle', function () { if (d.open) ds.forEach(function (o) { if (o !== d) o.open = false; }); });
    });
  });

  /* ---------- galería arrastrable ---------- */
  $$('.rail').forEach(function (rail) {
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; rail.classList.add('is-drag'); }
      rail.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; rail.classList.remove('is-drag'); });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    var id = rail.id, step = function (d) {
      var it = $('.rail__it', rail); rail.scrollBy({ left: d * (it ? it.offsetWidth + 16 : 300), behavior: 'smooth' });
    };
    $$('[data-rail="' + id + '"]').forEach(function (b) {
      b.addEventListener('click', function () { step(+b.getAttribute('data-dir')); });
    });
  });

  /* ---------- puntos interactivos sobre imágenes ---------- */
  $$('.show').forEach(function (show) {
    var pins = $$('.pin', show), i = 0, auto = null;
    function on(k) { pins.forEach(function (p, j) { p.classList.toggle('is-on', j === k); }); i = k; }
    function stop() { clearInterval(auto); auto = null; }
    pins.forEach(function (p, k) {
      var b = $('.pin__dot', p);
      b.addEventListener('click', function () { stop(); on(p.classList.contains('is-on') ? -1 : k); });
      b.addEventListener('mouseenter', function () { stop(); on(k); });
    });
    if (pins.length && !reduce) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !auto && i !== -1) {
          on(i); auto = setInterval(function () { on((i + 1) % pins.length); }, 3200);
        } else if (!es[0].isIntersecting) stop();
      }, { threshold: .4 }).observe(show);
    }
  });

  /* ---------- "¿Por qué elegirnos?" con imagen que cambia ---------- */
  $$('.why').forEach(function (why) {
    var items = $$('.why__it', why), imgs = $$('.why__media img', why), bar = $('.why__bar', why);
    var cur = 0, t = 0, paused = false, visible = false, DUR = 5, last = performance.now();
    function set(k) {
      cur = k; t = 0;
      items.forEach(function (it, j) { it.classList.toggle('is-on', j === k); it.setAttribute('aria-expanded', j === k ? 'true' : 'false'); });
      imgs.forEach(function (im, j) { im.classList.toggle('is-on', j === k); });
    }
    items.forEach(function (it, k) {
      it.addEventListener('click', function () { set(k); });
      it.addEventListener('mouseenter', function () { set(k); paused = true; });
      it.addEventListener('mouseleave', function () { paused = false; });
    });
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: .3 }).observe(why);
    set(0);
    (function loop(now) {
      var dt = (now - last) / 1000; last = now;
      if (visible && !paused && !reduce) { t += dt; if (t >= DUR) set((cur + 1) % items.length); }
      if (bar) bar.style.setProperty('--p', Math.min(1, t / DUR).toFixed(3));
      requestAnimationFrame(loop);
    })(last);
  });

  /* ---------- ventana de video ---------- */
  var modal = $('.modal'), frame = modal && $('.modal__frame', modal), box = modal && $('.modal__box', modal);
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    setTimeout(function () { modal.hidden = true; frame.innerHTML = ''; }, 300);
    document.dispatchEvent(new Event('mm:modalclose'));
  }
  $$('[data-video]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var v = b.getAttribute('data-video'), vert = b.hasAttribute('data-vertical');
      box.classList.toggle('modal__box--v', vert);
      if (v.indexOf('yt:') === 0) {
        frame.innerHTML = '<iframe allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video" src="https://www.youtube-nocookie.com/embed/' +
          v.slice(3) + '?autoplay=1&rel=0&modestbranding=1&playsinline=1"></iframe>';
      } else {
        frame.innerHTML = '<video controls autoplay playsinline src="' + v + '"></video>';
      }
      document.dispatchEvent(new Event('mm:modalopen'));
      modal.hidden = false;
      requestAnimationFrame(function () { modal.classList.add('is-open'); });
      document.documentElement.style.overflow = 'hidden';
      $('.modal__x', modal).focus();
    });
  });
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.modal__x')) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  }

  /* ---------- YouTube en el teléfono: se carga al dar clic ---------- */
  $$('.yt-face').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-yt');
      var f = document.createElement('iframe');
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true; f.title = 'Video';
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=' + id;
      b.replaceWith(f);
    });
  });

  /* ---------- mapa: se carga al dar clic (página más rápida) ---------- */
  $$('.map__face').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = b.getAttribute('data-map'); f.title = 'Mapa de ubicaciones'; f.loading = 'lazy';
      b.replaceWith(f);
    });
  });

  /* ---------- formulario de contacto → WhatsApp ---------- */
  $$('.form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('[required]', form).forEach(function (inp) {
        var f = inp.closest('.fld'), bad = !inp.value.trim() || (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value));
        f.classList.toggle('is-err', bad); if (bad && ok) { inp.focus(); ok = false; }
      });
      if (!ok) return;
      var d = new FormData(form), medios = d.getAll('medio');
      var msg = 'Hola Mediamaster, quiero cotizar una campaña.\n\n' +
        'Nombre: ' + d.get('nombre') + '\nCorreo: ' + d.get('correo') +
        (d.get('telefono') ? '\nTeléfono: ' + d.get('telefono') : '') +
        (d.get('empresa') ? '\nEmpresa: ' + d.get('empresa') : '') +
        (medios.length ? '\nMe interesa: ' + medios.join(', ') : '') +
        '\n\n' + d.get('mensaje');
      window.open(wa(msg), '_blank', 'noopener');
      form.classList.add('is-sent');
    });
    $$('input,textarea,select', form).forEach(function (i) {
      i.addEventListener('input', function () { var f = i.closest('.fld'); if (f) f.classList.remove('is-err'); });
    });
    var mail = $('[data-mail]', form);
    if (mail) mail.addEventListener('click', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      location.href = 'mailto:' + CORREO + '?subject=' + encodeURIComponent('Cotización · ' + (d.get('empresa') || d.get('nombre') || 'Mediamaster')) +
        '&body=' + encodeURIComponent((d.get('mensaje') || '') + '\n\n' + (d.get('nombre') || '') + '\n' + (d.get('telefono') || ''));
    });
  });

  /* ---------- estadio: video de YouTube de fondo ---------- */
  var shero = $('.shero');
  if (shero) {
    var ytBox = $('.shero__yt', shero), snd = $('.sound', shero), ytF = null, id = shero.getAttribute('data-yt');
    var cover = function () {
      if (!ytF) return;
      var w = shero.clientWidth, h = shero.clientHeight, fw = Math.max(w, h * 16 / 9) * 1.22;
      ytF.style.width = fw + 'px'; ytF.style.height = (fw * 9 / 16) + 'px';
    };
    var yt = function (cmd, args) { if (ytF) ytF.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd, args: args || [] }), '*'); };
    if (id && !reduce) {
      ytF = document.createElement('iframe');
      ytF.title = 'Video oficial'; ytF.allow = 'autoplay; encrypted-media'; ytF.tabIndex = -1;
      ytF.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + id +
        '&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1&origin=' + encodeURIComponent(location.origin);
      ytF.addEventListener('load', function () { setTimeout(function () { ytBox.classList.add('is-on'); snd.hidden = false; }, 1500); });
      ytBox.appendChild(ytF); cover(); window.addEventListener('resize', cover);
    }
    snd.addEventListener('click', function () {
      var on = snd.getAttribute('aria-pressed') !== 'true';
      snd.setAttribute('aria-pressed', on ? 'true' : 'false');
      $('span', snd).textContent = on ? 'Silenciar' : 'Activar sonido';
      if (on) { yt('unMute'); yt('setVolume', [100]); } else yt('mute');
    });
    document.addEventListener('mm:modalopen', function () { yt('pauseVideo'); if (snd.getAttribute('aria-pressed') === 'true') snd.click(); });
    document.addEventListener('mm:modalclose', function () { yt('playVideo'); });
  }

  /* ---------- estadio: prueba tu logo en la pantalla ---------- */
  var upl = $('#mm-logo');
  if (upl) {
    upl.addEventListener('change', function () {
      var f = upl.files && upl.files[0];
      if (!f || !/^image\//.test(f.type)) return;
      var url = URL.createObjectURL(f);
      $$('.scr-user img').forEach(function (im) { im.src = url; });
      $$('[data-scr]').forEach(function (s) { s.classList.add('has-user'); });
      var rs = $('[data-scr-reset]'); if (rs) rs.hidden = false;
    });
    var rs = $('[data-scr-reset]');
    if (rs) rs.addEventListener('click', function () {
      $$('[data-scr]').forEach(function (s) { s.classList.remove('has-user'); });
      upl.value = ''; rs.hidden = true;
    });
  }
})();

/* ---------- espectacular LED ---------- */

(function () {
  /* ============ CONFIGURA AQUÍ ============ */
  var SEGUNDOS_POR_ANUNCIO = 5;
  var COLORES_BRILLO = ['#ff0a6c', '#ffb347', '#3aa0ff', '#ff5a1f', '#c98a4b', '#ff7a59', '#b6ff3b']; // luz que emite la pantalla con cada anuncio

  /* Esquinas de la pantalla dentro del dibujo (en % del ancho/alto).
     No las cambies a menos que modifiques el dibujo SVG. */
  var ESQUINAS = {
    supIzq: [4.64, 24.13],
    supDer: [83.66, 6.74],
    infDer: [83.79, 66.20],
    infIzq: [3.33, 72.66]
  };
  /* ======================================== */

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Resuelve la homografía que lleva el rectángulo 1600×900 a las 4 esquinas
  function solve(A, b) {
    var n = b.length, i, j, k;
    for (i = 0; i < n; i++) A[i].push(b[i]);
    for (i = 0; i < n; i++) {
      var max = i;
      for (k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[max][i])) max = k;
      var t = A[i]; A[i] = A[max]; A[max] = t;
      for (k = i + 1; k < n; k++) {
        var f = A[k][i] / A[i][i];
        for (j = i; j <= n; j++) A[k][j] -= f * A[i][j];
      }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) {
      var s = A[i][n];
      for (j = i + 1; j < n; j++) s -= A[i][j] * x[j];
      x[i] = s / A[i][i];
    }
    return x;
  }
  function matrix3d(w, h, q) {
    var src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], b = [];
    for (var i = 0; i < 4; i++) {
      var x = src[i][0], y = src[i][1], u = q[i][0], v = q[i][1];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    var m = solve(A, b);
    return 'matrix3d(' + [m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, 1].join(',') + ')';
  }

  document.querySelectorAll('.mm-bb:not([data-ready])').forEach(function (root) {
    root.setAttribute('data-ready', '1');
    var frame = root.querySelector('.mm-bb__frame');
    var screen = root.querySelector('.mm-bb__screen');
    var ads = [].slice.call(root.querySelectorAll('.mm-ad'));
    // un anuncio puede durar más con data-segundos (el del estadio dura 9 s: 3 pantallas de 3 s)
    function dur(i) { return parseFloat(ads[i] && ads[i].getAttribute('data-segundos')) || SEGUNDOS_POR_ANUNCIO; }
    // la pantalla del estadio usa el mismo icono de Mediamaster del primer anuncio
    var star = root.querySelector('img.mm-star');
    root.querySelectorAll('.mm-st-star').forEach(function (im) { if (star) im.src = star.src; });
    var dotsEl = root.querySelector('.mm-bb__dots');

    function fit() {
      var W = frame.clientWidth, H = frame.clientHeight;
      var q = [ESQUINAS.supIzq, ESQUINAS.supDer, ESQUINAS.infDer, ESQUINAS.infIzq].map(function (p) {
        return [p[0] / 100 * W, p[1] / 100 * H];
      });
      screen.style.transform = matrix3d(1600, 900, q);
      screen.style.setProperty('--led', W < 600 ? 0 : W < 900 ? 0.5 : 1);   // evita moiré en pantallas pequeñas
      screen.classList.add('is-ready');
    }

    var dots = ads.map(function (ad, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'mm-bb__dot';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', ad.getAttribute('aria-label'));
      d.addEventListener('click', function () { show(i); });
      dotsEl.appendChild(d);
      return d;
    });

    var index = -1, elapsed = 0, paused = false, last = performance.now();
    function show(i) {
      i = (i + ads.length) % ads.length;
      if (i === index) return;
      ads.forEach(function (a, k) {
        a.classList.toggle('is-active', k === i);
        a.setAttribute('aria-hidden', k === i ? 'false' : 'true');
      });
      dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      screen.style.setProperty('--mm-glow', COLORES_BRILLO[i % COLORES_BRILLO.length]);
      screen.classList.remove('is-switching');
      void screen.offsetWidth;                       // reinicia el barrido
      screen.classList.add('is-switching');
      index = i;
      elapsed = 0;
    }

    function tick(now) {
      var dt = (now - last) / 1000;
      last = now;
      if (!paused && !document.hidden) {
        elapsed += dt;
        if (elapsed >= dur(index)) show(index + 1);
      }
      dots.forEach(function (d, k) {
        d.style.setProperty('--p', k === index ? Math.min(1, elapsed / dur(index)) : 0);
      });
      requestAnimationFrame(tick);
    }

    // pausa al pasar el cursor sobre la pantalla
    frame.addEventListener('mouseenter', function () { paused = true; });
    frame.addEventListener('mouseleave', function () { paused = false; });

    if (window.ResizeObserver) new ResizeObserver(fit).observe(frame);
    window.addEventListener('resize', fit);
    fit();
    show(0);
    if (reduce) SEGUNDOS_POR_ANUNCIO = Math.max(SEGUNDOS_POR_ANUNCIO, 8);
    requestAnimationFrame(tick);
  });
})();

/* ---------- carrusel de tótem ---------- */

(function () {
  /* ======================================================
     CONFIGURA AQUÍ TUS SERVICIOS
     - titulo: nombre de la categoría o servicio
     - imagen: URL de la imagen
     - url:    página a la que lleva el clic
     - color:  color del brillo del tótem cuando está al frente
     ====================================================== */
  var U = 'assets/img/';
  var MEDIOS = [
    { titulo: 'Pantallas Digitales',  imagen: U + 'pantalla-edificio.webp',       url: 'pantallas-digitales-queretaro', color: '#8a3ffc' },
    { titulo: 'Espectaculares',       imagen: U + 'espectacular-atardecer.webp',  url: 'espectaculares-queretaro',      color: '#ff7a00' },
    { titulo: 'Tótems',               imagen: U + 'totem-restaurante.webp',       url: 'totems-queretaro',              color: '#22d65a' },
    { titulo: 'Aeropuerto AIQ',       imagen: U + 'aeropuerto-gran-campana.webp', url: 'aeropuerto-aiq',                color: '#ff0a6c' },
    { titulo: 'Aeropuerto AICM',      imagen: U + 'aicm-pantalla.webp',           url: 'aeropuerto-aicm',               color: '#3aa0ff' },
    { titulo: 'Estadio Corregidora',  imagen: U + 'estadio-pantalla.webp',        url: 'estadio-corregidora-queretaro', color: '#f5e400' }
  ];

  var VELOCIDAD = 0.12;           // grados por frame (más alto = gira más rápido)
  var ABRIR_EN_NUEVA_PESTANA = false;

  /* ---------------- no es necesario editar abajo ---------------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var target = ABRIR_EN_NUEVA_PESTANA ? '_blank' : '_self';

  // precarga para que el tótem cambie sin parpadeos
  MEDIOS.forEach(function (m) { var i = new Image(); i.src = m.imagen; });

  document.querySelectorAll('.mm-totem-wrap:not([data-ready])').forEach(function (root) {
    root.setAttribute('data-ready', '1');
    var stage = root.querySelector('.mm-stage');
    var orbit = root.querySelector('.mm-orbit');
    var totem = root.querySelector('.mm-totem');
    var tImg = totem.querySelector('.mm-totem__media img');
    var tTitle = totem.querySelector('.mm-totem__title');
    var live = root.querySelector('.mm-live');

    var panels = MEDIOS.map(function (m, i) {
      var a = document.createElement('a');
      a.className = 'mm-panel';
      a.href = m.url;
      a.target = target;
      if (target === '_blank') a.rel = 'noopener';
      a.setAttribute('aria-label', m.titulo);
      a.innerHTML =
        '<span class="mm-panel__frame"><img alt="" decoding="async" draggable="false">' +
        '<span class="mm-panel__name"></span><span class="mm-panel__cta">Ver más →</span></span>';
      var img = a.querySelector('img');
      img.src = m.imagen;
      img.alt = m.titulo + ' – Mediamaster';
      a.querySelector('.mm-panel__name').textContent = m.titulo;
      orbit.appendChild(a);
      return a;
    });

    // partículas
    var pc = root.querySelector('.mm-particles');
    for (var k = 0; k < 28; k++) {
      var s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.top = 10 + Math.random() * 70 + '%';
      s.style.setProperty('--d', 3 + Math.random() * 4 + 's');
      s.style.setProperty('--dl', -Math.random() * 6 + 's');
      pc.appendChild(s);
    }

    var n = panels.length, step = 360 / n;
    var angle = 0, current = reduce ? 0 : VELOCIDAD;
    var hovering = false, snapTo = null, W = 0, R = 0, PW = 0, active = -1, swapTimer = null;

    function layout() {
      W = stage.clientWidth;
      var mobile = W < 768;
      PW = mobile ? Math.max(90, W * 0.25) : Math.max(150, Math.min(260, W * 0.17));
      var tw = mobile ? Math.max(130, W * 0.36) : Math.max(190, Math.min(290, W * 0.2));
      var sh = Math.round(tw * 2.05 + 70);
      stage.style.setProperty('--pw', PW + 'px');
      stage.style.setProperty('--tw', tw + 'px');
      stage.style.setProperty('--sh', sh + 'px');
      stage.style.setProperty('--cy', Math.round(tw * 0.95 + 30) + 'px');
      R = mobile ? W * 0.47 : Math.min(W * 0.38, 560);
    }

    function setActive(i) {
      if (i === active) return;
      var first = active === -1;
      active = i;
      var m = MEDIOS[i];
      totem.href = m.url;
      totem.target = target;
      totem.setAttribute('aria-label', 'Ver ' + m.titulo);
      totem.style.setProperty('--mm-c', m.color);
      live.textContent = m.titulo;
      function swap() {
        tImg.src = m.imagen;
        tImg.alt = m.titulo + ' – Mediamaster';
        tTitle.textContent = m.titulo;
        totem.classList.remove('is-changing');
      }
      clearTimeout(swapTimer);
      if (first) { swap(); return; }
      totem.classList.add('is-changing');
      swapTimer = setTimeout(swap, 380);
    }

    function render() {
      var best = 0, bestZ = -Infinity;
      for (var i = 0; i < n; i++) {
        var a = (angle + i * step) * Math.PI / 180;
        var sn = Math.sin(a), cs = Math.cos(a);
        var x = sn * R, z = cs * R * 0.9;
        var depth = (cs + 1) / 2;                       // 0 = atrás, 1 = frente
        // al pasar frente al tótem el panel "entra" a la pantalla y se desvanece
        var near = Math.min(1, Math.abs(x) / (W * 0.2));
        var fade = z > 0 ? near : 1;
        var el = panels[i];
        el.style.transform =
          'translate3d(' + x.toFixed(1) + 'px,' + (-depth * 14).toFixed(1) + 'px,' + (z - R * 0.3).toFixed(1) + 'px) ' +
          'rotateY(' + (sn * -26).toFixed(1) + 'deg)';
        el.style.zIndex = Math.round(1000 + z);
        el.style.opacity = ((0.3 + depth * 0.7) * fade * fade).toFixed(3);
        el.style.filter = 'brightness(' + (0.4 + depth * 0.6).toFixed(2) + ')';
        var off = Math.abs(x) < W * 0.12 || fade < 0.4;
        el.style.pointerEvents = off ? 'none' : 'auto';
        el.tabIndex = off ? -1 : 0;
        if (z > bestZ) { bestZ = z; best = i; }
      }
      setActive(best);
    }

    function loop() {
      if (snapTo !== null) {
        var d = snapTo - angle;
        angle += d * 0.12;
        if (Math.abs(d) < 0.05) { angle = snapTo; snapTo = null; }
      } else {
        var goal = hovering || document.hidden || reduce ? 0 : VELOCIDAD;
        current += (goal - current) * 0.08;             // frenado y arranque suave
        angle -= current;
      }
      render();
      requestAnimationFrame(loop);
    }

    // se detiene al pasar el cursor sobre un panel o el tótem
    orbit.addEventListener('mouseover', function (e) { hovering = !!e.target.closest('.mm-panel,.mm-totem'); });
    orbit.addEventListener('mouseleave', function () { hovering = false; });
    root.addEventListener('focusin', function () { hovering = true; });
    root.addEventListener('focusout', function () { hovering = false; });

    // flechas (botones y teclado)
    function go(dir) {
      var base = snapTo !== null ? snapTo : Math.round(angle / step) * step;
      snapTo = base + dir * step;
    }
    root.querySelector('.mm-nav--prev').addEventListener('click', function () { go(1); });
    root.querySelector('.mm-nav--next').addEventListener('click', function () { go(-1); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(-1); e.preventDefault(); }
    });

    // deslizar en móvil
    var sx = null, sy = 0, sa = 0, moved = false, resume = null;
    stage.addEventListener('touchstart', function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; sa = angle;
      moved = false; hovering = true; snapTo = null; clearTimeout(resume);
    }, { passive: true });
    stage.addEventListener('touchmove', function (e) {
      if (sx === null) return;
      var dx = e.touches[0].clientX - sx;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.touches[0].clientY - sy)) moved = true;
      if (moved) angle = sa + dx * 0.3;
    }, { passive: true });
    stage.addEventListener('touchend', function () {
      sx = null;
      if (moved) snapTo = Math.round(angle / step) * step;
      resume = setTimeout(function () { hovering = false; }, 2500);  // vuelve a girar tras 2.5 s
    });
    stage.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);

    window.addEventListener('resize', layout);
    layout();
    requestAnimationFrame(loop);
  });
})();
