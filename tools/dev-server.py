#!/usr/bin/env python
"""
Servidor local que imita a Vercel: si el archivo existe lo sirve, si no,
devuelve index.html para que el router se encargue. Sin esto, abrir
/presupuesto en local da 404 y no se puede probar el ruteo real.

Uso:  python tools/dev-server.py [puerto]
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIPOS = {'.avif': 'image/avif', '.webp': 'image/webp', '.js': 'text/javascript; charset=utf-8'}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def translate_path(self, path):
        p = super().translate_path(path)
        if os.path.isdir(p):
            idx = os.path.join(p, 'index.html')
            return idx if os.path.exists(idx) else p
        if not os.path.exists(p):
            return os.path.join(ROOT, 'index.html')   # el rewrite de vercel.json
        return p

    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return TIPOS.get(ext) or super().guess_type(path)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
    print(f'http://localhost:{port}  (Ctrl+C para cortar)')
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
