import type { PublicacionInstagram } from '../tipos/publicacion';
import { TarjetaPublicacion } from './TarjetaPublicacion';

type PropiedadesCuadriculaPublicaciones = {
  publicaciones: PublicacionInstagram[];
};

export function CuadriculaPublicaciones({
  publicaciones,
}: PropiedadesCuadriculaPublicaciones) {
  if (publicaciones.length === 0) {
    return (
      <section className="panel-seccion">
        <div className="encabezado-seccion">
          <span className="etiqueta-seccion">Resultados</span>
          <h2>Publicaciones recientes</h2>
        </div>
        <p className="estado-vacio">
          Todavia no hay publicaciones para mostrar en la cuadricula.
        </p>
      </section>
    );
  }

  return (
    <section className="panel-seccion">
      <div className="encabezado-seccion">
        <span className="etiqueta-seccion">Resultados</span>
        <h2>Publicaciones recientes</h2>
      </div>

      <div className="cuadricula-publicaciones">
        {publicaciones.map((publicacion) => (
          <TarjetaPublicacion
            key={publicacion.codigoCorto || publicacion.urlPublicacion}
            publicacion={publicacion}
          />
        ))}
      </div>
    </section>
  );
}
