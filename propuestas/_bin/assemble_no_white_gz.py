#!/usr/bin/env python3
"""Decode gzipped base64 HTML into propuestas/*/index.html"""
from pathlib import Path
import base64, gzip
root = Path("propuestas/_bin/no-white-gz")
for name in ("sellos", "editorial", "academia"):
    p = root / f"{name}.html.gz.b64"
    if not p.exists():
        print("missing", p)
        continue
    raw = gzip.decompress(base64.b64decode(p.read_text().strip()))
    out = Path("propuestas") / name / "index.html"
    out.write_bytes(raw)
    print("wrote", out, len(raw))
