#!/usr/bin/env python3
"""Texto por capítulos de Funk: The Music, the People, and the Rhythm of the One (Rickey Vincent, St. Martin’s Griffin, 1996).

Uso: python3 -I tools/split.py <dir_txt> <toc.ncx> <dir_salida>

<dir_txt> tiene un .txt por fichero del ePub (pandoc, un párrafo por línea). Capítulo 1: el prólogo de
George Clinton y el prefacio; 2-23: los capítulos 1-22 del libro (chapterN). La discografía esencial
(«Essential Funk Recordings») son páginas escaneadas como imágenes y se vuelca a mano en el último
data/NN-*.js. Los títulos de sección son líneas que coinciden (sin mayúsculas) con una entrada del índice
(toc.ncx). Escribe <dir>/NN.txt y <dir>/book.json (párrafos {ch, sec, segs:[[pág, texto]]}, el formato de
tools/refs.py). El ePub no trae paginación impresa: la página se estima a 300 palabras por página.
"""
import html
import json
import re
import sys
from pathlib import Path

WORDS_PER_PAGE = 300
FILES = {1: ['foreword', 'preface']} | {n + 1: [f'chapter{n}'] for n in range(1, 23)}


def main(txt_dir, toc, out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    heads = {html.unescape(t).strip().lower() for t in re.findall(r'<text>([^<]*)</text>', Path(toc).read_text())}
    paras, words = [], 0
    for ch, names in FILES.items():
        sec, text = None, []
        for name in names:
            lines = [l.strip() for l in (Path(txt_dir) / f'{name}.txt').read_text().splitlines()]
            lines = [l for l in lines if l and l not in ('[]', ' ')]
            for i, l in enumerate(lines):
                if (ch > 1 and i < 2) or l.lower() in heads:
                    sec = None if (ch > 1 and i < 2) else l
                    text.append(f'## {l}')
                    continue
                page = words // WORDS_PER_PAGE + 1
                paras.append({'ch': ch, 'sec': sec, 'segs': [[page, l]]})
                text.append(f'[pág. ≈{page}] {l}')
                words += len(l.split())
        (out / f'{ch:02d}.txt').write_text('\n\n'.join(text) + '\n')
        print(f'cap. {ch}: {sum(len(p["segs"][0][1].split()) for p in paras if p["ch"] == ch)} palabras')
    (out / 'book.json').write_text(json.dumps(paras, ensure_ascii=False))


if __name__ == '__main__':
    main(*sys.argv[1:])
