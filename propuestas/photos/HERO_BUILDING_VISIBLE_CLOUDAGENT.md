# CloudAgent — hero building more visible (CSS-first)

Repo: https://github.com/coquegaytan-tech0314/khepani-sitio  
Branch / starting_ref: `hero-building-visible` (already exists; update this PR, do not open a second branch)  
Do NOT touch institutokhepani.com. Do NOT merge. Do NOT push to main.

## Goal
Koke likes Sellos’ hero photo (`../photos/hero-campus-hd.jpg`) but the Secundaria white/orange building does not show up enough. Prefer CSS framing; keep the same JPEG.

## Already on the branch
`propuestas/apply_hero_building_visible.py` is committed.

## Steps
1. Checkout `hero-building-visible`.
2. From repo root run: `python3 propuestas/apply_hero_building_visible.py`
3. Confirm diffs only in:
   - `propuestas/sellos/index.html` — `object-position: 32% 58%` + lighter `.hero__scrim`
   - `propuestas/editorial/index.html` — `object-position: 32% 48%`
   - `propuestas/academia/index.html` — `object-position: 32% 55%`
4. Commit + push to `hero-building-visible`. Keep PR draft. No merge.
5. Report commit SHA + PR URL.

## Optional (only if CSS still insufficient after visual check)
Attach `file:///workspace/khep-hq/assets/hero-building-fix/ship/cand-A_facade.jpg` as `propuestas/photos/hero-campus-hd-building.jpg` (long edge 2400) and point the three heroes at it. Prefer CSS-only unless the facade is still weak.
