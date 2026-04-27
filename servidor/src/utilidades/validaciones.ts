import { parametrosAplicacion } from '../configuracion/parametrosAplicacion.js';
import { ErrorValidacion } from './errores.js';

const EXPRESION_USUARIO_INSTAGRAM =
  /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/;

export function normalizarUsernameInstagram(username: string): string {
  const usernameNormalizado = username.trim().replace(/^@/, '');

  if (!usernameNormalizado) {
    throw new ErrorValidacion(
      'Debes enviar un username de Instagram para consultar publicaciones.',
    );
  }

  if (!EXPRESION_USUARIO_INSTAGRAM.test(usernameNormalizado)) {
    throw new ErrorValidacion(
      'El username de Instagram no cumple el formato esperado.',
      {
        username: usernameNormalizado,
      },
    );
  }

  return usernameNormalizado;
}

export function validarCantidadConsulta(cantidad: number): number {
  if (
    !Number.isInteger(cantidad) ||
    cantidad < 1 ||
    cantidad > parametrosAplicacion.publicaciones.cantidadMaxima
  ) {
    throw new ErrorValidacion(
      `La cantidad de publicaciones debe ser un numero entero entre 1 y ${parametrosAplicacion.publicaciones.cantidadMaxima}.`,
      {
        cantidad,
      },
    );
  }

  return cantidad;
}
