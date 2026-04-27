import type { PublicacionRecienteInstagram } from '../tipos/publicaciones.js';

export class NormalizadorPublicaciones {
  normalizarColeccion(
    publicaciones: PublicacionRecienteInstagram[],
    limite: number,
  ): PublicacionRecienteInstagram[] {
    const publicacionesUnicas = new Map<string, PublicacionRecienteInstagram>();

    for (const publicacion of publicaciones) {
      const normalizada = this.normalizar(publicacion);
      const llave =
        normalizada.codigoCorto.trim() || normalizada.urlPublicacion.trim();

      if (!llave) {
        continue;
      }

      const actual = publicacionesUnicas.get(llave);

      publicacionesUnicas.set(
        llave,
        actual ? this.seleccionarMasCompleta(actual, normalizada) : normalizada,
      );
    }

    return Array.from(publicacionesUnicas.values())
      .slice(0, limite)
      .map((publicacion, indice) => ({
        ...publicacion,
        indice: indice + 1,
      }));
  }

  private normalizar(
    publicacion: PublicacionRecienteInstagram,
  ): PublicacionRecienteInstagram {
    return {
      ...publicacion,
      indice: 0,
      codigoCorto: publicacion.codigoCorto.trim(),
      urlPublicacion: publicacion.urlPublicacion.trim(),
      resumenTexto: publicacion.resumenTexto?.trim() || null,
      fechaPublicacion: publicacion.fechaPublicacion?.trim() || null,
      urlMiniatura: publicacion.urlMiniatura?.trim() || null,
    };
  }

  private seleccionarMasCompleta(
    izquierda: PublicacionRecienteInstagram,
    derecha: PublicacionRecienteInstagram,
  ): PublicacionRecienteInstagram {
    return this.calcularCompletitud(derecha) >= this.calcularCompletitud(izquierda)
      ? derecha
      : izquierda;
  }

  private calcularCompletitud(publicacion: PublicacionRecienteInstagram): number {
    let puntaje = 0;

    if (publicacion.resumenTexto) {
      puntaje += 1;
    }

    if (publicacion.fechaPublicacion) {
      puntaje += 1;
    }

    if (publicacion.urlMiniatura) {
      puntaje += 1;
    }

    if (publicacion.tipoMedio !== 'desconocido') {
      puntaje += 1;
    }

    return puntaje;
  }
}
