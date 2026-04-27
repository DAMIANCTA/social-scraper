import type { NextFunction, Request, Response } from 'express';
import { parametrosAplicacion } from '../configuracion/parametrosAplicacion.js';
import { OrquestadorConsulta } from '../servicios/orquestadorConsulta.js';

export class ControladorConsultaPublicaciones {
  constructor(
    private readonly orquestadorConsulta = new OrquestadorConsulta(),
  ) {}

  consultarPublicacionesRecientes = async (
    solicitud: Request,
    respuesta: Response,
    siguiente: NextFunction,
  ) => {
    try {
      const username = String(
        solicitud.query.username ??
          solicitud.query.usuario ??
          solicitud.query.cuenta ??
          '',
      );

      const cantidad = Number(
        solicitud.query.cantidad ??
          parametrosAplicacion.publicaciones.cantidadPredeterminada,
      );

      const resultado =
        await this.orquestadorConsulta.consultarPublicacionesRecientes({
          usuario: username,
          cantidad,
        });

      return respuesta.status(200).json(resultado);
    } catch (error) {
      return siguiente(error);
    }
  };
}

export const controladorConsultaPublicaciones =
  new ControladorConsultaPublicaciones();
