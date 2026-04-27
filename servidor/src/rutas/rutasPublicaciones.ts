import { Router } from 'express';
import { controladorConsultaPublicaciones } from '../controladores/controladorConsultaPublicaciones.js';

export const rutasPublicaciones = Router();

rutasPublicaciones.get('/publicaciones', (_solicitud, respuesta) => {
  respuesta.json({
    recurso: 'publicaciones',
    endpoints: [
      {
        metodo: 'GET',
        ruta: '/api/publicaciones/recientes?username=cuenta_instagram',
      },
    ],
  });
});

rutasPublicaciones.get(
  '/publicaciones/recientes',
  controladorConsultaPublicaciones.consultarPublicacionesRecientes,
);
