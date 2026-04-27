export const selectoresInstagram = {
  perfil: {
    bloquePrincipal: 'main',
    encabezadoPerfil: 'header, main header',
    enlacesPublicaciones:
      'a[href*="/p/"], a[href*="/reel/"], a[href*="/tv/"]',
  },
  publicacion: {
    fecha: 'time[datetime]',
    metadatosLdJson: 'script[type="application/ld+json"]',
    descripcionMeta:
      'meta[property="og:description"], meta[name="description"]',
    imagenMeta: 'meta[property="og:image"]',
    videoMeta: 'meta[property="og:video"]',
  },
} as const;
