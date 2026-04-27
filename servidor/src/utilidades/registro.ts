import { inspect } from 'node:util';

type NivelRegistro = 'INFO' | 'WARN' | 'ERROR' | 'OK';

function serializarDetalles(detalles: unknown) {
  if (detalles === undefined) {
    return '';
  }

  return `\n${inspect(detalles, {
    depth: 4,
    colors: false,
    compact: false,
  })}`;
}

function registrar(
  nivel: NivelRegistro,
  origen: string,
  mensaje: string,
  detalles?: unknown,
) {
  const marcaTiempo = new Date().toISOString();
  const salida = `[${marcaTiempo}] [${nivel}] [${origen}] ${mensaje}${serializarDetalles(detalles)}`;
  const metodo = nivel === 'ERROR' ? console.error : console.log;
  metodo(salida);
}

export function registrarInfo(
  origen: string,
  mensaje: string,
  detalles?: unknown,
) {
  registrar('INFO', origen, mensaje, detalles);
}

export function registrarAdvertencia(
  origen: string,
  mensaje: string,
  detalles?: unknown,
) {
  registrar('WARN', origen, mensaje, detalles);
}

export function registrarOperacion(
  origen: string,
  mensaje: string,
  detalles?: unknown,
) {
  registrar('OK', origen, mensaje, detalles);
}

export function registrarError(
  origen: string,
  mensaje: string,
  detalles?: unknown,
) {
  registrar('ERROR', origen, mensaje, detalles);
}
