export const parametrosAplicacion = {
  publicaciones: {
    cantidadPredeterminada: 10,
    cantidadMaxima: 10,
  },
  instagram: {
    esperaCargaSuaveMs: 1200,
    esperaEstructuraPerfilMs: 8000,
    desplazamientoInicialPx: 1200,
    esperaPostDesplazamientoMs: 900,
    esperaDetallePublicacionMs: 8000,
    concurrenciaDetalles: 3,
  },
} as const;
