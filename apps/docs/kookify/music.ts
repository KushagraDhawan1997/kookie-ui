/**
 * Kookify's theme music: original, deliberately silly loops written for this, played while the
 * stickers are on. Synthesised with Web Audio (no files) and scheduled a little ahead, step by
 * step, so each loop repeats without a seam. Every track is levelled to sit under the effects.
 *
 *   0  the first theme: squeaky lead, bouncing bass, 126 BPM
 *   a  cartoon chase: staccato squeak lead, oom-pah bass, snappy drums, 160 BPM
 *   b  goofy groove: bendy kazoo lead, slide-whistle accents, swung, 150 BPM
 *   c  hyper chiptune: square arpeggios, fast hats, a honk on every bar, 170 BPM
 */

export type Music = { start(): void; stop(): void };
export type TrackId = "0" | "a" | "b" | "c";

const LOOKAHEAD = 0.15;
const C5 = 523.25;
const C2 = 65.41;
const hz = (semitones: number, base: number) => base * Math.pow(2, semitones / 12);
/** Index into a pattern; every pattern here is sized to its loop, so the slot always exists. */
const at = <T,>(list: readonly T[], i: number) => list[i % list.length] as T;

type N = number | null;

type Kit = {
  squeak(note: number, t: number, len: number, peak?: number): void;
  kazoo(note: number, t: number, len: number): void;
  slide(up: boolean, t: number): void;
  square(note: number, t: number, len: number, peak: number): void;
  bass(note: number, t: number, len: number, peak?: number): void;
  kick(t: number): void;
  clap(t: number): void;
  hat(t: number, peak?: number): void;
  honk(t: number): void;
};

type Track = {
  /** Seconds per step. */
  step: number;
  steps: number;
  /** How late every other step lands, as a fraction of a step: a swing feel. */
  swing: number;
  gain: number;
  play(i: number, t: number, len: number, kit: Kit): void;
};

const eighth = (bpm: number) => 60 / bpm / 2;
const sixteenth = (bpm: number) => 60 / bpm / 4;

// 0. The first theme.
const LEAD_0: N[] = [
  0, 4, 7, 4, 9, 7, 4, null, 2, 5, 9, 5, 7, null, 7, null,
  0, 4, 7, 12, 11, 7, 4, 7, 9, 5, 2, -1, 0, null, null, null,
  7, 7, 9, 7, 4, null, 0, 2, 4, 4, 5, 4, 2, null, -1, 2,
  0, 4, 7, 9, 12, 11, 9, 7, 5, 4, 2, -1, 0, null, -5, null,
];
const ROOTS_0 = [0, 5, 0, 7, 0, 7, 0, 7];

// A. Cartoon chase.
const LEAD_A: N[] = [
  7, null, 7, 9, 7, 4, null, 0, 2, null, 2, 4, 5, 4, 2, null,
  7, null, 7, 9, 12, 9, 7, null, 5, 4, 2, 4, 0, null, null, null,
  9, null, 9, 11, 12, 11, 9, 7, 5, null, 5, 7, 9, 7, 5, 4,
  2, 4, 5, 7, 9, 11, 12, null, 11, 9, 7, 5, 4, 2, 0, null,
];
const ROOTS_A = [0, 7, 0, 5, 5, 0, 7, 0];

// B. Goofy groove, in a bluesy C.
const LEAD_B: N[] = [
  0, null, 3, null, 5, 6, 7, null, 10, null, 7, null, 5, 3, 0, null,
  0, null, 3, null, 5, 6, 7, 10, 12, null, 10, 7, null, null, null, null,
  5, null, 8, null, 10, 11, 12, null, 10, null, 7, 5, 3, null, 0, null,
  -2, 0, 3, 5, 7, null, 5, 3, 0, null, null, null, null, null, null, null,
];
const ROOTS_B = [0, 0, 5, 0, 5, 5, 0, 7];

// C. Hyper chiptune: C, A minor, F, G, twice, arpeggiated in sixteenths.
const CHORDS_C = [
  [0, 4, 7, 12], [9, 12, 16, 21], [5, 9, 12, 17], [7, 11, 14, 19],
  [0, 4, 7, 12], [9, 12, 16, 21], [5, 9, 12, 17], [7, 11, 14, 19],
];
const TOP_C: N[] = [12, null, 16, null, 19, null, 16, 14, 12, null, 11, null, 7, null, 11, 12];

const TRACKS: Record<TrackId, Track> = {
  "0": {
    step: eighth(126),
    steps: 64,
    swing: 0,
    gain: 0.35,
    play(i, t, len, kit) {
      const bar = Math.floor(i / 8);
      const beat = i % 8;
      const note = at(LEAD_0, i);
      if (note !== null) kit.squeak(note, t, len * 0.9);
      kit.bass(at(ROOTS_0, bar) + at([0, 12, 0, 7], beat % 4), t, len * 0.95);
      if (beat === 0 || beat === 4) kit.kick(t);
      if (beat === 2 || beat === 6) kit.clap(t);
      if (beat % 2 === 1) kit.hat(t);
    },
  },
  a: {
    step: eighth(160),
    steps: 64,
    swing: 0,
    gain: 0.38,
    play(i, t, len, kit) {
      const bar = Math.floor(i / 8);
      const beat = i % 8;
      const note = at(LEAD_A, i);
      if (note !== null) kit.squeak(note, t, len * 0.45, 0.055);
      // Oom on the beat, pah on the off-beat: root low, a high fifth short.
      const root = at(ROOTS_A, bar);
      if (beat % 2 === 0) kit.bass(beat % 4 === 0 ? root : root + 19, t, beat % 4 === 0 ? len * 1.6 : len * 0.5);
      if (beat === 0 || beat === 4) kit.kick(t);
      if (beat === 2 || beat === 6) kit.clap(t);
      kit.hat(t, beat % 2 ? 0.02 : 0.012);
    },
  },
  b: {
    step: eighth(150),
    steps: 64,
    swing: 0.24,
    gain: 0.44,
    play(i, t, len, kit) {
      const bar = Math.floor(i / 8);
      const beat = i % 8;
      const note = at(LEAD_B, i);
      if (note !== null) kit.kazoo(note, t, len * 1.6);
      const root = at(ROOTS_B, bar);
      if (beat % 2 === 0) kit.bass(root + at([0, 7, 12, 10], beat / 2), t, len * 1.7);
      if (beat === 0 || beat === 3 || beat === 4) kit.kick(t);
      if (beat === 2 || beat === 6) kit.clap(t);
      if (beat % 2 === 1) kit.hat(t);
      // A slide whistle at the end of each four bars: up, then back down.
      if (bar === 3 && beat === 4) kit.slide(true, t);
      if (bar === 7 && beat === 4) kit.slide(false, t);
    },
  },
  c: {
    step: sixteenth(170),
    steps: 128,
    swing: 0,
    gain: 0.37,
    play(i, t, len, kit) {
      const bar = Math.floor(i / 16);
      const pos = i % 16;
      const chord = at(CHORDS_C, bar);
      kit.square(at(chord, pos % 4) - 12, t, len * 0.9, 0.03);
      const top = at(TOP_C, pos);
      if (top !== null && bar % 2 === 1) kit.squeak(top - 12, t, len * 1.8, 0.04);
      if (pos % 2 === 0) kit.bass(at(chord, 0) + (pos % 4 === 0 ? 0 : 12), t, len * 1.8);
      if (pos % 4 === 0) kit.kick(t);
      if (pos === 4 || pos === 12) kit.clap(t);
      kit.hat(t, pos % 2 ? 0.014 : 0.022);
      if (pos === 0) kit.honk(t);
    },
  },
};

export function isTrack(id: string | null | undefined): id is TrackId {
  return id === "0" || id === "a" || id === "b" || id === "c";
}

export function createMusic(ctx: AudioContext, id: TrackId = "a"): Music {
  const track = TRACKS[id];
  const out = ctx.createGain();
  out.gain.value = 0;
  out.connect(ctx.destination);

  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  function env(gain: GainNode, t: number, peak: number, decay: number, attack = 0.005) {
    // Silent from the moment it exists: a new gain starts at 1, which clicks before the envelope.
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(decay, attack + 0.01));
  }

  function voice(osc: OscillatorNode, chain: AudioNode, gain: GainNode, t: number, len: number) {
    osc.connect(chain);
    if (chain !== gain) chain.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + len + 0.03);
  }

  function hiss(t: number, type: BiquadFilterType, freq: number, peak: number, decay: number) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const gain = ctx.createGain();
    env(gain, t, peak, decay, 0.002);
    src.connect(filter).connect(gain).connect(out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.02);
  }

  const kit: Kit = {
    squeak(note, t, len, peak = 0.05) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      const f = hz(note, C5);
      // A quick upward squeak into each note.
      osc.frequency.setValueAtTime(f * 0.94, t);
      osc.frequency.exponentialRampToValueAtTime(f, t + 0.02);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2600;
      const gain = ctx.createGain();
      env(gain, t, peak, len);
      voice(osc, filter, gain, t, len);
    },
    kazoo(note, t, len) {
      // A buzzy saw through a nasal formant, bending up into the note and wobbling.
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      const f = hz(note, C5 / 2);
      osc.frequency.setValueAtTime(f * 0.89, t);
      osc.frequency.exponentialRampToValueAtTime(f, t + 0.07);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 6.5;
      const depth = ctx.createGain();
      depth.gain.value = f * 0.025;
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + len + 0.03);
      const formant = ctx.createBiquadFilter();
      formant.type = "bandpass";
      formant.frequency.value = 1100;
      formant.Q.value = 2.5;
      const gain = ctx.createGain();
      env(gain, t, 0.16, len, 0.02);
      voice(osc, formant, gain, t, len);
    },
    slide(up, t) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const [a, b] = up ? [700, 2100] : [2100, 600];
      osc.frequency.setValueAtTime(a, t);
      osc.frequency.exponentialRampToValueAtTime(b, t + 0.32);
      const gain = ctx.createGain();
      env(gain, t, 0.05, 0.36, 0.03);
      voice(osc, gain, gain, t, 0.36);
    },
    square(note, t, len, peak) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = hz(note, C5);
      const gain = ctx.createGain();
      env(gain, t, peak, len, 0.003);
      voice(osc, gain, gain, t, len);
    },
    bass(note, t, len, peak = 0.16) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = hz(note, C2);
      const gain = ctx.createGain();
      env(gain, t, peak, len);
      voice(osc, gain, gain, t, len);
    },
    kick(t) {
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
      const gain = ctx.createGain();
      env(gain, t, 0.16, 0.1, 0.003);
      voice(osc, gain, gain, t, 0.1);
    },
    clap(t) {
      hiss(t, "bandpass", 1500, 0.08, 0.08);
    },
    hat(t, peak = 0.025) {
      hiss(t, "highpass", 7000, peak, 0.03);
    },
    honk(t) {
      // A clown horn: two detuned saws dropping a little, squeezed through a nasal band.
      const gain = ctx.createGain();
      env(gain, t, 0.07, 0.16, 0.01);
      const formant = ctx.createBiquadFilter();
      formant.type = "bandpass";
      formant.frequency.value = 850;
      formant.Q.value = 3;
      formant.connect(gain);
      gain.connect(out);
      for (const f of [330, 336]) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.86, t + 0.16);
        osc.connect(formant);
        osc.start(t);
        osc.stop(t + 0.19);
      }
    },
  };

  let timer = 0;
  let step = 0;
  let next = 0;

  function schedule() {
    while (next < ctx.currentTime + LOOKAHEAD) {
      const late = step % 2 === 1 ? track.swing * track.step : 0;
      track.play(step, next + late, track.step, kit);
      step = (step + 1) % track.steps;
      next += track.step;
    }
  }

  return {
    start() {
      if (timer) return;
      step = 0;
      next = ctx.currentTime + 0.05;
      const t = ctx.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(0.0001, t);
      out.gain.exponentialRampToValueAtTime(track.gain, t + 0.15);
      schedule();
      timer = window.setInterval(schedule, 25);
    },
    stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = 0;
      const t = ctx.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), t);
      out.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    },
  };
}
