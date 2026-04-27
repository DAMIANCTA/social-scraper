import type {
  ContextoExtraccionPublicaciones,
  ResultadoExtraccionPublicaciones,
} from '../tipos/publicaciones.js';

export interface EstrategiaExtraccionPublicaciones {
  readonly nombreExtractor: string;
  extraer(
    contexto: ContextoExtraccionPublicaciones,
  ): Promise<ResultadoExtraccionPublicaciones>;
}
