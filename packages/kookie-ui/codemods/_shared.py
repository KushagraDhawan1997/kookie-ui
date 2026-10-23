"""
Helpers the Kookie UI codemods share: which files to visit, and a small JavaScript/JSX scanner
that tells code apart from strings, comments, regex literals and JSX text.
"""
import os
import re

# Skipped at any depth.
SKIP_ANYWHERE = {'node_modules', '.next', '.git'}
# Skipped only when they sit directly inside a folder given on the command line, where they are
# build output. A source folder deeper down named build or dist (src/app/build) is visited.
SKIP_TOP = {'dist', 'build'}


def files(targets, extensions):
    """Yield every file under the given folders (or the given files) that ends in one of extensions."""
    for target in targets:
        if os.path.isfile(target):
            if target.endswith(extensions):
                yield target
            continue
        root_depth = os.path.abspath(target).rstrip(os.sep).count(os.sep)
        for folder, dirs, names in os.walk(target):
            top = os.path.abspath(folder).rstrip(os.sep).count(os.sep) == root_depth
            dirs[:] = sorted(d for d in dirs if d not in SKIP_ANYWHERE and not (top and d in SKIP_TOP))
            for name in sorted(names):
                if name.endswith(extensions):
                    yield os.path.join(folder, name)


IDENT = re.compile(r'[A-Za-z_$][\w$]*')
TAG_NAME = re.compile(r'[A-Za-z_$][\w$.:-]*')
ATTR_NAME = re.compile(r'[A-Za-z_$][\w$:.-]*')
NUMBER = re.compile(r'\d[\w.]*')
# After these words an expression starts, so `<` opens JSX and `/` opens a regex.
EXPR_KEYWORDS = {
    'return', 'typeof', 'case', 'yield', 'await', 'in', 'of', 'new', 'delete', 'void', 'throw',
    'else', 'do', 'instanceof', 'default', 'extends',
}


class Scan:
    """
    Walks a .ts/.tsx/.js/.jsx source once and records, with offsets:

    - idents: (start, end, name, object) for every identifier in code, where object is the
      identifier before a `.` (`K` in `K.Badge`) or None
    - tags: (start, end, name, closing) for every JSX tag name, closing for `</Name>`
    - attrs: (tag_index, name, value_start, value_end) for every attribute written on a tag

    Strings, template text, comments, regex literals and JSX text record nothing.
    """

    def __init__(self, text, jsx=True, run=True):
        self.t = text
        self.n = len(text)
        self.jsx = jsx
        self.idents = []
        self.tags = []
        self.attrs = []
        if run:
            self.code(0, False)

    @classmethod
    def elements(cls, text, pattern):
        """Scan only the JSX elements that start where pattern matches (for .mdx, which is not JS)."""
        scan = cls(text, True, run=False)
        for m in pattern.finditer(text):
            scan.element(m.start())
        return scan

    # --- code ---------------------------------------------------------------------------

    def code(self, i, stop):
        t, n = self.t, self.n
        depth = 0
        expr = True  # whether the next token starts an expression
        while i < n:
            c = t[i]
            if c in ' \t\r\n':
                i += 1
            elif c == '/' and t.startswith('//', i):
                j = t.find('\n', i)
                i = n if j < 0 else j
            elif c == '/' and t.startswith('/*', i):
                j = t.find('*/', i + 2)
                i = n if j < 0 else j + 2
            elif c in '"\'':
                i = self.string(i)
                expr = False
            elif c == '`':
                i = self.template(i)
                expr = False
            elif c == '/' and expr:
                i = self.regex(i)
                expr = False
            elif c == '<' and expr and self.jsx:
                end = self.element(i)
                if end is None:
                    i += 1
                    expr = True
                else:
                    i = end
                    expr = False
            elif c == '{':
                depth += 1
                i += 1
                expr = True
            elif c == '}':
                if depth == 0 and stop:
                    return i
                depth -= 1
                i += 1
                expr = True
            elif c in ')]':
                i += 1
                expr = False
            elif c.isdigit():
                i = NUMBER.match(t, i).end()
                expr = False
            elif c.isalpha() or c in '_$':
                m = IDENT.match(t, i)
                name = m.group(0)
                self.idents.append((i, m.end(), name, self.object_before(i)))
                i = m.end()
                expr = name in EXPR_KEYWORDS
            else:
                i += 1
                expr = True
        return n

    def object_before(self, i):
        t = self.t
        k = i - 1
        while k >= 0 and t[k] in ' \t\r\n':
            k -= 1
        if k < 0 or t[k] != '.' or (k > 0 and t[k - 1] == '.'):
            return None
        k -= 1
        if k >= 0 and t[k] == '?':
            k -= 1
        while k >= 0 and t[k] in ' \t\r\n':
            k -= 1
        end = k + 1
        while k >= 0 and (t[k].isalnum() or t[k] in '_$'):
            k -= 1
        return t[k + 1:end] or None

    def string(self, i):
        t, n, q = self.t, self.n, self.t[i]
        i += 1
        while i < n and t[i] != q:
            if t[i] == '\\':
                i += 1
            elif t[i] == '\n':
                break
            i += 1
        return i + 1

    def template(self, i):
        t, n = self.t, self.n
        i += 1
        while i < n and t[i] != '`':
            if t[i] == '\\':
                i += 2
            elif t.startswith('${', i):
                i = self.code(i + 2, True) + 1
            else:
                i += 1
        return i + 1

    def regex(self, i):
        t, n = self.t, self.n
        i += 1
        klass = False
        while i < n and t[i] != '\n':
            if t[i] == '\\':
                i += 2
                continue
            if t[i] == '[':
                klass = True
            elif t[i] == ']':
                klass = False
            elif t[i] == '/' and not klass:
                i += 1
                while i < n and t[i].isalpha():
                    i += 1
                return i
            i += 1
        return i

    # --- JSX ----------------------------------------------------------------------------

    def element(self, i):
        """Scan a JSX element starting at `<`. Returns the index after it, or None (not JSX)."""
        marks = (len(self.idents), len(self.tags), len(self.attrs))
        end = self._element(i)
        if end is None:
            del self.idents[marks[0]:]
            del self.tags[marks[1]:]
            del self.attrs[marks[2]:]
        return end

    def ws(self, j):
        while j < self.n and self.t[j] in ' \t\r\n':
            j += 1
        return j

    def _element(self, i):
        t, n = self.t, self.n
        j = self.ws(i + 1)
        if j < n and t[j] == '>':
            name, tag = '', None
        else:
            m = TAG_NAME.match(t, j)
            if not m:
                return None
            name = m.group(0)
            tag = len(self.tags)
            self.tags.append((j, m.end(), name, False))
            j = m.end()
            # `<T,>` and `<T extends X>` are TypeScript generics, not JSX.
            k = self.ws(j)
            if k < n and t[k] == ',' or t.startswith('extends', k) and not TAG_NAME.match(t, k + 7):
                return None
        while True:
            j = self.ws(j)
            if j >= n:
                return None
            c = t[j]
            if t.startswith('/>', j):
                return j + 2
            if c == '>':
                return self.children(j + 1)
            if c == '{':
                k = self.code(j + 1, True)
                if k >= n:
                    return None
                j = k + 1
            elif c.isalpha() or c in '_$':
                m = ATTR_NAME.match(t, j)
                attr = m.group(0)
                j = self.ws(m.end())
                if j < n and t[j] == '=':
                    j = self.ws(j + 1)
                    start = j
                    if j < n and t[j] in '"\'':
                        k = t.find(t[j], j + 1)
                        if k < 0:
                            return None
                        j = k + 1
                    elif j < n and t[j] == '{':
                        k = self.code(j + 1, True)
                        if k >= n:
                            return None
                        j = k + 1
                    elif j < n and t[j] == '<':
                        k = self.element(j)
                        if k is None:
                            return None
                        j = k
                    else:
                        return None
                    if tag is not None:
                        self.attrs.append((tag, attr, start, j))
            else:
                return None

    def children(self, j):
        t, n = self.t, self.n
        while j < n:
            c = t[j]
            if c == '<':
                k = self.ws(j + 1)
                if k < n and t[k] == '/':
                    k = self.ws(k + 1)
                    m = TAG_NAME.match(t, k)
                    if m:
                        self.tags.append((k, m.end(), m.group(0), True))
                        k = m.end()
                    k = self.ws(k)
                    if k >= n or t[k] != '>':
                        return None
                    return k + 1
                end = self.element(j)
                if end is None:
                    return None
                j = end
            elif c == '{':
                k = self.code(j + 1, True)
                if k >= n:
                    return None
                j = k + 1
            else:
                j += 1
        return None


def apply(text, edits):
    """Apply (start, end, replacement) edits that do not overlap."""
    out = []
    last = 0
    for start, end, new in sorted(edits):
        if start < last:
            continue
        out.append(text[last:start])
        out.append(new)
        last = end
    out.append(text[last:])
    return ''.join(out)


def line_of(text, offset):
    return text.count('\n', 0, offset) + 1
