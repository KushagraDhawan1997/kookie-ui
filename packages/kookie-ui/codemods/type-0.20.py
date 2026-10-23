"""
Kookie UI 0.20 type codemod.

Type takes v2's nine steps (12, 14, 16, 18, 20, 24, 32, 44, 64px) and three weights
(regular, medium, semibold). Sizes v2 lacks move to the nearest step: 0 -> 1, 8 -> 7,
10, 11 and 12 -> 9. Weights: thin, extralight and light -> regular; bold and extrabold -> semibold.
This rewrites, in place:

- size and weight props on Text, Heading, Link, Code, Kbd, Blockquote, Em, Strong and Quote,
  plain strings and responsive objects (.tsx/.jsx/.mdx)
- var(--font-size-N), var(--line-height-N), var(--letter-spacing-N) and
  var(--font-weight-NAME) in .css/.ts/.tsx/.mdx

Usage: python3 type-0.20.py <folder> [<folder> ...]   Safe to run twice.
"""
import glob
import os
import re
import sys

SIZE = {'0': '1', '8': '7', '10': '9', '11': '9', '12': '9'}
WEIGHT = {'thin': 'regular', 'extralight': 'regular', 'light': 'regular', 'bold': 'semibold', 'extrabold': 'semibold'}
TYPE = r'(?:Text|Heading|Link|Code|Kbd|Blockquote|Em|Strong|Quote)'
TAG = re.compile(r'<' + TYPE + r'\b[^<>]*?>', re.S)
PLAIN = re.compile(r'(\b(size|weight)=)(["\'])([\w-]+)\3')
OBJECT = re.compile(r'(\b(size|weight)=\{\{)([^{}]*)(\}\})')
ENTRY = re.compile(r'(\w+\s*:\s*)(["\'])([\w-]+)\2')
TOKEN = re.compile(r'--(font-size|line-height|letter-spacing)-(\d+)\b')
WEIGHT_TOKEN = re.compile(r'--font-weight-(thin|extralight|light|bold|extrabold)\b')
SKIP = ('node_modules', '/.next/', '/dist/', '/build/')


def value(prop, v):
    return (SIZE if prop == 'size' else WEIGHT).get(v, v)


def tag(m):
    t = PLAIN.sub(lambda p: p.group(1) + p.group(3) + value(p.group(2), p.group(4)) + p.group(3), m.group(0))
    return OBJECT.sub(
        lambda o: o.group(1) + ENTRY.sub(lambda e: e.group(1) + e.group(2) + value(o.group(2), e.group(3)) + e.group(2), o.group(3)) + o.group(4),
        t,
    )


def rewrite(text, jsx):
    if jsx:
        text = TAG.sub(tag, text)
    text = TOKEN.sub(lambda m: '--%s-%s' % (m.group(1), SIZE.get(m.group(2), m.group(2))), text)
    return WEIGHT_TOKEN.sub(lambda m: '--font-weight-' + WEIGHT[m.group(1)], text)


def main(folders):
    changed = 0
    for folder in folders:
        for path in glob.glob(os.path.join(folder, '**', '*'), recursive=True):
            if not os.path.isfile(path) or any(s in path for s in SKIP):
                continue
            if not path.endswith(('.css', '.scss', '.ts', '.tsx', '.jsx', '.mdx')):
                continue
            with open(path) as f:
                before = f.read()
            after = rewrite(before, path.endswith(('.tsx', '.jsx', '.mdx')))
            if after != before:
                with open(path, 'w') as f:
                    f.write(after)
                changed += 1
    print('%d files rewritten' % changed)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
