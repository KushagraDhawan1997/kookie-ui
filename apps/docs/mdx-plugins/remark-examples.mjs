/**
 * `<Example src="./examples/icon-and-label" />` in a page's MDX becomes two imports of ONE file:
 * the default export, rendered live, and the same file as a string, shown as its code. The demo
 * and the code can't drift because there is nothing to keep in step.
 *
 * The source import is `!!<raw-source-loader>!./examples/x.tsx`: `!!` turns off every configured
 * loader (so SWC doesn't compile it first), and raw-source-loader exports the file as text.
 *
 * Any other attribute on the tag (`height`, `background`) passes through to `Example`.
 */

import { fileURLToPath } from 'node:url';

const RAW_LOADER = fileURLToPath(new URL('./raw-source-loader.cjs', import.meta.url));

const identifier = (name) => ({ type: 'Identifier', name });
const literal = (value) => ({ type: 'Literal', value, raw: JSON.stringify(value) });

const importDefault = (local, from) => ({
  type: 'ImportDeclaration',
  specifiers: [{ type: 'ImportDefaultSpecifier', local: identifier(local) }],
  source: literal(from),
  attributes: [],
});

const expressionAttribute = (name, local) => ({
  type: 'mdxJsxAttribute',
  name,
  value: {
    type: 'mdxJsxAttributeValueExpression',
    value: local,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [{ type: 'ExpressionStatement', expression: identifier(local) }],
      },
    },
  },
});

function walk(node, visit) {
  visit(node);
  if (node.children) for (const child of node.children) walk(child, visit);
}

export default function remarkExamples() {
  return (tree) => {
    const imports = [];

    walk(tree, (node) => {
      if ((node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') || node.name !== 'Example') return;
      const src = node.attributes.find((attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'src');
      if (!src || typeof src.value !== 'string') return;

      const file = src.value.replace(/\.tsx$/, '');
      const index = imports.length / 2;
      const component = `__Example${index}`;
      const source = `__exampleSource${index}`;
      imports.push(importDefault(component, file), importDefault(source, `!!${RAW_LOADER}!${file}.tsx`));

      node.attributes = [
        ...node.attributes.filter((attribute) => attribute !== src),
        expressionAttribute('of', component),
        expressionAttribute('code', source),
      ];
    });

    if (imports.length === 0) return;
    tree.children.unshift({
      type: 'mdxjsEsm',
      value: '',
      data: { estree: { type: 'Program', sourceType: 'module', body: imports } },
    });
  };
}
