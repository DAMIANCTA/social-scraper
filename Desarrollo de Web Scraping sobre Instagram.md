# Documento Explicativo del Desarrollo Individual

## Proyecto

**Bitacora de Publicaciones**

Aplicacion web academica orientada a la consulta de las diez publicaciones mas recientes visibles de una cuenta publica de Instagram, utilizando un backend desarrollado con Node.js, TypeScript y Playwright, y un frontend desarrollado con React, Vite y TypeScript.

## 1. Introduccion

El presente documento tiene como finalidad demostrar el desarrollo individual del proceso de web scraping implementado sobre una pagina publica de Instagram. El sistema fue construido para consultar una cuenta ingresada por el usuario y recuperar hasta diez publicaciones visibles recientes, incluyendo datos resumidos de cada publicacion y evidencia tecnica del proceso ejecutado.

La solucion fue planteada con una arquitectura separada entre cliente y servidor. El cliente se encarga de la interaccion con el usuario, mientras que el servidor concentra la automatizacion con Playwright, la validacion de sesion persistente, la extraccion de informacion, la generacion de capturas, el historial local y las exportaciones.

## 2. Objetivo del desarrollo

El objetivo principal del proyecto fue construir una herramienta academica capaz de:

- consultar una cuenta publica de Instagram a partir del username ingresado por el usuario;
- reutilizar una sesion persistente para evitar el ingreso manual de credenciales en cada ejecucion;
- extraer hasta diez publicaciones visibles recientes;
- mostrar un resumen tecnico de la consulta;
- almacenar historial local de consultas y detectar publicaciones nuevas;
- exportar los resultados a JSON y CSV.

## 3. Enfoque general de la solucion

La aplicacion fue desarrollada en dos partes principales:

- **Cliente**: interfaz web construida con React + Vite + TypeScript para ingresar el username, visualizar resultados, mostrar historial reciente y presentar mensajes de estado.
- **Servidor**: servicio backend construido con Node.js + TypeScript + Playwright encargado de abrir la sesion reutilizable, navegar al perfil, extraer publicaciones y devolver una respuesta estructurada al cliente.

Esta separacion permite mantener la logica de scraping fuera del navegador del usuario, centralizar el control de la sesion y conservar una organizacion mantenible del codigo.

## 4. Arquitectura aplicada

El backend fue organizado en capas bien definidas para evitar mezclar responsabilidades:

- **rutas**: exponen los endpoints HTTP del sistema;
- **controladores**: reciben la solicitud del cliente y delegan el trabajo;
- **servicios**: coordinan la consulta completa;
- **extractores**: implementan estrategias de extraccion sobre Instagram;
- **sesion**: administra el uso del archivo `storageState`;
- **normalizadores**: ordenan y unifican los datos obtenidos;
- **evidencias**: generan capturas y registros de apoyo;
- **tipos**: concentran el tipado fuerte de entidades y respuestas;
- **utilidades**: contienen validaciones, errores y registro de eventos;
- **configuracion**: centraliza variables de entorno y parametros del proyecto.

En el frontend se mantuvo una separacion equivalente entre paginas, componentes, servicios, tipos y configuracion.

## 5. Desarrollo del proceso de web scraping

### 5.1 Flujo general

El proceso implementado para la consulta sigue la siguiente secuencia:

1. El usuario ingresa un username de Instagram desde el frontend.
2. El cliente envía una solicitud HTTP al backend.
3. El backend valida el username recibido.
4. El modulo de sesion revisa si existe el archivo `estado-sesion.json`.
5. Si la sesion es valida, Playwright abre un contexto reutilizando el `storageState`.
6. El orquestador inicia la consulta y prueba estrategias de extraccion.
7. Se recuperan hasta diez publicaciones visibles.
8. Los datos se normalizan y se enriquecen cuando es posible.
9. Se genera una captura del perfil consultado.
10. Se compara el resultado con la consulta anterior de la misma cuenta.
11. Se guardan historial y exportaciones.
12. La respuesta final vuelve al cliente para su visualizacion.

### 5.2 Sesion persistente sin credenciales hardcodeadas

Uno de los puntos mas importantes del desarrollo fue evitar el uso de credenciales dentro del codigo fuente. Para ello se implemento un modulo de sesion persistente con Playwright.

La sesion se genera una sola vez mediante un script manual que abre el navegador en modo visible. El usuario inicia sesion directamente en Instagram y luego el sistema guarda el `storageState` en:

`servidor/almacenamiento/sesion/estado-sesion.json`

Posteriormente, cada consulta reutiliza ese archivo, lo que evita solicitar usuario y contraseña en cada ejecucion y mantiene la solucion mas segura y profesional para un contexto academico.

### 5.3 Patron Strategy en la extraccion

La extraccion no fue implementada en un unico bloque rigido. Se aplico el patron **Strategy** para tener flexibilidad frente a cambios del DOM de Instagram.

Se definieron dos estrategias:

- **ExtractorCuadriculaPerfil**: estrategia principal, enfocada en leer la cuadricula visible del perfil.
- **ExtractorRespaldoMetadatos**: estrategia de respaldo, enfocada en recuperar enlaces y metadatos cuando el extractor principal no es suficiente.

El servicio **OrquestadorConsulta** intenta primero la estrategia principal y, si no obtiene resultados reutilizables, ejecuta la estrategia de respaldo. Esta decision mejora la resiliencia del sistema frente a cambios en la interfaz de la pagina objetivo.

### 5.4 Extraccion de datos por publicacion

Cada publicacion recuperada se transforma a una estructura tipada que incluye los siguientes campos:

- indice;
- urlPublicacion;
- codigoCorto;
- resumenTexto;
- tipoMedio;
- fechaPublicacion;
- urlMiniatura.

Para lograrlo, el sistema primero obtiene candidatas desde el perfil y luego intenta enriquecer cada publicacion visitando su detalle. Si alguna publicacion tarda demasiado o no entrega todos los metadatos esperados, el sistema conserva al menos la informacion inicial detectada en el perfil, evitando que una sola falla bloquee toda la consulta.

### 5.5 Normalizacion y control de calidad

Los resultados extraidos no se devuelven de forma cruda. Antes de responder al cliente, el backend aplica una etapa de normalizacion para:

- eliminar duplicados;
- respetar el limite maximo de diez publicaciones;
- ordenar y completar los campos esperados;
- mantener una salida consistente para el frontend.

Adicionalmente, se incluyeron validaciones del username, manejo de errores tecnicos y mensajes comprensibles para escenarios como cuenta inexistente, cuenta privada, sesion invalida o ausencia de resultados visibles.

## 6. Funcionalidades complementarias implementadas

Con el objetivo de enriquecer el proyecto y demostrar un proceso completo de desarrollo, se añadieron las siguientes funcionalidades:

- **captura automatica del perfil consultado**;
- **historial local de consultas**;
- **exportacion de resultados en JSON**;
- **exportacion de resultados en CSV**;
- **comparacion con la consulta anterior** para detectar publicaciones nuevas mediante codigo corto o URL.

Estas funciones aportan valor academico porque no solo muestran la extraccion, sino tambien la gestion posterior de la informacion obtenida.

## 7. Logica empleada en el servidor

La logica principal del servidor se concentra en el servicio orquestador:

- valida datos de entrada;
- verifica la sesion persistente;
- crea el contexto de Playwright;
- ejecuta las estrategias de extraccion;
- normaliza el resultado;
- captura evidencia visual;
- compara con historial previo;
- exporta resultados;
- responde al frontend con un resumen tecnico.

Este enfoque desacoplado facilita el mantenimiento y permite intervenir partes especificas del sistema sin reescribir toda la solucion.

## 8. Logica empleada en el cliente

En el frontend se implemento una pagina principal con componentes pequenos y reutilizables. La interfaz permite:

- ingresar el username;
- iniciar la consulta;
- mostrar estado de carga;
- informar errores;
- presentar una grilla de publicaciones;
- mostrar un resumen tecnico;
- consultar historial reciente;
- acceder a las exportaciones generadas.

El cliente no realiza scraping. Su funcion es consumir la API del backend y presentar los datos de manera clara y ordenada.

## 9. Dificultades encontradas durante el desarrollo

Durante el desarrollo se presentaron desafios propios del scraping sobre Instagram:

- cambios en selectores y estructura del DOM;
- necesidad de reutilizar sesion sin incluir credenciales en el codigo;
- tiempos variables de carga en perfiles y publicaciones;
- necesidad de contar con estrategias de respaldo;
- diferencias entre error real de servidor y bloqueo del navegador por CORS durante pruebas locales.

Cada una de estas dificultades obligo a introducir mejoras graduales en la arquitectura, en la tolerancia a fallos y en la claridad de los mensajes de error.

## 10. Justificacion tecnica de la herramienta elegida

Se selecciono **Playwright** porque permite:

- automatizar navegadores modernos;
- reutilizar `storageState` para sesion persistente;
- navegar y esperar elementos de manera controlada;
- capturar evidencias visuales;
- trabajar de forma robusta con aplicaciones web dinamicas.

La eleccion de Playwright resulta adecuada para Instagram debido a que gran parte del contenido se renderiza dinamicamente y requiere una herramienta de automatizacion real del navegador.

## 11. Resultados obtenidos

Como resultado del desarrollo, se obtuvo una aplicacion web capaz de consultar perfiles publicos de Instagram y devolver un conjunto resumido de publicaciones visibles, junto con informacion adicional util para el seguimiento del proceso:

- extractor utilizado;
- tiempo total del proceso;
- cantidad de publicaciones obtenidas;
- evidencias en imagen;
- exportaciones en JSON y CSV;
- comparacion con consultas anteriores.

Esto demuestra que el sistema no solo cumple una funcion puntual de extraccion, sino que integra varias etapas de procesamiento y control del resultado.

## 12. Conclusion

El desarrollo individual del proyecto **Bitacora de Publicaciones** demuestra la construccion de un proceso de web scraping estructurado, desacoplado y reutilizable sobre una pagina publica de Instagram. La solucion evita credenciales hardcodeadas, aplica sesion persistente, utiliza estrategias de extraccion, normaliza resultados y conserva evidencias e historial.

Desde una perspectiva academica, el proyecto evidencia no solo la obtencion de datos desde una web publica, sino tambien la aplicacion de buenas practicas de organizacion del codigo, separacion de responsabilidades, tipado fuerte, manejo de errores y mantenimiento de una arquitectura escalable.

## 13. Recomendaciones futuras

Como mejoras posteriores, se pueden considerar:

- incorporar pruebas automatizadas del flujo de extraccion;
- fortalecer aun mas los selectores frente a cambios de Instagram;
- mejorar la presentacion visual de los resultados en el frontend;
- agregar filtros o reportes adicionales sobre las publicaciones obtenidas.

## 14. Declaracion final

El presente documento sustituye y complementa la explicacion funcional del proyecto, detallando el proceso seguido y la logica implementada para el desarrollo del scraping sobre una pagina publica de Instagram.
