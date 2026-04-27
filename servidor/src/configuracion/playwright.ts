import { variablesEntorno } from './variablesEntorno.js';

export const configuracionPlaywright = {
  headless: variablesEntorno.playwrightHeadless,
  tiempoEsperaMs: variablesEntorno.playwrightTimeoutMs,
  instagramUrlBase: variablesEntorno.instagramUrlBase,
  rutaEstadoSesion: variablesEntorno.playwrightStorageStatePath,
} as const;
