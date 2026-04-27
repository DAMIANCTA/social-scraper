<<<<<<< HEAD
# bitacora-publicaciones

Aplicacion web academica en espanol para consultar hasta 10 publicaciones visibles y recientes de una cuenta de Instagram. El cliente usa `React + Vite + TypeScript` y el servidor usa `Node.js + TypeScript + Playwright` con sesion persistente basada en `storageState`, sin credenciales hardcodeadas.

## Caracteristicas principales

- Consulta de publicaciones recientes con sesion persistente reutilizable.
- Estrategias de extraccion desacopladas con extractor principal y extractor de respaldo.
- Captura automatica del perfil consultado.
- Historial local de consultas en el servidor y resumen reciente en el cliente.
- Exportacion de resultados a JSON y CSV.
- Comparacion con la consulta anterior para detectar publicaciones nuevas.

## Estructura del proyecto

```text
bitacora-publicaciones/
|-- cliente/
|   |-- src/
|   |   |-- componentes/
|   |   |-- configuracion/
|   |   |-- paginas/
|   |   |-- servicios/
|   |   |-- estilos/
|   |   `-- tipos/
|   |-- package.json
|   `-- vite.config.ts
|-- servidor/
|   |-- almacenamiento/
|   |   |-- capturas/
|   |   |-- exportaciones/
|   |   |-- historial/
|   |   `-- sesion/
|   |-- src/
|   |   |-- configuracion/
|   |   |-- controladores/
|   |   |-- evidencias/
|   |   |-- extractores/
|   |   |-- normalizadores/
|   |   |-- rutas/
|   |   |-- servicios/
|   |   |-- sesion/
|   |   |-- tipos/
|   |   `-- utilidades/
|   |-- package.json
|   `-- tsconfig.json
|-- .env.example
|-- .gitignore
`-- README.md
```

## Requisitos

- Node.js 20 o superior recomendado
- npm 10 o superior recomendado

## Configuracion inicial

1. Crear el archivo de entorno en la raiz del proyecto.

```powershell
Copy-Item .env.example .env
```

2. Instalar dependencias del cliente.

```powershell
Set-Location cliente
npm install
```

3. Instalar dependencias del servidor.

```powershell
Set-Location ..\servidor
npm install
```

## Generar sesion persistente

Antes de consultar Instagram por primera vez, genera la sesion persistente manual:

```powershell
Set-Location servidor
npm run sesion:generar
```

Ese comando abre Playwright en modo visible, permite iniciar sesion manualmente y guarda el `storageState` en la ruta definida por `PLAYWRIGHT_STORAGE_STATE_PATH`.

## Ejecutar el proyecto

Servidor:

```powershell
Set-Location servidor
npm run dev
```

Cliente:

```powershell
Set-Location cliente
npm run dev
```

Luego abre `http://localhost:5173`.

## Variables de entorno

Las variables compartidas viven en la raiz del proyecto y se documentan en `.env.example`. El cliente usa `envDir` para leerlas desde la raiz y el servidor carga el mismo archivo `.env`.

## Comprobaciones recomendadas

Cliente:

```powershell
Set-Location cliente
npm run typecheck
npm run build
```

Servidor:

```powershell
Set-Location servidor
npm run typecheck
npm run build
```

## Archivos generados

- `servidor/almacenamiento/sesion`: estado de sesion persistente
- `servidor/almacenamiento/capturas`: capturas del perfil consultado
- `servidor/almacenamiento/exportaciones`: resultados en JSON y CSV
- `servidor/almacenamiento/historial`: historial local de consultas

`.gitignore` ya excluye esos artefactos para evitar subir sesiones, capturas o exportaciones al repositorio.

## Estado del proyecto

El proyecto queda listo para presentacion academica y para seguir iterando sobre:

- endurecimiento de selectores frente a cambios de interfaz de Instagram
- mejoras visuales puntuales del cliente
- pruebas automatizadas de cliente y servidor
=======
# social-scraper
Sistema de rastreo de publicaciones recientes de Instagram usando Playwright y sesión persistente.
