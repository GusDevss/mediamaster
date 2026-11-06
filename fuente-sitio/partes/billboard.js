
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
