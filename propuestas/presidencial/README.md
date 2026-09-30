# Propuesta Presidencial — asistente de ejemplo

Borrador de diseño para la revisión interna de Instituto Khépani. No es el sitio en vivo (`institutokhepani.com`).

«Pregúntale a Khépani» contesta en el navegador. No llama a un modelo externo ni guarda claves. `asistente.js` elige una ficha de `conocimiento.json` según el tema de la pregunta y la audiencia (Padres, Alumnos, Profesores, Personal).

## Cómo sustituir los documentos reales

1. Edite solo `conocimiento.json`.
2. Cada entrada tiene `id`, `audiences`, `topics`, `kind`, `keywords`, `title`, `answer` y `sources`.
3. `kind: "ejemplo"` muestra la etiqueta **Información de ejemplo**. Úsela en calendario, vacaciones, días festivos, desfiles, eventos y listas de documentos mientras no exista el archivo oficial.
4. Cuando la escuela entregue el documento, reemplace `answer` con el texto vigente y cambie `kind` a `"hecho"`. La etiqueta desaparece sola. No hace falta tocar el HTML.
5. `sources` nombra el archivo que debe ocupar ese lugar (por ejemplo `documentos/calendario-oficial.pdf`). Hoy no se descarga nada: es la ranura del documento real.
6. Las palabras que enrutan la pregunta viven en `topics[].words`. Si agrega un tema, declare ahí su `id`, `label`, `priority` y `words`, y cree entradas con ese `topics`.

Las fichas con `suggest: true` y `prompt` aparecen como preguntas de muestra para esa audiencia.

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
  "sources": ["documentos/calendario-oficial.pdf"]
}
```

`badge` es `"Información de ejemplo"` solo cuando `kind` es `"ejemplo"`. `montar()` pinta el hilo y no hace falta cambiarlo si la respuesta conserva esa forma.

Para un recuperador futuro (fragmentos de los PDF oficiales y, si se quiere, un modelo), reemplace el cuerpo de `responder` por una llamada a su API:

`POST /api/khepani/preguntar`

```json
{ "pregunta": "¿Cuándo son las vacaciones?", "audiencia": "padres" }
```

Ese servicio viviría fuera de GitHub Pages. Este repositorio no incluye claves ni un cliente de ningún proveedor. Mantenga `kind: "ejemplo"` cuando el fragmento recuperado no sea el documento vigente del ciclo.

## Contraste

En esta propuesta la tinta clara solo va sobre relleno azul marino sólido (franja superior, hero, banda de oficio, encabezado del chat, burbuja de quien pregunta, botones marino y pie). Títulos, fichas de foto y burbujas de Khépani usan tinta marina sobre crema o blanco. No ponga texto blanco sobre fotos ni sobre fondos claros.
