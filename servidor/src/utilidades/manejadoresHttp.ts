import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
import { ErrorAplicacion, esErrorAplicacion } from './errores.js';
import { registrarError } from './registro.js';

export function manejarRutaNoEncontrada(
  solicitud: Request,
  respuesta: Response,
) {
  return respuesta.status(404).json({
    codigo: 'RUTA_NO_ENCONTRADA',
    mensaje: `No existe la ruta ${solicitud.method} ${solicitud.originalUrl}.`,
  });
}

export const manejarErroresHttp: ErrorRequestHandler = (
  error: unknown,
  solicitud: Request,
  respuesta: Response,
  _siguiente: NextFunction,
) => {
  const errorNormalizado = esErrorAplicacion(error)
    ? error
    : new ErrorAplicacion({
        codigo: 'ERROR_INTERNO',
        mensaje: 'Ocurrio un error interno no controlado.',
        estadoHttp: 500,
        detalles: error,
      });

  registrarError(
    'http',
    `${solicitud.method} ${solicitud.originalUrl} -> ${errorNormalizado.estadoHttp}`,
    {
      codigo: errorNormalizado.codigo,
      mensaje: errorNormalizado.message,
      detalles: errorNormalizado.detalles,
    },
  );

  return respuesta.status(errorNormalizado.estadoHttp).json({
    codigo: errorNormalizado.codigo,
    mensaje: errorNormalizado.message,
  });
};
