#!/usr/bin/env python3
"""
Genera el sitio estático de Mediamaster en ../sitio

  python3 fuente-sitio/build.py

Todas las páginas comparten encabezado, pie, formulario, CSS y JS.
Para cambiar un texto, edita los datos de este archivo y vuelve a correrlo.
"""
import html, os, re, shutil

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, '..', 'sitio')
PARTES = os.path.join(AQUI, 'partes')
DOMINIO = 'https://mediamaster.mx'
WA = '524421589486'
TEL = '442 158 9486'
CORREO = 'coordinacionventas@mediamaster.mx'
DIRECCION = 'Parque Industrial Jurica, Calle 1 #303, Querétaro, Qro.'
MAPA_OFICINA = 'https://maps.app.goo.gl/TuGEjh1WWfb7e7Pu9'
E = html.escape

def leer(n):
    with open(os.path.join(PARTES, n), encoding='utf-8') as f:
        return f.read()

# --------------------------------------------------------------------- iconos
ICO = {
    'flecha': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'chev': '<path d="M6 9l6 6 6-6"/>',
    'izq': '<path d="M15 5l-7 7 7 7"/>',
    'der': '<path d="M9 5l7 7-7 7"/>',
    'arriba': '<path d="M12 19V5M6 11l6-6 6 6"/>',
    'pin': '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    'resolucion': '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h4M7 8v4"/>',
    'reloj': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'archivo': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14l2 2 4-4"/>',
    'play': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
    'radar': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 12l6-6"/>',
    'ojo': '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'contrato': '<path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M8 13h8M8 17h5M8 9h3"/>',
    'capas': '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    'alcance': '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    'medida': '<path d="M3 7h18v10H3z"/><path d="M7 7v4M11 7v3M15 7v4M19 7v3"/>',
    'tel': '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    'mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    'mapa': '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    'sonido_off': '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none"/><path class="off" d="M17 9l5 6M22 9l-5 6"/><path class="on" d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    'movil': '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    'avion': '<path d="M2 16l20-6-2-2-7 2-5-5H6l3 6-4 1-2-2H2l1 4z"/><path d="M3 21h18"/>',
    'estadio': '<ellipse cx="12" cy="12" rx="10" ry="6"/><ellipse cx="12" cy="12" rx="5" ry="2.5"/><path d="M12 6v12"/>',
    'subir': '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
}
def ico(n, cls='ico'):
    return '<svg class="%s" viewBox="0 0 24 24" aria-hidden="true">%s</svg>' % (cls, ICO[n])

SOCIAL = {
    'Facebook': ('https://www.facebook.com/profile.php?id=61589277368478', '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/>'),
    'Instagram': ('https://www.instagram.com/mediamaster.publicidad/', '<path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>'),
    'LinkedIn': ('https://www.linkedin.com/company/media-master-publicidad', '<path d="M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM2.5 9h3v12h-3zM9 9h3v1.7c.6-1 1.9-2 3.8-2 3.6 0 4.2 2.3 4.2 5.4V21h-3v-6.2c0-1.5 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V21H9z"/>'),
    'TikTok': ('https://www.tiktok.com/@mediamaster_publicidad_', '<path d="M16 3c.4 2.4 1.9 4 4 4.3v3.2a7.5 7.5 0 0 1-4-1.2V15a6 6 0 1 1-6-6h.5v3.3A2.8 2.8 0 1 0 12.8 15V3z"/>'),
}
WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z"/></svg>'

# --------------------------------------------------------------------- medios
MEDIOS = {
    'pantallas-digitales-queretaro': ('Pantallas digitales', 'Querétaro', 'pantalla-edificio.webp', 'Pantallas LED de alta resolución en las principales avenidas de Querétaro.'),
    'pantallas-digitales-puebla': ('Pantallas digitales', 'Puebla', 'pantalla-ciudad-noche.webp', 'Pantallas LED en avenidas clave de Puebla con spots de 10 segundos.'),
    'totems-queretaro': ('Tótems', 'Querétaro', 'totem-restaurante.webp', 'Más de 40 posiciones en zonas premium, cerca de tu cliente.'),
    'totems-puebla': ('Tótems', 'Puebla', 'totem-impacto.webp', 'Pantallas verticales en zonas de alto nivel adquisitivo.'),
    'espectaculares-queretaro': ('Espectaculares', 'Querétaro', 'espectacular-atardecer.webp', 'Lonas de gran formato visibles 24/7 en avenidas de alto tráfico.'),
    'espectaculares-puebla': ('Espectaculares', 'Puebla', 'espectacular-noche.webp', 'Más de 100 ubicaciones para llegar a las personas correctas.'),
    'aeropuerto-aiq': ('Aeropuerto AIQ', 'Querétaro', 'aeropuerto-gran-campana.webp', 'Miles de viajeros diarios en el Aeropuerto Internacional de Querétaro.'),
    'aeropuerto-aicm': ('Aeropuerto AICM', 'CDMX', 'aicm-pantalla.webp', '4 megapantallas en uno de los aeropuertos con mayor tráfico del país.'),
    'estadio-corregidora-queretaro': ('Estadio Corregidora', 'Querétaro', 'estadio-pantalla.webp', 'La pantalla gigante de 5 × 20 m frente a miles de aficionados.'),
}

NAV = [
    ('Pantallas digitales', [('pantallas-digitales-queretaro', 'Querétaro'), ('pantallas-digitales-puebla', 'Puebla')]),
    ('Tótems', [('totems-queretaro', 'Querétaro'), ('totems-puebla', 'Puebla')]),
    ('Espectaculares', [('espectaculares-queretaro', 'Querétaro'), ('espectaculares-puebla', 'Puebla')]),
    ('Aeropuertos', [('aeropuerto-aiq', 'AIQ · Querétaro'), ('aeropuerto-aicm', 'AICM · CDMX')]),
    ('Estadio', 'estadio-corregidora-queretaro'),
]

def href(slug):
    return './' if slug == 'index' else slug

# --------------------------------------------------------------------- piezas comunes
def logo():
    return ('<a class="logo" href="./" aria-label="Mediamaster, ir al inicio"><img src="assets/img/icono.png" alt="" width="40" height="40">'
            '<span><b>media<strong>master</strong></b><small>medios publicitarios</small></span></a>')

def header(actual):
    items, mob = [], []
    for nombre, dest in NAV:
        if isinstance(dest, str):
            on = ' is-on' if dest == actual else ''
            items.append('<div class="nav__item"><a class="nav__link%s" href="%s">%s</a></div>' % (on, href(dest), nombre))
            mob.append('<div class="mnav__g"><a href="%s">%s</a></div>' % (href(dest), nombre))
            continue
        grupo_on = any(s == actual for s, _ in dest)
        sub = ''.join('<a class="%s" href="%s"><img src="assets/img/%s" alt="" width="44" height="44" loading="lazy"><span><b>%s</b>%s</span></a>'
                      % ('is-on' if s == actual else '', href(s), MEDIOS[s][2], c, nombre) for s, c in dest)
        items.append('<div class="nav__item"><button class="nav__link%s" type="button" aria-haspopup="true">%s%s</button><div class="drop">%s</div></div>'
                     % (' is-on' if grupo_on else '', nombre, ico('chev'), sub))
        mob.append('<div class="mnav__g"><span>%s</span><div class="mnav__sub">%s</div></div>'
                   % (nombre, ''.join('<a class="%s" href="%s">%s</a>' % ('is-on' if s == actual else '', href(s), c) for s, c in dest)))
    return ('<div class="progress" aria-hidden="true"></div>'
            '<header class="hdr"><div class="hdr__in">%s<nav class="nav" aria-label="Principal">%s</nav>'
            '<a class="btn btn--pk btn--sm hdr__cta" href="#contacto">Cotizar campaña</a>'
            '<button class="burger" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="mnav"><i></i><i></i><i></i></button></div></header>'
            '<nav class="mnav" id="mnav" aria-label="Menú móvil">%s<a class="btn btn--pk" href="#contacto">Cotizar campaña</a></nav>'
            % (logo(), ''.join(items), ''.join(mob)))

def contacto(medio_pre=''):
    opciones = ['Pantallas digitales', 'Tótems', 'Espectaculares', 'Aeropuertos', 'Estadio']
    pills = ''.join('<label><input type="checkbox" name="medio[]" value="%s"%s><span>%s</span></label>'
                    % (o, ' checked' if o == medio_pre else '', o) for o in opciones)
    return '''
<section class="sec" id="contacto"><div class="wrap"><div class="contact rv">
  <div class="contact__side">
    <span class="kicker">Contacto</span>
    <h2>Hablemos de tu próximo proyecto</h2>
    <p>Solicita tu cotización ahora mismo. Te respondemos con opciones de ubicaciones y precios para tu campaña.</p>
    <ul class="clist">
      <li><a href="tel:%s"><i>%s</i><span><small>Teléfono</small>%s</span></a></li>
      <li><a href="mailto:%s"><i>%s</i><span><small>Correo</small>%s</span></a></li>
      <li><a href="%s" target="_blank" rel="noopener"><i>%s</i><span><small>Visítanos</small>%s</span></a></li>
    </ul>
  </div>
  <form class="form" action="enviar.php" method="post" novalidate>
    <input type="hidden" name="tipo" value="contacto">
    <div class="hp" aria-hidden="true"><label>No llenar <input name="sitio_web" tabindex="-1" autocomplete="off"></label></div>
    <div class="fld"><label for="f-nombre">Nombre *</label><input id="f-nombre" name="nombre" autocomplete="name" required><em>Escribe tu nombre</em></div>
    <div class="fld"><label for="f-correo">Correo *</label><input id="f-correo" name="correo" type="email" autocomplete="email" required><em>Escribe un correo válido</em></div>
    <div class="fld"><label for="f-tel">Teléfono</label><input id="f-tel" name="telefono" type="tel" autocomplete="tel"></div>
    <div class="fld"><label for="f-emp">Empresa</label><input id="f-emp" name="empresa" autocomplete="organization"></div>
    <div class="fld fld--w"><label>¿Qué medio te interesa?</label><div class="pills">%s</div></div>
    <div class="fld fld--w"><label for="f-msg">Mensaje *</label><textarea id="f-msg" name="mensaje" required placeholder="Cuéntanos sobre tu campaña: fechas, ciudad, presupuesto…"></textarea><em>Cuéntanos un poco sobre tu campaña</em></div>
    <p class="form__msg" role="status" aria-live="polite"></p>
    <div class="form__foot">
      <a href="#" class="form__wa" data-form-wa>%s Prefiero enviarlo por WhatsApp</a>
      <button class="btn btn--pk" type="submit">Enviar mensaje %s</button>
    </div>
    <small class="form__legal">* Campos requeridos. Al enviar aceptas nuestro <a href="aviso-de-privacidad">aviso de privacidad</a>.</small>
  </form>
</div></div></section>''' % (TEL.replace(' ', ''), ico('tel'), TEL, CORREO, ico('mail'), CORREO, MAPA_OFICINA, ico('pin'), DIRECCION, pills, WA_SVG, ico('flecha'))

def footer():
    def col(t, links):
        return '<div><h4>%s</h4><ul>%s</ul></div>' % (t, ''.join('<li><a href="%s">%s<span>%s</span></a></li>' % (href(sl), ico(ic), n) for sl, n, ic in links))
    redes = ''.join('<a href="%s" target="_blank" rel="noopener" aria-label="%s"><svg viewBox="0 0 24 24" aria-hidden="true">%s</svg></a>' % (u, n, p) for n, (u, p) in SOCIAL.items())
    mapa = 'https://maps.google.com/maps?q=' + DIRECCION.replace(' ', '+').replace('#', '') + '&z=15&output=embed'
    return '''
<footer class="ftr"><div class="ftr__panel"><div class="wrap">
  <div class="ftr__top">
    <div class="ftr__brand">
      <a class="flogo" href="./" aria-label="Mediamaster, ir al inicio"><img src="assets/img/icono.png" alt="" width="84" height="84" loading="lazy"><b>media<strong>master</strong><sup>®</sup></b><small>medios publicitarios</small></a>
      <p><strong>Mediamaster</strong>, con más de 13 años de experiencia, transforma espacios en oportunidades para destacar tu marca.</p>
      <div class="socials">%s</div>
    </div>
    <div class="ftr__subs">
      <h3>Suscríbete</h3>
      <p>Recibe novedades, nuevas ubicaciones y promociones para tu marca.</p>
      <form class="subs" action="enviar.php" method="post" novalidate>
        <input type="hidden" name="tipo" value="suscripcion">
        <div class="hp" aria-hidden="true"><label>No llenar <input name="sitio_web" tabindex="-1" autocomplete="off"></label></div>
        <div class="fld"><label class="sr" for="s-correo">Correo</label><input id="s-correo" name="correo" type="email" placeholder="tu@correo.com" autocomplete="email" required><em>Escribe un correo válido</em></div>
        <button class="btn btn--pk" type="submit">Suscribirme</button>
        <p class="form__msg" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>
  <div class="ftr__cols">
    %s%s%s
    <div><h4>Visítanos</h4>
      <div class="ftr__map"><iframe src="%s" title="Mapa: oficinas de Mediamaster" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
      <ul><li><a href="%s" target="_blank" rel="noopener">%s<span>%s</span></a></li><li><a href="tel:%s">%s<span>%s</span></a></li><li><a href="mailto:%s">%s<span>%s</span></a></li></ul>
    </div>
  </div>
</div></div>
<div class="ftr__bot"><div class="wrap"><span>Copyright © <span data-year>2026</span> <a class="pk" href="./">Mediamaster</a></span><a href="aviso-de-privacidad">Aviso de privacidad</a></div></div>
</footer>
<a class="wa" data-wa="Hola Mediamaster, me gustaría cotizar una campaña." aria-label="Escríbenos por WhatsApp">%s<span class="wa__tip">¿Cotizamos tu campaña?</span></a>
<button class="totop" type="button" aria-label="Volver arriba"><svg class="ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20"/></svg>%s</button>
<div class="modal" hidden><div class="modal__box" role="dialog" aria-modal="true" aria-label="Video"><button class="modal__x" type="button" aria-label="Cerrar">×</button><div class="modal__frame"></div></div></div>
''' % (redes,
       col('Servicios', [('pantallas-digitales-queretaro', 'Pantallas digitales', 'resolucion'), ('totems-queretaro', 'Tótems', 'movil'), ('espectaculares-queretaro', 'Espectaculares', 'medida'), ('estadio-corregidora-queretaro', 'Estadio Corregidora', 'estadio')]),
       col('Ciudades', [('pantallas-digitales-queretaro', 'Querétaro', 'pin'), ('pantallas-digitales-puebla', 'Puebla', 'pin'), ('aeropuerto-aicm', 'CDMX', 'pin')]),
       col('Aeropuertos', [('aeropuerto-aiq', 'AIQ · Querétaro', 'avion'), ('aeropuerto-aicm', 'AICM · CDMX', 'avion')]),
       E(mapa), MAPA_OFICINA, ico('pin'), DIRECCION, TEL.replace(' ', ''), ico('tel'), TEL, CORREO, ico('mail'), CORREO, WA_SVG, ico('arriba', 'arr ico'))

def pagina(slug, titulo, desc, imagen_og, cuerpo):
    url = DOMINIO + ('/' if slug == 'index' else '/' + slug)
    return '''<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>%s</title>
<meta name="description" content="%s">
<link rel="canonical" href="%s">
<meta property="og:type" content="website">
<meta property="og:title" content="%s">
<meta property="og:description" content="%s">
<meta property="og:image" content="%s/assets/img/%s">
<meta property="og:url" content="%s">
<meta name="theme-color" content="#000000">
<link rel="icon" href="favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;600;700;900&family=Sora:wght@300;400;500;600;700;800&family=Montserrat:wght@500;700;800;900&family=Playfair+Display:ital,wght@1,700&display=swap">
<link rel="stylesheet" href="assets/css/site.css">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Mediamaster","description":"Publicidad exterior: pantallas digitales, tótems, espectaculares, aeropuertos y estadio.","telephone":"+52 %s","email":"%s","address":{"@type":"PostalAddress","streetAddress":"Parque Industrial Jurica, Calle 1 #303","addressLocality":"Querétaro","addressRegion":"Qro.","addressCountry":"MX"},"url":"%s"}</script>
</head>
<body>
%s
<main>
%s
</main>
%s
<script src="assets/js/site.js" defer></script>
</body>
</html>
''' % (E(titulo), E(desc), url, E(titulo), E(desc), DOMINIO, imagen_og, url, TEL, CORREO, DOMINIO, header(slug), cuerpo, footer())

# --------------------------------------------------------------------- bloques reutilizables
def specs_html(specs):
    return '<div class="specs">%s</div>' % ''.join(
        '<div class="spec rv rv-d%d">%s<small>%s</small><b>%s</b>%s</div>' % (i % 4 + 1, ico(ic), E(lbl), val, ('<p>%s</p>' % E(nota)) if nota else '')
        for i, (ic, lbl, val, nota) in enumerate(specs))

def faq_html(preguntas, titulo='Resolvemos <span class="y">tus dudas</span>'):
    items = ''.join('<details class="rv"%s><summary>%s</summary><div class="acc__b"><div class="acc__a">%s</div></div></details>'
                    % (' open' if i == 0 else '', E(q), a) for i, (q, a) in enumerate(preguntas))
    return '''
<section class="sec"><div class="wrap faq">
  <div class="faq__side"><span class="kicker rv">Preguntas frecuentes</span><h2 class="h2 split">%s</h2>
    <p class="lead rv">¿Tienes otra pregunta? Escríbenos y un asesor te responde.</p>
    <a class="btn btn--gh btn--sm rv" data-wa="Hola Mediamaster, tengo una duda.">Escríbenos por WhatsApp</a></div>
  <div class="acc">%s</div>
</div></section>''' % (titulo, items)

def ticker(palabras):
    s = ''.join('<span>%s</span>' % E(p) for p in palabras)
    return '<div class="ticker" aria-hidden="true"><div class="ticker__t">%s%s</div></div>' % (s, s)

def otros_medios(actual, titulo='Conoce otros <span class="y">medios</span>'):
    cards = ''.join(
        '<a class="mcard rail__card" href="%s"><img src="assets/img/%s" alt="%s en %s" loading="lazy"><span class="mcard__go">%s</span>'
        '<div class="mcard__b"><span class="mcard__tag">%s</span><h3>%s</h3><p>%s</p></div></a>'
        % (href(s), img, E(n), E(c), ico('flecha'), E(c), E(n), E(d))
        for s, (n, c, img, d) in MEDIOS.items() if s != actual)
    return '''
<section class="sec"><div class="wrap head head--row"><div><span class="kicker rv">Combina medios</span><h2 class="h2 split">%s</h2>
<p class="lead rv">Multiplica el impacto de tu campaña sumando formatos y ciudades.</p></div>
<div class="rail-nav rv"><button class="rbtn" type="button" data-rail="rail-medios" data-dir="-1" aria-label="Anterior">%s</button><button class="rbtn" type="button" data-rail="rail-medios" data-dir="1" aria-label="Siguiente">%s</button></div></div>
<div class="rail" id="rail-medios">%s</div></section>''' % (titulo, ico('izq'), ico('der'), cards)

def cta(titulo, texto, fondo, wa_msg):
    return '''
<section class="cta"><div class="cta__bg" data-parallax="80"><img src="assets/img/%s" alt="" loading="lazy"></div><div class="wrap">
<span class="kicker rv">¿Listo para empezar?</span><h2 class="split">%s</h2><p class="lead rv">%s</p>
<div class="btns rv"><a class="btn btn--pk" data-wa="%s">Cotizar por WhatsApp %s</a><a class="btn btn--gh" href="#contacto">Enviar mensaje</a></div></div></section>''' % (fondo, titulo, E(texto), E(wa_msg), ico('flecha'))

def vitrina(imagen, ar, pines, titulo, sub):
    ps = ''.join('<div class="pin %s" style="left:%s%%;top:%s%%"><button class="pin__dot" type="button" aria-label="%s">%d</button><div class="pin__card" role="tooltip"><b>%s</b><span>%s</span></div></div>'
                 % (cls + (' pin--b' if y < 38 and 'pin--b' not in cls else ''), x, y, E(t), i + 1, E(t), E(d)) for i, (x, y, t, d, cls) in enumerate(pines))
    return ('<div class="show rv" style="--ar:%s"><img class="show__img" src="assets/img/%s" alt="%s" loading="lazy"><div class="show__shade"></div>%s'
            '<div class="show__cap"><div><small>Toca los puntos</small><h3>%s</h3></div><small>%s</small></div></div>' % (ar, imagen, E(titulo), ps, titulo, E(sub)))

# --------------------------------------------------------------------- simulador de anuncio
SIM = {
    'pantalla': dict(nombre='pantalla digital', ratio=16/9, rtxt='16 : 9', ideal='1920 × 1080 px', minw=1280, minimo='1280 × 720 px',
                     formato='Video .MP4 de 10 s (para la vista previa usa una imagen).', fondo='pantalla-ciudad-noche.webp'),
    'totem': dict(nombre='tótem', ratio=9/16, rtxt='9 : 16 (vertical)', ideal='1080 × 1920 px', minw=720, minimo='720 × 1280 px',
                  formato='Video .MP4 vertical de 10 s (para la vista previa usa una imagen).', fondo='totem-restaurante.webp'),
    'espectacular': dict(nombre='espectacular', ratio=2, rtxt='2 : 1 aprox.', ideal='4800 × 2400 px', minw=2400, minimo='2400 × 1200 px',
                         formato='.JPG, .PNG o .PDF a 300 dpi al 10% del tamaño real. La medida exacta depende de la ubicación.', fondo='espectacular-atardecer.webp'),
}

def simulador(tipo, wa_msg):
    c = SIM[tipo]
    slides = ('<div class="scr-slides"><div class="scr-slide sl-a"><img src="assets/img/icono.png" alt=""><b>media<strong>master</strong></b><small>MEDIOS PUBLICITARIOS</small></div>'
              '<div class="scr-slide sl-b"><span>Tu marca</span><span>aquí</span><i></i></div>'
              '<div class="scr-slide sl-c"><b>+ Visibilidad</b><small>Anúnciate hoy</small></div></div>'
              '<div class="scr-user"><img alt="Tu anuncio en la pantalla"></div>')
    return '''
<section class="sec" id="simulador"><div class="wrap">
  <div class="head head--c"><span class="kicker rv">Simulador</span><h2 class="h2 split">Mira tu anuncio en un <span class="y">%s</span></h2>
    <p class="lead rv">Sube tu diseño y velo al instante en nuestro %s. Tu archivo no se envía a ningún lado: solo se muestra en tu navegador.</p></div>
  <div class="try rv">
    <div class="sim__stage" style="--bg:url(../img/%s)"><div class="sim__dev sim__dev--%s" data-scr><div class="sim__scr">%s</div></div>
      <span class="try__tag"><i class="live"></i>Vista previa</span></div>
    <aside class="try__panel">
      <label class="try__drop" for="mm-logo" data-drop>%s<b>Arrastra tu diseño aquí</b><span>o haz clic para elegirlo · PNG, JPG o WEBP</span>
        <input id="mm-logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" data-ratio="%.4f" data-ratio-txt="%s" data-ideal="%s" data-minw="%d"></label>
      <div class="try__info" data-try-info hidden></div>
      <div class="try__spec"><h3>Tamaño de tu diseño</h3><ul>
        <li><span>Proporción</span><b>%s</b></li><li><span>Ideal</span><b>%s</b><small>máxima nitidez</small></li><li><span>Mínimo</span><b>%s</b><small>por debajo se verá pixeleado</small></li></ul>
        <p>%s</p></div>
      <div class="try__fit" role="group" aria-label="Ajuste de la imagen"><span>Ajuste</span><button type="button" class="is-on" data-fit="contain">Imagen completa</button><button type="button" data-fit="cover">Llenar pantalla</button></div>
      <div class="try__btns"><button class="btn btn--gh btn--sm" type="button" data-scr-reset hidden>Quitar mi diseño</button>
        <a class="btn btn--pk btn--sm" data-wa="%s">Cotizar con mi diseño %s</a></div>
    </aside>
  </div>
</div></section>''' % (c['nombre'], c['nombre'], c['fondo'], tipo, slides, ico('subir'), c['ratio'], c['rtxt'], c['ideal'], c['minw'],
                       c['rtxt'], c['ideal'], c['minimo'], E(c['formato']), E(wa_msg + ' Ya probé mi diseño en el simulador.'), ico('flecha'))

# --------------------------------------------------------------------- páginas de medios
def pagina_medio(d):
    slug = d['slug']
    nombre, ciudad, img_card, _ = MEDIOS[slug]
    wa_msg = 'Hola Mediamaster, me interesa anunciarme en %s %s.' % (nombre.lower() if not nombre.startswith('Aeropuerto') else 'el ' + nombre, '' if nombre.startswith('Aeropuerto') else 'en ' + ciudad)
    wa_msg = ' '.join(wa_msg.split())
    chips = ''.join('<span class="chip"><b>%s</b>%s</span>' % (b, E(t)) for b, t in d['chips'])
    hero_btn2 = ('<button class="btn btn--gh" type="button" data-video="%s"%s><span class="play"></span>Ver video</button>' % (d['video_modal'], ' data-vertical' if d.get('video_vertical') else '')
                 if d.get('video_modal') else '<a class="btn btn--gh" href="#ubicaciones">Ver ubicaciones</a>')
    parrafos = ''.join('<p class="txt rv">%s</p>' % p for p in d['intro'])
    perks = ('<ul class="perks">%s</ul>' % ''.join('<li class="rv">%s</li>' % p for p in d['perks'])) if d.get('perks') else ''

    # teléfono con video
    if d.get('phone_yt'):
        pantalla = '<button class="yt-face" type="button" data-yt="%s" aria-label="Reproducir video"><img src="https://i.ytimg.com/vi/%s/hqdefault.jpg" alt="" loading="lazy"><i></i></button>' % (d['phone_yt'], d['phone_yt'])
    else:
        pantalla = '<video muted loop playsinline preload="none" data-src="assets/video/%s" poster="assets/img/%s"></video>' % d['phone_video']
        pantalla += ('<button class="phone__snd" type="button" aria-pressed="false"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true">%s</svg><span>Activar sonido</span></button>' % ICO['sonido_off'])
    telefono = '''
<section class="sec"><div class="wrap vsplit">
  <div class="phone rv"><div class="phone__scr">%s</div></div>
  <div><span class="kicker rv">%s</span><h2 class="h2 split">%s</h2><p class="lead rv">%s</p>%s
  <div class="btns rv" style="margin-top:30px"><a class="btn btn--pk" data-wa="%s">Quiero mi campaña %s</a></div></div>
</div></section>''' % (pantalla, d['phone_kicker'], d['phone_title'], E(d['phone_text']),
                       ('<ul class="perks">%s</ul>' % ''.join('<li class="rv">%s</li>' % p for p in d['phone_perks'])), E(wa_msg), ico('flecha'))
    if d.get('simulador'):
        telefono = simulador(d['simulador'], wa_msg)

    # ubicaciones
    if d.get('mapa'):
        leyenda = ('<div class="map-legend rv">%s</div>' % ''.join('<span>%s</span>' % E(l) for l in d['leyenda'])) if d.get('leyenda') else ''
        ubic = ('<div class="map rv"><button class="map__face" type="button" data-map="%s"><span class="map__ping"></span><b>Ver mapa de ubicaciones</b><span class="txt">Toca para cargar el mapa interactivo</span></button></div>%s'
                % (d['mapa'], leyenda))
    else:
        ubic = d['ubic_html']
    ubicaciones = '''
<section class="sec" id="ubicaciones"><div class="wrap">
  <div class="head head--c"><span class="kicker rv">Ubicaciones</span><h2 class="h2 split">%s</h2><p class="lead rv">%s</p></div>%s
</div></section>''' % (d['ubic_title'], E(d['ubic_text']), ubic)

    cuerpo = '''
<section class="phero">
  <div class="phero__bg"><img src="assets/img/%s" alt="" fetchpriority="high" style="object-position:%s"></div>
  <div class="wrap phero__in">
    <nav class="crumbs rv" aria-label="Ruta"><a href="./">Inicio</a><i></i><span>%s</span><i></i><span class="y">%s</span></nav>
    <h1 class="split">%s</h1>
    <p class="lead rv">%s</p>
    <div class="btns rv"><a class="btn btn--pk" data-wa="%s">Cotiza tu campaña %s</a>%s</div>
    <div class="chips rv">%s</div>
  </div>
  <span class="scrolldown" aria-hidden="true">SCROLL</span>
</section>
%s
<section class="sec"><div class="wrap intro">
  <div><span class="kicker rv">%s</span><h2 class="h2 split">%s</h2>%s%s%s</div>
  <figure class="intro__media rv" style="margin:0"><img src="assets/img/%s" alt="%s" loading="lazy"><figcaption class="intro__badge"><b>%s</b><span>%s</span></figcaption></figure>
</div></section>
<section class="sec sec--tight"><div class="wrap">%s</div></section>
%s%s%s%s%s
%s
''' % (d['hero_img'], d.get('hero_pos', '50% 50%'), E(nombre), E(ciudad), d['h1'], E(d['lead']), E(wa_msg), ico('flecha'), hero_btn2, chips,
       ticker(d['ticker']),
       d['intro_kicker'], d['intro_title'], parrafos, specs_html(d['specs']), perks, d['intro_img'], E(nombre), d['badge'][0], E(d['badge'][1]),
       vitrina(*d['vitrina']),
       telefono, ubicaciones, otros_medios(slug), faq_html(d['faq']), cta(d['cta_title'], d['cta_text'], d['cta_img'], wa_msg),
       contacto(d['medio']))
    return pagina(slug, d['title'], d['desc'], d['hero_img'], cuerpo)

# --------------------------------------------------------------------- datos de páginas
P = '<p>%s</p>'
FAQ_PANTALLAS = lambda ciudad: [
    ('¿Qué es una pantalla digital para publicidad?', P % 'Es un medio de publicidad exterior que utiliza pantallas LED de alta resolución para mostrar anuncios en formato digital, visibles en ubicaciones estratégicas.'),
    ('¿Cuáles son las ventajas de contratar una pantalla digital?', '<ul><li>Cambios de artes sin costo.</li><li>3 versiones de spots.</li></ul>'),
    ('¿Cuáles son los beneficios de usar pantallas digitales?', P % 'Ofrecen alto impacto visual, contenido dinámico, flexibilidad en tiempo de exhibición y exposición de diferentes versiones de artes sin mayor costo.'),
    ('¿En qué horarios operan las pantallas digitales?', P % 'Las pantallas están activas de 7:30 am a 10:30 pm, garantizando exposición prolongada todos los días.'),
    ('¿Qué requisitos debe cumplir mi anuncio?', P % 'Los anuncios deben estar en formato .MP4, con una resolución de 1920 × 1080 px y una duración de 10 segundos.'),
    ('¿Dónde están ubicadas las pantallas digitales?', P % ('Más de 30 pantallas están distribuidas en puntos estratégicos de alto tránsito vehicular y peatonal en %s para maximizar el alcance.' % ciudad)),
]
SPECS_PANTALLAS = [('resolucion', 'Resolución', '1920 × 1080 px', ''), ('reloj', 'Exposición', '7:30 am a 10:30 pm', ''), ('pin', 'Ubicaciones', '+32 pantallas', ''),
                   ('archivo', 'Formato', '.MP4', ''), ('play', 'Duración', 'Spots de 10 segundos', ''), ('radar', 'Monitoreo', '24/7', '')]
PINES_PANTALLAS = [(68, 22, 'Pantalla LED', 'Alta resolución, visible de día y de noche en las principales avenidas.', 'pin--l'),
                   (45, 82, 'Alto tráfico vehicular', 'Miles de automovilistas ven tu mensaje cada día.', ''),
                   (8, 40, 'Red de pantallas', 'Combina varias ubicaciones para multiplicar la frecuencia.', 'pin--r pin--b'),
                   (79, 62, 'Puntos estratégicos', 'Accesos y vialidades clave de la ciudad.', 'pin--l')]

def datos_pantallas(ciudad, slug, mapa, leyenda, hero, intro_img, vitrina_img, pines=PINES_PANTALLAS, ar='1671/941'):
    return dict(
        slug=slug, medio='Pantallas digitales',
        title='Pantallas digitales en %s · Publicidad LED | Mediamaster' % ciudad,
        desc='Pantallas digitales espectaculares de alta resolución en las principales avenidas de %s. Más de 30 ubicaciones, spots de 10 segundos y monitoreo 24/7.' % ciudad,
        hero_img=hero, h1='Pantallas <em>digitales</em> %s' % ciudad,
        lead='Pantallas LED de alta resolución en las principales avenidas de %s, entregando tu mensaje a miles de personas todos los días.' % ciudad,
        chips=[('+32', 'pantallas'), ('10 s', 'por spot'), ('24/7', 'monitoreo')],
        ticker=['Pantallas LED', 'Alta resolución', 'Movimiento', 'Iluminación', '3 versiones de spots', 'Cambios de arte sin costo'],
        intro_kicker='Pantallas digitales %s' % ciudad, intro_title='Tu marca en <span class="y">movimiento</span>',
        intro=['Nuestras <strong>pantallas digitales espectaculares de alta resolución</strong> se ubican en las principales avenidas de la ciudad, entregando el mensaje publicitario a diversas audiencias diariamente.',
               'Elementos como el <strong>movimiento e iluminación</strong> potencian su funcionalidad. Con más de 30 ubicaciones ofrecemos campañas de gran alcance, frecuencia y segmentación demográfica, alcanzando a tu mercado meta de manera eficiente y efectiva.'],
        specs=SPECS_PANTALLAS, perks=['<strong>Cambios de artes sin costo</strong> durante tu campaña.', '<strong>3 versiones de spots</strong> para probar mensajes.'],
        intro_img=intro_img, badge=('+30', 'ubicaciones de alto tránsito vehicular y peatonal'),
        vitrina=(vitrina_img, ar, pines, 'Así se ve tu <span class="y">campaña</span>', 'Pantallas digitales · %s' % ciudad),
        phone_video=('pantallas-campana.mp4', 'pantallas-campana-poster.webp'), phone_kicker='Campaña real',
        phone_title='Puntos <span class="pk">estratégicos</span>, máxima visibilidad',
        phone_text='Mira cómo luce una campaña en nuestra red de pantallas: ubicaciones de alto flujo, visibles desde lejos y con contenido en movimiento.',
        phone_perks=['Spots de 10 segundos en rotación.', 'Programación y cambios desde nuestro centro de monitoreo.', 'Reportes de exhibición de tu campaña.'],
        ubic_title='Ubicaciones de pantallas digitales en %s' % ciudad,
        ubic_text='Descubre nuestras ubicaciones de pantallas LED en %s y lleva tu negocio al siguiente nivel con publicidad de alto impacto.' % ciudad,
        mapa=mapa, leyenda=leyenda, faq=FAQ_PANTALLAS(ciudad),
        cta_title='¡Anúnciate en nuestras pantallas y <span class="y">conquista</span> tu mercado!',
        cta_text='Te armamos un plan con las ubicaciones ideales para tu marca en %s.' % ciudad, cta_img='pantalla-ciudad-noche.webp')

FAQ_TOTEMS = [
    ('¿Qué ventajas ofrecen los tótems digitales publicitarios?', P % 'Los tótems destacan por su alta visibilidad, ubicaciones estratégicas y capacidad para mostrar contenido dinámico con iluminación llamativa, maximizando el impacto de las campañas publicitarias.'),
    ('¿Qué son los tótems publicitarios?', P % 'Son pantallas digitales verticales diseñadas para campañas de alto impacto en ubicaciones premium.'),
    ('¿Cuánto dura un anuncio en los tótems?', P % 'Cada anuncio dura 10 segundos.'),
    ('¿Qué formato se requiere para los videos?', P % 'Los videos deben estar en formato .MP4 con resolución de 1080 × 1920 px (vertical).'),
    ('¿Cómo se monitorean los anuncios?', P % 'A través del centro de monitoreo y control de Mediamaster, que supervisa la exhibición de tu campaña.'),
]
def datos_totems(ciudad, slug, posiciones, mapa):
    return dict(
        slug=slug, medio='Tótems',
        title='Tótems digitales en %s · Publicidad premium | Mediamaster' % ciudad,
        desc='Tótems digitales publicitarios en %s: pantallas verticales en zonas premium, videos de 10 segundos y monitoreo 24/7.' % ciudad,
        hero_img='totem-impacto.webp', hero_pos='50% 35%', h1='Tótems <em>digitales</em> en %s' % ciudad,
        lead='Pantallas verticales en ubicaciones premium: más cerca de tu cliente, más impacto para tu marca.',
        chips=[(posiciones, 'posiciones'), ('1080×1920', 'vertical'), ('24/7', 'monitoreo')],
        ticker=['Más cerca', 'Más impacto', 'Zonas premium', 'Iluminación', 'Movimiento', 'Interactividad'],
        intro_kicker='Tótems en %s' % ciudad, intro_title='Más cerca. <span class="y">Más impacto.</span>',
        intro=['En Mediamaster ofrecemos <strong>tótems digitales</strong> diseñados para maximizar la visibilidad de tu marca y captar la atención de miles de personas a diario, con un diseño vanguardista y costos accesibles que se ajustan a tu presupuesto.',
               'Con <strong>%s posiciones</strong>, nuestros tótems son el medio ideal para complementar cualquier campaña: brindan mayor penetración en el mercado meta, se ubican en segmentos premium o de alto nivel adquisitivo y ofrecen gran impacto visual por la iluminación, el movimiento y la cercanía al espectador.' % posiciones.replace('+', 'más de ')],
        specs=[('resolucion', 'Resolución', '1080 × 1920 px', ''), ('archivo', 'Formato', '.MP4', ''), ('play', 'Duración', 'Videos de 10 s', ''),
               ('pin', 'Ubicaciones', posiciones + ' posiciones', ''), ('radar', 'Monitoreo', '24/7', ''), ('ojo', 'Audiencia', 'Nivel premium', '')],
        perks=['Permite publicar elementos para <strong>interactuar con la audiencia</strong>.', 'Ideal para <strong>complementar</strong> campañas en pantallas y espectaculares.'],
        intro_img='totem-restaurante.webp', badge=(posiciones, 'posiciones en zonas premium'),
        vitrina=('totem-impacto.webp', '1/1', [(68, 30, 'Pantalla vertical', 'Formato 1080 × 1920 px que destaca a la altura de la vista.', 'pin--l'),
                                                (22, 55, 'Cercanía', 'Tu mensaje a pocos metros de tu cliente.', 'pin--r'),
                                                (68, 72, 'Iluminación y movimiento', 'Contenido dinámico que capta la mirada de día y de noche.', 'pin--l')],
                 'Diseñados para <span class="y">detener</span> miradas', 'Tótems digitales · %s' % ciudad),
        phone_yt='edVwQNjv_2A', phone_kicker='Formato vertical', phone_title='Pensado para <span class="pk">pantalla vertical</span>',
        phone_text='Si ya tienes contenido para redes sociales en formato vertical, puede funcionar perfecto en nuestros tótems.',
        phone_perks=['Video .MP4 de 10 segundos.', 'Resolución 1080 × 1920 px.', 'Te asesoramos con el diseño de tu anuncio.'],
        ubic_title='Ubicaciones de tótems en %s' % ciudad,
        ubic_text='Descubre nuestras ubicaciones de tótems publicitarios en %s y lleva tu negocio al siguiente nivel.' % ciudad,
        mapa=mapa, faq=FAQ_TOTEMS,
        cta_title='Listo para llevar tu marca al <span class="y">siguiente nivel</span>',
        cta_text='En Mediamaster transformamos la publicidad creativa en una experiencia única para tu audiencia.', cta_img='totem-restaurante.webp')

FAQ_ESPECT = lambda c: [
    ('¿Qué tipos de espectaculares ofrecen?', P % 'Ofrecemos espectaculares fijos en avenidas de alta afluencia vehicular y zonas comerciales, con exposición las 24 horas del día, los 365 días del año.'),
    ('¿Cuáles son los formatos aceptados para los anuncios?', P % 'Aceptamos archivos en formatos .JPG, .PNG y .PDF para garantizar calidad y nitidez en tu publicidad.'),
    ('¿Cuánto tiempo estará visible mi anuncio?', P % 'Tu anuncio será visible 24/7, asegurando exposición constante en puntos estratégicos.'),
    ('¿Qué tipo de público vería mi anuncio?', P % 'Con más de 100 ubicaciones, tus anuncios llegarán a un público de alto tráfico vehicular y peatonal, lo que aumenta su efectividad.'),
    ('¿Cómo puedo contratar un espacio publicitario?', P % 'Escríbenos por WhatsApp, llámanos o llena el formulario de esta página y te enviamos opciones de ubicaciones y precios.'),
]
def datos_espect(ciudad, slug, mapa, yt, vit_img, vit_ar, pines):
    return dict(
        slug=slug, medio='Espectaculares',
        title='Espectaculares en %s · Renta de anuncios | Mediamaster' % ciudad,
        desc='Renta de espectaculares en %s: más de 100 ubicaciones, lonas de gran formato y exposición 24/7 en avenidas de alta afluencia.' % ciudad,
        hero_img='espectacular-autopista.webp', hero_pos='50% 22%', h1='Espectaculares en <em>%s</em>' % ciudad,
        lead='Anuncios de gran formato en posiciones estratégicas para captar la atención de miles de personas a diario.',
        chips=[('+100', 'ubicaciones'), ('24/7', 'exposición'), ('365', 'días al año')],
        ticker=['Gran formato', 'Visibles 24/7', '+100 ubicaciones', 'Avenidas principales', 'Zonas comerciales', 'Alto impacto'],
        intro_kicker='Espectaculares en %s' % ciudad, intro_title='Imposible <span class="y">no verlos</span>',
        intro=['En Mediamaster ofrecemos <strong>espectaculares para negocio</strong> diseñados para dar máxima visibilidad a tu marca y captar la atención de miles de personas a diario, con opciones creativas y costos accesibles que se adaptan a tu presupuesto.',
               'Contamos con anuncios espectaculares en <strong>posiciones estratégicas</strong> y diseñamos planes de cobertura efectiva para todo tipo de presupuestos.'],
        specs=[('resolucion', 'Resolución', '300 dpi al 10%', 'Del tamaño real: detalles nítidos y colores precisos.'), ('reloj', 'Exposición', '24/7', 'Tu publicidad disponible a cualquier hora, todos los días.'),
               ('archivo', 'Formatos', '.JPG · .PNG · .PDF', ''), ('capas', 'Presencia', 'Lona de gran formato', 'Impresión de calidad y durabilidad.'),
               ('alcance', 'Alcance', '+100 ubicaciones', 'Tu mensaje frente a las personas correctas.')],
        intro_img='espectacular-noche.webp', badge=('+100', 'ubicaciones en avenidas de alta afluencia'),
        vitrina=(vit_img, vit_ar, pines, 'Tu marca en <span class="y">gran formato</span>', 'Espectaculares · %s' % ciudad),
        phone_yt=yt, phone_video=('pantallas-campana.mp4', 'pantallas-campana-poster.webp'), phone_kicker='En la calle',
        phone_title='Ubicaciones que <span class="pk">sí se ven</span>',
        phone_text='Seleccionamos cada espectacular por su flujo vehicular, su ángulo de visión y su cercanía a zonas comerciales.',
        phone_perks=['Te asesoramos para elegir las mejores ubicaciones.', 'Impresión e instalación de tu lona.', 'Evidencia fotográfica de tu campaña.'],
        ubic_title='Ubicaciones de espectaculares en %s' % ciudad,
        ubic_text='Descubre nuestras opciones de renta de espectaculares y lleva tu negocio al siguiente nivel con publicidad de alto impacto.',
        mapa=mapa, faq=FAQ_ESPECT(ciudad),
        cta_title='Listo para llevar tu marca al <span class="y">siguiente nivel</span>',
        cta_text='Trabajemos juntos: cada anuncio espectacular creado con Mediamaster es único.', cta_img='espectacular-atardecer.webp')

def datos_aeropuerto(cod, nombre_largo, slug, ciudad, intro, faq, ubic_html, ubic_text, hero, intro_img, vit):
    return dict(
        slug=slug, medio='Aeropuertos',
        title='Publicidad en el Aeropuerto %s · %s | Mediamaster' % (cod, ciudad),
        desc='Publicidad en el %s (%s): pantallas digitales en zonas de alto tráfico para impactar a miles de viajeros todos los días.' % (nombre_largo, cod),
        hero_img=hero, h1='Aeropuerto <em>%s</em>' % cod, lead='Publicidad en el %s: tu marca frente a miles de viajeros todos los días.' % nombre_largo,
        chips=[('1920×512', 'px'), ('10 s', 'por spot'), ('30', 'días mínimo')],
        ticker=['Viajeros', 'Entorno premium', 'Megapantallas', 'Alto tráfico', 'Perfil ejecutivo', 'Turismo'],
        intro_kicker=nombre_largo, intro_title='Donde tu marca <span class="y">despega</span>', intro=intro,
        specs=[('resolucion', 'Resolución', '1920 × 512 px', ''), ('archivo', 'Formatos', '.MOV · .MP4 · .JPG', ''), ('ojo', 'Exposición', 'Spots de 10 segundos', ''), ('contrato', 'Contrato', 'Mínimo 30 días', '')],
        perks=['Público de <strong>alto perfil socioeconómico</strong>: turistas, viajeros de negocios y locales.', 'Contenido dinámico en <strong>pantallas de gran formato</strong>.'],
        intro_img=intro_img, badge=(cod, 'un entorno premium de alto tráfico'),
        vitrina=vit, phone_yt='MOshhvPCxUY', phone_kicker='En el aeropuerto',
        phone_title='Miles de viajeros, <span class="pk">una sola marca</span>',
        phone_text='Los pasajeros pasan tiempo en salas y pasillos: el momento ideal para que tu marca se quede en su mente.',
        phone_perks=['Spots en video o imagen fija.', 'Visibilidad las 24 horas.', 'Campañas desde 30 días.'],
        ubic_title='Espacios publicitarios en el %s' % cod, ubic_text=ubic_text, ubic_html=ubic_html, faq=faq,
        cta_title='Listo para llevar tu marca al <span class="y">siguiente nivel</span>',
        cta_text='Trabajemos juntos: cada campaña creada con Mediamaster es única.', cta_img='aeropuerto-pasajeros.webp')

FAQ_AICM = [
    ('¿Qué tipos de espacios publicitarios están disponibles en el AICM?', P % 'Ofrecemos espacios interiores y exteriores, como pantallas digitales, lonas y bastidores en puntos estratégicos del aeropuerto.'),
    ('¿Cómo puedo contratar un espacio publicitario en el AICM?', P % 'Escríbenos por WhatsApp, llámanos o llena el formulario de esta página para recibir información sobre tarifas y disponibilidad.'),
    ('¿Cuáles son las ventajas de anunciarse en el AICM?', P % 'El AICM es un punto clave para marcas que buscan reforzar su presencia en un entorno premium y de alto tráfico.'),
    ('¿Cuánto tiempo dura una campaña publicitaria en el AICM?', P % 'La duración varía según el espacio contratado y lo que el cliente desee, a partir de 30 días. Ofrecemos opciones flexibles.'),
    ('¿Qué tipo de público alcanza la publicidad en el AICM?', P % 'Un público variado que incluye turistas, viajeros de negocios y locales, con un alto perfil socioeconómico.'),
]
FAQ_AIQ = [(q.replace('AICM', 'AIQ'), a.replace('AICM', 'AIQ')) for q, a in FAQ_AICM]

UBIC_AICM = ('<div class="show rv" style="--ar:732/533;background:#fff"><img class="show__img" src="assets/img/mapa-aicm.webp" alt="Mapa de pantallas en el AICM" loading="lazy" style="object-fit:contain">'
             '<div class="pin" style="left:46%;top:88%"><button class="pin__dot" type="button" aria-label="Sala de espera">1</button><div class="pin__card"><b>Sala de espera</b><span>Pantallas frente a los pasajeros mientras esperan su vuelo.</span></div></div>'
             '<div class="pin pin--l pin--b" style="left:69%;top:12%"><button class="pin__dot" type="button" aria-label="Zona VIP">2</button><div class="pin__card"><b>Zona VIP</b><span>Audiencia de alto perfil en la zona preferente.</span></div></div>'
             '<div class="pin pin--r" style="left:12%;top:20%"><button class="pin__dot" type="button" aria-label="Megapantallas">3</button><div class="pin__card"><b>4 megapantallas</b><span>Calidad visual excepcional en zonas de alto flujo.</span></div></div></div>')
UBIC_AIQ = ('<div class="cards">%s</div>' % ''.join(
    '<div class="mcard rv rv-d%d" style="aspect-ratio:4/3"><img src="assets/img/%s" alt="%s" loading="lazy"><div class="mcard__b"><span class="mcard__tag">%s</span><h3>%s</h3><p style="max-height:none;opacity:1">%s</p></div></div>'
    % (i + 1, im, E(t), E(tag), E(t), E(d)) for i, (im, tag, t, d) in enumerate([
        ('aeropuerto-gran-campana.webp', 'Pantallas', 'Gran formato', 'Pantallas digitales en zonas de alto flujo de pasajeros.'),
        ('aeropuerto-pasajeros.webp', 'Pasillos', 'Llegadas y salidas', 'Tu marca en el camino de cada viajero.'),
        ('aicm-pantalla.webp', 'Salas', 'Salas de espera', 'Tiempo de exposición prolongado mientras esperan su vuelo.')])))

def paginas_medios():
    return [x for x in _paginas_medios()]

def _ajustes(d):
    extra = {'pantallas-digitales-puebla': dict(hero_pos='50% 18%', simulador='pantalla'),
             'totems-queretaro': dict(simulador='totem'),
             'espectaculares-puebla': dict(simulador='espectacular')}
    d.update(extra.get(d['slug'], {}))
    return d

def _paginas_medios():
    return [_ajustes(d) for d in [
        datos_pantallas('Querétaro', 'pantallas-digitales-queretaro', 'https://www.google.com/maps/d/embed?mid=1Krs1K62gw8oBcrio317pOVz5HN6nbx0&ehbc=2E312F',
                        ['Carretera Federal 57', 'Av. 5 de Febrero', 'Paseo de la República', 'Constituyentes', 'Bernardo Quintana'],
                        'queretaro-noche.webp', 'pantallas-mapa-queretaro.webp', 'queretaro-noche.webp'),
        datos_pantallas('Puebla', 'pantallas-digitales-puebla', 'https://www.google.com/maps/d/embed?mid=16fZlS5o7_vPs_Hd1AAuuDpwcB01OHQU', [],
                        'pantalla-ciudad-noche.webp', 'pantalla-edificio.webp', 'pantalla-ciudad-noche.webp',
                        [(70, 30, 'Pantalla LED', 'Alta resolución, visible de día y de noche.', 'pin--l'),
                         (60, 78, 'Vialidades clave', 'Tu mensaje frente al flujo vehicular de la ciudad.', 'pin--l'),
                         (22, 70, 'Contenido dinámico', 'Cambia tus artes sin costo y rota hasta 3 versiones de tu spot.', 'pin--r')], '1/1'),
        datos_totems('Querétaro', 'totems-queretaro', '+40', 'https://www.google.com/maps/d/embed?mid=1Z9GKW4FB0al52BJLZVpNMNVxpBbcfrk'),
        datos_totems('Puebla', 'totems-puebla', '+10', 'https://www.google.com/maps/d/embed?mid=1uZ2v2RxfGYYgNnMPmJxxmmp8DRCsVIA'),
        datos_espect('Querétaro', 'espectaculares-queretaro', 'https://www.google.com/maps/d/embed?mid=194RMs4KqGqeGGvdbm3sGd8NSoryIQgs', None,
                     'espectacular-atardecer.webp', '1/1', [(80, 30, 'Gran formato', 'Lona impresa de alta calidad visible a distancia.', 'pin--l'),
                                                            (52, 55, 'Vialidades principales', 'Junto a señalización y accesos de la ciudad.', ''),
                                                            (50, 88, 'Alto aforo vehicular', 'Exposición diaria a miles de automovilistas.', '')]),
        datos_espect('Puebla', 'espectaculares-puebla', 'https://www.google.com/maps/d/embed?mid=1mw-te93G_DlGanQqwp4OHQnNq5k-Lac', 'edVwQNjv_2A',
                     'espectacular-noche.webp', '1080/1350', [(79, 25, 'Visible 24/7', 'Iluminación nocturna para que tu marca no descanse.', 'pin--l'),
                                                              (66, 58, 'Estructura de gran altura', 'Se ve desde lejos y por encima del tráfico.', 'pin--l'),
                                                              (40, 78, 'Avenidas de alta afluencia', 'Tu mensaje frente a miles de personas al día.', 'pin--r')]),
        datos_aeropuerto('AIQ', 'Aeropuerto Internacional de Querétaro', 'aeropuerto-aiq', 'Querétaro',
                         ['En Mediamaster ofrecemos soluciones de publicidad dentro del <strong>Aeropuerto Internacional de Querétaro (AIQ)</strong>, diseñadas para dar máxima visibilidad a tu marca y captar la atención de miles de viajeros a diario.',
                          'Potencia tu marca en un punto estratégico para impactar a miles de viajeros diarios. Con espacios publicitarios innovadores y formatos versátiles, garantizamos <strong>máxima visibilidad las 24 horas</strong> del día.'],
                         FAQ_AIQ, UBIC_AIQ, 'Conoce los espacios donde tu marca acompaña a los viajeros del AIQ.', 'aeropuerto-pasajeros.webp', 'aeropuerto-gran-campana.webp',
                         ('terminal-autobuses.webp', '1/1', [(60, 28, 'Pantalla de gran formato', 'Tu marca a gran escala sobre el flujo de pasajeros.', 'pin--l'),
                                                             (45, 62, 'Viajeros todos los días', 'Llegadas y salidas con alto flujo de personas.', ''),
                                                             (88, 60, 'Perfil premium', 'Viajeros de negocios, familias y turistas.', 'pin--l')],
                          'Tu marca en el <span class="y">AIQ</span>', 'Aeropuerto Internacional de Querétaro')),
        datos_aeropuerto('AICM', 'Aeropuerto Internacional de la Ciudad de México', 'aeropuerto-aicm', 'CDMX',
                         ['En Mediamaster ofrecemos soluciones de publicidad dentro del <strong>Aeropuerto Internacional de la Ciudad de México (AICM)</strong>, diseñadas para maximizar la visibilidad de tu marca y captar la atención de miles de pasajeros a diario.',
                          'Contamos con <strong>4 megapantallas digitales</strong> en uno de los lugares de mayor tráfico del país, con calidad visual excepcional y ubicaciones estratégicas, ideales para la difusión de contenido dinámico en un entorno premium.'],
                         FAQ_AICM, UBIC_AICM, 'Toca los puntos del mapa para conocer dónde están las pantallas.', 'terminal-autobuses.webp', 'aicm-pantalla.webp',
                         ('aeropuerto-pasajeros.webp', '1/1', [(45, 30, 'Megapantalla', 'Contenido dinámico en el camino de los pasajeros.', ''),
                                                              (66, 68, 'Alto tráfico', 'Uno de los puntos de mayor afluencia del país.', 'pin--l'),
                                                              (20, 72, 'Entorno premium', 'Viajeros nacionales e internacionales.', 'pin--r')],
                          'Megapantallas en el <span class="y">AICM</span>', 'Aeropuerto Internacional de la CDMX')),
    ]]

# --------------------------------------------------------------------- AEROPUERTOS (explorador interactivo)
# Los espacios de cada aeropuerto están en partes/aeropuertos.json (código, tipo, medida, foto y posición en el plano).
AERO_COLORES = {'Pantalla digital': '#FF015B', 'Caja de luz': '#EBFF00', 'Bastidor': '#67FB94', 'Mega vinil': '#8a3ffc'}

def explorador(clave, pisos, titulo, texto):
    import json
    tipos = []
    for p in pisos:
        for e in p['espacios']:
            if e['tipo'] not in tipos: tipos.append(e['tipo'])
    total = sum(len(p['espacios']) for p in pisos)
    datos, idx = [], 0
    pisos_html, listas_html, tabs = [], [], []
    for k, p in enumerate(pisos):
        pins, items = [], []
        for e in p['espacios']:
            col = AERO_COLORES.get(e['tipo'], '#FF015B')
            datos.append(dict(e, piso=p['nombre'], sub=p['sub']))
            pins.append('<button class="ax__pin" type="button" style="left:%s%%;top:%s%%;--c:%s" data-i="%d" data-tipo="%s" aria-label="%s, %s"><span>%s</span></button>'
                        % (e['x'], e['y'], col, idx, E(e['tipo']), E(e['codigo']), E(e['tipo']), E(e['n'])))
            items.append('<li><button class="ax__item" type="button" data-i="%d" data-tipo="%s" style="--c:%s"><img src="assets/img/aero/%s-t.webp" alt="" loading="lazy" width="84" height="64">'
                         '<span><b>%s</b><small>%s</small><em>%s</em></span><i>%s</i></button></li>'
                         % (idx, E(e['tipo']), col, e['foto'], E(e['codigo']), E(e['tipo']), E(e['medida']), E(e['n'])))
            idx += 1
        oculto = '' if k == 0 else ' hidden'
        pisos_html.append('<div class="ax__plan%s" data-piso="%d"%s style="aspect-ratio:%s"><img src="assets/img/%s" alt="Plano %s, %s" loading="%s">%s</div>'
                          % (' ax__plan--claro' if p.get('claro') else '', k, oculto, p['ratio'], p['plano'], E(p['nombre']), E(p['sub']), 'eager' if k == 0 else 'lazy', ''.join(pins)))
        listas_html.append('<ul class="ax__ul" data-piso="%d"%s>%s</ul>' % (k, oculto, ''.join(items)))
        tabs.append('<button class="ax__floor%s" type="button" role="tab" aria-selected="%s" data-piso="%d"><b>%s</b><small>%s</small><i>%d</i></button>'
                    % (' is-on' if k == 0 else '', 'true' if k == 0 else 'false', k, E(p['nombre']), E(p['sub']), len(p['espacios'])))
    filtros = '<button class="ax__chip is-on" type="button" data-tipo="*">Todos <i>%d</i></button>' % total + ''.join(
        '<button class="ax__chip" type="button" data-tipo="%s" style="--c:%s"><span></span>%s</button>' % (E(t), AERO_COLORES.get(t, '#FF015B'), E(t)) for t in tipos)
    return '''
<section class="sec" id="ubicaciones"><div class="wrap">
  <div class="head head--c"><span class="kicker rv">Ubicaciones</span><h2 class="h2 split">%s</h2><p class="lead rv">%s</p></div>
  <div class="ax rv" data-aero="%s">
    <div class="ax__bar">%s<div class="ax__filters" aria-label="Filtrar por tipo">%s</div></div>
    <div class="ax__body">
      <div class="ax__stage"><div class="ax__scroll">%s</div><div class="ax__tip" role="tooltip" hidden></div>
        <p class="ax__hint"><span class="live"></span>Pasa el cursor por un número · da clic para ver la ficha completa</p></div>
      <aside class="ax__list"><div class="ax__lhead"><b data-ax-count>%d</b> espacios en esta planta</div>%s</aside>
    </div>
    <script type="application/json" class="ax__data">%s</script>
  </div>
</div></section>''' % (titulo, E(texto), clave, ('<div class="ax__floors" role="tablist">%s</div>' % ''.join(tabs)) if len(pisos) > 1 else '',
                       filtros, ''.join(pisos_html), len(pisos[0]['espacios']), ''.join(listas_html),
                       json.dumps(datos, ensure_ascii=False).replace('</', '<\\/'))

def kpis(items):
    return '<section class="sec sec--tight"><div class="wrap kpis">%s</div></section>' % ''.join(
        '<div class="stat rv rv-d%d"><b>%s</b><small>%s</small></div>' % (i % 4 + 1, v, E(t)) for i, (v, t) in enumerate(items))

def pagina_aeropuerto(d):
    slug = d['slug']
    wa_msg = 'Hola Mediamaster, me interesa anunciarme en el %s.' % d['nombre_largo']
    chips = ''.join('<span class="chip"><b>%s</b>%s</span>' % (b, E(t)) for b, t in d['chips'])
    grupos = ''.join('<div class="axs rv"><h3>%s</h3>%s</div>' % (g, specs_html(sp)) for g, sp in d['specs'])
    cuerpo = '''
<section class="phero">
  <div class="phero__bg"><img src="assets/img/%s" alt="" fetchpriority="high" style="object-position:%s"></div>
  <div class="wrap phero__in">
    <nav class="crumbs rv" aria-label="Ruta"><a href="./">Inicio</a><i></i><span>Aeropuertos</span><i></i><span class="y">%s</span></nav>
    <h1 class="split">%s</h1>
    <p class="lead rv">%s</p>
    <div class="btns rv"><a class="btn btn--pk" href="#ubicaciones">Explorar ubicaciones %s</a><a class="btn btn--gh" data-wa="%s">Cotizar por WhatsApp</a></div>
    <div class="chips rv">%s</div>
  </div>
  <span class="scrolldown" aria-hidden="true">SCROLL</span>
</section>
%s
%s
<section class="sec"><div class="wrap intro">
  <div><span class="kicker rv">%s</span><h2 class="h2 split">%s</h2>%s%s</div>
  <figure class="intro__media rv" style="margin:0"><img src="assets/img/%s" alt="%s" loading="lazy"><figcaption class="intro__badge"><b>%s</b><span>%s</span></figcaption></figure>
</div></section>
%s%s%s%s%s''' % (d['hero_img'], d.get('hero_pos', '50% 50%'), d['cod'], d['h1'], E(d['lead']), ico('flecha'), E(wa_msg), chips,
                  ticker(d['ticker']), kpis(d['kpis']),
                  d['nombre_largo'], d['intro_title'], ''.join('<p class="txt rv">%s</p>' % p for p in d['intro']), grupos,
                  d['intro_img'], E(d['nombre_largo']), d['badge'][0], E(d['badge'][1]),
                  explorador(d['cod'].lower(), d['pisos'], d['explora_title'], d['explora_text']),
                  otros_medios(slug), faq_html(d['faq']),
                  cta('Listo para llevar tu marca al <span class="y">siguiente nivel</span>', 'Trabajemos juntos: te armamos un plan con los espacios ideales para tu marca.', d['cta_img'], wa_msg),
                  contacto('Aeropuertos'))
    return pagina(slug, d['title'], d['desc'], d['hero_img'], cuerpo)

def paginas_aeropuertos():
    import json
    datos = json.loads(leer('aeropuertos.json'))
    total_aiq = sum(len(p['espacios']) for p in datos['aiq'])
    aiq = dict(
        slug='aeropuerto-aiq', cod='AIQ', nombre_largo='Aeropuerto Internacional de Querétaro',
        title='Publicidad en el Aeropuerto de Querétaro (AIQ) | Mediamaster',
        desc='Publicidad en el Aeropuerto Internacional de Querétaro: %d espacios entre pantallas digitales, cajas de luz, bastidores y mega viniles. Explora el plano interactivo.' % total_aiq,
        hero_img='aeropuerto-pasajeros.webp', hero_pos='60% 40%', h1='<small>Aeropuerto</small> <em>AIQ</em>',
        lead='Potencia tu marca en el Aeropuerto Internacional de Querétaro, un punto estratégico para impactar a miles de viajeros diarios, 24 horas al día.',
        chips=[('%d' % total_aiq, 'espacios'), ('+10', 'pantallas'), ('24/7', 'exposición')],
        ticker=['Viajeros', 'Pantallas digitales', 'Cajas de luz', 'Bastidores', 'Mega viniles', 'Alto perfil'],
        kpis=[('<span>+</span><i style="font-style:normal" data-count="1.3">1.3</i>M', 'pasajeros al año'), ('<span>+</span><i style="font-style:normal" data-count="10">10</i>', 'rutas nacionales e internacionales'),
              ('<span>+</span><i style="font-style:normal" data-count="120">120</i>', 'vuelos semanales'), ('<i style="font-style:normal" data-count="%d">%d</i>' % (total_aiq, total_aiq), 'espacios publicitarios')],
        intro_title='Donde tu marca <span class="y">despega</span>',
        intro=['Potencia tu marca en el <strong>Aeropuerto Internacional de Querétaro (AIQ)</strong>, un punto estratégico para impactar a miles de viajeros diarios.',
               'Con espacios publicitarios innovadores y formatos versátiles, interiores y exteriores, garantizamos <strong>máxima visibilidad las 24 horas</strong> del día.'],
        specs=[('Espacios interiores', [('resolucion', 'Pantallas', '+10 pantallas', '1920×1080 · 1920×832 · 1920×512 · 1920×498 · 1536×704 px'),
                                         ('reloj', 'Exposición', 'Spots de 10 s', 'Tu anuncio se repite cada minuto.'),
                                         ('archivo', 'Formatos', '.MOV · .MP4 · .JPG', ''), ('contrato', 'Contrato', 'Mínimo 30 días', '')]),
               ('Espacios exteriores', [('capas', 'Formato', 'Lonas de gran formato', 'Impresión fija de alta calidad.'), ('ojo', 'Exposición', '24 h · 7 días', '')])],
        intro_img='aeropuerto-gran-campana.webp', badge=('1.3M', 'pasajeros al año en el AIQ'),
        pisos=datos['aiq'], explora_title='Explora el <span class="y">AIQ</span>',
        explora_text='Elige la planta, filtra por tipo de espacio y pasa el cursor por los números. Da clic para ver la ficha completa de cada ubicación.',
        faq=FAQ_AIQ, cta_img='aeropuerto-pasajeros.webp')
    aicm = dict(
        slug='aeropuerto-aicm', cod='AICM', nombre_largo='Aeropuerto Internacional de la Ciudad de México',
        title='Publicidad en el Aeropuerto de la CDMX (AICM) | Mediamaster',
        desc='4 megapantallas digitales en el Aeropuerto Internacional de la Ciudad de México (AICM), uno de los lugares de mayor tráfico del país.',
        hero_img='terminal-autobuses.webp', hero_pos='85% 30%', h1='<small>Aeropuerto</small> <em>AICM</em>',
        lead='4 megapantallas digitales en uno de los lugares de mayor tráfico del país, frente a miles de viajeros todos los días.',
        chips=[('4', 'megapantallas'), ('1920×512', 'px'), ('30', 'días mínimo')],
        ticker=['Megapantallas', 'Entorno premium', 'Alto tráfico', 'Viajeros de negocios', 'Turismo', 'Contenido dinámico'],
        kpis=[('<i style="font-style:normal" data-count="4">4</i>', 'megapantallas digitales'), ('1920×512', 'píxeles por pantalla'),
              ('<i style="font-style:normal" data-count="10">10</i> s', 'por spot'), ('<i style="font-style:normal" data-count="30">30</i>', 'días de contratación mínima')],
        intro_title='Donde tu marca <span class="y">despega</span>',
        intro=['En el <strong>Aeropuerto Internacional de la Ciudad de México</strong> contamos con <strong>4 megapantallas digitales</strong> diseñadas para maximizar el impacto de las campañas en uno de los lugares de mayor tráfico del país.',
               'Ofrecen una calidad visual excepcional y ubicaciones estratégicas, ideales para captar la atención de miles de viajeros diariamente con contenido dinámico en un entorno premium.'],
        specs=[('Especificaciones', [('resolucion', 'Resolución', '1920 × 512 px', ''), ('archivo', 'Formatos', '.MOV · .MP4 · .JPG', ''),
                                     ('ojo', 'Exposición', 'Spots de 10 segundos', ''), ('contrato', 'Contrato', 'Mínimo 30 días', '')])],
        intro_img='aicm-pantalla.webp', badge=('4', 'megapantallas en la sala de espera'),
        pisos=datos['aicm'], explora_title='Explora el <span class="y">AICM</span>',
        explora_text='Pasa el cursor por cada número para ver la megapantalla y da clic para verla en grande.',
        faq=FAQ_AICM, cta_img='aeropuerto-pasajeros.webp')
    return [aiq, aicm]

# --------------------------------------------------------------------- HOME
def home():
    bb = leer('billboard.html')
    totem = leer('totem.html')
    logos = ''.join('<img src="assets/img/clientes/%s.webp" alt="%s" loading="lazy" height="90">' % (n, E(a)) for n, a in [
        ('oxxo', 'OXXO'), ('queretalove', 'QuerétaLove'), ('sephora', 'Sephora'), ('telcel', 'Telcel'), ('the-cheesecake-factory', 'The Cheesecake Factory'),
        ('att', 'AT&T'), ('coca-cola', 'Coca-Cola'), ('el-encanto', 'El Encanto'), ('heb', 'HEB'), ('jose-cuervo', 'José Cuervo'), ('la-comer', 'La Comer'),
        ('macdonald', "McDonald's"), ('maestro-dobel-tequila', 'Maestro Dobel'), ('megacable', 'Megacable'), ('omoda', 'Omoda')])
    logos2 = re.sub(r'alt="[^"]*"', 'alt="" aria-hidden="true"', logos)
    why = [('pantallas-mapa-queretaro.webp', 'Alcance focalizado', 'Impacta audiencias específicas en ubicaciones estratégicas de alto tráfico vehicular y peatonal en Querétaro, Puebla y CDMX, incluyendo los aeropuertos AIQ y AICM y zonas comerciales.'),
           ('espectacular-atardecer.webp', 'Variedad de formatos', 'Plataformas publicitarias flexibles, desde pantallas digitales de última generación hasta espectaculares tradicionales, adaptadas a cada campaña y presupuesto.'),
           ('pantalla-edificio.webp', 'Impulsa tu marca', 'Las pantallas de alta definición y formatos innovadores proyectan una imagen de marca moderna, sofisticada y diferenciada, posicionándote como líder en tu industria.'),
           ('centro-monitoreo.webp', 'Monitoreo y control 24/7', 'Un centro de monitoreo en tiempo real asegura la calidad y visibilidad de tus campañas en nuestras pantallas digitales.')]
    why_list = ''.join('<button class="why__it" type="button"><b>0%d</b><h3>%s</h3><p>%s</p></button>' % (i + 1, E(t), E(d)) for i, (_, t, d) in enumerate(why))
    why_imgs = ''.join('<img src="assets/img/%s" alt="%s" loading="lazy">' % (im, E(t)) for im, t, _ in why)
    ciudades = [('Querétaro', 'Sede · desde 2013', [('pantallas-digitales-queretaro', 'Pantallas digitales'), ('totems-queretaro', 'Tótems'), ('espectaculares-queretaro', 'Espectaculares'), ('aeropuerto-aiq', 'Aeropuerto AIQ'), ('estadio-corregidora-queretaro', 'Estadio Corregidora')]),
                ('Puebla', 'Cobertura completa', [('pantallas-digitales-puebla', 'Pantallas digitales'), ('totems-puebla', 'Tótems'), ('espectaculares-puebla', 'Espectaculares')]),
                ('CDMX', 'Entorno premium', [('aeropuerto-aicm', 'Aeropuerto AICM')])]
    city_html = ''.join('<div class="city rv rv-d%d"><span class="city__n">0%d</span><h3>%s</h3><small>%s</small><ul>%s</ul></div>'
                        % (i + 1, i + 1, c, sub, ''.join('<li><a href="%s">%s%s</a></li>' % (href(s), n, ico('flecha')) for s, n in links))
                        for i, (c, sub, links) in enumerate(ciudades))
    revs = [('Josemaria Reynoso', 'Una empresa que sí cumple, es muy buena, muy buen servicio y atención.'),
            ('Nelter Carrera', 'Excelente empresa.'), ('Antonio Chávez', 'Lo mejor en publicidad, son los mejores, me encantan.')]
    rev_html = ''.join('<div class="rev rv rv-d%d"><div class="stars" aria-label="5 estrellas">★★★★★</div><p>“%s”</p><div class="rev__who"><i>%s</i><span>%s<small>Reseña en Google</small></span></div></div>'
                       % (i + 2, E(t), n[0], E(n)) for i, (n, t) in enumerate(revs))
    faq = [('¿Qué se entiende por publicidad exterior?', P % 'La publicidad exterior consiste en anuncios ubicados en espacios públicos, como espectaculares, vallas, mupis, pantallas digitales y transporte público, diseñados para captar la atención de las personas mientras se desplazan.'),
           ('¿Dónde se coloca la publicidad exterior?', P % 'En lugares estratégicos como avenidas principales, zonas comerciales, estaciones de transporte, aeropuertos, estadios, fachadas de edificios y paradas de autobús.'),
           ('¿Qué son los anuncios espectaculares?', P % 'Un anuncio espectacular es un tipo de publicidad exterior: un cartel de gran tamaño colocado en lugares estratégicos, como avenidas principales o carreteras.'),
           ('¿Cómo puedo elegir el mejor espacio publicitario para mi campaña?', P % 'Nuestro equipo te asesora: evaluamos tus objetivos, tu público y el área geográfica que quieres cubrir para recomendarte las mejores ubicaciones y formatos.'),
           ('¿Cómo puedo diseñar mi anuncio para que sea efectivo?', P % 'El mensaje debe ser claro, directo y visualmente atractivo. Nuestros diseñadores te ayudan a crear un anuncio que capte la atención y cumpla con los requisitos técnicos de cada medio.'),
           ('¿Qué requisitos técnicos deben cumplirse?', P % 'Cada medio tiene requisitos de formato, tamaño y resolución. Te damos guías detalladas y nuestro equipo te acompaña en la producción.')]
    cuerpo = '''
<section class="hhero"><div class="wrap hhero__grid">
  <div>
    <span class="hhero__kick rv"><span class="live"></span>MILLONES DE MIRADAS.</span>
    <h1 class="split">Haz que tu <span class="y">marca</span> sea imposible de ignorar</h1>
    <p class="lead rv">Lleva tu marca a <strong>pantallas digitales, tótems y espectaculares de alto impacto</strong>, estratégicamente ubicados en ciudades clave de México.</p>
    <div class="btns rv"><a class="btn btn--pk" href="#contacto">Cotiza tu campaña %s</a><a class="btn btn--gh" href="#servicios">Ver medios</a></div>
    <div class="cities rv"><span>%s Querétaro</span><span>%s CDMX</span><span>%s Puebla</span></div>
  </div>
  <div class="hhero__bb rv rv-d2">%s</div>
</div></section>
%s
<section class="sec" id="nosotros"><div class="wrap about">
  <div class="about__media rv"><img src="assets/img/pantalla-ciudad-noche.webp" alt="Pantalla digital Mediamaster de noche" loading="lazy">
    <button class="playbtn" type="button" data-video="assets/video/mediamaster-animacion.mp4" aria-label="Ver video de Mediamaster"></button><span class="playbtn__lbl">Mira cómo funciona</span></div>
  <div>
    <span class="kicker rv">¿Quiénes somos?</span><h2 class="h2 split">Líderes en publicidad <span class="y">exterior</span></h2>
    <p class="txt rv">La publicidad exterior ha evolucionado y en Mediamaster lideramos esta transformación. <strong>Desde 2013</strong> somos la agencia de referencia en Querétaro. Impulsa tus campañas con nuestra red de pantallas digitales de alta resolución.</p>
    <p class="txt rv">Contamos con un <strong>centro de monitoreo y programación propio</strong> que nos permite alternar tus spots en tiempo real y responder con total agilidad para garantizar el máximo impacto de tu marca.</p>
    <div class="stats">
      <div class="stat"><b><span>+</span><i style="font-style:normal" data-count="100">100</i></b><small>Pantallas</small></div>
      <div class="stat"><b><span>+</span><i style="font-style:normal" data-count="78">78</i>M</b><small>Audiencia mensual</small></div>
      <div class="stat"><b><span>+</span><i style="font-style:normal" data-count="13">13</i></b><small>Años de experiencia</small></div>
      <div class="stat"><b><i style="font-style:normal" data-count="5">5</i></b><small>Plataformas</small></div>
    </div>
  </div>
</div></section>
<section class="sec" id="servicios" style="padding-bottom:40px"><div class="wrap svc-head">
  <span class="kicker rv">Servicios</span><h2 class="h2 split">Nuestros medios en publicidad <span class="y">exterior</span></h2>
  <p class="lead rv">Somos un medio publicitario masivo, con ubicaciones estratégicas en zonas de alta afluencia vehicular, peatonal y de transporte. Pasa el cursor sobre un medio y elige.</p>
</div>%s</section>
<section class="expert"><div class="expert__bg" data-parallax="120"><img src="assets/img/queretaro-noche.webp" alt="" loading="lazy"></div>
  <div class="wrap expert__grid">
    <div><span class="kicker rv">Experiencia</span><h2 class="split">Expertos en publicidad <span class="y">exterior</span></h2>
      <p class="lead rv">Ofrecemos soluciones publicitarias de calidad, creatividad y profesionalismo, garantizando la satisfacción de nuestros clientes con resultados exitosos en sus campañas.</p></div>
    <button class="playbtn rv" type="button" data-video="yt:M8E4Z7C79Lk" aria-label="Ver video"></button>
  </div>
</section>
<section class="sec"><div class="wrap">
  <div class="head"><span class="kicker rv">Por qué elegirnos</span><h2 class="h2 split">Tu publicidad en espectaculares y pantallas <span class="y">digitales</span></h2><p class="lead rv">Te asesoramos de manera profesional para maximizar tu alcance.</p></div>
  <div class="why"><div class="why__list rv">%s</div><div class="why__media rv">%s<div class="why__bar"><i></i></div></div></div>
</div></section>
<section class="sec sec--tight"><div class="wrap">
  <div class="head head--c"><span class="kicker rv">Cobertura</span><h2 class="h2 split">Presentes en ciudades <span class="y">clave</span></h2></div>
  <div class="citygrid">%s</div>
</div></section>
<section class="sec"><div class="head head--c wrap"><span class="kicker rv">Clientes</span><h2 class="h2 split">Ellos ya confían en <span class="y">nosotros</span></h2></div>
  <div class="logos rv"><div class="logos__t">%s%s</div></div>
  <div class="wrap reviews">
    <div class="rev rev--g rv rv-d1"><b>5.0</b><div class="stars">★★★★★</div><p style="margin:10px 0 18px">9 reseñas en Google</p>
      <a class="lnk" href="https://admin.trustindex.io/api/googleWriteReview?place-id=ChIJQU6wIvhb04URcMtBpLYJu_E" target="_blank" rel="noopener">Escribe una reseña %s</a></div>%s
  </div>
</section>
%s
''' % (ico('flecha'), ico('pin'), ico('pin'), ico('pin'), bb,
       ticker(['Pantallas digitales', 'Tótems', 'Espectaculares', 'Aeropuertos', 'Estadio Corregidora', 'Monitoreo 24/7']),
       totem, why_list, why_imgs, city_html, logos, logos2, ico('flecha'), rev_html, faq_html(faq))
    cuerpo += cta('Que tu marca sea <span class="y">imposible</span> de ignorar', 'Cuéntanos tu objetivo y te armamos una propuesta con los medios ideales para tu marca.',
                  'queretaro-noche.webp', 'Hola Mediamaster, quiero una propuesta para mi marca.') + contacto()
    return pagina('index', 'Mediamaster · Publicidad exterior en Querétaro, Puebla y CDMX',
                  'Pantallas digitales, tótems, espectaculares, aeropuertos y estadio. Haz que tu marca sea imposible de ignorar con Mediamaster, desde 2013.',
                  'queretaro-noche.webp', cuerpo)

# --------------------------------------------------------------------- ESTADIO
# Diseño original de la página de estadio (partes/estadio-original.html),
# adaptado a un solo espacio: la pantalla gigante de 5 × 20 m.
ESTADIO_ARCHIVOS = {
    'mediamaster-estadio-interior.mp4': 'video/estadio-interior.mp4',
    'mediamaster-estadio-exterior.mp4': 'video/estadio-exterior.mp4',
    'mediamaster-estadio-interior-poster.webp': 'img/estadio-interior.webp',
    'mediamaster-estadio-exterior-poster.webp': 'img/estadio-exterior.webp',
    'mediamaster-estadio-pantalla.webp': 'img/estadio-pantalla.webp',
    'mediamaster-estadio-cancha.webp': 'img/estadio-cancha.webp',
    'mediamaster-estadio-aficion.webp': 'img/estadio-aficion.webp',
    'mediamaster-estadio-llegada.webp': 'img/estadio-llegada.webp',
}
ESTADIO_FAQ = [
    ('¿Qué medidas tiene la pantalla gigante?', 'Mide 5 × 20 metros (100 m²) y es visible desde todas las gradas del estadio.'),
    ('¿Puedo anunciarme solo en un partido?', 'Sí. Armamos campañas por partido, por torneo o por temporada completa, según tus objetivos y la disponibilidad.'),
    ('¿Qué formato necesita mi anuncio?', 'Aceptamos video o imagen fija. Al cotizar te compartimos la resolución y especificaciones técnicas exactas para que tu anuncio se vea perfecto.'),
    ('¿En qué momentos se transmite mi anuncio?', 'Tu anuncio entra en la rotación de la pantalla antes del partido, en el medio tiempo y al final, cuando la atención de la afición está en la pantalla.'),
    ('¿Me ayudan a diseñar el anuncio?', 'Te asesoramos para que tu mensaje funcione en un estadio: textos cortos, alto contraste y tu marca siempre visible. Si lo necesitas, te apoyamos con la producción.'),
    ('¿Cómo compruebo que mi anuncio salió al aire?', 'Damos seguimiento a cada campaña y te entregamos evidencia de su exhibición.'),
]
ESTADIO_JS_PANTALLA = """  // ---------- la pantalla gigante ----------
  var panel = root.querySelector('.mme-panel'), e0 = ESPACIOS[0], pImg = panel.querySelector('.mme-panel__img img');
  pImg.src = M(e0.img); pImg.alt = e0.titulo;
  panel.querySelector('.mme-panel__title').textContent = e0.titulo;
  panel.querySelector('.mme-panel__text').textContent = e0.texto;
  var pList = panel.querySelector('.mme-panel__list');
  e0.lista.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; pList.appendChild(li); });
  panel.querySelector('.mme-panel__cta').href = wa('Hola, me interesa la pantalla gigante del Estadio Corregidora.');
  root.querySelectorAll('.mme-spot').forEach(function (s) { s.classList.add('is-active'); });

"""
ESTADIO_JS_ESPACIOS = """  var ESPACIOS = [
    { titulo: 'Pantalla gigante', img: 'img/estadio-pantalla.webp',
      texto: 'La pantalla principal del Estadio Corregidora: 5 × 20 metros de LED frente a toda la afición, en los momentos de mayor emoción del partido.',
      lista: ['5 × 20 m · 100 m² de pantalla LED', 'Visible desde todas las gradas', 'Spots en video o imagen fija', 'Antes del partido, medio tiempo y final'] }
  ];"""
ESTADIO_CSS_EXTRA = """
/* ajustes de la página de estadio dentro del sitio */
.mme{background:transparent; background-image:none}
.mme-panel__cta{align-self:flex-start}
.mme-acc details p{margin:0}
.mme .mme-spot.is-active,.mme .mme-spot.is-active:focus,.mme .mme-spot.is-active:hover{animation:mmeSpotOn 2s infinite !important}
@keyframes mmeSpotOn{0%{box-shadow:0 0 0 0 rgba(235,255,0,.6)}70%{box-shadow:0 0 0 18px rgba(235,255,0,0)}100%{box-shadow:0 0 0 0 rgba(235,255,0,0)}}
"""

def pruebalo():
    slides = ('<div class="scr-slides"><div class="scr-slide scr-logo"><img src="assets/img/icono.png" alt=""><b>media<strong>master</strong></b><small>MEDIOS PUBLICITARIOS</small></div>'
              '<div class="scr-slide scr-goal"><span>¡GOOOL!</span></div><div class="scr-slide scr-brand"><span>Tu marca aquí</span><i></i></div></div>'
              '<div class="scr-user"><img alt="Tu diseño en la pantalla"></div>')
    persona = ('<svg viewBox="0 0 40 120" aria-hidden="true"><circle cx="20" cy="11" r="9"/><path d="M8 26q12-6 24 0l3 40h-6l-2-30-1 82h-8l-1-45-1 45H8l-1-82-2 30H-1z"/></svg>')
    return '''  <!-- ============================ PRUÉBALO ============================ -->
  <section class="mme-try" id="pruebalo"><div class="mme-wrap">
    <div class="mme-head"><span class="mme-kicker mme-rv">PRUÉBALO</span>
      <h2 class="mme-h2 mme-rv">MIRA TU MARCA EN LA <span class="mme-y">PANTALLA GIGANTE</span></h2>
      <p class="mme-p mme-rv">Sube tu logo o tu anuncio y velo al instante en la pantalla del estadio. Tu archivo no se envía a ningún lado: solo se muestra en tu navegador.</p></div>
    <div class="try mme-rv">
      <div class="try__view">
        <div class="tryit" data-scr><img src="assets/img/estadio-pantalla.webp" alt="Pantalla gigante del estadio con la afición" loading="lazy" width="1600" height="899"><div class="tryit__scr">%s</div><span class="try__tag"><i class="live"></i>Vista en el estadio</span></div>
        <div class="try__scale">
          <div class="try__row"><div class="try__screen" data-scr><span class="try__w">20 m</span><span class="try__h">5 m</span><div class="try__flat">%s</div></div>
            <div class="try__man" title="Persona de 1.75 m a la misma escala">%s</div></div>
          <small>Vista frontal a escala · la figura mide 1.75 m</small>
        </div>
      </div>
      <aside class="try__panel">
        <label class="try__drop" for="mm-logo" data-drop>%s<b>Arrastra tu imagen aquí</b><span>o haz clic para elegirla · PNG, JPG o WEBP</span><input id="mm-logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
        <div class="try__info" data-try-info hidden></div>
        <div class="try__spec">
          <h3>Tamaño de tu diseño</h3>
          <ul>
            <li><span>Proporción</span><b>4 : 1</b><small>igual que la pantalla de 20 × 5 m</small></li>
            <li><span>Ideal</span><b>3840 × 960 px</b><small>máxima nitidez</small></li>
            <li><span>Mínimo</span><b>1920 × 480 px</b><small>por debajo se verá pixeleado</small></li>
          </ul>
          <p>Usa textos grandes, pocos elementos y colores contrastantes: la afición ve la pantalla a decenas de metros.</p>
        </div>
        <div class="try__fit" role="group" aria-label="Ajuste de la imagen"><span>Ajuste</span><button type="button" class="is-on" data-fit="contain">Imagen completa</button><button type="button" data-fit="cover">Llenar pantalla</button></div>
        <div class="try__btns"><button class="btn btn--gh btn--sm" type="button" data-scr-reset hidden>Quitar mi imagen</button>
          <a class="btn btn--pk btn--sm" data-wa="Hola, ya probé mi diseño en la pantalla gigante del Estadio Corregidora y quiero cotizar.">Cotizar con mi diseño %s</a></div>
      </aside>
    </div>
  </div></section>''' % (slides, slides, persona, ico('subir'), ico('flecha'))

def estadio_partes():
    s = leer('estadio-original.html')
    s = re.sub(r'^<!--.*?-->\s*', '', s, flags=re.S)
    s = re.sub(r'<link[^>]*>\n?', '', s)
    for a, b in ESTADIO_ARCHIVOS.items():
        s = s.replace(a, b)

    def rep(a, b):
        nonlocal s
        assert a in s, a[:70]
        s = s.replace(a, b, 1)

    # ---- hero
    rep('TU MARCA ENTRA<br>A LA <span>CANCHA</span>', 'TU MARCA EN LA<br><span>PANTALLA GIGANTE</span>')
    rep('Pantalla gigante, tableros LED y espacios en todo el estadio para que <strong>más de 30 mil aficionados</strong> vean tu marca justo en el momento de mayor emoción.',
        'Una pantalla de <strong>5 × 20 metros</strong> frente a <strong>más de 30 mil aficionados</strong>: tu marca justo en el momento de mayor emoción.')
    rep('data-mm-wa="Hola, me interesa anunciarme en el Estadio Corregidora."', 'data-mm-wa="Hola, me interesa anunciarme en la pantalla gigante del Estadio Corregidora."')
    s = re.sub(r'(<div class="mme-ticker__track">).*?(</div></div>)', lambda m: m.group(1) + ''.join(
        '<span>%s</span>' % t for t in ['PANTALLA GIGANTE', '5 × 20 METROS', '100 M² DE LED', 'DÍA DE PARTIDO', '+30 MIL AFICIONADOS', 'TU MARCA AQUÍ'] * 2) + m.group(2), s, count=1, flags=re.S)
    # ---- cifras
    rep('<div class="mme-stat mme-rv"><b><span data-mm-count="2">2</span></b><p>torneos al año: Apertura y Clausura</p></div>',
        '<div class="mme-stat mme-rv"><b><span data-mm-count="100" data-suffix=" m²">100 m²</span></b><p>de pantalla LED (5 × 20 m)</p></div>')
    # ---- intro
    rep('<strong>Presencia de principio a fin.</strong> Desde el estacionamiento hasta el silbatazo final.',
        '<strong>Imposible de no ver.</strong> 100 m² de LED visibles desde todas las gradas.')
    # ---- mapa: solo la pantalla gigante
    rep('ESPACIOS PUBLICITARIOS</span>', 'LA PANTALLA GIGANTE</span>')
    rep('ELIGE DÓNDE <span class="mme-y">BRILLA</span> TU MARCA', '5 × 20 METROS DE <span class="mme-y">PURA EMOCIÓN</span>')
    rep('Toca cada punto del estadio para conocer el espacio. Combínalos para acompañar a la afición durante toda su experiencia.',
        'La pantalla principal del estadio, frente a la cancha y visible desde todas las gradas. Ahí voltean miles de aficionados en cada repetición, cada gol y cada anuncio del marcador.')
    s = re.sub(r'\n\s*<button class="mme-spot" type="button" style="[^"]*"\s+data-spot="[1-5]".*?</button>', '', s)
    rep('<rect class="mme-map__screen" x="240" y="30" width="120" height="26" rx="3"/>',
        '<rect class="mme-map__screen" x="240" y="30" width="120" height="26" rx="3"/><text x="372" y="49" text-anchor="start" fill="#EBFF00" font-family="Titillium Web" font-weight="700" font-size="15">5 × 20 m</text>')
    rep('<div class="mme-tabs" role="tablist" aria-label="Espacios publicitarios"></div>', '')
    rep('<div class="mme-panel__bar"><i></i></div>', '')
    # ---- momentos
    rep('ESTRATEGIA 360°', 'MOMENTOS DE EXPOSICIÓN')
    rep('ACOMPAÑA A LA AFICIÓN <span class="mme-y">TODO</span> EL PARTIDO', 'TU ANUNCIO CUANDO <span class="mme-y">TODOS</span> ESTÁN MIRANDO')
    rep('La llegada: estacionamiento, accesos y explanada. Tu marca es lo primero que ve la afición al llegar al estadio.',
        'La previa: la afición llega, busca su lugar y mira la pantalla mientras calientan los equipos.')
    rep('<span class="mme-step__tag">Estacionamiento · Accesos</span>', '<span class="mme-step__tag">Previa del partido</span>')
    rep('Pantalla gigante y tableros LED en el punto exacto donde están todas las miradas: la cancha.',
        'El medio tiempo: 15 minutos en los que la pantalla es protagonista y tu marca se roba la atención.')
    rep('<span class="mme-step__tag">Pantalla · Tableros LED</span>', '<span class="mme-step__tag">Medio tiempo</span>')
    rep('La salida y las redes: fotos, videos y recuerdos del partido donde tu marca sigue presente.',
        'El cierre: la emoción del resultado, con las fotos y videos que la afición comparte con tu marca en pantalla.')
    rep('<span class="mme-step__tag">Salidas · Contenido digital</span>', '<span class="mme-step__tag">Final y redes sociales</span>')
    # ---- la galería se reemplaza por el componente para probar tu diseño en la pantalla
    s, n = re.subn(r'  <!-- =+ GALERÍA =+ -->.*?(?=  <!-- =+ CLIENTES =+ -->)', lambda m: pruebalo() + '\n\n', s, count=1, flags=re.S)
    assert n == 1
    # ---- preguntas
    items = ''.join('<details class="mme-rv"%s><summary>%s</summary><div class="acc__b"><p>%s</p></div></details>'
                    % (' open' if k == 0 else '', E(q), E(a)) for k, (q, a) in enumerate(ESTADIO_FAQ))
    s, n = re.subn(r'(<div class="mme-acc">).*?(\n      </div>\n    </div>\n  </section>)', lambda m: m.group(1) + items + m.group(2), s, count=1, flags=re.S)
    assert n == 1
    # ---- CTA
    rep('data-mm-wa="Hola, quiero una propuesta para anunciarme en el Estadio Corregidora."', 'data-mm-wa="Hola, quiero una propuesta para la pantalla gigante del Estadio Corregidora."')
    rep('te armamos una propuesta para el Estadio Corregidora.', 'te armamos una propuesta para la pantalla gigante del Estadio Corregidora.')

    css = re.search(r'<style>(.*?)</style>', s, re.S).group(1) + ESTADIO_CSS_EXTRA
    js = re.search(r'<script>(.*?)</script>', s, re.S).group(1)
    cuerpo = re.sub(r'<style>.*?</style>', '', s, flags=re.S)
    cuerpo = re.sub(r'<script>.*?</script>', '', cuerpo, flags=re.S).strip()

    def jrep(a, b):
        nonlocal js
        assert a in js, a[:70]
        js = js.replace(a, b)
    jrep("MEDIOS: 'https://maroon-oyster-970439.hostingersite.com/wp-content/uploads/2026/11/'", "MEDIOS: 'assets/'")
    jrep("var CLIENTES_URL = 'https://maroon-oyster-970439.hostingersite.com/wp-content/uploads/2026/09/mediamaster-publicidad-exterior-';", "var CLIENTES_URL = 'assets/img/clientes/';")
    js, n = re.subn(r"  var ESPACIOS = \[.*?\n  \];", lambda m: ESTADIO_JS_ESPACIOS, js, count=1, flags=re.S); assert n == 1
    js, n = re.subn(r"  // ---------- mapa interactivo ----------.*?(  // ---------- clientes ----------)", lambda m: ESTADIO_JS_PANTALLA + m.group(1), js, count=1, flags=re.S); assert n == 1
    return cuerpo, css, js

def estadio():
    cuerpo, _, _ = estadio_partes()
    return pagina('estadio-corregidora-queretaro', 'Pantalla gigante en el Estadio Corregidora · 5 × 20 m | Mediamaster',
                  'Anúnciate en la pantalla gigante de 5 × 20 m del Estadio Corregidora en Querétaro, frente a más de 30 mil aficionados por partido.',
                  'estadio-pantalla.webp', cuerpo + contacto('Estadio'))

# --------------------------------------------------------------------- AVISO DE PRIVACIDAD
def aviso():
    sec = [
        ('Responsable de tus datos', 'Mediamaster (“Mediamaster”, “nosotros”), con domicilio en %s, es responsable del uso y protección de tus datos personales, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.' % DIRECCION),
        ('Datos que recabamos', 'A través de este sitio, WhatsApp, correo o teléfono podemos recabar: nombre, correo electrónico, teléfono, empresa y la información que nos compartas sobre tu campaña. No recabamos datos personales sensibles.'),
        ('Para qué usamos tus datos', 'Finalidades necesarias: responder a tus solicitudes, elaborar cotizaciones y propuestas, y dar seguimiento a los servicios contratados. Finalidades adicionales: enviarte novedades, nuevas ubicaciones y promociones. Si no deseas que tus datos se usen para las finalidades adicionales, escríbenos al correo indicado abajo.'),
        ('Con quién compartimos tus datos', 'No vendemos ni compartimos tus datos personales con terceros, salvo con proveedores que nos ayudan a prestar el servicio (por ejemplo, alojamiento del sitio o correo electrónico) y en los casos que exija la ley.'),
        ('Derechos ARCO', 'Puedes Acceder, Rectificar, Cancelar u Oponerte al uso de tus datos, así como revocar tu consentimiento, enviando una solicitud a %s con tu nombre, el derecho que deseas ejercer y una identificación. Te responderemos en un plazo máximo de 20 días hábiles.' % CORREO),
        ('Cookies y tecnologías similares', 'Este sitio no usa cookies propias de rastreo. Al cargar videos de YouTube o mapas de Google, estos servicios pueden usar sus propias cookies conforme a sus políticas de privacidad.'),
        ('Cambios a este aviso', 'Cualquier cambio a este aviso de privacidad se publicará en esta misma página.'),
    ]
    cuerpo = '''<section class="phero phero--min"><div class="phero__bg"><img src="assets/img/queretaro-noche.webp" alt=""></div>
<div class="wrap phero__in"><nav class="crumbs" aria-label="Ruta"><a href="./">Inicio</a><i></i><span class="y">Aviso de privacidad</span></nav><h1>Aviso de <em>privacidad</em></h1>
<p class="lead">Última actualización: noviembre de 2026.</p></div></section>
<section class="sec sec--tight"><div class="wrap legal">%s</div></section>''' % ''.join('<h2>%s</h2><p>%s</p>' % (E(t), E(x)) for t, x in sec)
    return pagina('aviso-de-privacidad', 'Aviso de privacidad | Mediamaster', 'Aviso de privacidad de Mediamaster: cómo recabamos, usamos y protegemos tus datos personales.', 'queretaro-noche.webp', cuerpo)

# --------------------------------------------------------------------- 404
def no_encontrada():
    cuerpo = '''<section class="phero" style="align-items:center"><div class="phero__bg"><img src="assets/img/queretaro-noche.webp" alt=""></div>
<div class="wrap phero__in"><span class="kicker">Error 404</span><h1>Esta página <em>no existe</em></h1><p class="lead">Pero tu marca sí puede estar en todas partes.</p>
<div class="btns"><a class="btn btn--pk" href="./">Ir al inicio %s</a><a class="btn btn--gh" href="./#servicios">Ver medios</a></div></div></section>''' % ico('flecha')
    return pagina('404', 'Página no encontrada | Mediamaster', 'La página que buscas no existe.', 'queretaro-noche.webp', cuerpo).replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="/">\n<meta name="robots" content="noindex">')

# --------------------------------------------------------------------- construir
def main():
    css = leer('site-base.css') + leer('site-pages.css') + '\n/* ---------- espectacular LED (home) ---------- */\n' + leer('billboard.css') + \
          '\n/* ---------- carrusel de tótem (home) ---------- */\n' + leer('totem.css') + leer('extra.css')
    _, est_css, est_js = estadio_partes()
    css += '\n/* ---------- página de estadio ---------- */\n' + est_css
    js = leer('site-base.js') + '\n/* ---------- espectacular LED ---------- */\n' + leer('billboard.js') + '\n/* ---------- carrusel de tótem ---------- */\n' + leer('totem.js') + \
         '\n/* ---------- página de estadio ---------- */\n' + est_js
    with open(os.path.join(SALIDA, 'assets/css/site.css'), 'w', encoding='utf-8') as f: f.write(css)
    with open(os.path.join(SALIDA, 'assets/js/site.js'), 'w', encoding='utf-8') as f: f.write(js)
    paginas = {'index': home(), 'estadio-corregidora-queretaro': estadio(), 'aviso-de-privacidad': aviso(), '404': no_encontrada()}
    for d in paginas_medios():
        paginas[d['slug']] = pagina_medio(d)
    for d in paginas_aeropuertos():
        paginas[d['slug']] = pagina_aeropuerto(d)
    # versión según el contenido: cada cambio de CSS/JS genera una URL nueva y el navegador no usa la copia vieja
    import hashlib
    v = hashlib.md5((css + js).encode('utf-8')).hexdigest()[:10]
    for slug, h in paginas.items():
        h = h.replace('assets/css/site.css"', 'assets/css/site.css?v=%s"' % v).replace('assets/js/site.js"', 'assets/js/site.js?v=%s"' % v)
        with open(os.path.join(SALIDA, slug + '.html'), 'w', encoding='utf-8') as f: f.write(h)
    urls = ''.join('<url><loc>%s%s</loc></url>' % (DOMINIO, '/' if s == 'index' else '/' + s) for s in paginas if s != '404')
    with open(os.path.join(SALIDA, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">%s</urlset>\n' % urls)
    print('Listo:', len(paginas), 'páginas en', os.path.normpath(SALIDA))

if __name__ == '__main__':
    main()
