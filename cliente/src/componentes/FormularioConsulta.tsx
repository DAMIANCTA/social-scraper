import { configuracionCliente } from '../configuracion/configuracionCliente';
import { useEffect, useState, type FormEvent } from 'react';

type PropiedadesFormularioConsulta = {
  bloqueado?: boolean;
  usernameInicial?: string;
  onConsultar: (username: string) => void | Promise<void>;
};

export function FormularioConsulta({
  bloqueado = false,
  usernameInicial = '',
  onConsultar,
}: PropiedadesFormularioConsulta) {
  const [username, setUsername] = useState(usernameInicial);

  useEffect(() => {
    setUsername(usernameInicial);
  }, [usernameInicial]);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const usernameNormalizado = username.trim().replace(/^@/, '');

    if (!usernameNormalizado) {
      return;
    }

    await onConsultar(usernameNormalizado);
  }

  return (
    <form className="formulario-consulta" onSubmit={manejarEnvio}>
      <div className="encabezado-seccion">
        <span className="etiqueta-seccion">Consulta de perfil</span>
        <h2>Consultar publicaciones recientes</h2>
      </div>

      <label className="etiqueta-campo" htmlFor="username-instagram">
        Username de Instagram
      </label>

      <div className="fila-consulta">
        <input
          id="username-instagram"
          className="campo-texto"
          type="text"
          placeholder="@cuenta_academica"
          value={username}
          onChange={(evento) => setUsername(evento.target.value)}
          autoComplete="off"
          disabled={bloqueado}
          required
          maxLength={30}
        />

        <button className="boton-primario" type="submit" disabled={bloqueado}>
          {bloqueado ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      <p className="texto-ayuda">
        La consulta extrae hasta {configuracionCliente.publicaciones.cantidadMaxima}{' '}
        publicaciones visibles y reutiliza la sesion persistente del servidor.
      </p>
    </form>
  );
}
