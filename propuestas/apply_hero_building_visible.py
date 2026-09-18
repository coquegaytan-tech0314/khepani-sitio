#!/usr/bin/env python3
"""Patch Sellos/Editorial/Academia heroes so the Secundaria facade shows more clearly."""
from pathlib import Path

PROOT = Path("propuestas") if Path("propuestas").is_dir() else Path(".")

CHANGES = [
    (
        PROOT / "sellos" / "index.html",
        '''.hero__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 55%;
}''',
        '''.hero__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Favor Secundaria facade (left-of-center) over flag/tree on the right */
  object-position: 32% 58%;
}''',
    ),
    (
        PROOT / "sellos" / "index.html",
        '''.hero__scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255,250,245,0.90) 0%, rgba(255,250,245,0.58) 38%, rgba(255,250,245,0.10) 72%, rgba(255,250,245,0) 100%),
    linear-gradient(180deg, rgba(255,250,245,0.18) 0%, rgba(255,250,245,0.04) 42%, rgba(255,250,245,0.78) 100%);
}''',
        '''.hero__scrim {
  position: absolute;
  inset: 0;
  /* Lighter left wash so white/orange facade stays readable behind copy */
  background:
    linear-gradient(90deg, rgba(255,250,245,0.72) 0%, rgba(255,250,245,0.38) 28%, rgba(255,250,245,0.08) 58%, rgba(255,250,245,0) 82%),
    linear-gradient(180deg, rgba(255,250,245,0.14) 0%, rgba(255,250,245,0.03) 40%, rgba(255,250,245,0.72) 100%);
}''',
    ),
    (
        PROOT / "editorial" / "index.html",
        '''.hero-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 42%;
}''',
        '''.hero-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Same facade focal point as Sellos (building left-of-center in hero-campus-hd) */
  object-position: 32% 48%;
}''',
    ),
    (
        PROOT / "academia" / "index.html",
        '''.hero__plate img {
  width: 100%;
  height: min(68vh, 620px);
  object-fit: cover;
  object-position: 50% 52%;
  filter: saturate(0.98) contrast(0.96) brightness(1.16);
}''',
        '''.hero__plate img {
  width: 100%;
  height: min(68vh, 620px);
  object-fit: cover;
  /* Same facade focal point as Sellos/Editorial */
  object-position: 32% 55%;
  filter: saturate(0.98) contrast(0.96) brightness(1.16);
}''',
    ),
]

def main():
    for path, old, new in CHANGES:
        text = path.read_text(encoding="utf-8")
        if old not in text:
            if "object-position: 32%" in text:
                print(f"SKIP already patched: {path}")
                continue
            raise SystemExit(f"Pattern not found in {path}")
        path.write_text(text.replace(old, new, 1), encoding="utf-8")
        print(f"OK {path}")

if __name__ == "__main__":
    main()
