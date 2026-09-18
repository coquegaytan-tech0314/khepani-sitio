#!/usr/bin/env python3
"""Apply Campus Sep17 HTML photo refresh to propuestas/{editorial,sellos,academia}/index.html"""
from pathlib import Path
import re
import sys

FIGS = """
            <figure class="gallery__item">
              <img src="../photos/campus-secundaria-sep17.jpg" alt="Edificio de Secundaria Instituto Khépani frente a la cancha, CCT 11PES0464H" width="1200" height="900" loading="lazy" />
              <figcaption>Secundaria y cancha</figcaption>
            </figure>
            <figure class="gallery__item">
              <img src="../photos/campus-bandera-sep17.jpg" alt="Bandera mexicana en el campus Instituto Khépani con el Cerro al fondo" width="900" height="1200" loading="lazy" />
              <figcaption>Bandera y Cerro</figcaption>
            </figure>
            <figure class="gallery__item">
              <img src="../photos/campus-secundaria-portrait-sep17.jpg" alt="Fachada de Secundaria Instituto Khépani (CCT 11PES0464H) con adornos patrios, vista vertical" width="900" height="1200" loading="lazy" />
              <figcaption>Secundaria · septiembre</figcaption>
            </figure>
"""

def patch(html: str) -> str:
    html = re.sub(
        r'src="../photos/hero-campus\.webp"\s+data-k="hero-campus"',
        'src="../photos/hero-campus-hd.jpg"',
        html,
    )
    html = html.replace(
        'src="../photos/secundaria.webp" data-k="secundaria"',
        'src="../photos/campus-secundaria-sep17.jpg"',
    )
    html = re.sub(
        r'\s*<figure class="gallery__item">\s*'
        r'<img src="../photos/secundaria\.webp" data-k="secundaria"[^>]*>\s*'
        r'<figcaption>Secundaria · CCT 11PES0464H</figcaption>\s*'
        r'</figure>',
        '\n',
        html,
        count=1,
    )
    if 'campus-bandera-sep17.jpg' not in html:
        m = re.search(r'(id="campus"[\s\S]*?</figure>)', html)
        if not m:
            raise SystemExit('campus section not found')
        html = html[: m.end()] + FIGS + html[m.end() :]
    if html.count('campus-secundaria-sep17.jpg') > 2:
        html = re.sub(
            r'\s*<figure class="gallery__item">\s*'
            r'<img src="../photos/campus-secundaria-sep17\.jpg" '
            r'alt="Edificio de Secundaria del Instituto Khépani, CCT 11PES0464H"[^>]*>\s*'
            r'<figcaption>Secundaria · CCT 11PES0464H</figcaption>\s*'
            r'</figure>',
            '\n',
            html,
            count=1,
        )
    return html

def main() -> None:
    base = Path('propuestas')
    for prop in ('editorial', 'sellos', 'academia'):
        p = base / prop / 'index.html'
        if not p.exists():
            print('missing', p)
            continue
        new = patch(p.read_text(encoding='utf-8'))
        p.write_text(new, encoding='utf-8')
        print(
            'patched', p,
            'hero-hd', new.count('hero-campus-hd.jpg'),
            'bandera', new.count('campus-bandera-sep17.jpg'),
        )

if __name__ == '__main__':
    main()
