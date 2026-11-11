# Instituto Khépani · propuesta pulida «Fable 5.2» (Trial 2)

Propuesta de diseño para la dirección del instituto, basada en la pestaña
Presidencial. Vive completa en esta carpeta (`propuestas/fable-5-2/`) y no
modifica ninguna otra pestaña ni el sitio en vivo.

Es un **borrador**: la página lo dice en la barra superior y en el pie, y lleva
`<meta name="robots" content="noindex">` para que no aparezca en buscadores
hasta que la escuela la apruebe.

## Cómo verla

1. Copiar la carpeta `fable-5-2/` dentro de `propuestas/` del repositorio.
2. Publicada en GitHub Pages queda en
   `https://coquegaytan-tech0314.github.io/khepani-sitio/propuestas/fable-5-2/`.
3. En local, desde `propuestas/`: `python3 -m http.server 3000` y abrir
   `http://localhost:3000/fable-5-2/`.

Todas las rutas de archivos son relativas. No hay paso de compilación ni
dependencias de npm: es HTML, CSS y JavaScript sin librerías.

## Archivos

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | La página completa (una sola). |
| `styles.css` | Estilos. Paleta: azul marino, rojo, azul cielo y blanco. |
| `app.js` | Menú, pestañas de admisiones, animaciones, cita y montaje del asistente. |
| `sw.js` | Service worker propio (modo sin conexión). |
| `manifest.webmanifest` | Datos de la aplicación instalable. |
| `img/` | Fotos reales del campus ya optimizadas (ver `IMAGENES.md`). |
| `icons/` | Iconos de la aplicación y favicon, hechos con el logotipo oficial. |
| `fonts/` | Tipografías Newsreader y Figtree alojadas aquí mismo, con su licencia OFL. |
| `IMAGENES.md` | De qué foto original sale cada imagen. |

## Lo único que usa de fuera de la carpeta

| Ruta | Uso | ¿Se modificó? |
| --- | --- | --- |
| `../presidencial/asistente.js` | Motor de «Pregúntale a Khépani» y de la cita por WhatsApp. | No |
| `../presidencial/conocimiento.json` | Base local del asistente (ciclo 2026-2027). | No |

La página **no carga ningún archivo de `../photos/` ni de `../assets/`**: las
fotos que usa son copias optimizadas guardadas en `img/`.

## Pregúntale a Khépani

- Se reutiliza el motor existente tal cual. Aquí solo cambia el aspecto.
- El motor llama por `POST` a
  `https://us-central1-khepani-guanajuato.cloudfunctions.net/asistente` y, si
  no hay respuesta, contesta con `conocimiento.json`. No se tocó la función, su
  contrato, la base ni el candado de rangos de precios.
- La función solo acepta peticiones desde
  `https://coquegaytan-tech0314.github.io`. En cualquier otro dominio (o en
  local) el asistente contesta con la base local; es el comportamiento esperado.
- El cuerpo que envía el motor sin modificar es
  `{ message, history, audiencia: "publico" }`.
- Las respuestas de calendario salen marcadas como «Información de ejemplo» y
  la página lo avisa junto al asistente.
- Si el asistente o su base no cargan, en su lugar aparece un aviso con el
  WhatsApp, y la cita ofrece los botones de WhatsApp y de llamada.
- El botón rojo que el asistente agrega en algunas respuestas usa la clase
  `btn--orange` del motor; aquí se pinta con el rojo de la paleta.

Cuatro ajustes de comodidad viven en `app.js`, sin tocar el motor:

- Cuando una respuesta no cabe completa, la conversación se queda en el primer
  renglón de esa respuesta para leerla desde el inicio.
- Si la conversación continúa más abajo, aparece el aviso «Ver más» sobre su
  orilla; al tocarlo avanza casi una pantalla y desaparece al llegar al final.
- Con ratón, el formulario de cita no recentra la página en cada campo. En
  pantallas táctiles se conserva ese recentrado porque ayuda con el teclado.
- Con teclado, la sugerencia enfocada se acomoda completa dentro de la fila
  deslizable del celular.

En `styles.css`, las orillas de la conversación y de la fila de sugerencias se
desvanecen al deslizarlas, para que nada se vea cortado en seco.

## Reglas del encargo que se cuidaron

- Solo datos reales del instituto; los textos salen del encargo y de
  `conocimiento.json`.
- Precios únicamente en rangos, nunca exactos. Nada sobre 2027-2028.
- Las tradiciones se listan sin fechas. Las fechas de calendario solo aparecen
  dentro de las respuestas del asistente y marcadas como ejemplo.
- Los renders de «Próximamente» llevan la etiqueta «Render · proyecto futuro».
- Dirección tal como se pidió: «Libramiento San Miguel No. 202, La Joyita,
  Uriangato», sin código postal.
- Nunca texto blanco sobre fondo claro: el texto blanco solo va sobre azul
  marino o rojo sólidos, y el botón verde de WhatsApp lleva texto azul marino.
  No hay texto directamente sobre fotografías; la única etiqueta que va encima
  de una imagen («Render · proyecto futuro») lleva su propio fondo azul marino
  sólido. Se revisó el contraste de los textos (nivel AA).

## Accesibilidad, rendimiento y SEO

- Navegación completa con teclado, enlace «Saltar al contenido», foco visible,
  pestañas con flechas, menú móvil en `<dialog>` y respeto a «reducir
  movimiento».
- Funciona sin JavaScript: se ven los tres niveles con sus requisitos y la
  cita se ofrece por WhatsApp o teléfono.
- Primera carga de unos 400 KB en celular (12 archivos) y unos 430 KB en
  escritorio (16 archivos), sin comprimir y con las fuentes incluidas. No
  cuenta lo que el service worker guarda después en segundo plano. El resto de
  las fotos se cargan al acercarse. Imágenes en AVIF con respaldo en JPG.
- Título, descripción, Open Graph, enlace canónico y datos estructurados
  (`School`) listos. Las direcciones absolutas (canónico, `og:url`, `og:image`
  y el logotipo e imagen de los datos estructurados) apuntan a la vista previa
  de GitHub Pages. Para publicar de verdad: quitar `noindex`, quitar la nota de
  borrador y cambiar esas direcciones al dominio final.

## Aplicación instalable

- Caché propia: `khepani-fable-5-2-v1`. Solo borra versiones viejas con ese
  mismo prefijo, así que no afecta a Presidencial.
- Alcance: solo esta carpeta, más los dos archivos del asistente.
- Nunca intercepta al asistente en la nube, WhatsApp ni Google Maps.
- Para publicar cambios, subir la versión del nombre de la caché en `sw.js`.

## Avisos para quien la integre

1. **Dirección en las respuestas del asistente.** Fuera de esta carpeta
   todavía se escribe «Libramiento San Miguel (Arcángel) No. 202»:
   `../presidencial/conocimiento.json` en las líneas 463, 487, 511, 537 y 1013
   (esta última agrega «C.P. 38980») y `../presidencial/asistente.js` en la
   línea 332. Como esos archivos no se debían tocar, el asistente puede
   contestar con esa forma. Se corrige ahí, y conviene revisar también el
   texto que usa la función en la nube. En esta carpeta no aparece.
2. **Mapa.** El recuadro de Google Maps muestra su propia ficha, que incluye
   el código postal. Es contenido de Google dentro del mapa, no texto de la
   página. Si se prefiere, se puede dejar solo la tarjeta con el botón «Abrir
   en Google Maps», que ya existe como respaldo.
3. **Pestaña en la vista previa.** No se agregó una quinta pestaña en
   `propuestas/index.html` porque el encargo pedía no editar lo existente.
4. **Caché de Presidencial.** Su service worker borra las cachés que no son
   suyas. Si alguien abre Presidencial después de esta página, la copia sin
   conexión de aquí se vuelve a guardar en la siguiente visita con red.
5. **Mascota.** La base menciona un búho; el logotipo oficial muestra un libro
   y un globo. La página no menciona mascota.
6. **Pruebas.** Se revisó en Chromium, en tamaño de escritorio y de celular.
   Falta probarla en un iPhone con Safari y en Firefox antes de publicarla.

## Tipografías

Newsreader y Figtree, ambas con licencia SIL Open Font License 1.1. Los textos
de licencia están en `fonts/`.

## Fotos en GitHub Pages

Las fotos grandes se reutilizan desde `../photos/` para no duplicarlas en esta carpeta. El logotipo recortado y las tipografías van incrustados en el HTML y el CSS.
