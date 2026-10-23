"""
Kookie UI 0.20 type codemod.

Type takes v2's nine steps (12, 14, 16, 18, 20, 24, 32, 44, 64px) and three weights
(regular, medium, semibold). Sizes v2 lacks move to the nearest step: 0 -> 1, 8 -> 7,
10, 11 and 12 -> 9. Weights: thin, extralight and light -> regular; bold and extrabold -> semibold.
This rewrites, in place:

- size and weight props on Text, Heading, Link, Code, Kbd, Blockquote, Em, Strong and Quote,
  plain strings, `{"8"}` and responsive objects (.tsx/.jsx/.js/.mdx). Arrow functions and
  comparisons inside a tag do not stop it. A size or weight it cannot read (a variable, a
  ternary, also as one entry of a responsive object) is printed for a person to check.
- var(--font-size-N), var(--line-height-N), var(--letter-spacing-N) and
  var(--font-weight-NAME) in .css/.scss/.ts/.tsx/.js/.jsx/.mjs/.cjs/.mdx

Usage: python3 type-0.20.py <folder|file> [...]
Run it once. It maps 8 to 7, so a second run moves the new size 8 too.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _shared import Scan, apply, files, line_of  # noqa: E402

SIZE = {'0': '1', '8': '7', '10': '9', '11': '9', '12': '9'}
WEIGHT = {'thin': 'regular', 'extralight': 'regular', 'light': 'regular', 'bold': 'semibold', 'extrabold': 'semibold'}
TYPES = {'Text', 'Heading', 'Link', 'Code', 'Kbd', 'Blockquote', 'Em', 'Strong', 'Quote'}
START = re.compile(r'<(?:' + '|'.join(sorted(TYPES)) + r')(?![\w$-])')
QUOTED = re.compile(r'^(["\'])([\w-]+)\1$')
LITERAL = re.compile(r'^\{\s*(["\'])([\w-]+)\1\s*\}$')
OBJECT = re.compile(r'^\{\s*\{([^{}]*)\}\s*\}$')
ENTRY = re.compile(r'(\w+\s*:\s*)(["\'])([\w-]+)\2')
ENTRY_ONLY = re.compile(r'^\s*(["\']?)\w+\1\s*:\s*(["\'])[^"\']*\2\s*$')
TOKEN = re.compile(r'--(font-size|line-height|letter-spacing)-(\d+)\b')
WEIGHT_TOKEN = re.compile(r'--font-weight-(thin|extralight|light|bold|extrabold)\b')
EXT = ('.css', '.scss', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mdx')
JSX = ('.tsx', '.jsx', '.js', '.mdx')


def value(prop, v):
    return (SIZE if prop == 'size' else WEIGHT).get(v, v)


def attribute(prop, raw):
    """The rewritten attribute value, or None when it is not a literal this can read."""
    m = QUOTED.match(raw)
    if m:
        return m.group(1) + value(prop, m.group(2)) + m.group(1)
    m = LITERAL.match(raw)
    if m:
        return raw[:m.start(2)] + value(prop, m.group(2)) + raw[m.end(2):]
    m = OBJECT.match(raw)
    if m:
        body = ENTRY.sub(lambda e: e.group(1) + e.group(2) + value(prop, e.group(3)) + e.group(2), m.group(1))
        return raw[:m.start(1)] + body + raw[m.end(1):]
    return None


def rewrite_tags(text, path='<text>', warn=None):
    scan = Scan.elements(text, START) if path.endswith('.mdx') else Scan(text, True)
    edits = []
    for tag, prop, start, end in scan.attrs:
        name = scan.tags[tag][2]
        if prop not in ('size', 'weight') or name.rpartition('.')[2] not in TYPES:
            continue
        raw = text[start:end]
        new = attribute(prop, raw)
        whole = OBJECT.match(raw)
        if new is None or whole and not all(ENTRY_ONLY.match(e) for e in whole.group(1).split(',') if e.strip()):
            if warn is not None:
                warn('%s:%d: %s %s=%s is not a literal; check it by hand' % (path, line_of(text, start), name, prop, raw))
        if new is not None and new != raw:
            edits.append((start, end, new))
    return apply(text, edits)


def rewrite(text, jsx, path='<text>', warn=None):
    if jsx:
        text = rewrite_tags(text, path, warn)
    text = TOKEN.sub(lambda m: '--%s-%s' % (m.group(1), SIZE.get(m.group(2), m.group(2))), text)
    return WEIGHT_TOKEN.sub(lambda m: '--font-weight-' + WEIGHT[m.group(1)], text)


def main(targets):
    changed = 0
    warn = lambda message: print(message, file=sys.stderr)
    for path in files(targets, EXT):
        with open(path) as f:
            before = f.read()
        after = rewrite(before, path.endswith(JSX), path, warn)
        if after != before:
            with open(path, 'w') as f:
                f.write(after)
            changed += 1
    print('%d files rewritten' % changed)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
