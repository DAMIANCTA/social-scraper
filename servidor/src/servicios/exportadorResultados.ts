import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { variablesEntorno } from '../configuracion/variablesEntorno.js';
import type {
  RegistroConsultaHistorial,
  RutasExportacionConsulta,
} from '../tipos/publicaciones.js';

export class ExportadorResultados {
  async exportarConsulta(
    consulta: RegistroConsultaHistorial,
  ): Promise<RutasExportacionConsulta> {
    await this.prepararDirectorio();

    const nombreBase = [
      'resultado',
      consulta.usernameConsultado,
      this.formatearMarcaTiempo(consulta.generadoEn),
    ].join('_');

    const rutaJson = join(
      variablesEntorno.rutaExportaciones,
      `${nombreBase}.json`,
    );
    const rutaCsv = join(
      variablesEntorno.rutaExportaciones,
      `${nombreBase}.csv`,
    );

    await writeFile(rutaJson, JSON.stringify(consulta, null, 2), 'utf8');
    await writeFile(rutaCsv, this.construirCsv(consulta), 'utf8');

    return {
      json: rutaJson,
      csv: rutaCsv,
    };
  }

  private async prepararDirectorio(): Promise<void> {
    await mkdir(variablesEntorno.rutaExportaciones, { recursive: true });
  }

  private construirCsv(consulta: RegistroConsultaHistorial): string {
    const encabezados = [
      'indice',
      'urlPublicacion',
      'codigoCorto',
      'resumenTexto',
      'tipoMedio',
      'fechaPublicacion',
      'urlMiniatura',
    ];

    const filas = consulta.publicaciones.map((publicacion) =>
      [
        publicacion.indice,
        publicacion.urlPublicacion,
        publicacion.codigoCorto,
        publicacion.resumenTexto ?? '',
        publicacion.tipoMedio,
        publicacion.fechaPublicacion ?? '',
        publicacion.urlMiniatura ?? '',
      ]
        .map((valor) => this.escaparValorCsv(valor))
        .join(','),
    );

    return [encabezados.join(','), ...filas].join('\n');
  }

  private escaparValorCsv(valor: string | number): string {
    const texto = String(valor).replaceAll('"', '""');
    return `"${texto}"`;
  }

  private formatearMarcaTiempo(momento: string): string {
    return momento.replaceAll(':', '-').replaceAll('.', '-');
  }
}
