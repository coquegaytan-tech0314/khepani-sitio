#!/usr/bin/env python3
"""Decode gzipped base64 HTML into propuestas/*/index.html"""
from pathlib import Path
import base64, gzip

root = Path("propuestas/_bin/no-white-gz")
for name in ("sellos", "editorial", "academia"):
    p = root / f"{name}.html.gz.b64"
    if p.exists():
        b64 = p.read_text().strip()
    else:
        parts = sorted(root.glob(f"{name}.html.gz.b64.part*"))
        if not parts:
            print("missing", name)
            continue
        b64 = "".join(x.read_text().strip() for x in parts)
    raw = gzip.decompress(base64.b64decode(b64))
    out = Path("propuestas") / name / "index.html"
    out.write_bytes(raw)
    print("wrote", out, len(raw))
