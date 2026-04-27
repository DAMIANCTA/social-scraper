import type { Page } from 'playwright';
import { parametrosAplicacion } from '../configuracion/parametrosAplicacion.js';
import { configuracionPlaywright } from '../configuracion/playwright.js';
import type {
  CandidatoPublicacion,
  ContextoExtraccionPublicaciones,
} from '../tipos/publicaciones.js';
import {
  ErrorCuentaNoEncontrada,
  ErrorCuentaPrivada,
  ErrorSesionExpirada,
} from '../utilidades/errores.js';
import { selectoresInstagram } from './selectoresInstagram.js';
import {
  construirUrlPerfil,
  construirUrlPublicacion,
  extraerCodigoCorto,
  inferirTipoMedio,
  normalizarTarjetasCuadricula,
  type TarjetaCuadriculaBruta,
} from './utilidadesComunesInstagram.js';

const EXPRESION_ENLACES_HTML =
  /(?:https?:\/\/www\.instagram\.com)?\/(?:p|reel|tv)\/[A-Za-z0-9_-]+\/?/gi;

export type DiagnosticoPerfilInstagram = {
  urlActual: string;
  titulo: string;
  contieneEncabezadoPerfil: boolean;
  cantidadEnlacesPublicaciones: number;
  redirigidoALogin: boolean;
  textoVisibleRecortado: string;
};

export async function abrirPaginaPerfil(
  contexto: ContextoExtraccionPublicaciones,
): Promise<Page> {
  const pagina = await contexto.contextoNavegacion.newPage();
  const respuesta = await pagina.goto(construirUrlPerfil(contexto.usuario), {
    waitUntil: 'domcontentloaded',
  });

  await esperarCargaSuave(pagina);
  await esperarEstructuraPerfil(pagina);
  await realizarDesplazamientoInicial(pagina);
  await validarEstadoPerfil(pagina, contexto.usuario, respuesta?.status() ?? null);

  return pagina;
}

export async function recolectarTarjetasVisibles(
  pagina: Page,
  cantidad: number,
): Promise<CandidatoPublicacion[]> {
  await pagina.waitForSelector(selectoresInstagram.perfil.bloquePrincipal, {
    timeout: configuracionPlaywright.tiempoEsperaMs,
  });

  await esperarEstructuraPerfil(pagina);

  const tarjetas = await pagina
    .locator(selectoresInstagram.perfil.enlacesPublicaciones)
    .evaluateAll(
      (enlaces, limite) =>
        enlaces.slice(0, Number(limite) * 4).map((enlace) => {
          const imagen = enlace.querySelector('img');
          const iconos = Array.from(
            enlace.querySelectorAll('svg[aria-label], span[aria-label]'),
          )
            .map(
              (elemento) =>
                elemento.getAttribute('aria-label')?.trim() ?? '',
            )
            .filter(Boolean);

          return {
            href: enlace.getAttribute('href'),
            textoAlternativo: imagen?.getAttribute('alt') ?? null,
            miniatura:
              imagen?.getAttribute('src') ??
              imagen?.getAttribute('srcset')?.split(' ')[0] ??
              null,
            etiquetaMedia: iconos.join(' '),
          };
        }),
      cantidad,
    );

  return normalizarTarjetasCuadricula(tarjetas as TarjetaCuadriculaBruta[], cantidad);
}

export async function extraerEnlacesDesdeHtml(
  pagina: Page,
  cantidad: number,
): Promise<CandidatoPublicacion[]> {
  const contenidoHtml = await pagina.content();
  const urls = new Set<string>();

  for (const coincidencia of contenidoHtml.matchAll(EXPRESION_ENLACES_HTML)) {
    const href = coincidencia[0];

    if (!href) {
      continue;
    }

    urls.add(construirUrlPublicacion(href));

    if (urls.size >= cantidad) {
      break;
    }
  }

  return Array.from(urls).map((urlPublicacion) => ({
    urlPublicacion,
    codigoCorto: extraerCodigoCorto(urlPublicacion),
    resumenTexto: null,
    tipoMedio: inferirTipoMedio(null, urlPublicacion),
    fechaPublicacion: null,
    urlMiniatura: null,
  }));
}

export async function obtenerDiagnosticoPerfil(
  pagina: Page,
): Promise<DiagnosticoPerfilInstagram> {
  const [titulo, urlActual, contieneEncabezadoPerfil, cantidadEnlacesPublicaciones] =
    await Promise.all([
      pagina.title().catch(() => ''),
      Promise.resolve(pagina.url()),
      pagina
        .locator(selectoresInstagram.perfil.encabezadoPerfil)
        .first()
        .isVisible()
        .catch(() => false),
      pagina
        .locator(selectoresInstagram.perfil.enlacesPublicaciones)
        .count()
        .catch(() => 0),
    ]);
  const textoVisibleRecortado = await pagina
    .textContent('body')
    .then((texto) => (texto ?? '').replace(/\s+/g, ' ').trim().slice(0, 320))
    .catch(() => '');

  return {
    urlActual,
    titulo,
    contieneEncabezadoPerfil,
    cantidadEnlacesPublicaciones,
    redirigidoALogin:
      urlActual.includes('/accounts/login') ||
      textoVisibleRecortado.toLowerCase().includes('inicia sesion') ||
      textoVisibleRecortado.toLowerCase().includes('log in'),
    textoVisibleRecortado,
  };
}

async function esperarCargaSuave(pagina: Page): Promise<void> {
  await pagina.waitForTimeout(parametrosAplicacion.instagram.esperaCargaSuaveMs);
}

async function esperarEstructuraPerfil(pagina: Page): Promise<void> {
  await pagina
    .waitForFunction(
      ({ selectorEncabezado, selectorEnlaces }) => {
        return Boolean(
          document.querySelector(selectorEncabezado) ||
            document.querySelector(selectorEnlaces),
        );
      },
      {
        selectorEncabezado: selectoresInstagram.perfil.encabezadoPerfil,
        selectorEnlaces: selectoresInstagram.perfil.enlacesPublicaciones,
      },
      {
        timeout: parametrosAplicacion.instagram.esperaEstructuraPerfilMs,
      },
    )
    .catch(() => undefined);
}

async function realizarDesplazamientoInicial(pagina: Page): Promise<void> {
  await pagina
    .evaluate((desplazamientoInicialPx) => {
      window.scrollTo({
        top: Number(desplazamientoInicialPx),
        behavior: 'instant',
      });
      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    }, parametrosAplicacion.instagram.desplazamientoInicialPx)
    .catch(() => undefined);

  await pagina.waitForTimeout(
    parametrosAplicacion.instagram.esperaPostDesplazamientoMs,
  );
}

async function validarEstadoPerfil(
  pagina: Page,
  usuario: string,
  codigoHttp: number | null,
): Promise<void> {
  const diagnostico = await obtenerDiagnosticoPerfil(pagina);
  const titulo = diagnostico.titulo.toLowerCase();
  const textoCuerpo = diagnostico.textoVisibleRecortado.toLowerCase();
  const urlActual = diagnostico.urlActual;

  if (
    codigoHttp === 404 ||
    titulo.includes('page not found') ||
    textoCuerpo.includes("sorry, this page isn't available") ||
    textoCuerpo.includes('esta pagina no esta disponible') ||
    textoCuerpo.includes('the link you followed may be broken')
  ) {
    throw new ErrorCuentaNoEncontrada(
      `La cuenta de Instagram @${usuario} no existe o no esta disponible.`,
      {
        urlActual,
      },
    );
  }

  if (diagnostico.redirigidoALogin) {
    throw new ErrorSesionExpirada(
      'Instagram redirigio la consulta a la pantalla de inicio de sesion. Genera una nueva sesion persistente antes de consultar.',
      {
        urlActual,
      },
    );
  }

  if (
    textoCuerpo.includes('this account is private') ||
    textoCuerpo.includes('esta cuenta es privada')
  ) {
    throw new ErrorCuentaPrivada(
      `La cuenta @${usuario} es privada y no permite consultar publicaciones visibles.`,
      {
        urlActual,
      },
    );
  }
}
