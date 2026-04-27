import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { chromium } from 'playwright';
import { configuracionPlaywright } from '../configuracion/playwright.js';
import { registrarError, registrarInfo, registrarOperacion } from '../utilidades/registro.js';
import { GestorSesion } from './gestorSesion.js';

async function esperarConfirmacionManual() {
  const interfaz = createInterface({
    input: stdin,
    output: stdout,
  });

  try {
    await interfaz.question(
      'Completa el inicio de sesion manualmente en la ventana del navegador y, cuando ya veas tu cuenta abierta, presiona Enter aqui para guardar la sesion.',
    );
  } finally {
    interfaz.close();
  }
}

async function generarSesionManual() {
  const gestorSesion = new GestorSesion();
  await gestorSesion.prepararDirectorioSesion();

  registrarInfo(
    'sesion',
    'Se abrira Instagram en modo visible para que inicies sesion manualmente.',
    {
      rutaArchivo: gestorSesion.obtenerRutaEstadoSesion(),
    },
  );

  const navegador = await chromium.launch({
    headless: false,
    slowMo: 150,
  });

  const contexto = await navegador.newContext();
  const pagina = await contexto.newPage();

  try {
    await pagina.goto(configuracionPlaywright.instagramUrlBase, {
      waitUntil: 'domcontentloaded',
    });

    console.log('');
    console.log('Pasos sugeridos:');
    console.log('1. Inicia sesion manualmente en Instagram.');
    console.log('2. Espera a que cargue tu inicio, tu perfil o el feed.');
    console.log('3. Regresa a esta terminal y presiona Enter.');
    console.log('');

    await esperarConfirmacionManual();

    await gestorSesion.guardarEstadoSesion(contexto);
    const diagnostico = await gestorSesion.asegurarSesionReutilizable();

    registrarOperacion(
      'sesion',
      'La sesion persistente se guardo y valido correctamente.',
      diagnostico,
    );
  } finally {
    await pagina.close().catch(() => undefined);
    await navegador.close().catch(() => undefined);
  }
}

generarSesionManual().catch((error) => {
  if (
    error instanceof Error &&
    error.message.includes("Executable doesn't exist")
  ) {
    console.log('');
    console.log('Accion requerida: instala el navegador de Playwright con:');
    console.log('npm run navegador:instalar');
    console.log('');
  }

  registrarError(
    'sesion',
    'No fue posible generar la sesion persistente manual.',
    error,
  );
  process.exit(1);
});
