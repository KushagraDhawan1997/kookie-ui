"""
Laws for the codemods. Run from this folder: python3 -m unittest test_codemods
"""
import contextlib
import importlib.util
import io
import os
import re
import shutil
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
PACKAGE = os.path.dirname(HERE)


def load(name):
    spec = importlib.util.spec_from_file_location(name.replace('-', '_').replace('.', '_'), os.path.join(HERE, name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


space = load('space-0.17')
type_ = load('type-0.20')
components = load('components-0.21')
names = load('names-0.22')
shared = load('_shared')


class Space(unittest.TestCase):
    def test_position_output_is_a_position_step(self):
        # The codemod moves old 9 (64px) to 10. The position props must take every step it
        # writes, or `top="10"` falls through as the unitless `--top: 10` and the offset is lost.
        with open(os.path.join(PACKAGE, 'src/props/layout.props.ts')) as f:
            source = f.read()
        steps = set(re.search(r'positionEdgeValues = \[([^\]]*)\]', source).group(1).replace("'", '').replace(' ', '').split(','))
        for old in range(0, 13):
            for sign in ('', '-'):
                if sign and old == 0:
                    continue
                out = space.rewrite('<Box top="%s%d" />' % (sign, old), True)
                new = re.search(r'top="([^"]+)"', out).group(1)
                if not sign:
                    self.assertIn(new, steps, 'top="%d" becomes "%s", which the position props do not take' % (old, new))
        self.assertEqual(space.rewrite('<Box top="9" left="-9" />', True), '<Box top="10" left="-10" />')

    def test_literal_expressions(self):
        self.assertEqual(space.rewrite("<Box p={'3'} gap={{ initial: '1', md: '9' }} />", True), "<Box p={'4'} gap={{ initial: '2', md: '10' }} />")

    def test_non_literal_values_are_reported_not_changed(self):
        text = "<Box mt={isMobile ? '2' : '4'} p={pad} m={'2'} />"
        self.assertEqual(space.rewrite(text, True), "<Box mt={isMobile ? '2' : '4'} p={pad} m={'3'} />")
        self.assertEqual([prop for _, prop in space.computed(text)], ['mt', 'p'])

    def test_non_literal_responsive_entry_is_reported(self):
        # The literal entry still shifts; the ternary entry keeps its old step, so a person is told.
        text = "<Box m={{ initial: '2', md: wide ? '3' : '4' }} p={{ initial: '1', md: '2' }} />"
        self.assertEqual(space.rewrite(text, True), "<Box m={{ initial: '3', md: wide ? '3' : '4' }} p={{ initial: '2', md: '3' }} />")
        self.assertEqual([prop for _, prop in space.computed(text)], ['m'])

    def test_scaling_with_a_fallback(self):
        self.assertEqual(space.rewrite('a: calc(2px * var(--scaling, 1)); b: var(--scaling);', False), 'a: calc(2px * var(--scale, 1)); b: var(--scale);')


class Type(unittest.TestCase):
    def test_arrow_function_before_size(self):
        text = '<Text onClick={() => setOpen(true)} size="8" weight="bold">Hi</Text>'
        self.assertEqual(type_.rewrite(text, True), '<Text onClick={() => setOpen(true)} size="7" weight="semibold">Hi</Text>')

    def test_comparison_before_weight(self):
        text = "<Heading className={x > 1 ? 'a' : 'b'} weight=\"light\" size={{ initial: '8', md: '10' }}>H</Heading>"
        self.assertEqual(type_.rewrite(text, True), "<Heading className={x > 1 ? 'a' : 'b'} weight=\"regular\" size={{ initial: '7', md: '9' }}>H</Heading>")

    def test_nested_tag_and_literal_expression(self):
        text = "<Text size={'0'} title={<Text size=\"8\">a</Text>}>b</Text>"
        self.assertEqual(type_.rewrite(text, True), "<Text size={'1'} title={<Text size=\"7\">a</Text>}>b</Text>")

    def test_other_components_and_non_literals_are_left(self):
        warnings = []
        text = '<><Avatar size="8" /><Text size={open ? "8" : "2"}>z</Text></>'
        self.assertEqual(type_.rewrite(text, True, 'x.tsx', warnings.append), text)
        self.assertEqual(len(warnings), 1)

    def test_non_literal_responsive_entry_is_reported(self):
        warnings = []
        text = "<Text size={{ initial: '8', md: big ? '8' : '2' }}>z</Text>"
        self.assertEqual(type_.rewrite(text, True, 'x.tsx', warnings.append), "<Text size={{ initial: '7', md: big ? '8' : '2' }}>z</Text>")
        self.assertEqual(len(warnings), 1)

    def test_mdx(self):
        text = "It's prose with <Text onClick={() => go()} size=\"8\">x</Text> and don't."
        self.assertEqual(type_.rewrite(text, True, 'x.mdx'), text.replace('size="8"', 'size="7"'))


SOURCE = '''import { Badge, IconButton as IB, ToggleIconButton, BadgeProps } from '@kushagradhawan/kookie-ui';
import * as K from '@kushagradhawan/kookie-ui';

// a Badge in a comment
const label = 'Badge';
const tpl = `Badge ${label}`;
const re = /Badge'/g;
const Comp = ToggleIconButton;
type P = BadgeProps;
const f = <T,>(v: T) => v;
const ok = a < b && c > d;
export const A = () => (
  <>
    <Badge color="gray">New Badge</Badge>
    <IB aria-label="x" onClick={() => go()} />
    <K.Badge>don't rename</K.Badge>
    <K.IconButton aria-label="y"></K.IconButton>
  </>
);
'''

EXPECTED = '''import { Chip, Button as IB, Toggle, ChipProps } from '@kushagradhawan/kookie-ui';
import * as K from '@kushagradhawan/kookie-ui';

// a Badge in a comment
const label = 'Badge';
const tpl = `Badge ${label}`;
const re = /Badge'/g;
const Comp = ToggleIconButton;
type P = ChipProps;
const f = <T,>(v: T) => v;
const ok = a < b && c > d;
export const A = () => (
  <>
    <Chip color="gray">New Badge</Chip>
    <IB iconOnly aria-label="x" onClick={() => go()} />
    <K.Chip>don't rename</K.Chip>
    <K.Button iconOnly aria-label="y"></K.Button>
  </>
);
'''


class Components(unittest.TestCase):
    def test_renames_code_only(self):
        warnings = []
        out = components.rewrite(SOURCE, 'a.tsx', warnings.append)
        self.assertEqual(out, EXPECTED)
        # The aliased icon button keeps no square shape without iconOnly, so it is reported.
        self.assertEqual(len(warnings), 1)
        self.assertIn('ToggleIconButton', warnings[0])

    def test_aliased_icon_button_reference_is_reported(self):
        # `Comp = IB` still type-checks after the import becomes `Button as IB`, so the printed
        # line is the only notice that Comp needs iconOnly.
        warnings = []
        text = "import { IconButton as IB, Badge as B } from '@kushagradhawan/kookie-ui';\nconst Comp = IB;\nconst Tag = B;\n"
        out = components.rewrite(text, 'a.tsx', warnings.append)
        self.assertEqual(out, "import { Button as IB, Chip as B } from '@kushagradhawan/kookie-ui';\nconst Comp = IB;\nconst Tag = B;\n")
        self.assertEqual(len(warnings), 1)
        self.assertIn('IB', warnings[0])

    def test_twice(self):
        once = components.rewrite(SOURCE, 'a.tsx')
        self.assertEqual(components.rewrite(once, 'a.tsx'), once)

    def test_plain_ts(self):
        text = "import type { BadgeProps } from '@kushagradhawan/kookie-ui';\nconst n = 'BadgeProps';\nexport type X = BadgeProps;\n"
        self.assertEqual(components.rewrite(text, 'a.ts'), "import type { ChipProps } from '@kushagradhawan/kookie-ui';\nconst n = 'BadgeProps';\nexport type X = ChipProps;\n")

    def test_not_imported_from_kookie(self):
        text = "import { Badge } from './badge';\nconst a = <Badge />;\n"
        self.assertEqual(components.rewrite(text, 'a.tsx'), text)


class Names(unittest.TestCase):
    def test_translucent_tokens(self):
        text = 'a: var(--color-panel-translucent); b: var(--color-surface-translucent); c: var(--color-dialog-translucent);'
        self.assertEqual(names.rewrite(text), 'a: var(--color-surface); b: var(--color-surface); c: var(--color-surface);')


class Files(unittest.TestCase):
    def test_skips_output_folders_only_at_the_top(self):
        root = tempfile.mkdtemp()
        try:
            for rel in ['src/app/build/page.tsx', 'src/dist/a.tsx', 'src/rebuild/b.tsx', 'build/out.tsx', 'dist/out.tsx',
                        'node_modules/x/a.tsx', 'src/node_modules/x/a.tsx', '.next/a.tsx', 'src/c.tsx']:
                path = os.path.join(root, rel)
                os.makedirs(os.path.dirname(path), exist_ok=True)
                open(path, 'w').close()
            found = sorted(os.path.relpath(p, root) for p in shared.files([root], ('.tsx',)))
            self.assertEqual(found, ['src/app/build/page.tsx', 'src/c.tsx', 'src/dist/a.tsx', 'src/rebuild/b.tsx'])
            # A path under a folder named build is visited when it is what was given.
            self.assertEqual(len(list(shared.files([os.path.join(root, 'src', 'app', 'build')], ('.tsx',)))), 1)
        finally:
            shutil.rmtree(root)

    def test_every_codemod_visits_a_source_folder_named_build(self):
        sample = "import { Badge } from '@kushagradhawan/kookie-ui';\nexport const A = () => <Badge p=\"3\" />;\n"
        css = '.a { padding: var(--space-3); font-size: var(--font-size-8); color: var(--gray-9); } .rt-Badge {}\n'
        for module in (space, type_, components, names):
            root = tempfile.mkdtemp()
            try:
                for rel, text in [('src/app/build/page.tsx', sample), ('src/app/build/page.css', css),
                                  ('build/page.tsx', sample), ('build/page.css', css)]:
                    path = os.path.join(root, rel)
                    os.makedirs(os.path.dirname(path), exist_ok=True)
                    with open(path, 'w') as f:
                        f.write(text)
                with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                    module.main([root])
                for name, before in (('page.tsx', sample), ('page.css', css)):
                    with open(os.path.join(root, 'build', name)) as f:
                        self.assertEqual(f.read(), before, module.__name__)
                with open(os.path.join(root, 'src/app/build/page.tsx')) as f:
                    tsx = f.read()
                with open(os.path.join(root, 'src/app/build/page.css')) as f:
                    sheet = f.read()
                self.assertNotEqual((tsx, sheet), (sample, css), module.__name__)
            finally:
                shutil.rmtree(root)


if __name__ == '__main__':
    unittest.main()
