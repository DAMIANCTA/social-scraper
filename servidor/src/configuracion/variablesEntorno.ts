import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const directorioActual = dirname(fileURLToPath(import.meta.url));
const raizProyecto = resolve(directorioActual, '../../../');
const raizServidor = resolve(directorioActual, '../..');

dotenv.config({
  path: resolve(raizProyecto, '.env'),
});

function obtenerNumero(valor: string | undefined, valorPorDefecto: number) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : valorPorDefecto;
}

function obtenerBooleano(
  valor: string | undefined,
  valorPorDefecto: boolean,
) {
  if (valor === undefined) {
    return valorPorDefecto;
  }

  return valor.toLowerCase() === 'true';
}

function resolverRutaEnServidor(
  valor: string | undefined,
  valorPorDefecto: string,
) {
  return resolve(raizServidor, valor ?? valorPorDefecto);
}

export const variablesEntorno = {
  puertoServidor: obtenerNumero(process.env.PUERTO_SERVIDOR, 4000),
  origenCliente: process.env.ORIGEN_CLIENTE ?? 'http://localhost:5173',
  playwrightHeadless: obtenerBooleano(process.env.PLAYWRIGHT_HEADLESS, true),
  playwrightTimeoutMs: obtenerNumero(process.env.PLAYWRIGHT_TIMEOUT_MS, 30000),
  instagramUrlBase: process.env.INSTAGRAM_URL_BASE ?? 'https://www.instagram.com/',
  playwrightStorageStatePath: resolverRutaEnServidor(
    process.env.PLAYWRIGHT_STORAGE_STATE_PATH,
    'almacenamiento/sesion/estado-sesion.json',
  ),
  capturasHabilitadas: obtenerBooleano(
    process.env.CAPTURAS_HABILITADAS,
    true,
  ),
  rutaCapturas: resolverRutaEnServidor(
    process.env.RUTA_CAPTURAS,
    'almacenamiento/capturas',
  ),
  rutaExportaciones: resolverRutaEnServidor(
    process.env.RUTA_EXPORTACIONES,
    'almacenamiento/exportaciones',
  ),
  rutaHistorial: resolverRutaEnServidor(
    process.env.RUTA_HISTORIAL,
    'almacenamiento/historial',
  ),
} as const;
