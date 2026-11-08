<?php
/* =====================================================================
   MEDIAMASTER · Envío de formularios por correo
   Lo usan el formulario de contacto y la suscripción del pie de página.
   Requiere que el hosting tenga PHP con mail() (Hostinger lo incluye).
   ===================================================================== */
$DESTINO   = 'coordinacionventas@mediamaster.mx';
$REMITENTE = 'no-responder@mediamaster.mx';   // debe ser un correo del mismo dominio del sitio

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function salir($ok, $codigo = 200, $error = '') {
    http_response_code($codigo);
    echo json_encode($error ? ['ok' => $ok, 'error' => $error] : ['ok' => $ok]);
    exit;
}
function campo($k, $max = 2000) {
    $v = isset($_POST[$k]) && is_string($_POST[$k]) ? trim($_POST[$k]) : '';
    $v = str_replace(["\0", "\r"], '', $v);
    return mb_substr($v, 0, $max, 'UTF-8');
}
function linea($v) { return trim(preg_replace('/[\n\t]+/', ' ', $v)); }   // sin saltos para encabezados/asunto

if ($_SERVER['REQUEST_METHOD'] !== 'POST') salir(false, 405, 'metodo');
if (campo('sitio_web') !== '') salir(true);                               // trampa para robots

// límite simple: un envío cada 20 segundos por visitante
session_start();
if (!empty($_SESSION['mm_ultimo']) && time() - $_SESSION['mm_ultimo'] < 20) salir(false, 429, 'espera');

$tipo   = campo('tipo', 20) === 'suscripcion' ? 'suscripcion' : 'contacto';
$correo = linea(campo('correo', 200));
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) salir(false, 422, 'correo');

if ($tipo === 'suscripcion') {
    $asunto = 'Nueva suscripción · mediamaster.mx';
    $cuerpo = "Nueva suscripción a las novedades de Mediamaster.\n\nCorreo: $correo\n";
} else {
    $nombre  = linea(campo('nombre', 120));
    $mensaje = campo('mensaje', 5000);
    if ($nombre === '' || $mensaje === '') salir(false, 422, 'faltan');
    $tel     = linea(campo('telefono', 40));
    $empresa = linea(campo('empresa', 120));
    $medios  = [];
    if (isset($_POST['medio']) && is_array($_POST['medio'])) {
        foreach (array_slice($_POST['medio'], 0, 10) as $m) if (is_string($m)) $medios[] = linea(mb_substr(strip_tags($m), 0, 40, 'UTF-8'));
    }
    $asunto = 'Cotización · ' . ($empresa !== '' ? $empresa : $nombre);
    $cuerpo = "Nuevo mensaje desde mediamaster.mx\n\n"
            . "Nombre: $nombre\nCorreo: $correo\n"
            . ($tel !== '' ? "Teléfono: $tel\n" : '')
            . ($empresa !== '' ? "Empresa: $empresa\n" : '')
            . ($medios ? 'Le interesa: ' . implode(', ', $medios) . "\n" : '')
            . "\nMensaje:\n$mensaje\n";
}

$encabezados = implode("\r\n", [
    'From: Mediamaster <' . $REMITENTE . '>',
    'Reply-To: ' . $correo,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);
$ok = mail($DESTINO, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, $encabezados, '-f' . $REMITENTE);
if ($ok) $_SESSION['mm_ultimo'] = time();
salir($ok, $ok ? 200 : 500, $ok ? '' : 'envio');
