# Propuesta Presidencial — Pregúntale a Khépani

Borrador de diseño para la revisión interna de Instituto Khépani. No es el sitio en vivo (`institutokhepani.com`).

«Pregúntale a Khépani» pregunta primero al asistente en la nube. No hay claves en este repositorio. Si la llamada falla, tarda más de unos 20 segundos o no responde 200, `asistente.js` elige una ficha de `conocimiento.json` según el tema de la pregunta, el nivel (si lo dice) y la audiencia (Padres, Alumnos, Profesores, Personal).

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

El formulario pide nombre de mamá, papá o tutor, nombre del alumno, nivel y grado, día y hora (lunes a viernes, 8:00 a 15:00), teléfono y la pregunta. Si los datos sirven, muestra el mensaje en claro y abre WhatsApp al (445) 103-0946 con ese texto ya escrito. La familia toca enviar. Esta página no guarda la cita ni la manda al asistente.

## Asistente en la nube

Cada pregunta hace `POST` a `https://us-central1-khepani-guanajuato.cloudfunctions.net/asistente` con `Content-Type: application/json`:

```json
{
  "message": "¿Cuánto cuesta la secundaria?",
  "history": [
    { "role": "user", "content": "…" },
    { "role": "assistant", "content": "…" }
  ],
  "audiencia": "publico"
}
```

`history` son los últimos 8 turnos, sin contar la pregunta que va en `message`. La respuesta es `{answer, offerCita, cita:{whatsapp, phone}, model, guarded}`.

`answer` se muestra como texto plano. Las direcciones, los correos y el teléfono se vuelven enlaces con nodos del documento; el HTML del modelo no se inserta. Si `offerCita` es verdadero, aparece el botón «Agenda una cita», que abre el mismo formulario de arriba. El número del formulario sigue siendo `wa.me/524451030946`.

Si `fetch` falla, se agota el tiempo (~20 s) o el estado no es 200, responde el emparejamiento de `conocimiento.json`. Ese respaldo conserva la forma anterior (`answer`, `kind`, `badge`, `topicLabel`, `offerCita`). `badge` es «Información de ejemplo» solo cuando `kind` es `"ejemplo"`.

El service worker no guarda las peticiones al asistente. La caché del shell es solo de esta propuesta.

## App de pantalla de inicio

La propuesta se puede instalar desde `propuestas/presidencial/` (manifest, iconos y service worker). En GitHub Pages el alcance es `/khepani-sitio/propuestas/presidencial/`. El service worker guarda la página, el CSS, el asistente, `conocimiento.json` y las fotos de esta propuesta para abrirlas sin red. Sellos, Editorial y Academia no entran en ese alcance.

## Contraste

En esta propuesta la tinta clara solo va sobre relleno azul marino sólido (franja superior, hero en teléfono, títulos de la banda de vida escolar, encabezado del chat, burbuja de quien pregunta, botones marino y pie). En escritorio el hero y las fichas de foto usan tinta marina sobre crema o blanco. No ponga texto blanco sobre fotos ni sobre fondos claros.
