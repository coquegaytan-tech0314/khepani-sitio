# Imágenes de la propuesta Fable 5.2

Para no duplicar fotos grandes que ya están en el repositorio, esta carpeta
referencia los originales en `../photos/` (y `../photos/proximamente/` para
los renders). El recorte de cada foto se hace con CSS (`object-fit` y
`object-position`). En particular, `vida-paz.webp` se recorta por abajo
(`object-position: center bottom`) para ocultar la cita en blanco que trae
el original.

El logotipo recortado (sin el margen blanco de `logo-oficial.png`) va
incrustado en `index.html`. Las tipografías Newsreader y Figtree van
incrustadas en `styles.css`.

Lo único que la página pide fuera de esta carpeta, además de las fotos, son
los dos archivos del asistente: `../presidencial/asistente.js` y
`../presidencial/conocimiento.json`. No se modifica ni la Cloud Function
ni esas bases.

| Uso en la página | Archivo en `../photos/` |
| --- | --- |
| Portada (bandera / campus) | `campus-secundaria-flag-sep18.jpg` |
| Portada, mosaico explanada | `galeria-explanada.webp` |
| Portada, mosaico andador | `galeria-cancha-frontal.webp` |
| Tarjeta de Primaria | `campus-primaria-sep18.jpg` |
| Tarjeta de Secundaria | `campus-secundaria-portrait-sep17.jpg` |
| Tarjeta de Preparatoria | `galeria-fachada-lateral.webp` |
| Programa de inglés | `miss-sandy-english.jpg` (el `.webp` de main está dañado) |
| Formación en valores (PAZ) | `vida-paz.webp` |
| Campus, foto ancha | `hero-campus.webp` |
| Cancha techada | `campus-cancha-cubierta.webp` |
| Pasillo | `galeria-edificio-moderno.webp` |
| Fachada de Primaria | `primaria.jpg` |
| Próximamente | `proximamente/cafeteria-aerea.jpg`, `plan-maestro.jpg`, `anfiteatro.jpg`, `jardineras.jpg`, `terraza-pista.jpg` |
| Iconos / og:image / JSON-LD | `logo-oficial.png`, `campus-secundaria-flag-sep18.jpg` |
