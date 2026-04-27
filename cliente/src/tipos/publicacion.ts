export interface PublicacionInstagram {
  indice: number;
  urlPublicacion: string;
  codigoCorto: string;
  resumenTexto: string | null;
  tipoMedio: 'imagen' | 'video' | 'carrusel' | 'reel' | 'desconocido';
  fechaPublicacion: string | null;
  urlMiniatura: string | null;
}

export interface RespuestaConsultaPublicaciones {
  usernameConsultado: string;
  cantidadSolicitada: number;
  cantidadPublicacionesObtenidas: number;
  publicaciones: PublicacionInstagram[];
  extractorUsado: string;
  origenExtraccion: 'cuadricula' | 'metadatos';
  estadoSesion: 'disponible' | 'ausente';
  mensaje: string;
  observaciones: string[];
  generadoEn: string;
  tiempoTotalMs: number;
  comparacionAnterior: {
    existeConsultaAnterior: boolean;
    cantidadPublicacionesNuevas: number;
    publicacionesNuevas: PublicacionInstagram[];
    rutaConsultaAnterior: string | null;
  };
  evidencias: {
    capturaPerfil: string | null;
  };
  exportaciones: {
    json: string;
    csv: string;
  };
  historial: {
    rutaConsultaActual: string;
    rutaConsultaAnterior: string | null;
  };
}
