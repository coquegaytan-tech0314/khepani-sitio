# CloudAgent — hero building visible + URGENT Editorial restore

Repo: https://github.com/coquegaytan-tech0314/khepani-sitio  
Branch: `hero-building-visible` · PR https://github.com/coquegaytan-tech0314/khepani-sitio/pull/24  
Do NOT merge. Do NOT touch institutokhepani.com. Do NOT push to main.

## URGENT
`propuestas/editorial/index.html` currently has a temporary JS loader. Replace with the full patched HTML from uploads.

## Attachments (preferred)
Copy from CloudAgent uploads/:
- `editorial-index.html` → `propuestas/editorial/index.html`
- `sellos-index.html` → `propuestas/sellos/index.html`
- `academia-index.html` → `propuestas/academia/index.html`

## Verify
- Each file starts with `<!DOCTYPE html>` or `<!doctype html>`
- Sellos: `object-position: 32% 58%` and scrim includes `0.72) 0%`
- Editorial: `object-position: 32% 48%`
- Academia: `object-position: 32% 55%`

## Fallback
Restore Editorial from `main`, then `python3 propuestas/apply_hero_building_visible.py`.

## Optional JPEG
Only if CSS still weak: attach `file:///workspace/khep-hq/assets/hero-building-fix/ship/hero-campus-hd-building.jpg` → `propuestas/photos/hero-campus-hd-building.jpg` and point heroes at it.

Commit + push. Keep draft. Report SHA.
