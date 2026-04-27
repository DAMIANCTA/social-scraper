import { crearAplicacion } from './aplicacion.js';
import { variablesEntorno } from './configuracion/variablesEntorno.js';
import { registrarError, registrarInfo } from './utilidades/registro.js';

const aplicacion = crearAplicacion();
const servidor = aplicacion.listen(variablesEntorno.puertoServidor, () => {
  registrarInfo(
    'servidor',
    `Servidor listo en http://localhost:${variablesEntorno.puertoServidor}`,
  );
});

servidor.on('error', (error) => {
  registrarError(
    'servidor',
    'No fue posible iniciar el servidor de bitacora-publicaciones.',
    error,
  );
  process.exit(1);
});
