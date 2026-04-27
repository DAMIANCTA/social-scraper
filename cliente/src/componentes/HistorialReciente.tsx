type ItemHistorialReciente = {
  usernameConsultado: string;
  cantidadPublicacionesObtenidas: number;
  extractorUsado: string;
  generadoEn: string;
  cantidadPublicacionesNuevas: number;
};

type PropiedadesHistorialReciente = {
  historial: ItemHistorialReciente[];
  onSeleccionar: (username: string) => void;
};

function formatearFecha(fecha: string) {
  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha;
  }

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fechaConvertida);
}

export function HistorialReciente({
  historial,
  onSeleccionar,
}: PropiedadesHistorialReciente) {
  return (
    <section className="panel-seccion">
      <div className="encabezado-seccion">
        <span className="etiqueta-seccion">Historial reciente</span>
        <h2>Consultas guardadas en el navegador</h2>
      </div>

      {historial.length > 0 ? (
        <div className="lista-historial">
          {historial.map((item) => (
            <button
              key={`${item.usernameConsultado}-${item.generadoEn}`}
              className="item-historial"
              type="button"
              onClick={() => onSeleccionar(item.usernameConsultado)}
            >
              <div>
                <strong>@{item.usernameConsultado}</strong>
                <p>
                  {item.cantidadPublicacionesObtenidas} publicaciones,{' '}
                  {item.extractorUsado}
                </p>
              </div>
              <div className="meta-historial">
                <span>{formatearFecha(item.generadoEn)}</span>
                <span
                  className={
                    item.cantidadPublicacionesNuevas > 0
                      ? 'texto-destacado'
                      : ''
                  }
                >
                  {item.cantidadPublicacionesNuevas > 0
                    ? `${item.cantidadPublicacionesNuevas} nuevas`
                    : 'Sin cambios'}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="estado-vacio">
          Aun no hay consultas guardadas en el historial reciente.
        </p>
      )}
    </section>
  );
}
