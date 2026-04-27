import { configuracionPlaywright } from '../configuracion/playwright.js';
import type {
  CandidatoPublicacion,
  TipoMedioInstagram,
} from '../tipos/publicaciones.js';

export type TarjetaCuadriculaBruta = {
  href: string | null;
  textoAlternativo: string | null;
  miniatura: string | null;
  etiquetaMedia: string | null;
};

export type MetadatosLdJson = {
  '@type'?: string;
  caption?: string;
  uploadDate?: string;
  thumbnailUrl?: string;
  contentUrl?: string;
  image?: string | string[];
};

const EXPRESION_CODIGO_CORTO = /\/(?:p|reel|tv)\/([^/?#]+)/i;

export function construirUrlPerfil(usuario: string): string {
  return new URL(
    `/${usuario}/`,
    configuracionPlaywright.instagramUrlBase,
  ).toString();
}

export function construirUrlPublicacion(rutaRelativaOAbsoluta: string): string {
  return new URL(
    rutaRelativaOAbsoluta,
    configuracionPlaywright.instagramUrlBase,
  ).toString();
}

export function extraerCodigoCorto(urlPublicacion: string): string {
  return urlPublicacion.match(EXPRESION_CODIGO_CORTO)?.[1] ?? '';
}

export function inferirTipoMedio(
  descriptor: string | null | undefined,
  urlPublicacion: string,
): TipoMedioInstagram {
  const descriptorNormalizado = (descriptor ?? '').toLowerCase();
  const urlNormalizada = urlPublicacion.toLowerCase();

  if (urlNormalizada.includes('/reel/')) {
    return 'reel';
  }

  if (
    descriptorNormalizado.includes('carousel') ||
    descriptorNormalizado.includes('album') ||
    descriptorNormalizado.includes('multiple')
  ) {
    return 'carrusel';
  }

  if (
    descriptorNormalizado.includes('video') ||
    descriptorNormalizado.includes('clip')
  ) {
    return 'video';
  }

  if (
    descriptorNormalizado.includes('photo') ||
    descriptorNormalizado.includes('image')
  ) {
    return 'imagen';
  }

  if (urlNormalizada.includes('/p/')) {
    return 'imagen';
  }

  return 'desconocido';
}

export function limpiarResumenTexto(resumen: string | null): string | null {
  if (!resumen) {
    return null;
  }

  const texto = resumen.trim().replace(/\s+/g, ' ');
  const coincidencia = texto.match(/:\s*(.+)$/);

  return (coincidencia?.[1] ?? texto).trim() || null;
}

export function normalizarTarjetasCuadricula(
  tarjetas: TarjetaCuadriculaBruta[],
  cantidad: number,
): CandidatoPublicacion[] {
  const publicaciones = new Map<string, CandidatoPublicacion>();

  for (const tarjeta of tarjetas) {
    if (!tarjeta.href) {
      continue;
    }

    const urlPublicacion = construirUrlPublicacion(tarjeta.href);
    const codigoCorto = extraerCodigoCorto(urlPublicacion);

    if (!codigoCorto) {
      continue;
    }

    publicaciones.set(codigoCorto, {
      urlPublicacion,
      codigoCorto,
      resumenTexto: limpiarResumenTexto(tarjeta.textoAlternativo),
      tipoMedio: inferirTipoMedio(tarjeta.etiquetaMedia, urlPublicacion),
      fechaPublicacion: null,
      urlMiniatura: tarjeta.miniatura,
    });

    if (publicaciones.size >= cantidad) {
      break;
    }
  }

  return Array.from(publicaciones.values()).slice(0, cantidad);
}

export function normalizarUrlMiniatura(
  metadatosLdJson: MetadatosLdJson | null,
): string | null {
  if (!metadatosLdJson) {
    return null;
  }

  if (typeof metadatosLdJson.thumbnailUrl === 'string') {
    return metadatosLdJson.thumbnailUrl;
  }

  if (typeof metadatosLdJson.image === 'string') {
    return metadatosLdJson.image;
  }

  if (Array.isArray(metadatosLdJson.image)) {
    return metadatosLdJson.image[0] ?? null;
  }

  return null;
}

export function resolverTipoMedioFinal(
  tipoInicial: TipoMedioInstagram,
  urlPublicacion: string,
  metadatosLdJson: MetadatosLdJson | null,
  urlVideoMeta: string | null,
): TipoMedioInstagram {
  if (tipoInicial !== 'desconocido' && tipoInicial !== 'imagen') {
    return tipoInicial;
  }

  if (urlPublicacion.toLowerCase().includes('/reel/')) {
    return 'reel';
  }

  if (urlVideoMeta) {
    return 'video';
  }

  if (metadatosLdJson?.['@type']?.toLowerCase().includes('video')) {
    return 'video';
  }

  return tipoInicial === 'desconocido' ? 'imagen' : tipoInicial;
}
