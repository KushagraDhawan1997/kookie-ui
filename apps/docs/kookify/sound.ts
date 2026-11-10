/**
 * Kookify's sounds, made on the fly with Web Audio: no files to load. Everything is a short
 * shaped burst of noise, so a screen of stickers lands as a papery patter rather than a beep.
 */

export type Sound = {
  slap(): void;
  knock(): void;
  peel(): void;
  pat(): void;
  whoosh(): void;
  resume(): void;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function createSound(ctx: AudioContext): Sound {
  const out = ctx.createGain();
  out.gain.value = 0.9;
  out.connect(ctx.destination);

  // One second of white noise, and one of sparse clicks for the sticky crackle of a peel.
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const crackle = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const n = noise.getChannelData(0);
  const c = crackle.getChannelData(0);
  for (let i = 0; i < n.length; i++) {
    n[i] = Math.random() * 2 - 1;
    c[i] = Math.random() < 0.012 ? (Math.random() * 2 - 1) * rand(0.4, 1) : 0;
  }

  let lastSlap = -Infinity;
  let lastKnock = -Infinity;

  /** A burst of noise through a band-pass filter, with a fast attack and a set decay. */
  function burst(buffer: AudioBuffer, type: BiquadFilterType, freq: number, q: number, peak: number, decay: number, freqEnd?: number) {
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, t);
    if (freqEnd) filter.frequency.exponentialRampToValueAtTime(freqEnd, t + decay);
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    src.connect(filter).connect(gain).connect(out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.02);
  }

  /** A short falling thump under a slap: the weight of it hitting the glass. */
  function thump(freq: number, peak: number, decay: number) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + decay);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + decay + 0.02);
  }

  return {
    slap() {
      // Landings come faster than the ear can separate. Voice only some, at uneven gaps, so a
      // full cover sounds like a patter of hands rather than a machine gun.
      const now = performance.now();
      if (now - lastSlap < rand(28, 60)) return;
      lastSlap = now;
      burst(noise, "bandpass", rand(1500, 2600), 0.9, rand(0.05, 0.09), rand(0.03, 0.05));
      thump(rand(120, 170), 0.05, 0.05);
    },
    knock() {
      // Sticker on sticker: a soft, low tap, thinned out the same way as the slaps.
      const now = performance.now();
      if (now - lastKnock < rand(45, 90)) return;
      lastKnock = now;
      burst(noise, "bandpass", rand(600, 900), 1.1, rand(0.02, 0.035), 0.035);
    },
    peel() {
      burst(crackle, "highpass", 2200, 0.7, 0.14, 0.18);
      burst(noise, "bandpass", 3200, 1.2, 0.025, 0.16, 5200);
    },
    pat() {
      burst(noise, "bandpass", rand(800, 1100), 0.8, 0.06, 0.045);
      thump(110, 0.04, 0.06);
    },
    whoosh() {
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 0.8;
      filter.frequency.setValueAtTime(500, t);
      filter.frequency.exponentialRampToValueAtTime(3500, t + 0.35);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      src.connect(filter).connect(gain).connect(out);
      src.start(t);
      src.stop(t + 0.5);
    },
    resume() {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    },
  };
}
