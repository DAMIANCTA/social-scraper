import { configuracionCliente } from '../configuracion/configuracionCliente';
import { useEffect, useState } from 'react';
import { CuadriculaPublicaciones } from '../componentes/CuadriculaPublicaciones';
import { FormularioConsulta } from '../componentes/FormularioConsulta';
import { HistorialReciente } from '../componentes/HistorialReciente';
import { IndicadorCarga } from '../componentes/IndicadorCarga';
import { MensajeError } from '../componentes/MensajeError';
import { PanelResumenTecnico } from '../componentes/PanelResumenTecnico';
import { consultarPublicacionesRecientes } from '../servicios/clienteApi';
import type { RespuestaConsultaPublicaciones } from '../tipos/publicacion';

type ConsultaRecienteLocal = {
  usernameConsultado: string;
  cantidadPublicacionesObtenidas: number;
  extractorUsado: string;
  generadoEn: string;
  cantidadPublicacionesNuevas: number;
};

function leerHistorialLocal(): ConsultaRecienteLocal[] {
  try {
    const contenido = window.localStorage.getItem(
      configuracionCliente.historial.claveAlmacenamiento,
    );

    if (!contenido) {
      return [];
    }

    const historial = JSON.parse(contenido) as ConsultaRecienteLocal[];
    return Array.isArray(historial) ? historial : [];
  } catch {
    return [];
  }
}

function guardarHistorialLocal(historial: ConsultaRecienteLocal[]) {
  window.localStorage.setItem(
    configuracionCliente.historial.claveAlmacenamiento,
    JSON.stringify(
      historial.slice(0, configuracionCliente.historial.limiteConsultasRecientes),
    ),
  );
}

function resumirConsultaLocal(
  resultado: RespuestaConsultaPublicaciones,
): ConsultaRecienteLocal {
  return {
    usernameConsultado: resultado.usernameConsultado,
    cantidadPublicacionesObtenidas: resultado.cantidadPublicacionesObtenidas,
    extractorUsado: resultado.extractorUsado,
    generadoEn: resultado.generadoEn,
    cantidadPublicacionesNuevas:
      resultado.comparacionAnterior.cantidadPublicacionesNuevas,
  };
}

export function PaginaInicio() {
  const [resultado, setResultado] =
    useState<RespuestaConsultaPublicaciones | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historialReciente, setHistorialReciente] = useState<
    ConsultaRecienteLocal[]
  >([]);
  const [usernameActivo, setUsernameActivo] = useState('');

  useEffect(() => {
    setHistorialReciente(leerHistorialLocal());
  }, []);

  async function ejecutarConsulta(username: string) {
    setCargando(true);
    setError(null);
    setUsernameActivo(username);

    try {
      const respuesta = await consultarPublicacionesRecientes(username);
      setResultado(respuesta);

      setHistorialReciente((historialAnterior) => {
        const historialActualizado = [
          resumirConsultaLocal(respuesta),
          ...historialAnterior.filter(
            (item) => item.usernameConsultado !== respuesta.usernameConsultado,
          ),
        ].slice(0, configuracionCliente.historial.limiteConsultasRecientes);

        guardarHistorialLocal(historialActualizado);
        return historialActualizado;
      });
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : 'No fue posible completar la consulta.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="pagina-inicio">
      <section className="franja-heroica">
        <div className="hero-texto">
          <p className="sello-proyecto">Proyecto academico</p>
          <h1>Bitacora de Publicaciones</h1>
          <p className="descripcion-principal">
            Interfaz web para consultar publicaciones visibles de Instagram con
            backend en Playwright, sesion persistente, comparacion historica y
            exportacion tecnica.
          </p>
        </div>

        <div className="hero-panel">
          <FormularioConsulta
            bloqueado={cargando}
            usernameInicial={usernameActivo}
            onConsultar={ejecutarConsulta}
          />
          <IndicadorCarga visible={cargando} />
          <MensajeError mensaje={error} />
        </div>
      </section>

      <section className="zona-contenido">
        <div className="columna-principal">
          <PanelResumenTecnico resultado={resultado} />
          <CuadriculaPublicaciones
            publicaciones={resultado?.publicaciones ?? []}
          />
        </div>

        <aside className="columna-lateral">
          <HistorialReciente
            historial={historialReciente}
            onSeleccionar={ejecutarConsulta}
          />
        </aside>
      </section>
    </main>
  );
}