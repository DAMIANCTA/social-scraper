import { configuracionCliente } from '../configuracion/configuracionCliente';
import type { RespuestaConsultaPublicaciones } from '../tipos/publicacion';

type RespuestaErrorApi = {
  codigo?: string;
  mensaje?: string;
};

export async function consultarPublicacionesRecientes(
  username: string,
): Promise<RespuestaConsultaPublicaciones> {
  try {
    const parametros = new URLSearchParams({ username });
    const respuesta = await fetch(
      `${configuracionCliente.urlBaseApi}/api/publicaciones/recientes?${parametros.toString()}`,
    );

    if (!respuesta.ok) {
      const detalle = (await respuesta.json().catch(() => null)) as
        | RespuestaErrorApi
        | null;

      throw new Error(
        construirMensajeErrorConsulta(detalle, respuesta.status),
      );
    }

    return (await respuesta.json()) as RespuestaConsultaPublicaciones;
  } catch (error) {
    if (error instanceof Error && error.name === 'TypeError') {
      const origenActual = window.location.origin;
      const origenApi = new URL(configuracionCliente.urlBaseApi).origin;

      throw new Error(
        origenActual !== origenApi
          ? `El navegador bloqueo la respuesta del servidor o no pudo completar la conexion. Verifica que el backend este activo y que permita solicitudes desde ${origenActual}.`
          : 'No fue posible conectarse con el servidor de bitacora-publicaciones.',
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      'No fue posible conectarse con el servidor de bitacora-publicaciones.',
    );
  }
}

function construirMensajeErrorConsulta(
  detalle: RespuestaErrorApi | null,
  estadoHttp: number,
): string {
  if (detalle?.mensaje) {
    return detalle.mensaje;
  }

  if (estadoHttp >= 500) {
    return 'El servidor no pudo completar la consulta en este momento.';
  }

  return 'No fue posible consultar las publicaciones recientes.';
}
