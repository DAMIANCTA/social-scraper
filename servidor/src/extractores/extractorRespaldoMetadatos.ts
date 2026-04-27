import type { EstrategiaExtraccionPublicaciones } from './estrategiaExtraccionPublicaciones.js';
import type {
  ContextoExtraccionPublicaciones,
  PublicacionRecienteInstagram,
  ResultadoExtraccionPublicaciones,
} from '../tipos/publicaciones.js';
import {
  extraerEnlacesDesdeHtml,
  obtenerDiagnosticoPerfil,
} from './navegacionPerfilInstagram.js';
import { enriquecerColeccionPublicaciones } from './analizadorDetalleInstagram.js';
import { abrirPaginaPerfil } from './navegacionPerfilInstagram.js';
import { registrarInfo } from '../utilidades/registro.js';

export class ExtractorRespaldoMetadatos
  implements EstrategiaExtraccionPublicaciones
{
  readonly nombreExtractor = 'ExtractorRespaldoMetadatos';

  async extraer(
    contexto: ContextoExtraccionPublicaciones,
  ): Promise<ResultadoExtraccionPublicaciones> {
    const paginaPerfil = await abrirPaginaPerfil(contexto);

    try {
      const candidatas = await extraerEnlacesDesdeHtml(
        paginaPerfil,
        contexto.cantidad,
      );
      const diagnosticoPerfil = await obtenerDiagnosticoPerfil(paginaPerfil);
      const publicaciones: PublicacionRecienteInstagram[] =
        await enriquecerColeccionPublicaciones(
          contexto.contextoNavegacion,
          candidatas.slice(0, contexto.cantidad),
        );

      registrarInfo(
        'extractor',
        `El extractor ${this.nombreExtractor} detecto ${candidatas.length} candidatas para @${contexto.usuario}.`,
        {
          urlActual: diagnosticoPerfil.urlActual,
          titulo: diagnosticoPerfil.titulo,
          cantidadEnlacesPublicaciones:
            diagnosticoPerfil.cantidadEnlacesPublicaciones,
        },
      );

      return {
        nombreExtractor: this.nombreExtractor,
        origen: 'metadatos',
        publicaciones,
        observaciones:
          candidatas.length > 0
            ? [
                `Extractor de respaldo ejecutado leyendo metadatos y enlaces del HTML del perfil de @${contexto.usuario}.`,
              ]
            : [
                `Extractor de respaldo sin coincidencias reutilizables para @${contexto.usuario}.`,
                `Diagnostico rapido: titulo="${diagnosticoPerfil.titulo}", enlacesDetectados=${diagnosticoPerfil.cantidadEnlacesPublicaciones}, url="${diagnosticoPerfil.urlActual}".`,
              ],
      };
    } finally {
      await paginaPerfil.close().catch(() => undefined);
    }
  }
}
