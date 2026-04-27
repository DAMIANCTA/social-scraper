import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Page } from 'playwright';
import { parametrosAplicacion } from '../configuracion/parametrosAplicacion.js';
import { configuracionPlaywright } from '../configuracion/playwright.js';
import { variablesEntorno } from '../configuracion/variablesEntorno.js';
import { registrarAdvertencia, registrarInfo } from '../utilidades/registro.js';

type HuellaConsulta = {
  usuario: string;
  cantidad: number;
  sesionDisponible: boolean;
  momento: string;
};

export class GeneradorEvidencias {
  async prepararDirectorios(): Promise<void> {
    await Promise.all([
      mkdir(variablesEntorno.rutaCapturas, { recursive: true }),
      mkdir(variablesEntorno.rutaExportaciones, { recursive: true }),
      mkdir(variablesEntorno.rutaHistorial, { recursive: true }),
    ]);
  }

  async registrarHuellaConsulta(huella: HuellaConsulta): Promise<void> {
    try {
      await this.prepararDirectorios();

      const nombreArchivo = [
        'huella',
        huella.usuario,
        this.formatearMarcaTiempo(huella.momento),
      ].join('_');

      const rutaArchivo = join(
        variablesEntorno.rutaHistorial,
        `${nombreArchivo}.json`,
      );

      await writeFile(rutaArchivo, JSON.stringify(huella, null, 2), 'utf8');
    } catch (error) {
      registrarAdvertencia(
        'evidencias',
        'No fue posible registrar la huella de la consulta.',
        error,
      );
    }
  }

  async capturarPerfilConsultado(
    pagina: Page,
    usuario: string,
    momento: string,
  ): Promise<string | null> {
    if (!variablesEntorno.capturasHabilitadas) {
      return null;
    }

    try {
      await this.prepararDirectorios();

      const rutaArchivo = join(
        variablesEntorno.rutaCapturas,
        [
          'perfil',
          usuario,
          this.formatearMarcaTiempo(momento),
        ].join('_') + '.png',
      );

      await pagina.goto(
        new URL(`/${usuario}/`, configuracionPlaywright.instagramUrlBase).toString(),
        {
          waitUntil: 'domcontentloaded',
        },
      );
      await pagina.waitForTimeout(parametrosAplicacion.instagram.esperaCargaSuaveMs);
      await pagina.screenshot({
        path: rutaArchivo,
        fullPage: true,
      });

      registrarInfo(
        'evidencias',
        `Captura del perfil de @${usuario} guardada correctamente.`,
        {
          rutaArchivo,
        },
      );

      return rutaArchivo;
    } catch (error) {
      registrarAdvertencia(
        'evidencias',
        `No fue posible capturar el perfil de @${usuario}.`,
        error,
      );
      return null;
    }
  }

  private formatearMarcaTiempo(momento: string): string {
    return momento.replaceAll(':', '-').replaceAll('.', '-');
  }
}
