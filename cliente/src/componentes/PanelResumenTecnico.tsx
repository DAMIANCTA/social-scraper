import { configuracionCliente } from '../configuracion/configuracionCliente';
import { useState } from 'react';
import type { RespuestaConsultaPublicaciones } from '../tipos/publicacion';

type PropiedadesPanelResumenTecnico = {
  resultado: RespuestaConsultaPublicaciones | null;
};

function formatearFechaHora(fecha: string) {
  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha;
  }

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fechaConvertida);
}

export function PanelResumenTecnico({
  resultado,
}: PropiedadesPanelResumenTecnico) {
  const [mensajeCopia, setMensajeCopia] = useState<string | null>(null);

  async function copiarRuta(ruta: string, formato: 'JSON' | 'CSV') {
    try {
      await navigator.clipboard.writeText(ruta);
      setMensajeCopia(`Ruta ${formato} copiada al portapapeles.`);
      window.setTimeout(
        () => setMensajeCopia(null),
        configuracionCliente.interfaz.duracionMensajeCopiaMs,
      );
    } catch {
      setMensajeCopia(`No fue posible copiar la ruta ${formato}.`);
      window.setTimeout(
        () => setMensajeCopia(null),
        configuracionCliente.interfaz.duracionMensajeCopiaMs,
      );
    }
  }

  return (
    <section className="panel-seccion">
      <div className="encabezado-seccion">
        <span className="etiqueta-seccion">Resumen tecnico</span>
        <h2>Detalles de la consulta</h2>
      </div>

      {resultado ? (
        <>
          <div className="rejilla-resumen">
            <div className="dato-resumen">
              <span>Username consultado</span>
              <strong>@{resultado.usernameConsultado}</strong>
            </div>
            <div className="dato-resumen">
              <span>Publicaciones obtenidas</span>
              <strong>{resultado.cantidadPublicacionesObtenidas}</strong>
            </div>
            <div className="dato-resumen">
              <span>Extractor utilizado</span>
              <strong>{resultado.extractorUsado}</strong>
            </div>
            <div className="dato-resumen">
              <span>Duracion total</span>
              <strong>{resultado.tiempoTotalMs} ms</strong>
            </div>
            <div className="dato-resumen">
              <span>Fecha y hora</span>
              <strong>{formatearFechaHora(resultado.generadoEn)}</strong>
            </div>
            <div className="dato-resumen">
              <span>Publicaciones nuevas</span>
              <strong
                className={
                  resultado.comparacionAnterior.cantidadPublicacionesNuevas > 0
                    ? 'texto-destacado'
                    : ''
                }
              >
                {resultado.comparacionAnterior.existeConsultaAnterior
                  ? resultado.comparacionAnterior.cantidadPublicacionesNuevas
                  : 'Sin referencia previa'}
              </strong>
            </div>
          </div>

          <p className="nota-tecnica">{resultado.mensaje}</p>

          <div className="grupo-exportaciones">
            <button
              className="boton-secundario"
              type="button"
              onClick={() => copiarRuta(resultado.exportaciones.json, 'JSON')}
            >
              Exportar JSON
            </button>
            <button
              className="boton-secundario"
              type="button"
              onClick={() => copiarRuta(resultado.exportaciones.csv, 'CSV')}
            >
              Exportar CSV
            </button>
          </div>

          {mensajeCopia ? <p className="nota-tecnica">{mensajeCopia}</p> : null}
        </>
      ) : (
        <p className="estado-vacio">
          El resumen tecnico aparecera cuando completes una consulta.
        </p>
      )}
    </section>
  );
}
