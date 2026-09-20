# no-white-text-readable assemble

Patched Sellos / Editorial / Academia HTML (navy text + cream scrims) are stored as gzipped base64:

- `editorial.html.gz.b64`
- `academia.html.gz.b64`
- `sellos.html.gz.b64.part0` + `sellos.html.gz.b64.part1` (concat)

From repo root on this branch:

```bash
python3 propuestas/_bin/assemble_no_white_gz.py
git add propuestas/sellos/index.html propuestas/editorial/index.html propuestas/academia/index.html
git commit -m "fix(propuestas): navy text + cream scrims instead of washed white letters"
git push
```

Or CloudAgent / MCP `push_files` with full content from local:

- `/workspace/khepani-sitio/propuestas/sellos/index.html`
- `/workspace/khepani-sitio/propuestas/editorial/index.html`
- `/workspace/khepani-sitio/propuestas/academia/index.html`

Unified patch (applies cleanly on main): `../no-white-text-readable.patch`
