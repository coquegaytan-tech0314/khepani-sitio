#!/usr/bin/env python3
"""Apply Drive shortlist campus photos (Sep18) to propuestas/{editorial,sellos,academia}.

Hero bytes are replaced separately (same filename hero-campus-hd.jpg).
Surgical + idempotent. Prefer new primaria/cancha/hero; keep Sep17 secundaria niveles
and existing Sep17 gallery accents. Strip data-k so JS loaders do not overwrite.
"""
from __future__ import annotations

from pathlib import Path
import re
import sys

FIGS = {
    "campus-primaria-sep18.jpg": """
            <figure class=\"gallery__item\">
              <img src=\"../photos/campus-primaria-sep18.jpg\" alt=\"Fachada de Primaria Instituto Khépani, CCT 11PPR1068V\" width=\"900\" height=\"1200\" loading=\"lazy\" />
              <figcaption>Primaria · septiembre</figcaption>
            </figure>
""",
    "campus-cancha-cubierta-sep18.jpg": """
            <figure class=\"gallery__item\">
              <img src=\"../photos/campus-cancha-cubierta-sep18.jpg\" alt=\"Cancha techada del campus Instituto Khépani\" width=\"1200\" height=\"900\" loading=\"lazy\" />
              <figcaption>Cancha techada</figcaption>
            </figure>
""",
    "campus-bandera-sep18.jpg": """
            <figure class=\"gallery__item\">
              <img src=\"../photos/campus-bandera-sep18.jpg\" alt=\"Bandera mexicana en el campus Instituto Khépani\" width=\"900\" height=\"1200\" loading=\"lazy\" />
              <figcaption>Bandera · acento</figcaption>
            </figure>
""",
    "campus-secundaria-flag-sep18.jpg": """
            <figure class=\"gallery__item\">
              <img src=\"../photos/campus-secundaria-flag-sep18.jpg\" alt=\"Bandera y edificio de Secundaria Instituto Khépani\" width=\"1200\" height=\"900\" loading=\"lazy\" />
              <figcaption>Secundaria y bandera</figcaption>
            </figure>
""",
}


def patch(html: str) -> str:
    html = re.sub(
        r'src=\"../photos/hero-campus(?:-hd)?\\.(?:webp|jpg)\"\\s*(?:data-k=\"hero-campus\")?',
        'src=\"../photos/hero-campus-hd.jpg\"',
        html,
    )
    html = re.sub(
        r'(src=\"../photos/hero-campus-hd\\.jpg\")\\s+data-k=\"hero-campus\"',
        r'\\1',
        html,
    )
    html = re.sub(
        r'src=\"../photos/primaria\\.jpg\"(?:\\s+data-k=\"primaria\")?',
        'src=\"../photos/campus-primaria-sep18.jpg\"',
        html,
    )
    html = re.sub(
        r'src=\"\"\\s+data-k=\"primaria\"',
        'src=\"../photos/campus-primaria-sep18.jpg\"',
        html,
    )
    html = re.sub(
        r'(src=\"../photos/campus-primaria-sep18\\.jpg\")\\s+data-k=\"primaria\"',
        r'\\1',
        html,
    )
    html = re.sub(
        r'(src=\"../photos/campus-secundaria-sep17\\.jpg\")\\s+data-k=\"secundaria\"',
        r'\\1',
        html,
    )
    html = re.sub(
        r'src=\"../photos/campus-cancha-cubierta\\.webp\"\\s+data-k=\"campus-cancha-cubierta\"',
        'src=\"../photos/campus-cancha-cubierta-sep18.jpg\"',
        html,
    )
    html = re.sub(
        r'(src=\"../photos/campus-cancha-cubierta-sep18\\.jpg\")\\s+data-k=\"campus-cancha-cubierta\"',
        r'\\1',
        html,
    )
    missing = [FIGS[k] for k in FIGS if k not in html]
    if missing:
        m = re.search(r'(id=\"campus\"[\\s\\S]*?</figure>)', html)
        if not m:
            m = re.search(
                r'(<(?:section|div)[^>]*(?:id=\"campus\"|class=\"[^\"]*gallery[^\"]*\")[^>]*>[\\s\\S]*?</figure>)',
                html,
            )
        if not m:
            raise SystemExit('campus gallery anchor not found')
        html = html[: m.end()] + ''.join(missing) + html[m.end() :]
    return html


def main() -> None:
    base = Path('propuestas')
    targets = []
    for prop in ('editorial', 'sellos', 'academia'):
        for fname in ('index.html', 'full.html'):
            p = base / prop / fname
            if p.exists():
                targets.append(p)
    if not targets:
        print('no propuestas HTML found — run from repo root', file=sys.stderr)
        sys.exit(1)
    for p in targets:
        old = p.read_text(encoding='utf-8')
        new = patch(old)
        p.write_text(new, encoding='utf-8')
        print(
            'patched',
            p,
            'hero-hd', new.count('hero-campus-hd.jpg'),
            'primaria18', new.count('campus-primaria-sep18.jpg'),
            'cancha18', new.count('campus-cancha-cubierta-sep18.jpg'),
            'bandera18', new.count('campus-bandera-sep18.jpg'),
            'secflag18', new.count('campus-secundaria-flag-sep18.jpg'),
            'sec17', new.count('campus-secundaria-sep17.jpg'),
            'data-k-hero', new.count('data-k="hero-campus"'),
            'data-k-cancha', new.count('data-k="campus-cancha-cubierta"'),
        )


if __name__ == '__main__':
    main()
