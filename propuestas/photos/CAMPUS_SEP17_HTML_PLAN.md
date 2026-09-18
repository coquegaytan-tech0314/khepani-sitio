# HTML patches to apply on campus-sep17-refresh

Apply these changes to propuestas/{editorial,sellos,academia}/index.html.

## Shared rules
1. Hero: `hero-campus.webp` + `data-k="hero-campus"` → `src="../photos/hero-campus-hd.jpg"` (remove data-k)
2. Niveles Secundaria building: `secundaria.webp` + data-k → `campus-secundaria-sep17.jpg` (remove data-k)
3. #campus gallery: add three figures (no data-k) for campus-secundaria-sep17.jpg, campus-bandera-sep17.jpg, campus-secundaria-portrait-sep17.jpg; remove old gallery secundaria.webp slot if duplicate.

Full patched files + unified diffs live on the box at `/workspace/khep-hq/assets/campus-sep17/html-patches/`.
Exact JPEG bytes on Drive folder https://drive.google.com/drive/folders/1bentF8OG9WOqtQqvwk_eYMpizcJxKeFi and box `/workspace/khep-hq/assets/campus-sep17/ship/`.
