"""
Kookie UI 0.17 spacing codemod.

The space palette moved to v2's twelve steps, so every old step N becomes N+1
(80px and 112px have no match and move to 64px and 96px). This rewrites, in place:

- layout props in .tsx/.jsx/.mdx: p, px, py, pt, pr, pb, pl, m*, gap, gapX, gapY,
  rowGap, columnGap, inset, top, right, bottom, left; plain strings and responsive objects
- var(--space-N) in .css/.ts/.tsx/.mdx, and var(--scaling) to var(--scale)

Usage: python3 space-0.17.py <folder> [<folder> ...]
Run it once. Running it twice shifts everything twice.
"""
import glob
import os
import re
import sys

MAP = {1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10, 11: 11, 12: 11}
PROPS = 'p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gapX|gapY|rowGap|columnGap|inset|top|right|bottom|left'
PLAIN = re.compile(r'(?<![\w.-])(' + PROPS + r')=(["\'])(-?\d+)\2')
OBJECT = re.compile(r'(?<![\w.-])(' + PROPS + r')=\{\{([^{}]*)\}\}')
ENTRY = re.compile(r'(\w+\s*:\s*)(["\'])(-?\d+)\2')
SPACE = re.compile(r'--space-(\d+)\b')
SKIP = ('node_modules', '/.next/', '/dist/', '/build/')


def shift(value):
    negative = value.startswith('-')
    n = int(value.lstrip('-'))
    if n not in MAP:
        return value
    return ('-' if negative else '') + str(MAP[n])


def rewrite(text, jsx):
    if jsx:
        text = PLAIN.sub(lambda m: '%s=%s%s%s' % (m.group(1), m.group(2), shift(m.group(3)), m.group(2)), text)
        text = OBJECT.sub(
            lambda m: '%s={{%s}}' % (
                m.group(1),
                ENTRY.sub(lambda e: e.group(1) + e.group(2) + shift(e.group(3)) + e.group(2), m.group(2)),
            ),
            text,
        )
    text = SPACE.sub(lambda m: '--space-%d' % MAP.get(int(m.group(1)), int(m.group(1))), text)
    return text.replace('var(--scaling)', 'var(--scale)')


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
