export const configuracionCliente = {
  urlBaseApi: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000',
  historial: {
    claveAlmacenamiento: 'bitacora-publicaciones.historial-reciente',
    limiteConsultasRecientes: 6,
  },
  interfaz: {
    duracionMensajeCopiaMs: 2200,
  },
  publicaciones: {
    cantidadMaxima: 10,
  },
} as const;
