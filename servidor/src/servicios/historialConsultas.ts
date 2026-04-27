import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { variablesEntorno } from '../configuracion/variablesEntorno.js';
import type { RegistroConsultaHistorial } from '../tipos/publicaciones.js';
import { registrarAdvertencia } from '../utilidades/registro.js';

type RegistroConsultaPersistido = {
  rutaArchivo: string;
  consulta: RegistroConsultaHistorial;
};

export class HistorialConsultas {
  async obtenerConsultaAnterior(
    usuario: string,
  ): Promise<RegistroConsultaPersistido | null> {
    await this.prepararDirectorio();

    const archivos = await readdir(variablesEntorno.rutaHistorial);
    const archivosConsulta = archivos
      .filter((archivo) => archivo.startsWith(`consulta_${usuario}_`))
      .sort()
      .reverse();

    for (const archivo of archivosConsulta) {
      const rutaArchivo = join(variablesEntorno.rutaHistorial, archivo);

      try {
        const contenido = await readFile(rutaArchivo, 'utf8');
        const consulta = JSON.parse(contenido) as RegistroConsultaHistorial;

        if (consulta?.usernameConsultado === usuario) {
          return {
            rutaArchivo,
            consulta,
          };
        }
      } catch (error) {
        registrarAdvertencia(
          'historial',
          `No fue posible leer el archivo de historial ${rutaArchivo}.`,
          error,
        );
      }
    }

    return null;
  }

  async guardarConsulta(
    consulta: RegistroConsultaHistorial,
  ): Promise<string> {
    await this.prepararDirectorio();

    const rutaArchivo = join(
      variablesEntorno.rutaHistorial,
      [
        'consulta',
        consulta.usernameConsultado,
        this.formatearMarcaTiempo(consulta.generadoEn),
      ].join('_') + '.json',
    );

    await writeFile(rutaArchivo, JSON.stringify(consulta, null, 2), 'utf8');

    return rutaArchivo;
  }

  private async prepararDirectorio(): Promise<void> {
    await mkdir(variablesEntorno.rutaHistorial, { recursive: true });
  }

  private formatearMarcaTiempo(momento: string): string {
    return momento.replaceAll(':', '-').replaceAll('.', '-');
  }
}
