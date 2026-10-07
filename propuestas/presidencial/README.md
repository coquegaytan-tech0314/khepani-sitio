# Propuesta Presidencial — Pregúntale a Khépani

Borrador de diseño para la revisión interna de Instituto Khépani. No es el sitio en vivo (`institutokhepani.com`).

«Pregúntale a Khépani» contesta en el navegador. No llama a un modelo externo ni guarda claves. `asistente.js` elige una ficha de `conocimiento.json` según el tema de la pregunta, el nivel (si lo dice) y la audiencia (Padres, Alumnos, Profesores, Personal).

El ciclo 2026-2027 ya orienta con datos de la escuela: requisitos de inscripción, becas, descuentos, venta de libros y uniformes en julio, y claves de incorporación. Las colegiaturas se dicen en rango aproximado y siempre invitan a agendar cita para el costo exacto. Vacaciones, días festivos, desfiles y las fechas de eventos siguen con `kind: "ejemplo"`.

## Cómo sustituir los documentos reales

1. Edite solo `conocimiento.json`.
2. Cada entrada tiene `id`, `audiences`, `topics`, `kind`, `keywords`, `title`, `answer` y `sources`. Si la ficha es de un solo nivel, agregue `nivel` (`primaria`, `secundaria` o `preparatoria`). Sin `nivel`, se usa cuando la pregunta no nombra un nivel, o nombra más de uno.
3. `kind: "ejemplo"` muestra la etiqueta **Información de ejemplo**. Úsela en calendario, vacaciones, días festivos, desfiles y fechas de eventos mientras no exista el calendario oficial.
4. Cuando la escuela entregue el calendario, reemplace `answer` con el texto vigente y cambie `kind` a `"hecho"`. La etiqueta desaparece sola. No hace falta tocar el HTML.
5. `sources` nombra el archivo que debe ocupar ese lugar (por ejemplo `documentos/calendario-oficial.pdf`). Hoy no se descarga nada: es la ranura del documento real.
6. Las palabras que enrutan la pregunta viven en `topics[].words`. Si agrega un tema, declare ahí su `id`, `label`, `priority` y `words`, y cree entradas con ese `topics`.
7. `offerCita: true` muestra el botón «Agenda una cita» después de la respuesta. Hoy va en colegiaturas, inscripción, becas y descuentos.

Las fichas con `suggest: true` y `prompt` aparecen como sugerencias para esa audiencia. «Agendar cita» es una acción aparte: abre el formulario, no una ficha.

## Citas por WhatsApp

El formulario pide nombre de mamá, papá o tutor, nombre del alumno, nivel y grado, día y hora (lunes a viernes, 8:00 a 15:00), teléfono y la pregunta. Si los datos sirven, muestra el mensaje en claro y abre WhatsApp al (445) 103-0946 con ese texto ya escrito. La familia toca enviar. No hay servidor, ni claves, ni se guarda la cita en esta página.

## Dónde conectar un backend con LLM

El único punto de sustitución es la función `responder` dentro de `crearMotor`, en `asistente.js`.

Hoy devuelve:

```json
{
  "id": "vacaciones-padres",
  "title": "Vacaciones del ciclo",
  "answer": "Información de ejemplo. …",
  "kind": "ejemplo",
  "badge": "Información de ejemplo",
  "topicLabel": "Vacaciones",
  "sources": ["documentos/calendario-oficial.pdf"],
  "offerCita": false
}
```

`badge` es `"Información de ejemplo"` solo cuando `kind` es `"ejemplo"`. `montar()` pinta el hilo y no hace falta cambiarlo si la respuesta conserva esa forma.

Para un recuperador futuro (fragmentos de los PDF oficiales y, si se quiere, un modelo), reemplace el cuerpo de `responder` por una llamada a su API:

`POST /api/khepani/preguntar`

```json
{ "pregunta": "¿Cuándo son las vacaciones?", "audiencia": "padres" }
```

Ese servicio viviría fuera de GitHub Pages. Este repositorio no incluye claves ni un cliente de ningún proveedor. Mantenga `kind: "ejemplo"` cuando el fragmento recuperado no sea el documento vigente del ciclo.

## App de pantalla de inicio

La propuesta se puede instalar desde `propuestas/presidencial/` (manifest, iconos y service worker). En GitHub Pages el alcance es `/khepani-sitio/propuestas/presidencial/`. El service worker guarda la página, el CSS, el asistente, `conocimiento.json` y las fotos de esta propuesta para abrirlas sin red. Sellos, Editorial y Academia no entran en ese alcance.

## Contraste

En esta propuesta la tinta clara solo va sobre relleno azul marino sólido (franja superior, hero en teléfono, títulos de la banda de vida escolar, encabezado del chat, burbuja de quien pregunta, botones marino y pie). En escritorio el hero y las fichas de foto usan tinta marina sobre crema o blanco. No ponga texto blanco sobre fotos ni sobre fondos claros.
