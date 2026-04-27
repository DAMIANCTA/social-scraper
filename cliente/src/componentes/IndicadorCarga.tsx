type PropiedadesIndicadorCarga = {
  visible: boolean;
};

export function IndicadorCarga({ visible }: PropiedadesIndicadorCarga) {
  if (!visible) {
    return null;
  }

  return (
    <div className="indicador-carga" aria-live="polite">
      <span className="pulso-carga" />
      <div>
        <strong>Consultando publicaciones...</strong>
        <p>El servidor esta navegando el perfil y consolidando resultados.</p>
      </div>
    </div>
  );
}
