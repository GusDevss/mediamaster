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
      ripples = ripples.filter(function (r) { return (now - r.t) / cfg.rippleDuration < 1; });
      for (var i = 0; i < dots.length; i += 2) {
        var x = dots[i], y = dots[i + 1], size = cfg.dotSize, op = cfg.baseOpacity, col = '255,255,255', wg = 0;
        if (mouse.active) {
          var dx = x - mouse.x, dy = y - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cfg.hoverRadius) {
            var k = 1 - dist / cfg.hoverRadius; k = k * k * (3 - 2 * k);
            size += (cfg.hoverSize - cfg.dotSize) * k; op += (cfg.hoverOpacity - cfg.baseOpacity) * k;
            col = Math.round(255 + (cfg.hover[0] - 255) * k) + ',' + Math.round(255 + (cfg.hover[1] - 255) * k) + ',' + Math.round(255 + (cfg.hover[2] - 255) * k);
          }
        }
        for (var j = 0; j < ripples.length; j++) {
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
        var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, cfg.hoverRadius);
        g.addColorStop(0, 'rgba(' + hc + ',.30)'); g.addColorStop(.2, 'rgba(' + hc + ',.20)'); g.addColorStop(.4, 'rgba(' + hc + ',.11)');
        g.addColorStop(.65, 'rgba(' + hc + ',.045)'); g.addColorStop(1, 'rgba(' + hc + ',0)');
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
      window.addEventListener('click', function (e) {
        var x = e.clientX, y = e.clientY;
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
