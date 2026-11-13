#!/usr/bin/env python3
"""Writes the stand-in screenshots for the sample post sample-build-kitchen-sink.

Dark terminal-like panels drawn with the standard library only (no Pillow);
every colour is read from src/styles/vendor/tokens.css. Run from the repo root:
  python3 scripts/make-sample-shots.py
"""
import re
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/content/posts/sample-build-kitchen-sink"
TOKENS = (ROOT / "src/styles/vendor/tokens.css").read_text()


def token(name):
    m = re.search(rf"--{name}:\s*#([0-9A-Fa-f]{{6}})", TOKENS)
    return tuple(int(m.group(1)[i : i + 2], 16) for i in (0, 2, 4))


BG, BAR, DOT = token("space-950"), token("space-800"), token("moss-400")
INK = {"prompt": token("moss-300"), "text": token("starlight"), "value": token("stellar-300")}


def png(path, w, h, rows):
    """rows: list of (y, x, width, colour) bars on the dark panel."""
    px = [[BG] * w for _ in range(h)]
    for y in range(min(36, h)):
        px[y] = [BAR] * w
    for cx in (18, 34, 50):
        for y in range(12, 24):
            for x in range(cx - 6, cx + 6):
                if (x - cx) ** 2 + (y - 18) ** 2 <= 36:
                    px[y][x] = DOT
    for y, x, bw, col in rows:
        for yy in range(y, min(y + 10, h)):
            for xx in range(x, min(x + bw, w)):
                px[yy][xx] = col
    raw = b"".join(b"\x00" + bytes(c for p in row for c in p) for row in px)

    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))

    data = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    path.write_bytes(data)


def terminal(lines):
    """lines: (indent, width, kind) per line; 30 px per line from y = 60."""
    return [(60 + i * 30, 24 + ind, bw, INK[kind]) for i, (ind, bw, kind) in enumerate(lines)]


png(OUT / "shot-wide.png", 1200, 420, terminal([(0, 80, "prompt"), (0, 520, "text"), (0, 70, "value"), (0, 80, "prompt"), (0, 300, "text"), (0, 640, "text"), (0, 600, "text"), (0, 560, "text")]))
png(OUT / "shot-single.png", 960, 300, terminal([(0, 60, "prompt"), (0, 420, "text"), (0, 140, "value"), (0, 60, "prompt"), (0, 360, "text"), (0, 280, "text")]))
png(OUT / "shot-before.png", 600, 240, terminal([(0, 220, "text"), (0, 340, "value"), (0, 180, "text"), (0, 260, "text")]))
png(OUT / "shot-after.png", 600, 240, terminal([(0, 220, "text"), (0, 340, "value"), (0, 240, "text"), (0, 300, "text")]))
print("wrote 4 PNGs to", OUT.relative_to(ROOT))
