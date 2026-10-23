"""
Kookie UI 0.22 names codemod.

Class names and private variables move from Radix Themes' prefix to Kookie's, as in v2:
`rt-` -> `kui-` (classes like rt-Button, rt-r-size-2, and variables like --rt-shell-gap) and the
root class `radix-themes` -> `kui-theme`. The neutral scale's variables move from --gray-N to
--neutral-N (the `color="gray"` prop value does not change). The page and surface colours take
v2's names: --color-background -> --color-page, and --color-panel(-solid), --color-surface-solid
and --color-dialog(-solid) -> --color-surface.

Usage: python3 names-0.22.py <folder> [<folder> ...]   Safe to run twice.
"""
import glob
import os
import re
import sys

PREFIX = re.compile(r'(?<![A-Za-z0-9_])rt-(?=[A-Za-z-])')
ROOT = re.compile(r'(?<![A-Za-z0-9_@/])radix-themes(?![A-Za-z0-9_-])')
NEUTRAL = re.compile(r'--gray-(a?\d+\b|contrast\b|surface\b|indicator\b|track\b|ink\b|ink-faint\b|ink-muted\b)')
COLORS = [
    ('--color-panel-solid', '--color-surface'),
    ('--color-surface-solid', '--color-surface'),
    ('--color-dialog-solid', '--color-surface'),
    ('--color-panel-translucent', '--color-surface'),
    ('--color-panel', '--color-surface'),
    ('--color-dialog', '--color-surface'),
    ('--color-background', '--color-page'),
]
SKIP = ('node_modules', '/.next/', '/dist/', '/build/')
EXT = ('.css', '.scss', '.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.mdx', '.html')


def rewrite(text, neutral=True):
    text = PREFIX.sub('kui-', text)
    text = ROOT.sub('kui-theme', text)
    if neutral:
        text = NEUTRAL.sub(lambda m: '--neutral-' + m.group(1), text)
    for old, new in COLORS:
        text = re.sub(re.escape(old) + r'(?![\w-])', new, text)
    return text


def main(folders):
    changed = 0
    for folder in folders:
        paths = [folder] if os.path.isfile(folder) else glob.glob(os.path.join(folder, '**', '*'), recursive=True)
        for path in paths:
            if not os.path.isfile(path) or any(s in path for s in SKIP) or not path.endswith(EXT):
                continue
            with open(path) as f:
                before = f.read()
            after = rewrite(before)
            if after != before:
                with open(path, 'w') as f:
                    f.write(after)
                changed += 1
    print('%d files rewritten' % changed)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
