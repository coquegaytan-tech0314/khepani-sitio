#!/usr/bin/env python3
"""Assemble no-white-chunks into propuestas/*/index.html. Run from repo root."""
from pathlib import Path

def assemble(name: str) -> None:
    d = Path("propuestas/_bin/no-white-chunks") / name
    parts = sorted(d.glob("part-*.txt"))
    if not parts:
        raise SystemExit(f"no parts for {name}")
    text = "".join(p.read_text(encoding="utf-8") for p in parts)
    out = Path("propuestas") / name / "index.html"
    out.write_text(text, encoding="utf-8")
    print(f"wrote {out} ({len(text)} chars) from {len(parts)} parts")

def main() -> None:
    for name in ("sellos", "editorial", "academia"):
        assemble(name)

if __name__ == "__main__":
    main()
