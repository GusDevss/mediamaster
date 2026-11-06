
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
