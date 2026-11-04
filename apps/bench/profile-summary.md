# Kookie UI v1 per-component profile

Generated 2026-10-23T14:25:17.382Z. Chromium (Playwright), 1280x800, production bundle.
Per-instance cost = (n200 - n1) / 199. Recalc = median time of a .dark toggle on <html> plus a forced style read.

## Per-instance costs (all)

| Component | State | Layers/inst | Inline el/inst | Inline B/inst | Inline vars/inst | DOM nodes/inst | Heap KB/inst | Listeners/inst | Recalc µs/inst | Own custom props (inst 0) | Layers n1 | Layers n200 | Recalc ms n200 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Button | rest | 0 | 0 | 0 | 0 | 2 | 4.42 | 1 | 5.5 | 7 | 5 | 5 | 1.2 |
| Button | hover | 0 | 0 | 0 | 0 | 2 | 4.39 | 1 | 5 | 7 | 5 | 5 | 1.1 |
| Button | focus | 0 | 0 | 0 | 0 | 2 | 4.43 | 1 | 5.5 | 7 | 5 | 5 | 1.2 |
| Select | rest | 0 | 1 | 21 | 0 | 27 | 111.41 | 294 | 16.1 | 4 | 5 | 5 | 3.3 |
| Select | hover | 0 | 1 | 21 | 0 | 27 | 111.49 | 294 | 15.6 | 4 | 5 | 5 | 3.3 |
| Select | focus | 0 | 1 | 21 | 0 | 27 | 111.43 | 294 | 16.1 | 4 | 5 | 5 | 3.3 |
| Select | open | 0 | 1 | 21 | 0 | 27 | 111.53 | 294 | 16.1 | 4 | 6 | 6 | 3.5 |
| Slider | rest | 0 | 5 | 240.55 | 1 | 9 | 23.9 | 0 | 23.1 | 7 | 5 | 5 | 4.7 |
| Slider | hover | 0 | 5 | 240.55 | 1 | 9 | 23.99 | 0 | 23.1 | 7 | 5 | 5 | 4.7 |
| Slider | focus | 0 | 5 | 240.55 | 1 | 9 | 23.88 | 0 | 24.6 | 7 | 5 | 5 | 5 |
| Card | rest | 0 | 0 | 0 | 0 | 6 | 2.36 | 0 | 19.1 | 11 | 5 | 5 | 4 |
| Progress | rest | 0 | 1 | 20.9 | 1 | 2 | 2.9 | 0 | 7.5 | 6 | 5 | 5 | 1.6 |

## Top: compositing layers per instance

- Button (rest): 0 layers
- Button (hover): 0 layers
- Button (focus): 0 layers
- Select (rest): 0 layers
- Select (hover): 0 layers
- Select (focus): 0 layers
- Select (open): 0 layers
- Slider (rest): 0 layers
- Slider (hover): 0 layers
- Slider (focus): 0 layers

## Top: inline style bytes per instance

- Slider (rest): 240.55 B
- Slider (hover): 240.55 B
- Slider (focus): 240.55 B
- Select (rest): 21 B
- Select (hover): 21 B
- Select (focus): 21 B
- Select (open): 21 B
- Progress (rest): 20.9 B
- Button (rest): 0 B
- Button (hover): 0 B

## Top: inline style elements per instance

- Slider (rest): 5 elements
- Slider (hover): 5 elements
- Slider (focus): 5 elements
- Select (rest): 1 elements
- Select (hover): 1 elements
- Select (focus): 1 elements
- Select (open): 1 elements
- Progress (rest): 1 elements
- Button (rest): 0 elements
- Button (hover): 0 elements

## Top: DOM nodes per instance

- Select (rest): 27 nodes
- Select (hover): 27 nodes
- Select (focus): 27 nodes
- Select (open): 27 nodes
- Slider (rest): 9 nodes
- Slider (hover): 9 nodes
- Slider (focus): 9 nodes
- Card (rest): 6 nodes
- Button (rest): 2 nodes
- Button (hover): 2 nodes

## Top: JS heap per instance

- Select (open): 111.53 KB
- Select (hover): 111.49 KB
- Select (focus): 111.43 KB
- Select (rest): 111.41 KB
- Slider (hover): 23.99 KB
- Slider (rest): 23.9 KB
- Slider (focus): 23.88 KB
- Button (focus): 4.43 KB
- Button (rest): 4.42 KB
- Button (hover): 4.39 KB

## Top: style recalc per instance

- Slider (focus): 24.6 µs
- Slider (rest): 23.1 µs
- Slider (hover): 23.1 µs
- Card (rest): 19.1 µs
- Select (rest): 16.1 µs
- Select (focus): 16.1 µs
- Select (open): 16.1 µs
- Select (hover): 15.6 µs
- Progress (rest): 7.5 µs
- Button (rest): 5.5 µs

## Top: own custom properties on instance root

- Card (rest): 11 props
- Button (rest): 7 props
- Button (hover): 7 props
- Button (focus): 7 props
- Slider (rest): 7 props
- Slider (hover): 7 props
- Slider (focus): 7 props
- Progress (rest): 6 props
- Select (rest): 4 props
- Select (hover): 4 props

## Layer owners at n=200 (components with layers growing per instance)


## Inline style sources at n=200 (components with inline styles growing per instance)

### Select (rest)
- 200 × span {pointer-events}: 4200 B, e.g. `pointer-events: none;`
### Select (hover)
- 200 × span {pointer-events}: 4200 B, e.g. `pointer-events: none;`
### Select (focus)
- 200 × span {pointer-events}: 4200 B, e.g. `pointer-events: none;`
### Select (open)
- 200 × span {pointer-events}: 4200 B, e.g. `pointer-events: none;`
- 1 × div {display,flex-direction,position,min-width,left,top,height,margin,min-height,max-height,z-index}: 184 B, e.g. `display: flex; flex-direction: column; position: fixed; min-width: 203.422px; left: 10px; top: 0px; height: 114px; margin: 10px 0px; min-height: 114px; max-height: 780px; z-index: 200;`
- 2 × span {outline,opacity,position,pointer-events}: 130 B, e.g. `outline: none; opacity: 0; position: fixed; pointer-events: none;`
- 1 × kui-theme {box-sizing,max-height,display,flex-direction,outline,pointer-events}: 117 B, e.g. `box-sizing: border-box; max-height: 100%; display: flex; flex-direction: column; outline: none; pointer-events: auto;`
### Slider (rest)
- 200 × span {transform,position,left}: 18524 B, e.g. `transform: var(--radix-slider-thumb-transform); position: absolute; left: calc(0% + 8px);`
- 200 × div {position,left,width,height,overflow}: 15600 B, e.g. `position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;`
- 200 × kui-SliderRoot {--radix-slider-thumb-transform}: 9800 B, e.g. `--radix-slider-thumb-transform: translateX(-50%);`
- 200 × kui-SliderRange {left,right}: 4184 B, e.g. `left: 0%; right: 100%;`
### Slider (hover)
- 200 × span {transform,position,left}: 18524 B, e.g. `transform: var(--radix-slider-thumb-transform); position: absolute; left: calc(0% + 8px);`
- 200 × div {position,left,width,height,overflow}: 15600 B, e.g. `position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;`
- 200 × kui-SliderRoot {--radix-slider-thumb-transform}: 9800 B, e.g. `--radix-slider-thumb-transform: translateX(-50%);`
- 200 × kui-SliderRange {left,right}: 4184 B, e.g. `left: 0%; right: 100%;`
### Slider (focus)
- 200 × span {transform,position,left}: 18524 B, e.g. `transform: var(--radix-slider-thumb-transform); position: absolute; left: calc(0% + 8px);`
- 200 × div {position,left,width,height,overflow}: 15600 B, e.g. `position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;`
- 200 × kui-SliderRoot {--radix-slider-thumb-transform}: 9800 B, e.g. `--radix-slider-thumb-transform: translateX(-50%);`
- 200 × kui-SliderRange {left,right}: 4184 B, e.g. `left: 0%; right: 100%;`
### Progress (rest)
- 200 × kui-ProgressRoot {--progress-value}: 4180 B, e.g. `--progress-value: 0;`

## Open-state overlay cost (n1 open - n1 rest)

- Select: +1 layers, +8 inline el / +638 B, +5 nodes, +133.2 KB heap
