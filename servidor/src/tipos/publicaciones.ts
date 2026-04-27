import type { BrowserContext } from 'playwright';

export type TipoMedioInstagram =
  | 'imagen'
  | 'video'
  | 'carrusel'
  | 'reel'
  | 'desconocido';

export type OrigenExtraccion = 'cuadricula' | 'metadatos';

export type EstadoSesionConsulta = 'disponible' | 'ausente';

export interface PublicacionRecienteInstagram {
  indice: number;
  urlPublicacion: string;
  codigoCorto: string;
  resumenTexto: string | null;
  tipoMedio: TipoMedioInstagram;
  fechaPublicacion: string | null;
  urlMiniatura: string | null;
}

export interface CandidatoPublicacion {
  urlPublicacion: string;
  codigoCorto: string;
  resumenTexto: string | null;
  tipoMedio: TipoMedioInstagram;
  fechaPublicacion: string | null;
  urlMiniatura: string | null;
}

export interface SolicitudConsultaPublicaciones {
  usuario: string;
  cantidad: number;
}

export interface ContextoExtraccionPublicaciones {
  usuario: string;
  cantidad: number;
  sesionDisponible: boolean;
  rutaEstadoSesion: string;
  contextoNavegacion: BrowserContext;
}

export interface ResultadoExtraccionPublicaciones {
  nombreExtractor: string;
  origen: OrigenExtraccion;
  publicaciones: PublicacionRecienteInstagram[];
  observaciones: string[];
}

export interface ResultadoComparacionConsultas {
  existeConsultaAnterior: boolean;
  cantidadPublicacionesNuevas: number;
  publicacionesNuevas: PublicacionRecienteInstagram[];
  rutaConsultaAnterior: string | null;
}

export interface RutasExportacionConsulta {
  json: string;
  csv: string;
}

export interface MetadatosHistorialConsulta {
  rutaConsultaActual: string;
  rutaConsultaAnterior: string | null;
}

export interface EvidenciasConsulta {
  capturaPerfil: string | null;
}

export interface ResultadoConsultaBase {
  usernameConsultado: string;
  cantidadSolicitada: number;
  cantidadPublicacionesObtenidas: number;
  publicaciones: PublicacionRecienteInstagram[];
  extractorUsado: string;
  origenExtraccion: OrigenExtraccion;
  estadoSesion: EstadoSesionConsulta;
  mensaje: string;
  observaciones: string[];
  generadoEn: string;
  tiempoTotalMs: number;
  comparacionAnterior: ResultadoComparacionConsultas;
  evidencias: EvidenciasConsulta;
}

export interface RegistroConsultaHistorial extends ResultadoConsultaBase {}

export interface RespuestaConsultaPublicaciones extends ResultadoConsultaBase {
  exportaciones: RutasExportacionConsulta;
  historial: MetadatosHistorialConsulta;
}
