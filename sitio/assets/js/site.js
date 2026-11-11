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

  /* ---------- preguntas: se abre una y se cierran las demás, con animación suave ---------- */
  $$('.acc, .mme-acc').forEach(function (acc) {
    var ds = $$('details', acc);
    function body(d) { return d.querySelector('.acc__b'); }
    function open(d) {
      d.open = true;
      var b = body(d); if (!b || reduce) return;
      b.animate([{ height: '0px', opacity: 0 }, { height: b.scrollHeight + 'px', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    function close(d) {
      var b = body(d);
      if (!b || reduce) { d.open = false; return; }
      var a = b.animate([{ height: b.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.4,0,.2,1)' });
      d.classList.add('is-closing');
      a.onfinish = function () { d.open = false; d.classList.remove('is-closing'); };
    }
    ds.forEach(function (d) {
      d.querySelector('summary').addEventListener('click', function (e) {
        e.preventDefault();
        if (d.open && !d.classList.contains('is-closing')) { close(d); return; }
        ds.forEach(function (o) { if (o !== d && o.open) close(o); });
        open(d);
      });
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

  /* ---------- formulario de contacto: se envía por correo (enviar.php); WhatsApp como opción ---------- */
  function texto(d) {
    var medios = d.getAll('medio[]');
    return 'Nombre: ' + d.get('nombre') + '\nCorreo: ' + d.get('correo') +
      (d.get('telefono') ? '\nTeléfono: ' + d.get('telefono') : '') +
      (d.get('empresa') ? '\nEmpresa: ' + d.get('empresa') : '') +
      (medios.length ? '\nMe interesa: ' + medios.join(', ') : '') + '\n\n' + d.get('mensaje');
  }
  function valida(form) {
    var ok = true;
    $$('[required]', form).forEach(function (inp) {
      var f = inp.closest('.fld'), bad = !inp.value.trim() || (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value));
      if (f) f.classList.toggle('is-err', bad); if (bad && ok) { inp.focus(); ok = false; }
    });
    return ok;
  }
  function estado(form, tipo, msg) {
    var box = $('.form__msg', form); if (!box) return;
    box.className = 'form__msg is-' + tipo; box.textContent = msg;
  }
  $$('form.form, form.subs').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valida(form)) return;
      var btn = $('button[type=submit]', form), d = new FormData(form);
      btn.disabled = true; form.classList.add('is-busy');
      estado(form, 'wait', 'Enviando…');
      fetch(form.getAttribute('action'), { method: 'POST', body: d, headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error('envio');
          form.reset();
          estado(form, 'ok', form.classList.contains('subs') ? '¡Listo! Te suscribiste a nuestras novedades.' : '¡Gracias! Recibimos tu mensaje y te responderemos muy pronto.');
        })
        .catch(function () {
          if (form.classList.contains('subs')) { estado(form, 'err', 'No pudimos registrarte. Inténtalo de nuevo más tarde.'); return; }
          estado(form, 'err', 'No pudimos enviar el formulario. Se abrirá tu correo con el mensaje listo.');
          location.href = 'mailto:' + CORREO + '?subject=' + encodeURIComponent('Cotización · ' + (d.get('empresa') || d.get('nombre'))) + '&body=' + encodeURIComponent(texto(d));
        })
        .then(function () { btn.disabled = false; form.classList.remove('is-busy'); });
    });
    $$('input,textarea,select', form).forEach(function (i) {
      i.addEventListener('input', function () { var f = i.closest('.fld'); if (f) f.classList.remove('is-err'); });
    });
    var w = $('[data-form-wa]', form);
    if (w) w.addEventListener('click', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      window.open(wa('Hola Mediamaster, quiero cotizar una campaña.' + (d.get('nombre') ? '\n\n' + texto(d) : '')), '_blank', 'noopener');
    });
  });

  /* ---------- fondo de puntos: brillo al pasar el cursor y onda al dar clic ---------- */
  (function () {
    var canvas = document.createElement('canvas');
    canvas.className = 'bg-dots'; canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    document.documentElement.classList.add('has-dots');
    var ctx = canvas.getContext('2d');
    var cfg = { spacing: 24, dotSize: 1.1, hoverSize: 2.8, hoverRadius: 145, baseOpacity: .20, base: [255, 255, 255], hover: [95, 130, 175],
                hoverOpacity: 1, rippleDuration: 2400, rippleThickness: 65, rippleDotSize: 5.5, rippleGlow: 15, rippleTrail: 85 };
    var hc = cfg.hover.join(','), glow = 'rgb(' + hc + ')';
    var W, H, dots = [], ripples = [], mouse = { x: -1e3, y: -1e3, active: false }, running = false;
    // la portada del inicio lleva el efecto completo (onda al clic); el resto del sitio, una versión discreta
    var hero = document.querySelector('.hhero'), hr = null;
    var SUAVE = { base: .08, hoverSize: 1.8, hoverOpacity: .38, halo: .3 };
    function heroRect() { hr = hero ? hero.getBoundingClientRect() : null; if (hr && (hr.bottom <= 0 || hr.top >= H)) hr = null; }
    function enHero(x, y) { return hr && x >= hr.left && x <= hr.right && y >= hr.top && y <= hr.bottom; }
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (var y = cfg.spacing / 2; y < H; y += cfg.spacing) for (var x = cfg.spacing / 2; x < W; x += cfg.spacing) dots.push(x, y);
      kick();
    }
    function fade(p) { return Math.pow(Math.max(0, 1 - (p - .65) / .35), 1.4); }
    function draw() {
      var now = performance.now();
      ctx.clearRect(0, 0, W, H);
      heroRect();
      var mHero = mouse.active && enHero(mouse.x, mouse.y);
      ripples = ripples.filter(function (r) { return (now - r.t) / cfg.rippleDuration < 1; });
      for (var i = 0; i < dots.length; i += 2) {
        var x = dots[i], y = dots[i + 1], full = enHero(x, y), size = cfg.dotSize, op = full ? cfg.baseOpacity : SUAVE.base, col = '255,255,255', wg = 0;
        if (mouse.active) {
          var dx = x - mouse.x, dy = y - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cfg.hoverRadius) {
            var k = 1 - dist / cfg.hoverRadius; k = k * k * (3 - 2 * k);
            size += ((full ? cfg.hoverSize : SUAVE.hoverSize) - cfg.dotSize) * k; op += ((full ? cfg.hoverOpacity : SUAVE.hoverOpacity) - op) * k;
            col = Math.round(255 + (cfg.hover[0] - 255) * k) + ',' + Math.round(255 + (cfg.hover[1] - 255) * k) + ',' + Math.round(255 + (cfg.hover[2] - 255) * k);
          }
        }
        for (var j = 0; full && j < ripples.length; j++) {
          var r = ripples[j], p = (now - r.t) / cfg.rippleDuration;
          var rad = (1 - Math.pow(1 - p, 2.2)) * r.max, rx = x - r.x, ry = y - r.y, d = Math.sqrt(rx * rx + ry * ry), diff = Math.abs(d - rad);
          if (diff < cfg.rippleThickness) {
            var it = 1 - diff / cfg.rippleThickness; it = it * it * (3 - 2 * it); if (p >= .65) it *= fade(p);
            if (cfg.rippleDotSize > size) size += (cfg.rippleDotSize - size) * it;
            if (1 > op) op += (1 - op) * it;
            col = hc; wg = Math.max(wg, it);
          }
          var td = rad - d;
          if (td > 0 && td < cfg.rippleTrail) { var tr = 1 - td / cfg.rippleTrail; tr = tr * tr * .22; if (p > .75) tr *= fade(p); wg = Math.max(wg, tr); }
        }
        if (wg > 0) { ctx.shadowColor = glow; ctx.shadowBlur = cfg.rippleGlow * wg; } else ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(x, y, size, 0, 6.2832); ctx.fillStyle = 'rgba(' + col + ',' + op + ')'; ctx.fill();
      }
      ctx.shadowBlur = 0;
      if (mouse.active) {
        var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, cfg.hoverRadius), f = mHero ? 1 : SUAVE.halo;
        g.addColorStop(0, 'rgba(' + hc + ',' + .30 * f + ')'); g.addColorStop(.2, 'rgba(' + hc + ',' + .20 * f + ')'); g.addColorStop(.4, 'rgba(' + hc + ',' + .11 * f + ')');
        g.addColorStop(.65, 'rgba(' + hc + ',' + .045 * f + ')'); g.addColorStop(1, 'rgba(' + hc + ',0)');
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, cfg.hoverRadius, 0, 6.2832); ctx.fillStyle = g; ctx.fill();
      }
      // solo se sigue animando mientras hay cursor u ondas: ahorra batería
      if ((mouse.active || ripples.length) && !document.hidden) requestAnimationFrame(draw); else running = false;
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(draw); } }
    if (!reduce) {
      window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; kick(); }, { passive: true });
      document.addEventListener('mouseleave', function () { mouse.active = false; kick(); });
      window.addEventListener('blur', function () { mouse.active = false; kick(); });
      window.addEventListener('scroll', kick, { passive: true });
      window.addEventListener('click', function (e) {
        var x = e.clientX, y = e.clientY;
        if (!hero || !hero.contains(e.target)) return;      // la onda solo en la portada del inicio
        ripples.push({ x: x, y: y, t: performance.now(), max: Math.sqrt(Math.pow(Math.max(x, W - x), 2) + Math.pow(Math.max(y, H - y), 2)) * 1.12 });
        kick();
      });
    }
    window.addEventListener('resize', resize);
    resize();
  })();

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

  /* ---------- estadio: prueba tu diseño en la pantalla gigante ---------- */
  var upl = $('#mm-logo');
  if (upl) {
    var info = $('[data-try-info]'), rs = $('[data-scr-reset]'), drop = $('[data-drop]'), lastUrl = null;
    function cargar(f) {
      if (!f || !/^image\//.test(f.type)) { mostrar('err', 'Ese archivo no es una imagen. Usa PNG, JPG o WEBP.'); return; }
      if (lastUrl) URL.revokeObjectURL(lastUrl);
      var url = lastUrl = URL.createObjectURL(f), probe = new Image();
      probe.onload = function () {
        var R = +upl.getAttribute('data-ratio') || 4, MINW = +upl.getAttribute('data-minw') || 1920;
        var RT = upl.getAttribute('data-ratio-txt') || '4 : 1', IDEAL = upl.getAttribute('data-ideal') || '3840 × 960 px';
        var w = probe.naturalWidth, h = probe.naturalHeight, r = w / h, msg, tipo = 'ok';
        if (Math.abs(r - R) / R <= .12) msg = '✓ ' + w + ' × ' + h + ' px · proporción ideal para la pantalla.';
        else { tipo = 'warn'; msg = w + ' × ' + h + ' px · tu imagen no tiene la proporción de la pantalla (' + RT + ', por ejemplo ' + IDEAL + '): con “Imagen completa” verás franjas y con “Llenar pantalla” se recortará.'; }
        if (w < MINW && f.type !== 'image/svg+xml') { tipo = 'warn'; msg += ' Tu imagen mide menos de ' + MINW + ' px de ancho y podría verse pixeleada.'; }
        mostrar(tipo, msg);
        $$('.scr-user img').forEach(function (im) { im.src = url; });
        $$('[data-scr]').forEach(function (s) { s.classList.add('has-user'); });
        if (rs) rs.hidden = false;
      };
      probe.src = url;
    }
    function mostrar(t, m) { if (!info) return; info.hidden = false; info.className = 'try__info is-' + t; info.textContent = m; }
    upl.addEventListener('change', function () { cargar(upl.files && upl.files[0]); });
    if (drop) {
      ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); }); });
      drop.addEventListener('drop', function (e) { cargar(e.dataTransfer.files && e.dataTransfer.files[0]); });
    }
    if (rs) rs.addEventListener('click', function () {
      $$('[data-scr]').forEach(function (s) { s.classList.remove('has-user'); });
      upl.value = ''; rs.hidden = true; if (info) info.hidden = true;
    });
    $$('[data-fit]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-fit]').forEach(function (o) { o.classList.toggle('is-on', o === b); });
        $$('[data-scr]').forEach(function (s) { s.classList.toggle('fit-cover', b.getAttribute('data-fit') === 'cover'); });
      });
    });
  }

  $$('.try__row').forEach(function (r) {
    var sc = $('.try__screen', r), man = $('.try__man', r);
    var fit = function () { man.style.setProperty('--man', (sc.offsetHeight * 1.75 / 5).toFixed(1) + 'px'); };
    fit(); window.addEventListener('resize', fit);
  });

  /* ---------- sonido del video en el teléfono ---------- */
  $$('.phone__snd').forEach(function (b) {
    var v = b.parentNode.querySelector('video');
    b.addEventListener('click', function () {
      if (!v) return;
      if (!v.getAttribute('src')) v.src = v.getAttribute('data-src');
      v.muted = !v.muted;
      if (!v.muted) { v.volume = 1; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      b.setAttribute('aria-pressed', v.muted ? 'false' : 'true');
      $('span', b).textContent = v.muted ? 'Activar sonido' : 'Silenciar';
    });
  });

  /* ---------- aeropuertos: explorador de planos ---------- */
  $$('.ax').forEach(function (ax) {
    var datos = JSON.parse($('.ax__data', ax).textContent);
    var tip = $('.ax__tip', ax), stage = $('.ax__stage', ax), piso = 0, filtro = '*';
    var pins = $$('.ax__pin', ax), items = $$('.ax__item', ax);
    var touch = window.matchMedia('(hover: none)').matches;
    function visibles() { return datos.map(function (d, i) { return i; }).filter(function (i) { return filtro === '*' || datos[i].tipo === filtro; }); }
    function aplicar() {
      $$('.ax__plan', ax).forEach(function (p) { p.hidden = +p.getAttribute('data-piso') !== piso; });
      $$('.ax__ul', ax).forEach(function (u) { u.hidden = +u.getAttribute('data-piso') !== piso; });
      $$('.ax__floor', ax).forEach(function (f) { var on = +f.getAttribute('data-piso') === piso; f.classList.toggle('is-on', on); f.setAttribute('aria-selected', on); });
      var n = 0;
      pins.concat(items).forEach(function (el) {
        var ok = filtro === '*' || el.getAttribute('data-tipo') === filtro;
        el.classList.toggle('is-off', !ok);
        if (el.classList.contains('ax__item')) el.parentNode.hidden = !ok;
      });
      $$('.ax__ul[data-piso="' + piso + '"] li', ax).forEach(function (li) { if (!li.hidden) n++; });
      var c = $('[data-ax-count]', ax); if (c) c.textContent = n;
      $$('.ax__chip', ax).forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-tipo') === filtro); });
      ocultar();
    }
    $$('.ax__floor', ax).forEach(function (f) { f.addEventListener('click', function () { piso = +f.getAttribute('data-piso'); aplicar(); }); });
    $$('.ax__chip', ax).forEach(function (c) { c.addEventListener('click', function () { filtro = c.getAttribute('data-tipo'); aplicar(); }); });

    function resaltar(i, on) {
      pins.forEach(function (p) { if (+p.getAttribute('data-i') === i) p.classList.toggle('is-hot', on); });
      items.forEach(function (p) { if (+p.getAttribute('data-i') === i) p.classList.toggle('is-hot', on); });
    }
    function mostrar(i) {
      var d = datos[i], pin = pins[i];
      tip.innerHTML = '<img src="assets/img/aero/' + d.foto + '-t.webp" alt="">' +
        '<div><b>' + esc(d.codigo) + '</b><span style="--c:' + getComputedStyle(pin).getPropertyValue('--c') + '">' + esc(d.tipo) + '</span>' +
        (d.detalle ? '<small>' + esc(d.detalle) + '</small>' : '') + '<em>Medida: ' + esc(d.medida) + '</em><i>Clic para ver la ficha completa</i></div>';
      tip.hidden = false;
      var sr = stage.getBoundingClientRect(), pr = pin.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      var x = pr.left - sr.left + pr.width / 2 - tw / 2, y = pr.top - sr.top - th - 14, abajo = false;
      if (y < 4) { y = pr.bottom - sr.top + 14; abajo = true; }
      x = Math.max(6, Math.min(sr.width - tw - 6, x));
      tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.classList.toggle('is-down', abajo);
      requestAnimationFrame(function () { tip.classList.add('is-on'); });
    }
    function ocultar() { tip.classList.remove('is-on'); tip.hidden = true; }
    pins.forEach(function (p) {
      var i = +p.getAttribute('data-i');
      p.addEventListener('mouseenter', function () { if (!touch) { mostrar(i); resaltar(i, true); } });
      p.addEventListener('mouseleave', function () { ocultar(); resaltar(i, false); });
      p.addEventListener('focus', function () { mostrar(i); });
      p.addEventListener('blur', ocultar);
      p.addEventListener('click', function () { ocultar(); abrir(i); });
    });
    items.forEach(function (it) {
      var i = +it.getAttribute('data-i');
      it.addEventListener('mouseenter', function () { resaltar(i, true); });
      it.addEventListener('mouseleave', function () { resaltar(i, false); });
      it.addEventListener('click', function () { abrir(i); });
    });

    // ficha completa
    var m = document.createElement('div');
    m.className = 'axm'; m.hidden = true;
    m.innerHTML = '<div class="axm__box" role="dialog" aria-modal="true" aria-label="Ficha del espacio">' +
      '<button class="axm__x" type="button" aria-label="Cerrar">×</button>' +
      '<div class="axm__media"><img alt=""><button class="axm__nav axm__prev" type="button" aria-label="Anterior">‹</button><button class="axm__nav axm__next" type="button" aria-label="Siguiente">›</button></div>' +
      '<div class="axm__info"><span class="axm__n"></span><h3></h3><p class="axm__tipo"></p><dl></dl>' +
      '<a class="btn btn--pk btn--sm axm__cta" target="_blank" rel="noopener">Cotizar este espacio</a><p class="axm__count"></p><div class="axm__strip"></div></div></div>';
    document.body.appendChild(m);
    var actual = 0, lista = [];
    function abrir(i) {
      lista = visibles().filter(function (k) { return datos[k].piso === datos[i].piso; });
      if (lista.indexOf(i) < 0) lista = [i];
      pintar(i);
      m.hidden = false; requestAnimationFrame(function () { m.classList.add('is-open'); });
      document.documentElement.style.overflow = 'hidden';
      $('.axm__x', m).focus();
    }
    function pintar(i) {
      actual = i;
      var d = datos[i], col = getComputedStyle(pins[i]).getPropertyValue('--c');
      var img = $('.axm__media img', m);
      img.classList.remove('is-in'); img.onload = function () { img.classList.add('is-in'); };
      img.src = 'assets/img/aero/' + d.foto + '.webp'; img.alt = d.codigo + ' · ' + d.tipo;
      $('.axm__n', m).textContent = d.n; $('.axm__n', m).style.background = col;
      $('h3', m).textContent = d.codigo;
      $('.axm__tipo', m).textContent = d.tipo + (d.detalle ? ' · ' + d.detalle : '');
      $('dl', m).innerHTML = '<dt>Medida</dt><dd>' + esc(d.medida) + '</dd><dt>Ubicación</dt><dd>' + esc(d.piso) + '<br><small>' + esc(d.sub) + '</small></dd>';
      $('.axm__cta', m).href = wa('Hola Mediamaster, me interesa el espacio ' + d.codigo + ' (' + d.tipo + ', ' + d.medida + ') en el ' + (ax.getAttribute('data-aero') === 'aicm' ? 'AICM' : 'AIQ') + '.');
      var k = lista.indexOf(i);
      $('.axm__count', m).textContent = (k + 1) + ' de ' + lista.length + ' espacios en ' + d.piso.toLowerCase();
      $('.axm__strip', m).innerHTML = lista.map(function (j) {
        return '<button type="button" data-j="' + j + '" class="' + (j === i ? 'is-on' : '') + '" aria-label="' + esc(datos[j].codigo) + '"><img src="assets/img/aero/' + datos[j].foto + '-t.webp" alt="" loading="lazy"></button>';
      }).join('');
      var on = $('.axm__strip .is-on', m); if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' });
      $$('.axm__nav', m).forEach(function (b) { b.hidden = lista.length < 2; });
    }
    function mover(dir) { var k = lista.indexOf(actual); pintar(lista[(k + dir + lista.length) % lista.length]); }
    function cerrar() { m.classList.remove('is-open'); document.documentElement.style.overflow = ''; setTimeout(function () { m.hidden = true; }, 300); }
    m.addEventListener('click', function (e) {
      if (e.target === m || e.target.closest('.axm__x')) cerrar();
      else if (e.target.closest('.axm__prev')) mover(-1);
      else if (e.target.closest('.axm__next')) mover(1);
      else if (e.target.closest('.axm__strip button')) pintar(+e.target.closest('button').getAttribute('data-j'));
    });
    document.addEventListener('keydown', function (e) {
      if (m.hidden) return;
      if (e.key === 'Escape') cerrar(); if (e.key === 'ArrowLeft') mover(-1); if (e.key === 'ArrowRight') mover(1);
    });
    var sx = null;
    $('.axm__media', m).addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    $('.axm__media', m).addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) mover(dx < 0 ? 1 : -1); sx = null; });
    aplicar();
  });
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
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

/* ---------- página de estadio ---------- */

(function () {
  /* ======================= CONFIGURA AQUÍ ======================= */
  var CONFIG = {
    // Carpeta de Medios donde subiste los archivos de "subir-a-wordpress"
    MEDIOS: 'assets/',
    YOUTUBE_ID: 'EF8OAkjTtSk',          // video oficial (fondo del encabezado y botón "Ver video")
    WHATSAPP: '524421589486',
    SEGUNDOS_POR_ESPACIO: 5               // cambio automático en el mapa del estadio
  };

  var ESPACIOS = [
    { titulo: 'Pantalla gigante', img: 'img/estadio-pantalla.webp',
      texto: 'La pantalla principal del Estadio Corregidora: 5 × 20 metros de LED frente a toda la afición, en los momentos de mayor emoción del partido.',
      lista: ['5 × 20 m · 100 m² de pantalla LED', 'Visible desde todas las gradas', 'Spots en video o imagen fija', 'Antes del partido, medio tiempo y final'] }
  ];

  var CLIENTES = ['att','coca-cola','el-encanto','heb','jose-cuervo','la-comer','macdonald','maestro-dobel-tequila','megacable','omoda','oxxo','queretalove','sephora','telcel','the-cheesecake-factory'];
  var CLIENTES_URL = 'assets/img/clientes/';
  /* ============================================================== */

  var root = document.getElementById('mme');
  if (!root || root.getAttribute('data-ready')) return;
  root.setAttribute('data-ready', '1');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var M = function (f) { return CONFIG.MEDIOS + f; };
  var wa = function (t) { return 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(t); };

  // ---------- medios y enlaces ----------
  root.querySelectorAll('[data-mm-src]').forEach(function (el) {
    if (el.tagName === 'VIDEO') el.setAttribute('data-src', M(el.getAttribute('data-mm-src')));
    else el.src = M(el.getAttribute('data-mm-src'));
  });
  root.querySelectorAll('[data-mm-poster]').forEach(function (el) { el.poster = M(el.getAttribute('data-mm-poster')); });
  root.querySelectorAll('[data-mm-wa]').forEach(function (a) { a.href = wa(a.getAttribute('data-mm-wa')); });

  // los videos se cargan y reproducen solo cuando están en pantalla
  function playWhenVisible(v) {
    if (!('IntersectionObserver' in window)) { v.src = v.getAttribute('data-src'); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          if (!v.src) v.src = v.getAttribute('data-src');
          if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        } else if (v.src) v.pause();
      });
    }, { rootMargin: '200px' }).observe(v);
  }
  root.querySelectorAll('video[data-src]').forEach(playWhenVisible);

  // ventanas: se mueven al <body> para que nada del tema las recorte
  var modal = root.querySelector('[data-mm-modal]');
  var lb = root.querySelector('[data-mm-lightbox]');
  document.body.appendChild(modal);
  document.body.appendChild(lb);

  // ---------- encabezado con YouTube de fondo ----------
  var hero = root.querySelector('.mme-hero');
  var ytBox = root.querySelector('.mme-hero__yt');
  var soundBtn = root.querySelector('.mme-sound');
  var ytFrame = null;
  function ytCover() {
    if (!ytFrame) return;
    var w = hero.clientWidth, h = hero.clientHeight;
    var fw = Math.max(w, h * 16 / 9) * 1.22, fh = fw * 9 / 16;   // 1.22: oculta los controles y el título de YouTube
    ytFrame.style.width = fw + 'px'; ytFrame.style.height = fh + 'px';
  }
  function yt(cmd, args) {
    if (ytFrame) ytFrame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd, args: args || [] }), '*');
  }
  if (CONFIG.YOUTUBE_ID && !reduce) {
    var id = CONFIG.YOUTUBE_ID;
    ytFrame = document.createElement('iframe');
    ytFrame.title = 'Video oficial Estadio Corregidora';
    ytFrame.allow = 'autoplay; encrypted-media; picture-in-picture';
    ytFrame.setAttribute('tabindex', '-1');
    ytFrame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + id +
      '&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1&origin=' + encodeURIComponent(location.origin);
    ytFrame.addEventListener('load', function () {
      setTimeout(function () { ytBox.classList.add('is-on'); soundBtn.hidden = false; }, 1500);
    });
    ytBox.appendChild(ytFrame);
    ytCover();
    window.addEventListener('resize', ytCover);
  }
  soundBtn.addEventListener('click', function () {
    var on = soundBtn.getAttribute('aria-pressed') !== 'true';
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    soundBtn.querySelector('span').textContent = on ? 'Silenciar' : 'Activar sonido';
    if (on) { yt('unMute'); yt('setVolume', [100]); } else yt('mute');
  });

  // ---------- video oficial en ventana ----------
  var frameBox = modal.querySelector('.mme-modal__frame');
  function openModal() {
    if (CONFIG.YOUTUBE_ID) {
      frameBox.innerHTML = '<iframe allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video oficial" src="https://www.youtube-nocookie.com/embed/' +
        CONFIG.YOUTUBE_ID + '?autoplay=1&rel=0&modestbranding=1&playsinline=1"></iframe>';
    } else {
      frameBox.innerHTML = '<video controls autoplay playsinline src="' + M('video/estadio-interior.mp4') + '"></video>';
    }
    if (soundBtn.getAttribute('aria-pressed') === 'true') soundBtn.click();
    yt('pauseVideo');
    show(modal);
  }
  function closeModal() { hide(modal, function () { frameBox.innerHTML = ''; }); yt('playVideo'); }
  function show(m) { m.hidden = false; requestAnimationFrame(function () { m.classList.add('is-open'); }); document.documentElement.style.overflow = 'hidden'; m.querySelector('.mme-modal__close').focus(); }
  function hide(m, done) { m.classList.remove('is-open'); document.documentElement.style.overflow = ''; setTimeout(function () { m.hidden = true; if (done) done(); }, 300); }
  root.querySelectorAll('[data-mm-play]').forEach(function (b) { b.addEventListener('click', openModal); });
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.mme-modal__close')) closeModal(); });

  // ---------- galería con visor ----------
  var shots = [].slice.call(root.querySelectorAll('.mme-shot'));
  var lbImg = lb.querySelector('img'), lbIndex = 0;
  function lbShow(i) {
    lbIndex = (i + shots.length) % shots.length;
    var s = shots[lbIndex];
    lbImg.src = M(s.getAttribute('data-mm-full'));
    lbImg.alt = s.querySelector('img').alt;
  }
  shots.forEach(function (s, i) { s.addEventListener('click', function () { lbShow(i); show(lb); }); });
  lb.querySelector('.mme-lb__prev').addEventListener('click', function () { lbShow(lbIndex - 1); });
  lb.querySelector('.mme-lb__next').addEventListener('click', function () { lbShow(lbIndex + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.mme-modal__close')) hide(lb); });
  document.addEventListener('keydown', function (e) {
    if (!modal.hidden && e.key === 'Escape') closeModal();
    if (!lb.hidden) {
      if (e.key === 'Escape') hide(lb);
      if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
      if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    }
  });

  // ---------- animaciones al hacer scroll ----------
  var counted = false;
  function countUp(el) {
    var to = +el.getAttribute('data-mm-count'), from = +(el.getAttribute('data-from') || 0);
    var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var t0 = performance.now(), dur = 1800;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + Math.round(from + (to - from) * e) + suf;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
        if (!counted && e.target.classList.contains('mme-stat')) {
          counted = true;
          root.querySelectorAll('[data-mm-count]').forEach(countUp);
        }
      });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    root.querySelectorAll('.mme-rv').forEach(function (el) { io.observe(el); });
  } else {
    root.querySelectorAll('.mme-rv').forEach(function (el) { el.classList.add('is-in'); });
  }

  // línea de "día de partido" que se llena con el scroll
  var day = root.querySelector('.mme-day'), dayLine = root.querySelector('.mme-day__line');
  function dayProgress() {
    var r = day.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height * .7)));
    dayLine.style.setProperty('--p', p.toFixed(3));
  }
  window.addEventListener('scroll', dayProgress, { passive: true });
  dayProgress();

  // ---------- la pantalla gigante ----------
  var panel = root.querySelector('.mme-panel'), e0 = ESPACIOS[0], pImg = panel.querySelector('.mme-panel__img img');
  pImg.src = M(e0.img); pImg.alt = e0.titulo;
  panel.querySelector('.mme-panel__title').textContent = e0.titulo;
  panel.querySelector('.mme-panel__text').textContent = e0.texto;
  var pList = panel.querySelector('.mme-panel__list');
  e0.lista.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; pList.appendChild(li); });
  panel.querySelector('.mme-panel__cta').href = wa('Hola, me interesa la pantalla gigante del Estadio Corregidora.');
  root.querySelectorAll('.mme-spot').forEach(function (s) { s.classList.add('is-active'); });

  // ---------- clientes ----------
  var track = root.querySelector('.mme-clients__track');
  CLIENTES.concat(CLIENTES).forEach(function (c, i) {
    var im = document.createElement('img');
    im.src = CLIENTES_URL + c + '.webp'; im.alt = i < CLIENTES.length ? c.replace(/-/g, ' ') : '';
    im.loading = 'lazy';
    if (i >= CLIENTES.length) im.setAttribute('aria-hidden', 'true');
    im.onerror = function () { im.remove(); };
    track.appendChild(im);
  });
})();
