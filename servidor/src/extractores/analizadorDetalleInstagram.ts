import type { BrowserContext, Page } from 'playwright';
import { parametrosAplicacion } from '../configuracion/parametrosAplicacion.js';
import type {
  CandidatoPublicacion,
  PublicacionRecienteInstagram,
} from '../tipos/publicaciones.js';
import { registrarAdvertencia } from '../utilidades/registro.js';
import { selectoresInstagram } from './selectoresInstagram.js';
import {
  limpiarResumenTexto,
  normalizarUrlMiniatura,
  resolverTipoMedioFinal,
  type MetadatosLdJson,
} from './utilidadesComunesInstagram.js';

export async function enriquecerColeccionPublicaciones(
  contextoNavegacion: BrowserContext,
  candidatas: CandidatoPublicacion[],
): Promise<PublicacionRecienteInstagram[]> {
  const publicaciones: PublicacionRecienteInstagram[] = [];
  const tamanoLote = Math.max(
    1,
    parametrosAplicacion.instagram.concurrenciaDetalles,
  );

  for (let indice = 0; indice < candidatas.length; indice += tamanoLote) {
    const lote = candidatas.slice(indice, indice + tamanoLote);
    const resultados = await Promise.all(
      lote.map((candidata) =>
        enriquecerPublicacionDesdeDetalle(contextoNavegacion, candidata),
      ),
    );

    publicaciones.push(...resultados);
  }

  return publicaciones;
}

export async function enriquecerPublicacionDesdeDetalle(
  contextoNavegacion: BrowserContext,
  candidato: CandidatoPublicacion,
): Promise<PublicacionRecienteInstagram> {
  const pagina = await contextoNavegacion.newPage();

  try {
    await pagina.goto(candidato.urlPublicacion, {
      waitUntil: 'domcontentloaded',
      timeout: parametrosAplicacion.instagram.esperaDetallePublicacionMs,
    });
    await pagina.waitForTimeout(parametrosAplicacion.instagram.esperaCargaSuaveMs);

    const metadatosLdJson = await leerMetadatosLdJson(pagina);
    const fechaPublicacion =
      (await pagina
        .locator(selectoresInstagram.publicacion.fecha)
        .first()
        .getAttribute('datetime')
        .catch(() => null)) ??
      metadatosLdJson?.uploadDate ??
      candidato.fechaPublicacion;

    const resumenMeta = await leerContenidoMeta(
      pagina,
      selectoresInstagram.publicacion.descripcionMeta,
    );
    const urlMiniaturaMeta = await leerContenidoMeta(
      pagina,
      selectoresInstagram.publicacion.imagenMeta,
    );
    const urlVideoMeta = await leerContenidoMeta(
      pagina,
      selectoresInstagram.publicacion.videoMeta,
    );

    return {
      indice: 0,
      urlPublicacion: candidato.urlPublicacion,
      codigoCorto: candidato.codigoCorto,
      resumenTexto:
        candidato.resumenTexto ??
        limpiarResumenTexto(metadatosLdJson?.caption ?? null) ??
        limpiarResumenTexto(resumenMeta),
      tipoMedio: resolverTipoMedioFinal(
        candidato.tipoMedio,
        candidato.urlPublicacion,
        metadatosLdJson,
        urlVideoMeta,
      ),
      fechaPublicacion,
      urlMiniatura:
        candidato.urlMiniatura ??
        normalizarUrlMiniatura(metadatosLdJson) ??
        urlMiniaturaMeta,
    };
  } catch (error) {
    registrarAdvertencia(
      'extractor',
      `No se pudo enriquecer completamente la publicacion ${candidato.codigoCorto}; se devolvera la informacion visible inicial.`,
      {
        urlPublicacion: candidato.urlPublicacion,
        mensaje:
          error instanceof Error ? error.message : 'Error no identificable',
      },
    );

    return construirPublicacionBase(candidato);
  } finally {
    await pagina.close().catch(() => undefined);
  }
}

function construirPublicacionBase(
  candidato: CandidatoPublicacion,
): PublicacionRecienteInstagram {
  return {
    indice: 0,
    urlPublicacion: candidato.urlPublicacion,
    codigoCorto: candidato.codigoCorto,
    resumenTexto: candidato.resumenTexto,
    tipoMedio: candidato.tipoMedio,
    fechaPublicacion: candidato.fechaPublicacion,
    urlMiniatura: candidato.urlMiniatura,
  };
}

async function leerContenidoMeta(
  pagina: Page,
  selector: string,
): Promise<string | null> {
  return (
    (await pagina
      .locator(selector)
      .first()
      .getAttribute('content')
      .catch(() => null)) ?? null
  );
}

async function leerMetadatosLdJson(
  pagina: Page,
): Promise<MetadatosLdJson | null> {
  const scripts = await pagina
    .locator(selectoresInstagram.publicacion.metadatosLdJson)
    .allTextContents()
    .catch(() => []);

  for (const script of scripts) {
    try {
      const datos = JSON.parse(script) as unknown;
      const candidato = buscarMetadatosLdJson(datos);

      if (candidato) {
        return candidato;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function buscarMetadatosLdJson(valor: unknown): MetadatosLdJson | null {
  if (!valor) {
    return null;
  }

  if (Array.isArray(valor)) {
    for (const item of valor) {
      const encontrado = buscarMetadatosLdJson(item);

      if (encontrado) {
        return encontrado;
      }
    }

    return null;
  }

  if (typeof valor !== 'object') {
    return null;
  }

  const registro = valor as Record<string, unknown>;

  if (
    typeof registro.caption === 'string' ||
    typeof registro.uploadDate === 'string' ||
    typeof registro.thumbnailUrl === 'string' ||
    typeof registro.contentUrl === 'string'
  ) {
    return registro as MetadatosLdJson;
  }

  for (const item of Object.values(registro)) {
    const encontrado = buscarMetadatosLdJson(item);

    if (encontrado) {
      return encontrado;
    }
  }

  return null;
}
