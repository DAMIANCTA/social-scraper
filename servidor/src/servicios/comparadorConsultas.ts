import type {
  PublicacionRecienteInstagram,
  RegistroConsultaHistorial,
  ResultadoComparacionConsultas,
} from '../tipos/publicaciones.js';

export class ComparadorConsultas {
  compararConAnterior(
    publicacionesActuales: PublicacionRecienteInstagram[],
    consultaAnterior:
      | {
          rutaArchivo: string;
          consulta: RegistroConsultaHistorial;
        }
      | null,
  ): ResultadoComparacionConsultas {
    if (!consultaAnterior) {
      return {
        existeConsultaAnterior: false,
        cantidadPublicacionesNuevas: 0,
        publicacionesNuevas: [],
        rutaConsultaAnterior: null,
      };
    }

    const clavesAnteriores = new Set(
      consultaAnterior.consulta.publicaciones.map((publicacion) =>
        this.construirClave(publicacion),
      ),
    );
    const publicacionesNuevas = publicacionesActuales.filter(
      (publicacion) => !clavesAnteriores.has(this.construirClave(publicacion)),
    );

    return {
      existeConsultaAnterior: true,
      cantidadPublicacionesNuevas: publicacionesNuevas.length,
      publicacionesNuevas,
      rutaConsultaAnterior: consultaAnterior.rutaArchivo,
    };
  }

  private construirClave(publicacion: PublicacionRecienteInstagram): string {
    return (
      publicacion.codigoCorto.trim().toLowerCase() ||
      publicacion.urlPublicacion.trim().toLowerCase()
    );
  }
}
