# Sitio Mediamaster (código, sin WordPress)

## Qué subir al hosting
Sube **todo el contenido de la carpeta `sitio/`** a `public_html` en Hostinger (incluido el archivo oculto `.htaccess`).

```
sitio/
├── index.html                       Inicio
├── pantallas-digitales-queretaro.html / -puebla.html
├── totems-queretaro.html / -puebla.html
├── espectaculares-queretaro.html / -puebla.html
├── aeropuerto-aiq.html / aeropuerto-aicm.html
├── estadio-corregidora-queretaro.html
├── 404.html, sitemap.xml, robots.txt, favicon.png, .htaccess
└── assets/
    ├── css/site.css     ← un solo archivo de estilos
    ├── js/site.js       ← un solo archivo de JavaScript
    ├── img/             ← imágenes WebP optimizadas
    └── video/           ← videos comprimidos
```

`.htaccess` quita el `.html` de las direcciones (`/totems-queretaro`), fuerza HTTPS,
redirige las direcciones del WordPress anterior y activa compresión y caché.

## Cómo cambiar textos
Los textos de todas las páginas están en `fuente-sitio/build.py`. Edita y corre:

```
python3 fuente-sitio/build.py
```

Esto vuelve a generar `sitio/` (HTML, `site.css` y `site.js`). Los estilos y scripts base
están en `fuente-sitio/partes/`.

## Formulario de contacto
No necesita servidor: al enviarlo abre WhatsApp (442 158 9486) con el mensaje listo.
También ofrece la opción de enviarlo por correo a coordinacionventas@mediamaster.mx.
