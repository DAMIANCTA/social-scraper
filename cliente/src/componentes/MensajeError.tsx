type PropiedadesMensajeError = {
  mensaje: string | null;
};

export function MensajeError({ mensaje }: PropiedadesMensajeError) {
  if (!mensaje) {
    return null;
  }

  return (
    <div className="mensaje-error" role="alert">
      <strong>Error de consulta</strong>
      <p>{mensaje}</p>
    </div>
  );
}
