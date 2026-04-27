import type { PublicacionInstagram } from '../tipos/publicacion';

type PropiedadesTarjetaPublicacion = {
  publicacion: PublicacionInstagram;
};

function formatearFecha(fecha: string | null) {
  if (!fecha) {
    return 'Fecha no disponible';
  }

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha;
  }

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fechaConvertida);
}

function traducirTipoMedio(tipoMedio: PublicacionInstagram['tipoMedio']) {
  const mapa: Record<PublicacionInstagram['tipoMedio'], string> = {
    imagen: 'Imagen',
    video: 'Video',
    carrusel: 'Carrusel',
    reel: 'Reel',
    desconocido: 'Desconocido',
  };

  return mapa[tipoMedio];
}

export function TarjetaPublicacion({
  publicacion,
}: PropiedadesTarjetaPublicacion) {
  return (
    <article className="tarjeta-publicacion">
      <div className="cabecera-tarjeta">
        <span className="insignia-posicion">#{publicacion.indice}</span>
        <span className="insignia-tipo">
          {traducirTipoMedio(publicacion.tipoMedio)}
        </span>
      </div>

      <div className="contenedor-miniatura">
        {publicacion.urlMiniatura ? (
          <img
            className="miniatura-publicacion"
            src={publicacion.urlMiniatura}
            alt={`Miniatura de la publicacion ${publicacion.codigoCorto}`}
            loading="lazy"
          />
        ) : (
          <div className="miniatura-vacia">Sin miniatura</div>
        )}
      </div>

      <div className="contenido-tarjeta">
        <p className="codigo-corto">{publicacion.codigoCorto}</p>
        <p className="resumen-publicacion">
          {publicacion.resumenTexto ?? 'No se encontro un resumen corto.'}
        </p>
        <p className="dato-secundario">
          <strong>Fecha:</strong> {formatearFecha(publicacion.fechaPublicacion)}
        </p>
      </div>

      <a
        className="enlace-publicacion"
        href={publicacion.urlPublicacion}
        target="_blank"
        rel="noreferrer"
      >
        Ver publicacion
      </a>
    </article>
  );
}
