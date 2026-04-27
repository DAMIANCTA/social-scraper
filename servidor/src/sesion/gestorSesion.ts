import { constants } from 'node:fs';
import { access, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
  chromium,
  type Browser,
  type BrowserContext,
} from 'playwright';
import { configuracionPlaywright } from '../configuracion/playwright.js';
import type { DiagnosticoSesion } from '../tipos/sesion.js';
import {
  ErrorSesionExpirada,
  ErrorSesionInvalida,
  ErrorSesionNoDisponible,
} from '../utilidades/errores.js';
import { registrarInfo } from '../utilidades/registro.js';

export type SesionNavegacion = {
  navegador: Browser;
  contexto: BrowserContext;
};

type CookieSesionPlaywright = {
  domain: string;
  expires: number;
};

type EstadoSesionPlaywright = {
  cookies: CookieSesionPlaywright[];
  origins: unknown[];
};

export class GestorSesion {
  obtenerRutaEstadoSesion(): string {
    return configuracionPlaywright.rutaEstadoSesion;
  }

  async existeArchivoEstadoSesion(): Promise<boolean> {
    try {
      await access(this.obtenerRutaEstadoSesion(), constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async obtenerDiagnosticoSesion(): Promise<DiagnosticoSesion> {
    const rutaArchivo = this.obtenerRutaEstadoSesion();
    const existeArchivo = await this.existeArchivoEstadoSesion();

    if (!existeArchivo) {
      return {
        rutaArchivo,
        existeArchivo: false,
        totalCookies: 0,
        totalCookiesInstagram: 0,
        cookiesInstagramVigentes: 0,
        origenesRegistrados: 0,
      };
    }

    const estadoSesion = await this.cargarEstadoSesion();
    const instanteActual = Math.floor(Date.now() / 1000);
    const cookies: CookieSesionPlaywright[] = Array.isArray(estadoSesion.cookies)
      ? estadoSesion.cookies
      : [];
    const cookiesInstagram = cookies.filter((cookie) =>
      cookie.domain.includes('instagram.com'),
    );
    const cookiesInstagramVigentes = cookiesInstagram.filter(
      (cookie) => cookie.expires === -1 || cookie.expires > instanteActual,
    );

    return {
      rutaArchivo,
      existeArchivo: true,
      totalCookies: cookies.length,
      totalCookiesInstagram: cookiesInstagram.length,
      cookiesInstagramVigentes: cookiesInstagramVigentes.length,
      origenesRegistrados: Array.isArray(estadoSesion.origins)
        ? estadoSesion.origins.length
        : 0,
    };
  }

  async asegurarSesionReutilizable(): Promise<DiagnosticoSesion> {
    const diagnostico = await this.obtenerDiagnosticoSesion();

    if (!diagnostico.existeArchivo) {
      throw new ErrorSesionNoDisponible(
        'No existe el archivo de sesion persistente. Ejecuta el script manual para generarlo.',
        {
          rutaArchivo: diagnostico.rutaArchivo,
        },
      );
    }

    if (diagnostico.totalCookiesInstagram === 0) {
      throw new ErrorSesionInvalida(
        'El archivo de sesion existe, pero no contiene cookies de Instagram reutilizables.',
        diagnostico,
      );
    }

    if (diagnostico.cookiesInstagramVigentes === 0) {
      throw new ErrorSesionExpirada(
        'La sesion guardada existe, pero las cookies de Instagram ya expiraron. Genera una nueva sesion manual.',
        diagnostico,
      );
    }

    return diagnostico;
  }

  async abrirSesionReutilizable(): Promise<SesionNavegacion> {
    await this.asegurarSesionReutilizable();

    const navegador = await chromium.launch({
      headless: configuracionPlaywright.headless,
    });

    const contexto = await navegador.newContext({
      storageState: this.obtenerRutaEstadoSesion(),
    });

    contexto.setDefaultTimeout(configuracionPlaywright.tiempoEsperaMs);

    try {
      await this.validarSesionCargada(contexto);
    } catch (error) {
      await this.cerrarSesion({
        navegador,
        contexto,
      });
      throw error;
    }

    return {
      navegador,
      contexto,
    };
  }

  async guardarEstadoSesion(contexto: BrowserContext): Promise<string> {
    const rutaArchivo = this.obtenerRutaEstadoSesion();

    await this.prepararDirectorioSesion();
    await contexto.storageState({ path: rutaArchivo });

    registrarInfo('sesion', 'Storage state guardado correctamente.', {
      rutaArchivo,
    });

    return rutaArchivo;
  }

  async prepararDirectorioSesion(): Promise<void> {
    await mkdir(dirname(this.obtenerRutaEstadoSesion()), { recursive: true });
  }

  async cerrarSesion(sesion: Partial<SesionNavegacion> | undefined) {
    await sesion?.contexto?.close();
    await sesion?.navegador?.close();
  }

  private async cargarEstadoSesion(): Promise<EstadoSesionPlaywright> {
    const rutaArchivo = this.obtenerRutaEstadoSesion();

    try {
      const contenido = await readFile(rutaArchivo, 'utf8');
      const estadoSesion = JSON.parse(contenido) as EstadoSesionPlaywright;

      if (
        !estadoSesion ||
        !Array.isArray(estadoSesion.cookies) ||
        !Array.isArray(estadoSesion.origins)
      ) {
        throw new ErrorSesionInvalida(
          'El archivo de sesion no tiene el formato esperado de Playwright.',
          {
            rutaArchivo,
          },
        );
      }

      return estadoSesion;
    } catch (error) {
      if (error instanceof ErrorSesionInvalida) {
        throw error;
      }

      throw new ErrorSesionInvalida(
        'No fue posible leer o interpretar el archivo de sesion persistente.',
        {
          rutaArchivo,
          causa: error,
        },
      );
    }
  }

  private async validarSesionCargada(
    contexto: BrowserContext,
  ): Promise<void> {
    const pagina = await contexto.newPage();

    try {
      await pagina.goto(configuracionPlaywright.instagramUrlBase, {
        waitUntil: 'domcontentloaded',
      });
      await pagina
        .waitForLoadState('networkidle', {
          timeout: configuracionPlaywright.tiempoEsperaMs,
        })
        .catch(() => undefined);

      const urlActual = pagina.url();

      if (
        urlActual.includes('/accounts/login') ||
        urlActual.includes('/challenge')
      ) {
        throw new ErrorSesionExpirada(
          'La sesion almacenada ya no es aceptada por Instagram. Vuelve a generarla manualmente.',
          {
            urlActual,
          },
        );
      }
    } catch (error) {
      if (error instanceof ErrorSesionExpirada) {
        throw error;
      }

      throw new ErrorSesionInvalida(
        'No fue posible validar la sesion persistente con Playwright.',
        error,
      );
    } finally {
      await pagina.close();
    }
  }
}
