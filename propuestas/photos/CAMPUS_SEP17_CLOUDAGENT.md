# CloudAgent task — campus-sep17-refresh

Repo: https://github.com/coquegaytan-tech0314/khepani-sitio
Branch: campus-sep17-refresh (exists) from main. Do NOT merge. Do NOT touch institutokhepani.com.

## Attach images (exact bytes required)
If your launcher supports `images:[{url:file:///...}]`, attach:
- file:///workspace/khep-hq/assets/campus-sep17/ship/hero-campus-hd.jpg
- file:///workspace/khep-hq/assets/campus-sep17/ship/campus-secundaria-sep17.jpg
- file:///workspace/khep-hq/assets/campus-sep17/ship/campus-bandera-sep17.jpg
- file:///workspace/khep-hq/assets/campus-sep17/ship/campus-secundaria-portrait-sep17.jpg

sha256 MUST match propuestas/photos/CAMPUS_SEP17_MANIFEST.json on this branch.

## Steps
1. Checkout campus-sep17-refresh.
2. If attachment files are on the VM as real JPEGs, copy them to propuestas/photos/ with the names above. Verify sha256.
3. If you only have vision/screenshot previews, STOP and report — do not recompress.
4. Fallback: download from Google Drive folder https://drive.google.com/drive/folders/1bentF8OG9WOqtQqvwk_eYMpizcJxKeFi (same filenames) if authenticated.
5. Run: `python3 propuestas/apply_campus_sep17_html.py`
6. Commit + push to campus-sep17-refresh. Keep PR #23 draft.
7. Do not close PR #22 yourself unless asked.

## Paths/hashes
hero-campus-hd.jpg 522770 89a042d305d91fa05cd94c6cf3e50239316d1dd84e2239dc11678c353c78051e
campus-secundaria-sep17.jpg 595382 d5a373918aaddd968d60ae153137e2259fdf2c6d7e6de8770ec63b988f76d105
campus-bandera-sep17.jpg 1072480 cb93d33a351809d70bc59902a5c327d114894e314cc46274aefe50b73fb1a977
campus-secundaria-portrait-sep17.jpg 452568 9f7fa03a0f0a1dcb1da480bf49c13c946fd6758951647b892764eb8318a0d500
