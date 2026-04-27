import { GeneradorEvidencias } from '../evidencias/generadorEvidencias.js';
import { ExtractorCuadriculaPerfil } from '../extractores/extractorCuadriculaPerfil.js';
import type { EstrategiaExtraccionPublicaciones } from '../extractores/estrategiaExtraccionPublicaciones.js';
import { ExtractorRespaldoMetadatos } from '../extractores/extractorRespaldoMetadatos.js';
import { NormalizadorPublicaciones } from '../normalizadores/normalizadorPublicaciones.js';
import { GestorSesion } from '../sesion/gestorSesion.js';
import { ComparadorConsultas } from './comparadorConsultas.js';
import { ExportadorResultados } from './exportadorResultados.js';
import { HistorialConsultas } from './historialConsultas.js';
import type {
  ContextoExtraccionPublicaciones,
  RegistroConsultaHistorial,
  RespuestaConsultaPublicaciones,
  ResultadoExtraccionPublicaciones,
  SolicitudConsultaPublicaciones,
} from '../tipos/publicaciones.js';
import {
  ErrorAplicacion,
  ErrorCuentaNoEncontrada,
  ErrorCuentaPrivada,
  ErrorSinResultados,
  esErrorAplicacion,
} from '../utilidades/errores.js';
import {
  registrarAdvertencia,
  registrarError,
  registrarInfo,
  registrarOperacion,
} from '../utilidades/registro.js';
import {
  normalizarUsernameInstagram,
  validarCantidadConsulta,
} from '../utilidades/validaciones.js';

export class OrquestadorConsulta {
  private readonly estrategiasExtraccion: EstrategiaExtraccionPublicaciones[];

  constructor(
    private readonly gestorSesion = new GestorSesion(),
    private readonly extractorCuadriculaPerfil = new ExtractorCuadriculaPerfil(),
    private readonly extractorRespaldoMetadatos =
      new ExtractorRespaldoMetadatos(),
    private readonly normalizadorPublicaciones =
      new NormalizadorPublicaciones(),
    private readonly generadorEvidencias = new GeneradorEvidencias(),
    private readonly historialConsultas = new HistorialConsultas(),
    private readonly exportadorResultados = new ExportadorResultados(),
    private readonly comparadorConsultas = new ComparadorConsultas(),
  ) {
    this.estrategiasExtraccion = [
      this.extractorCuadriculaPerfil,
      this.extractorRespaldoMetadatos,
    ];
  }

  async consultarPublicacionesRecientes(
    solicitud: SolicitudConsultaPublicaciones,
  ): Promise<RespuestaConsultaPublicaciones> {
    const inicioProceso = Date.now();
    const usuario = normalizarUsernameInstagram(solicitud.usuario);
    const cantidad = validarCantidadConsulta(solicitud.cantidad);
    const diagnosticoSesion =
      await this.gestorSesion.asegurarSesionReutilizable();
    const momentoConsulta = new Date().toISOString();
    let sesionActiva:
      | Awaited<ReturnType<GestorSesion['abrirSesionReutilizable']>>
      | undefined;

    registrarInfo(
      'consulta',
      `Iniciando consulta de publicaciones para @${usuario}.`,
      {
        cantidad,
        sesion: diagnosticoSesion,
      },
    );

    await this.generadorEvidencias.registrarHuellaConsulta({
      usuario,
      cantidad,
      sesionDisponible: true,
      momento: momentoConsulta,
    });

    try {
      sesionActiva = await this.gestorSesion.abrirSesionReutilizable();
      const contextoExtraccion: ContextoExtraccionPublicaciones = {
        usuario,
        cantidad,
        sesionDisponible: true,
        rutaEstadoSesion: this.gestorSesion.obtenerRutaEstadoSesion(),
        contextoNavegacion: sesionActiva.contexto,
      };
      const resultadoFinal =
        await this.ejecutarEstrategiasExtraccion(contextoExtraccion);

      const publicacionesNormalizadas =
        this.normalizadorPublicaciones.normalizarColeccion(
          resultadoFinal.publicaciones,
          cantidad,
        );
      const capturaPerfil = await this.capturarPerfilConsultado(
        sesionActiva.contexto,
        usuario,
        momentoConsulta,
      );
      await this.validarPublicacionesExtraidas(
        publicacionesNormalizadas.length,
        usuario,
      );
      const consultaAnterior =
        await this.historialConsultas.obtenerConsultaAnterior(usuario);
      const comparacionAnterior =
        this.comparadorConsultas.compararConAnterior(
          publicacionesNormalizadas,
          consultaAnterior,
        );
      const tiempoTotalMs = Date.now() - inicioProceso;
      const resultadoBase: RegistroConsultaHistorial = {
        usernameConsultado: usuario,
        cantidadSolicitada: cantidad,
        cantidadPublicacionesObtenidas: publicacionesNormalizadas.length,
        publicaciones: publicacionesNormalizadas,
        extractorUsado: resultadoFinal.nombreExtractor,
        origenExtraccion: resultadoFinal.origen,
        estadoSesion: 'disponible',
        mensaje: this.construirMensaje(
          usuario,
          publicacionesNormalizadas.length,
          comparacionAnterior.cantidadPublicacionesNuevas,
          comparacionAnterior.existeConsultaAnterior,
        ),
        observaciones: resultadoFinal.observaciones,
        generadoEn: momentoConsulta,
        tiempoTotalMs,
        comparacionAnterior,
        evidencias: {
          capturaPerfil,
        },
      };
      const exportaciones =
        await this.exportadorResultados.exportarConsulta(resultadoBase);
      const rutaConsultaActual =
        await this.historialConsultas.guardarConsulta(resultadoBase);

      registrarOperacion(
        'consulta',
        `Consulta finalizada para @${usuario} con ${publicacionesNormalizadas.length} publicaciones usando ${resultadoFinal.nombreExtractor}.`,
        {
          tiempoTotalMs,
          cantidadPublicacionesNuevas:
            comparacionAnterior.cantidadPublicacionesNuevas,
        },
      );

      return {
        ...resultadoBase,
        exportaciones,
        historial: {
          rutaConsultaActual,
          rutaConsultaAnterior: comparacionAnterior.rutaConsultaAnterior,
        },
      };
    } catch (error) {
      registrarError(
        'consulta',
        `Fallo la consulta de publicaciones para @${usuario}.`,
        error,
      );

      if (esErrorAplicacion(error)) {
        throw error;
      }

      throw new ErrorAplicacion({
        codigo: 'CONSULTA_PUBLICACIONES_FALLIDA',
        mensaje: 'No fue posible completar la consulta de publicaciones.',
        estadoHttp: 500,
        detalles: error,
      });
    } finally {
      await this.gestorSesion.cerrarSesion(sesionActiva);
    }
  }

  private construirMensaje(
    usuario: string,
    cantidadObtenida: number,
    cantidadPublicacionesNuevas: number,
    existeConsultaAnterior: boolean,
  ): string {
    if (!existeConsultaAnterior) {
      return `La consulta de @${usuario} devolvio ${cantidadObtenida} publicaciones y quedo guardada como referencia inicial.`;
    }

    if (cantidadPublicacionesNuevas > 0) {
      return `La consulta de @${usuario} devolvio ${cantidadObtenida} publicaciones y detecto ${cantidadPublicacionesNuevas} publicaciones nuevas respecto a la consulta anterior.`;
    }

    return `La consulta base para @${usuario} devolvio ${cantidadObtenida} publicaciones resumidas.`;
  }

  private async capturarPerfilConsultado(
    contextoNavegacion: ContextoExtraccionPublicaciones['contextoNavegacion'],
    usuario: string,
    momentoConsulta: string,
  ): Promise<string | null> {
    const paginaCaptura = await contextoNavegacion.newPage();

    try {
      return await this.generadorEvidencias.capturarPerfilConsultado(
        paginaCaptura,
        usuario,
        momentoConsulta,
      );
    } finally {
      await paginaCaptura.close().catch(() => undefined);
    }
  }

  private async ejecutarEstrategiasExtraccion(
    contexto: ContextoExtraccionPublicaciones,
  ): Promise<ResultadoExtraccionPublicaciones> {
    const observacionesAcumuladas: string[] = [];

    for (const estrategia of this.estrategiasExtraccion) {
      try {
        registrarInfo(
          'consulta',
          `Intentando extraccion con ${estrategia.nombreExtractor}.`,
        );

        const resultado = await estrategia.extraer(contexto);
        observacionesAcumuladas.push(...resultado.observaciones);

        if (resultado.publicaciones.length > 0) {
          return {
            ...resultado,
            observaciones: observacionesAcumuladas,
          };
        }
      } catch (error) {
        if (this.esErrorTerminalExtraccion(error)) {
          throw error;
        }

        registrarAdvertencia(
          'consulta',
          `El extractor ${estrategia.nombreExtractor} fallo y se intentara el siguiente.`,
          error,
        );
        observacionesAcumuladas.push(
          `El extractor ${estrategia.nombreExtractor} no produjo resultados reutilizables.`,
        );
      }
    }

    throw new ErrorSinResultados(
      `No se encontraron publicaciones visibles para @${contexto.usuario}.`,
      {
        usuario: contexto.usuario,
      },
    );
  }

  private esErrorTerminalExtraccion(error: unknown): boolean {
    return (
      error instanceof ErrorCuentaNoEncontrada ||
      error instanceof ErrorCuentaPrivada
    );
  }

  private async validarPublicacionesExtraidas(
    cantidadObtenida: number,
    usuario: string,
  ): Promise<void> {
    if (cantidadObtenida === 0) {
      throw new ErrorSinResultados(
        `No se encontraron publicaciones visibles para @${usuario}.`,
        {
          usuario,
        },
      );
    }
  }
}
