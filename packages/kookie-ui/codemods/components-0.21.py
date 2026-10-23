"""
Kookie UI 0.21 components codemod.

The component list follows v2. Four names merge into others. This rewrites, in place:

- IconButton -> Button iconOnly, ToggleIconButton -> Toggle iconOnly, ToggleButton -> Toggle,
  Badge -> Chip: JSX tags, the import from @kushagradhawan/kookie-ui, other references to the
  imported name, and the Props types (IconButtonProps -> ButtonProps, BadgeProps -> ChipProps,
  ToggleButtonProps and ToggleIconButtonProps -> ToggleProps) (.ts/.tsx/.jsx/.mdx)
- .rt-Badge -> .rt-Chip and .rt-IconButton -> .rt-Button[data-icon-only] in .css/.scss

It only renames. Dropped components, margin props on leaf components and icon-only buttons
named by visible text need a person: see MIGRATION.md.

Usage: python3 components-0.21.py <folder> [<folder> ...]   Safe to run twice.
"""
import glob
import os
import re
import sys

# old name -> (new name, adds iconOnly)
RENAME = {
    'IconButton': ('Button', True),
    'ToggleIconButton': ('Toggle', True),
    'ToggleButton': ('Toggle', False),
    'Badge': ('Chip', False),
}
TYPES = {
    'IconButtonProps': 'ButtonProps',
    'ToggleIconButtonProps': 'ToggleProps',
    'ToggleButtonProps': 'ToggleProps',
    'BadgeProps': 'ChipProps',
}
IMPORT = re.compile(r'import(\s+type)?\s*\{([^{}]*)\}\s*from\s*([\'"])@kushagradhawan/kookie-ui\3')
CSS = [
    (re.compile(r'\.rt-Badge(?![\w-])'), '.rt-Chip'),
    (re.compile(r'\.rt-IconButton(?![\w-])'), '.rt-Button[data-icon-only]'),
]
SKIP = ('node_modules', '/.next/', '/dist/', '/build/')


def word(name):
    return re.compile(r'(?<![\w$.-])' + name + r'(?![\w$-])')


def imported(text):
    names = set()
    for m in IMPORT.finditer(text):
        for part in m.group(2).split(','):
            bits = part.replace('type ', ' ').split()
            if len(bits) == 1:
                names.add(bits[0])
    return names


def fix_import(m):
    parts = []
    for part in m.group(2).split(','):
        bits = part.split()
        if not bits:
            continue
        i = 1 if bits[0] == 'type' else 0
        old = bits[i]
        bits[i] = TYPES.get(old) or (RENAME[old][0] if old in RENAME else old)
        p = ' '.join(bits)
        if p not in parts:
            parts.append(p)
    multiline = '\n' in m.group(2)
    body = (',\n  '.join(parts) + ',') if multiline else ', '.join(parts)
    body = ('\n  ' + body + '\n') if multiline else (' ' + body + ' ')
    return 'import%s {%s} from %s@kushagradhawan/kookie-ui%s' % (m.group(1) or '', body, m.group(3), m.group(3))


def rewrite_jsx(text, mdx):
    names = imported(text)
    for old, (new, icon_only) in RENAME.items():
        if old not in names and not mdx:
            continue
        flag = ' iconOnly' if icon_only else ''
        text = re.sub(r'<' + old + r'(?![\w$.-])', '<' + new + flag, text)
        text = re.sub(r'</' + old + r'\s*>', '</' + new + '>', text)
    for old, new in TYPES.items():
        if old in names:
            text = word(old).sub(new, text)
    for old, (new, _) in RENAME.items():
        if old in names:
            text = word(old).sub(new, text)
    return IMPORT.sub(fix_import, text) if names & (set(RENAME) | set(TYPES)) else text


def rewrite_css(text):
    for pattern, new in CSS:
        text = pattern.sub(new, text)
    return text


def main(folders):
    changed = 0
    for folder in folders:
        for path in glob.glob(os.path.join(folder, '**', '*'), recursive=True):
            if not os.path.isfile(path) or any(s in path for s in SKIP):
                continue
            if path.endswith(('.css', '.scss')):
                fn = rewrite_css
            elif path.endswith(('.ts', '.tsx', '.jsx', '.mdx')):
                fn = lambda t, mdx=path.endswith('.mdx'): rewrite_jsx(t, mdx)
            else:
                continue
            with open(path) as f:
                before = f.read()
            after = fn(before)
            if after != before:
                with open(path, 'w') as f:
                    f.write(after)
                changed += 1
    print('%d files rewritten' % changed)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
