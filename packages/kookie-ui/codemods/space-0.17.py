"""
Kookie UI 0.17 spacing codemod.

The space palette moved to v2's twelve steps, so every old step N becomes N+1
(80px and 112px have no match and move to 64px and 96px). This rewrites, in place:

- layout props in .tsx/.jsx/.js/.mdx: p, px, py, pt, pr, pb, pl, m*, gap, gapX, gapY,
  rowGap, columnGap, inset, top, right, bottom, left; plain strings, `{"4"}` and responsive objects
- var(--space-N) in .css/.scss/.ts/.tsx/.js/.jsx/.mjs/.cjs/.mdx, and var(--scaling) to var(--scale)

It cannot read a value that is not written out: a ternary, a variable, a spread or a template
string keeps its old step, also as one entry of a responsive object. It prints each such prop;
MIGRATION.md says how to find the rest.

Usage: python3 space-0.17.py <folder|file> [...]
Run it once. Running it twice shifts everything twice.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _shared import files  # noqa: E402

MAP = {1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10, 11: 11, 12: 11}
PROPS = 'p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gapX|gapY|rowGap|columnGap|inset|top|right|bottom|left'
PLAIN = re.compile(r'(?<![\w.-])(' + PROPS + r')=(\{\s*)?(["\'])(-?\d+)\3(?(2)\s*\})')
OBJECT = re.compile(r'(?<![\w.-])(' + PROPS + r')=\{\{([^{}]*)\}\}')
ENTRY = re.compile(r'(\w+\s*:\s*)(["\'])(-?\d+)\2')
ENTRY_ONLY = re.compile(r'^\s*(["\']?)\w+\1\s*:\s*(["\'])[^"\']*\2\s*$')
SPACE = re.compile(r'--space-(\d+)\b')
COMPUTED = re.compile(r'(?<![\w.-])(' + PROPS + r')=\{(?!\s*\{)(?!\s*["\'][^"\']*["\']\s*\})')
SCALING = re.compile(r'var\(--scaling(?=\s*[,)])')
EXT = ('.css', '.scss', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mdx')
JSX = ('.tsx', '.jsx', '.js', '.mdx')


def shift(value):
    negative = value.startswith('-')
    n = int(value.lstrip('-'))
    if n not in MAP:
        return value
    return ('-' if negative else '') + str(MAP[n])


def rewrite(text, jsx):
    if jsx:
        text = PLAIN.sub(lambda m: m.group(0)[:m.start(4) - m.start(0)] + shift(m.group(4)) + m.group(0)[m.end(4) - m.start(0):], text)
        text = OBJECT.sub(
            lambda m: '%s={{%s}}' % (
                m.group(1),
                ENTRY.sub(lambda e: e.group(1) + e.group(2) + shift(e.group(3)) + e.group(2), m.group(2)),
            ),
            text,
        )
    text = SPACE.sub(lambda m: '--space-%d' % MAP.get(int(m.group(1)), int(m.group(1))), text)
    return SCALING.sub('var(--scale', text)


def literal_object(body):
    """Whether every entry of a responsive object is a key with a quoted value."""
    for entry in body.split(','):
        if entry.strip() and not ENTRY_ONLY.match(entry):
            return False
    return True


def computed(text):
    """(line, prop) for every spacing prop whose value, or one of whose responsive entries, is an
    expression this cannot read."""
    found = [(m.start(), m.group(1)) for m in COMPUTED.finditer(text)]
    found += [(m.start(), m.group(1)) for m in OBJECT.finditer(text) if not literal_object(m.group(2))]
    return [(text.count('\n', 0, start) + 1, prop) for start, prop in sorted(found)]


def main(targets):
    changed = 0
    for path in files(targets, EXT):
        with open(path) as f:
            before = f.read()
        if path.endswith(JSX):
            for line, prop in computed(before):
                print('%s:%d: %s is not a literal; check it by hand' % (path, line, prop), file=sys.stderr)
        after = rewrite(before, path.endswith(JSX))
        if after != before:
            with open(path, 'w') as f:
                f.write(after)
            changed += 1
    print('%d files rewritten' % changed)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
