/**
 * The performance benchmark: five heavy screens built from Kookie UI, measured in Chromium.
 *
 *   node run.mjs            measure, compare with budget.json, exit 1 on a regression
 *   node run.mjs --update   measure and write the numbers into budget.json as the new baseline
 *   node run.mjs --serve    serve the screens at http://localhost:4173/?scene=table to look at
 *
 * The screens are bundled for production in memory (React's production build, minified), so the
 * numbers are what an app would ship. Nothing is written into the repo except budget.json.
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as esbuild from 'esbuild';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const BUDGET_PATH = join(here, 'budget.json');
const RUNS = Number(process.env.BENCH_RUNS ?? 5);

// ── Bundle ──────────────────────────────────────────────────────────────────

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
const round = (x) => Math.round(x * 10) / 10;

/** Time from navigation to the scene's first painted commit, and to repaint after a full update. */
async function renderTimes(page, base, scene) {
  await page.goto(`${base}/?scene=${scene}`);
  await page.waitForFunction(() => window.__bench.mountedAt);
  const mount = await page.evaluate(() => window.__bench.mountedAt);
  const rerender = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const start = performance.now();
        window.__bench.scene.rerender();
        requestAnimationFrame(() => setTimeout(() => resolve(performance.now() - start), 0));
      }),
  );
  return { mount, rerender };
}

/** The slowest interaction, from the browser's own event timing (what INP reports). */
async function interactionDelay(page) {
  return page.evaluate(() => window.__events.reduce((max, e) => Math.max(max, e.duration), 0));
}

async function observeEvents(page) {
  await page.evaluate(() => {
    // Event entries reach only an observer, never the timeline buffer, so collect them here.
    window.__events = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (e.interactionId) window.__events.push({ duration: e.duration });
    }).observe({ type: 'event', durationThreshold: 16 });
  });
}

/** Frames longer than 25ms while the scene's scroller scrolls top to bottom over two seconds. */
async function scrollJank(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        const el = window.__bench.scene.scroller?.();
        if (!el) return resolve(null);
        const max = el.scrollHeight - el.clientHeight;
        const start = performance.now();
        let last = start;
        let long = 0;
        let frames = 0;
        const step = (now) => {
          const t = (now - start) / 2000;
          el.scrollTop = max * Math.min(t, 1);
          if (now - last > 25) long++;
          last = now;
          frames++;
          if (t < 1) requestAnimationFrame(step);
          else resolve({ frames, long });
        };
        requestAnimationFrame(step);
      }),
  );
}

/** DOM nodes, listeners and heap through the DevTools protocol, after a forced collection. */
async function memory(cdp) {
  await cdp.send('HeapProfiler.collectGarbage');
  const { metrics } = await cdp.send('Performance.getMetrics');
  const get = (name) => metrics.find((m) => m.name === name)?.value ?? 0;
  return { nodes: get('Nodes'), listeners: get('JSEventListeners'), heapKB: Math.round(get('JSHeapUsedSize') / 1024) };
}

/** Compositing layers Chrome builds for the page, after one more frame has painted. */
async function layers(page, cdp, withReasons = false) {
  const changed = new Promise((resolve) => cdp.once('LayerTree.layerTreeDidChange', resolve));
  await cdp.send('LayerTree.enable');
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const { layers: list = [] } = await Promise.race([changed, new Promise((r) => setTimeout(() => r({}), 2000))]);
  let reasons;
  if (withReasons) {
    reasons = {};
    for (const layer of list) {
      try {
        const { compositingReasonIds = [] } = await cdp.send('LayerTree.compositingReasons', { layerId: layer.layerId });
        const key = compositingReasonIds.join(',') || '(none)';
        reasons[key] = (reasons[key] ?? 0) + 1;
      } catch {}
    }
  }
  await cdp.send('LayerTree.disable');
  return { count: list.length, reasons };
}

/** How many elements carry a style attribute, and how much CSS text those attributes hold. */
async function inlineStyles(page) {
  return page.evaluate(() => {
    const styled = document.querySelectorAll('[style]');
    let bytes = 0;
    for (const el of styled) bytes += (el.getAttribute('style') ?? '').length;
    return { elements: styled.length, bytes };
  });
}

// ── Scenes ──────────────────────────────────────────────────────────────────

const INTERACTIONS = {
  async table(page) {
    await page.click('[data-bench="rerender"]');
    await page.click('[aria-label="Actions for row 3"]');
    await page.keyboard.press('Escape');
  },
  async form(page) {
    await page.click('[data-bench="type"] input, input[data-bench="type"]');
    await page.keyboard.type('hello');
  },
  async menu(page) {
    await page.click('[data-bench="open"]');
    for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
  },
  async dialogs(page) {
    await page.click('[data-bench="dialog"]');
    await page.click('[data-bench="dialog-close"]');
    await page.click('[data-bench="popover"]');
    await page.keyboard.press('Escape');
  },
  async shell(page) {
    await page.click('text=Page 5');
  },
};

/** Opens and closes the dialog and the popover 100 times; what is left over is a leak. */
async function leakCheck(page, cdp) {
  const before = await memory(cdp);
  for (let i = 0; i < 100; i++) {
    await page.click('[data-bench="dialog"]');
    await page.click('[data-bench="dialog-close"]');
    await page.click('[data-bench="popover"]');
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(300);
  const after = await memory(cdp);
  return {
    nodesLeft: after.nodes - before.nodes,
    listenersLeft: after.listeners - before.listeners,
    heapGrowthKB: after.heapKB - before.heapKB,
  };
}

async function measureScene(browser, base, scene) {
  const samples = [];
  for (let run = 0; run < RUNS; run++) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    const { mount, rerender } = await renderTimes(page, base, scene);
    await observeEvents(page);
    await INTERACTIONS[scene](page);
    await page.waitForTimeout(300);
    const inp = await interactionDelay(page);
    const jank = await scrollJank(page);
    const mem = await memory(cdp);
    const layer = run === 0 ? await layers(page, cdp, args.has('--diagnose')) : undefined;
    const inline = run === 0 ? await inlineStyles(page) : undefined;
    if (layer?.reasons) console.log(`\n${scene} layers by reason:`, layer.reasons);
    const leak = scene === 'dialogs' && run === 0 ? await leakCheck(page, cdp) : undefined;
    samples.push({ mount, rerender, inp, jank, mem, leak, layer, inline });
    await context.close();
  }
  const pick = (f) => round(median(samples.map(f)));
  return {
    mountMs: pick((s) => s.mount),
    rerenderMs: pick((s) => s.rerender),
    interactionMs: pick((s) => s.inp),
    ...(samples[0].jank ? { longFrames: pick((s) => s.jank.long) } : {}),
    domNodes: pick((s) => s.mem.nodes),
    layers: samples[0].layer.count,
    inlineStyleElements: samples[0].inline.elements,
    inlineStyleBytes: samples[0].inline.bytes,
    heapKB: pick((s) => s.mem.heapKB),
    ...(samples[0].leak ?? {}),
  };
}

// ── Budget ──────────────────────────────────────────────────────────────────

/*
 * Two kinds of number. COUNTS (bytes, DOM nodes, nodes and listeners a leak leaves behind) are
 * exact on any machine, so any increase fails. TIMES, long frames and heap sizes depend on the
 * machine, so they are recorded from CI and fail only past a margin. A time with no CI baseline
 * yet is reported, never failed.
 */
const TIME_KEYS = new Set(['mountMs', 'rerenderMs', 'interactionMs', 'longFrames', 'heapKB', 'heapGrowthKB']);
const TIME_MARGIN = 1.5;
// One frame: a difference under 16ms is noise on a shared CI runner, and no one can see it.
// It applies to milliseconds only. longFrames counts frames and the heap is in KB, so they take
// the margin alone: from a baseline of 0 long frames, one long frame fails.
const MS_KEYS = new Set(['mountMs', 'rerenderMs', 'interactionMs']);
const TIME_SLACK = 16;

function limitFor(key, base) {
  if (!TIME_KEYS.has(key)) return base;
  return base * TIME_MARGIN + (MS_KEYS.has(key) ? TIME_SLACK : 0);
}

function compare(budget, results) {
  const failures = [];
  const rows = [];
  for (const [group, values] of Object.entries(results)) {
    for (const [key, value] of Object.entries(values)) {
      const base = budget?.[group]?.[key];
      let verdict = 'new';
      if (typeof base === 'number') {
        const limit = limitFor(key, base);
        verdict = value > limit ? 'WORSE' : value < base ? 'better' : 'ok';
        if (verdict === 'WORSE') failures.push(`${group}.${key}: ${value} (baseline ${base}, limit ${round(limit)})`);
      }
      rows.push([group, key, value, base ?? '', verdict]);
    }
  }
  console.table(rows.map(([group, metric, value, baseline, verdict]) => ({ group, metric, value, baseline, verdict })));
  return failures;
}

// ── Main ────────────────────────────────────────────────────────────────────

const built = await bundle();

if (args.has('--serve')) {
  await serve(built, 4173);
  console.log('Scenes at http://localhost:4173/?scene=table | form | menu | dialogs | shell');
} else {
  const server = await serve(built, 0);
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  const results = {
    size: { cssGzipBytes: gzipSync(built.css).length, jsGzipBytes: gzipSync(built.js).length },
  };
  for (const scene of Object.keys(INTERACTIONS)) results[scene] = await measureScene(browser, base, scene);
  await browser.close();
  server.close();

  const budget = JSON.parse(readFileSync(BUDGET_PATH, 'utf8'));
  if (args.has('--update')) {
    const { comment, ...rest } = budget;
    const next = { comment, ...rest };
    for (const [group, values] of Object.entries(results)) {
      next[group] = { ...next[group] };
      for (const [key, value] of Object.entries(values)) {
        // Times are only recorded from CI, where the gate runs; a laptop's times would be too fast.
        if (TIME_KEYS.has(key) && !process.env.CI) continue;
        next[group][key] = value;
      }
    }
    writeFileSync(BUDGET_PATH, JSON.stringify(next, null, 2) + '\n');
    console.log('budget.json updated.');
  }
  const failures = compare(budget, results);
  if (failures.length && !args.has('--update')) {
    console.error('\nWorse than the budget:\n  ' + failures.join('\n  '));
    console.error('\nFix the regression, or re-record on purpose with `pnpm --filter bench bench:update`.');
    process.exit(1);
  }
}
