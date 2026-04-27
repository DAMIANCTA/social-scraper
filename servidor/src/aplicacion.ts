import cors from 'cors';
import express from 'express';
import { variablesEntorno } from './configuracion/variablesEntorno.js';
import { rutasPublicaciones } from './rutas/rutasPublicaciones.js';
import {
  manejarErroresHttp,
  manejarRutaNoEncontrada,
} from './utilidades/manejadoresHttp.js';
import { registrarInfo } from './utilidades/registro.js';

function construirOrigenesPermitidos(): Set<string> {
  const origenesConfigurados = variablesEntorno.origenCliente
    .split(',')
    .map((valor) => valor.trim())
    .filter(Boolean);

  return new Set<string>([
    ...origenesConfigurados,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);
}

function esOrigenLocalPermitido(origen: string): boolean {
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origen);
}

export function crearAplicacion() {
  const aplicacion = express();
  const origenesPermitidos = construirOrigenesPermitidos();

  aplicacion.use((solicitud, respuesta, siguiente) => {
    const inicio = Date.now();

    respuesta.on('finish', () => {
      const duracionMs = Date.now() - inicio;
      registrarInfo(
        'http',
        `${solicitud.method} ${solicitud.originalUrl} -> ${respuesta.statusCode} (${duracionMs} ms)`,
      );
    });

    siguiente();
  });

  aplicacion.use(
    cors({
      origin(origen, callback) {
        if (
          !origen ||
          origenesPermitidos.has(origen) ||
          esOrigenLocalPermitido(origen)
        ) {
          callback(null, true);
          return;
        }

        callback(
          new Error(
            `Origen no permitido por CORS para bitacora-publicaciones: ${origen}`,
          ),
        );
      },
      optionsSuccessStatus: 200,
    }),
  );
  aplicacion.use(express.json());

  aplicacion.get('/', (_solicitud, respuesta) => {
    respuesta.json({
      servicio: 'bitacora-publicaciones-servidor',
      estado: 'activo',
    });
  });

  aplicacion.get('/favicon.ico', (_solicitud, respuesta) => {
    respuesta.status(204).end();
  });

  aplicacion.get('/api/salud', (_solicitud, respuesta) => {
    respuesta.json({
      servicio: 'bitacora-publicaciones-servidor',
      estado: 'ok',
    });
  });

  aplicacion.use('/api', rutasPublicaciones);
  aplicacion.use(manejarRutaNoEncontrada);
  aplicacion.use(manejarErroresHttp);

  return aplicacion;
}
