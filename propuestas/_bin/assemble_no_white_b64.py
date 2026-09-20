#!/usr/bin/env python3
from pathlib import Path
import base64
def main():
    root = Path("propuestas/_bin/no-white-b64")
    for name in ("sellos", "editorial", "academia"):
        parts = sorted((root/name).glob("part-*.b64"))
        b64 = "".join(p.read_text() for p in parts)
        out = Path("propuestas")/name/"index.html"
        out.write_bytes(base64.b64decode(b64))
        print("wrote", out, out.stat().st_size)
if __name__ == "__main__":
    main()
