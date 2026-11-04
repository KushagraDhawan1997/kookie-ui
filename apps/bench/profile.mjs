/**
 * Per-component profile: mounts one component N times (scene "components") and records what each
 * instance costs Chromium.
 *
 *   node profile.mjs                 every component, n=1 and n=200, every meaningful state
 *   node profile.mjs Button Select   only these components
 *
 * Writes profile-baseline.json next to this file, and a readable summary to PROFILE_SUMMARY (or
 * profile-summary.md next to this file). Bundling and serving match run.mjs.
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as esbuild from 'esbuild';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const OUT_JSON = join(here, 'profile-baseline.json');
const OUT_MD = process.env.PROFILE_SUMMARY ?? join(here, 'profile-summary.md');
const COUNTS = [1, 200];

// ── Bundle and serve (same as run.mjs) ──────────────────────────────────────

async function bundle() {
  const result = await esbuild.build({
    entryPoints: [join(here, 'src/main.tsx')],
    bundle: true,
    minify: true,
    format: 'esm',
    target: 'es2022',
    write: false,
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'error',
  });
  const js = result.outputFiles[0].contents;
  const css = readFileSync(join(here, '../../packages/kookie-ui/styles.css'));
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<link rel="stylesheet" href="/styles.css"><style>body{margin:0}</style></head>
<body><div id="root"></div><script type="module" src="/main.js"></script></body></html>`;
  return { js, css, html };
}

function serve({ js, css, html }, port) {
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://x').pathname;
    if (path === '/main.js') res.writeHead(200, { 'content-type': 'text/javascript' }).end(js);
    else if (path === '/styles.css') res.writeHead(200, { 'content-type': 'text/css' }).end(css);
    else res.writeHead(200, { 'content-type': 'text/html' }).end(html);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

// ── Measures ────────────────────────────────────────────────────────────────

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;

async function layers(page, cdp) {
  const changed = new Promise((resolve) => cdp.once('LayerTree.layerTreeDidChange', resolve));
  await cdp.send('LayerTree.enable');
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const { layers: list = [] } = await Promise.race([changed, new Promise((r) => setTimeout(() => r({}), 2000))]);
  await cdp.send('DOM.getDocument', { depth: 0 }).catch(() => {});
  const reasons = {};
  const owners = {};
  for (const layer of list) {
    let ids = [];
    try {
      ({ compositingReasonIds: ids = [] } = await cdp.send('LayerTree.compositingReasons', { layerId: layer.layerId }));
    } catch {}
    const key = ids.join(',') || '(none)';
    reasons[key] = (reasons[key] ?? 0) + 1;
    let owner = '(no node)';
    if (layer.backendNodeId) {
      try {
        const { node } = await cdp.send('DOM.describeNode', { backendNodeId: layer.backendNodeId });
        const attrs = node.attributes ?? [];
        const cls = attrs[attrs.indexOf('class') + 1];
        owner = `${node.nodeName.toLowerCase()}${attrs.includes('class') && cls ? '.' + cls.split(/\s+/).join('.') : ''}`;
      } catch {}
    }
    const ownerKey = `${owner} [${key}]`;
    owners[ownerKey] = (owners[ownerKey] ?? 0) + 1;
  }
  await cdp.send('LayerTree.disable');
  return { count: list.length, reasons, owners };
}

async function inlineStyles(page) {
  return page.evaluate(() => {
    const styled = document.querySelectorAll('[style]');
    let bytes = 0;
    let vars = 0;
    const kinds = {};
    for (const el of styled) {
      const text = el.getAttribute('style') ?? '';
      bytes += text.length;
      vars += (text.match(/--[\w-]+\s*:/g) ?? []).length;
      // Group by the element's first kui class and the property names it sets.
      const cls = [...el.classList].find((c) => c.startsWith('kui-')) ?? el.tagName.toLowerCase();
      const props = text
        .split(';')
        .map((d) => d.split(':')[0].trim())
        .filter(Boolean)
        .join(',');
      const key = `${cls} {${props}}`;
      kinds[key] = kinds[key] ?? { count: 0, bytes: 0, sample: text.slice(0, 200) };
      kinds[key].count++;
      kinds[key].bytes += text.length;
    }
    return { elements: styled.length, bytes, vars, kinds };
  });
}

async function memory(cdp) {
  await cdp.send('HeapProfiler.collectGarbage');
  await cdp.send('HeapProfiler.collectGarbage');
  const { metrics } = await cdp.send('Performance.getMetrics');
  const get = (name) => metrics.find((m) => m.name === name)?.value ?? 0;
  return {
    nodes: get('Nodes'),
    listeners: get('JSEventListeners'),
    heapKB: round(get('JSHeapUsedSize') / 1024),
    recalcCount: get('RecalcStyleCount'),
    recalcMs: get('RecalcStyleDuration') * 1000,
  };
}

/** Custom properties in instance 0's computed style, and how many of them differ from its parent's. */
async function customProps(page) {
  return page.evaluate(() => {
    const el = document.querySelector('[data-inst="0"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const parent = el.parentElement ? getComputedStyle(el.parentElement) : null;
    let total = 0;
    let own = 0;
    for (let i = 0; i < cs.length; i++) {
      const name = cs[i];
      if (!name.startsWith('--')) continue;
      total++;
      if (!parent || parent.getPropertyValue(name) !== cs.getPropertyValue(name)) own++;
    }
    return { total, differFromParent: own, tag: el.tagName.toLowerCase(), cls: el.className };
  });
}

/** A theme switch: toggle .dark on <html>, then read the last instance's style. Median of 11. */
async function recalc(page, cdp) {
  const before = await cdp.send('Performance.getMetrics');
  const ms = await page.evaluate(() => {
    const all = document.querySelectorAll('[data-inst]');
    const last = all[all.length - 1] ?? document.body;
    const times = [];
    for (let i = 0; i < 11; i++) {
      const start = performance.now();
      document.documentElement.classList.toggle('dark');
      getComputedStyle(last).color;
      times.push(performance.now() - start);
    }
    document.documentElement.classList.remove('dark');
    getComputedStyle(last).color;
    return times.sort((a, b) => a - b)[5];
  });
  const after = await cdp.send('Performance.getMetrics');
  const dur = (m) => m.metrics.find((x) => x.name === 'RecalcStyleDuration')?.value ?? 0;
  return { ms: round(ms, 2), cdpRecalcMsPerToggle: round(((dur(after) - dur(before)) * 1000) / 12, 2) };
}

async function applyState(page, state) {
  if (state === 'hover') {
    await page.hover('[data-inst="0"]', { force: true });
    await page.waitForTimeout(900);
  } else if (state === 'focus') {
    await page.evaluate(() => document.activeElement?.blur?.());
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
  } else if (state === 'open') {
    await page.waitForTimeout(600);
  }
}

async function measure(browser, base, c, n, state) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/?scene=components&c=${c}&n=${n}&state=${state}`);
  await page.waitForFunction(() => window.__bench.mountedAt, null, { timeout: 15000 });
  await page.waitForTimeout(300);
  await applyState(page, state);
  const layer = await layers(page, cdp);
  const inline = await inlineStyles(page);
  const props = await customProps(page);
  const mem = await memory(cdp);
  const rc = await recalc(page, cdp);
  const instances = await page.evaluate(() => document.querySelectorAll('[data-inst]').length);
  await context.close();
  return {
    instances,
    layers: layer.count,
    layerReasons: layer.reasons,
    layerOwners: layer.owners,
    inlineElements: inline.elements,
    inlineBytes: inline.bytes,
    inlineVars: inline.vars,
    inlineKinds: inline.kinds,
    customProps: props,
    heapKB: mem.heapKB,
    domNodes: mem.nodes,
    listeners: mem.listeners,
    recalcMs: rc.ms,
    cdpRecalcMs: rc.cdpRecalcMsPerToggle,
    errors,
  };
}

// ── Main ────────────────────────────────────────────────────────────────────

// The component list and their states come from the scene source, so the two cannot drift.
const src = readFileSync(join(here, 'src/components.tsx'), 'utf8');
const specs = {};
{
  const body = src.slice(src.indexOf('export const COMPONENTS'));
  const re = /^  (\w+): \{/gm;
  const names = [...body.matchAll(re)].map((m) => ({ name: m[1], at: m.index }));
  names.forEach(({ name, at }, i) => {
    const chunk = body.slice(at, names[i + 1]?.at ?? body.indexOf('\n};'));
    const st = chunk.match(/states: (\[[^\]]*\]|INTERACTIVE|STATIC)/)[1];
    specs[name] = st === 'INTERACTIVE' ? ['rest', 'hover', 'focus'] : st === 'STATIC' ? ['rest'] : JSON.parse(st.replace(/'/g, '"'));
  });
}
const only = process.argv.slice(2);
const list = Object.keys(specs).filter((c) => !only.length || only.includes(c));

const built = await bundle();
const server = await serve(built, 0);
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch();
const results = {};
for (const c of list) {
  results[c] = {};
  for (const state of specs[c]) {
    results[c][state] = {};
    for (const n of COUNTS) {
      results[c][state][`n${n}`] = await measure(browser, base, c, n, state);
      const r = results[c][state][`n${n}`];
      console.log(`${c} ${state} n=${n}: layers ${r.layers}, inline ${r.inlineElements}/${r.inlineBytes}B, nodes ${r.domNodes}, heap ${r.heapKB}KB, recalc ${r.recalcMs}ms${r.errors.length ? ' ERR ' + r.errors[0] : ''}`);
    }
  }
}
await browser.close();
server.close();

writeFileSync(OUT_JSON, JSON.stringify({ generated: new Date().toISOString(), counts: COUNTS, results }, null, 2) + '\n');

// ── Summary ─────────────────────────────────────────────────────────────────

const per = (a, b, k) => round((b[k] - a[k]) / (COUNTS[1] - COUNTS[0]), 2);
const rows = [];
for (const [c, states] of Object.entries(results)) {
  for (const [state, { n1, n200 }] of Object.entries(states)) {
    rows.push({
      c,
      state,
      n1,
      n200,
      layers: per(n1, n200, 'layers'),
      inlineEl: per(n1, n200, 'inlineElements'),
      inlineB: per(n1, n200, 'inlineBytes'),
      inlineVars: per(n1, n200, 'inlineVars'),
      nodes: per(n1, n200, 'domNodes'),
      heapKB: per(n1, n200, 'heapKB'),
      listeners: per(n1, n200, 'listeners'),
      recalcUs: round(((n200.recalcMs - n1.recalcMs) / (COUNTS[1] - COUNTS[0])) * 1000, 1),
      propsOwn: n1.customProps?.differFromParent ?? '',
      propsTotal: n1.customProps?.total ?? '',
    });
  }
}

const top = (key, k = 10) => [...rows].sort((a, b) => b[key] - a[key]).slice(0, k);
const lines = [];
lines.push(`# Kookie UI v1 per-component profile`, '', `Generated ${new Date().toISOString()}. Chromium (Playwright), 1280x800, production bundle.`);
lines.push(`Per-instance cost = (n200 - n1) / 199. Recalc = median time of a .dark toggle on <html> plus a forced style read.`, '');

lines.push('## Per-instance costs (all)', '');
lines.push('| Component | State | Layers/inst | Inline el/inst | Inline B/inst | Inline vars/inst | DOM nodes/inst | Heap KB/inst | Listeners/inst | Recalc µs/inst | Own custom props (inst 0) | Layers n1 | Layers n200 | Recalc ms n200 |');
lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows)
  lines.push(`| ${r.c} | ${r.state} | ${r.layers} | ${r.inlineEl} | ${r.inlineB} | ${r.inlineVars} | ${r.nodes} | ${r.heapKB} | ${r.listeners} | ${r.recalcUs} | ${r.propsOwn} | ${r.n1.layers} | ${r.n200.layers} | ${r.n200.recalcMs} |`);

const section = (title, key, unit) => {
  lines.push('', `## Top: ${title}`, '');
  for (const r of top(key)) lines.push(`- ${r.c} (${r.state}): ${r[key]} ${unit}`);
};
section('compositing layers per instance', 'layers', 'layers');
section('inline style bytes per instance', 'inlineB', 'B');
section('inline style elements per instance', 'inlineEl', 'elements');
section('DOM nodes per instance', 'nodes', 'nodes');
section('JS heap per instance', 'heapKB', 'KB');
section('style recalc per instance', 'recalcUs', 'µs');
section('own custom properties on instance root', 'propsOwn', 'props');

lines.push('', '## Layer owners at n=200 (components with layers growing per instance)', '');
for (const r of rows.filter((r) => r.layers > 0.2)) {
  lines.push(`### ${r.c} (${r.state})`);
  for (const [k, v] of Object.entries(r.n200.layerOwners).sort((a, b) => b[1] - a[1]).slice(0, 6)) lines.push(`- ${v} × ${k}`);
}
lines.push('', '## Inline style sources at n=200 (components with inline styles growing per instance)', '');
for (const r of rows.filter((r) => r.inlineEl > 0.2)) {
  lines.push(`### ${r.c} (${r.state})`);
  for (const [k, v] of Object.entries(r.n200.inlineKinds).sort((a, b) => b[1].bytes - a[1].bytes).slice(0, 4))
    lines.push(`- ${v.count} × ${k}: ${v.bytes} B, e.g. \`${v.sample}\``);
}
lines.push('', '## Open-state overlay cost (n1 open - n1 rest)', '');
for (const [c, states] of Object.entries(results)) {
  if (!states.open) continue;
  const o = states.open.n1;
  const r = states.rest.n1;
  lines.push(`- ${c}: +${o.layers - r.layers} layers, +${o.inlineElements - r.inlineElements} inline el / +${o.inlineBytes - r.inlineBytes} B, +${o.domNodes - r.domNodes} nodes, +${round(o.heapKB - r.heapKB)} KB heap`);
}
const errs = rows.filter((r) => r.n1.errors.length || r.n200.errors.length);
if (errs.length) {
  lines.push('', '## Page errors', '');
  for (const r of errs) lines.push(`- ${r.c} (${r.state}): ${[...r.n1.errors, ...r.n200.errors][0]}`);
}
writeFileSync(OUT_MD, lines.join('\n') + '\n');
console.log(`\nWrote ${OUT_JSON}\nWrote ${OUT_MD}`);
