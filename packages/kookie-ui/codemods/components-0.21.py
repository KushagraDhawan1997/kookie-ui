"""
Kookie UI 0.21 components codemod.

The component list follows v2. Four names merge into others. This rewrites, in place:

- IconButton -> Button iconOnly, ToggleIconButton -> Toggle iconOnly, ToggleButton -> Toggle,
  Badge -> Chip: JSX tags (also under an alias or a namespace import, `<K.Badge>`), the import
  from @kushagradhawan/kookie-ui, other code references to the imported name, and the Props types
  (IconButtonProps -> ButtonProps, BadgeProps -> ChipProps, ToggleButtonProps and
  ToggleIconButtonProps -> ToggleProps) (.ts/.tsx/.js/.jsx/.mdx)
- .rt-Badge -> .rt-Chip and .rt-IconButton -> .rt-Button[data-icon-only] in .css/.scss

Strings, comments and JSX text are left alone. A reference to IconButton or ToggleIconButton
outside a JSX tag (`const Comp = IconButton`, or `const Comp = IB` under an alias) is printed: it
needs `iconOnly` where it renders, which only a person can add. A direct name is left as it is, so
TypeScript flags it; an alias still type-checks, so the printed line is the only notice.

It only renames. Dropped components, margin props on leaf components and icon-only buttons
named by visible text need a person: see MIGRATION.md.

Usage: python3 components-0.21.py <folder|file> [...]   Safe to run twice.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _shared import Scan, apply, files, line_of  # noqa: E402

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
SOURCE = r'([\'"])@kushagradhawan/kookie-ui\3'
IMPORT = re.compile(r'import(\s+type)?\s*\{([^{}]*)\}\s*from\s*' + SOURCE)
NAMESPACE = re.compile(r'import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*([\'"])@kushagradhawan/kookie-ui\2')
CSS = [
    (re.compile(r'\.rt-Badge(?![\w-])'), '.rt-Chip'),
    (re.compile(r'\.rt-IconButton(?![\w-])'), '.rt-Button[data-icon-only]'),
]
EXT = ('.css', '.scss', '.ts', '.tsx', '.js', '.jsx', '.mdx')


def imported(text):
    """Local name -> the name it was imported as, for every named import from Kookie."""
    names = {}
    for m in IMPORT.finditer(text):
        for part in m.group(2).split(','):
            bits = part.split()
            if bits and bits[0] == 'type':
                bits = bits[1:]
            if len(bits) == 1:
                names[bits[0]] = bits[0]
            elif len(bits) == 3 and bits[1] == 'as':
                names[bits[2]] = bits[0]
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


def tag_target(name, names, spaces):
    """The original Kookie name a JSX tag refers to and the tag's new name, or (None, None)."""
    if '.' in name:
        space, _, member = name.partition('.')
        if space in spaces and member in RENAME:
            return member, space + '.' + RENAME[member][0]
        return None, None
    original = names.get(name)
    if original in RENAME:
        return original, RENAME[original][0] if name == original else name
    return None, None


def rewrite_code(text, jsx, path='<text>', warn=None):
    names = imported(text)
    spaces = {m.group(1) for m in NAMESPACE.finditer(text)}
    if not (set(names.values()) & (set(RENAME) | set(TYPES))) and not spaces:
        return text
    skip = [(m.start(), m.end()) for m in IMPORT.finditer(text)]
    scan = Scan(text, jsx)
    edits = []
    for start, end, name, closing in scan.tags:
        original, new = tag_target(name, names, spaces)
        if original is None:
            continue
        flag = ' iconOnly' if RENAME[original][1] and not closing else ''
        edits.append((start, end, new + flag))
    for start, end, name, obj in scan.idents:
        if any(a <= start < b for a, b in skip):
            continue
        if obj is None and name in names:
            original = names[name]
        elif obj is not None and obj in spaces:
            original = name
        else:
            continue
        # An alias (`IconButton as IB`) keeps its local name: the import rename moves it.
        aliased = obj is None and name != original
        if original in TYPES:
            if not aliased:
                edits.append((start, end, TYPES[original]))
        elif original in RENAME:
            new, icon_only = RENAME[original]
            if icon_only:
                if warn is not None:
                    todo = 'add iconOnly' if aliased else 'rename it to %s and add iconOnly' % new
                    warn('%s:%d: %s used outside a JSX tag; %s where it renders' % (path, line_of(text, start), name, todo))
                continue
            if not aliased:
                edits.append((start, end, new))
    text = apply(text, edits)
    return IMPORT.sub(fix_import, text)


def rewrite_mdx(text):
    for old, (new, icon_only) in RENAME.items():
        flag = ' iconOnly' if icon_only else ''
        text = re.sub(r'<' + old + r'(?![\w$.-])', '<' + new + flag, text)
        text = re.sub(r'</' + old + r'\s*>', '</' + new + '>', text)
    return IMPORT.sub(fix_import, text)


def rewrite_css(text):
    for pattern, new in CSS:
        text = pattern.sub(new, text)
    return text


def rewrite(text, path, warn=None):
    if path.endswith(('.css', '.scss')):
        return rewrite_css(text)
    if path.endswith('.mdx'):
        return rewrite_mdx(text)
    return rewrite_code(text, not path.endswith('.ts'), path, warn)


def main(targets):
    changed = 0
    warn = lambda message: print(message, file=sys.stderr)
    for path in files(targets, EXT):
        with open(path) as f:
            before = f.read()
        after = rewrite(before, path, warn)
        if after != before:
            with open(path, 'w') as f:
                f.write(after)
            changed += 1
    print('%d files rewritten' % changed)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
