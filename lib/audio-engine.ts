import type { ThemeId } from "@/lib/themes";

/**
 * Motor de sonido por tema (CLAUDE.md §6): sonidos SINTETIZADOS con la
 * Web Audio API — cero assets, latencia nula y el timbre exacto de cada
 * mundo. Módulo puro sin React; el estado (mute, unlock) lo gestiona
 * {@link AudioProvider}.
 *
 * El AudioContext se crea/reanuda en `unlock()`, que el provider llama
 * en la primera interacción del usuario (política de autoplay). Todos
 * los volúmenes son deliberadamente bajos: el sonido acompaña, no invade.
 */

/** Tipo de evento sonoro. `travel` = cambio de mundo. */
export type SoundKind = "hover" | "click" | "travel";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

/**
 * Crea (o reanuda) el AudioContext. Llamar SOLO desde un gesto de
 * usuario; es idempotente.
 *
 * @returns true si el contexto quedó operativo.
 */
export function unlock(): boolean {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return false;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return true;
  } catch {
    return false;
  }
}

/** Buffer de ruido blanco (1s), generado una sola vez, para percusiones. */
function getNoise(context: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** Oscilador corto con envolvente exponencial (attack casi nulo). */
function tone(
  context: AudioContext,
  out: AudioNode,
  opts: {
    type: OscillatorType;
    freq: number;
    /** Glide de frecuencia hasta este valor durante la duración. */
    to?: number;
    gain: number;
    duration: number;
    delay?: number;
  },
) {
  const t0 = context.currentTime + (opts.delay ?? 0);
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.duration);
  gain.gain.setValueAtTime(opts.gain, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.duration);
  osc.connect(gain).connect(out);
  osc.start(t0);
  osc.stop(t0 + opts.duration + 0.02);
}

/** Ráfaga de ruido filtrado (ticks, impactos, vapor). */
function noise(
  context: AudioContext,
  out: AudioNode,
  opts: {
    filter: BiquadFilterType;
    freq: number;
    gain: number;
    duration: number;
    delay?: number;
  },
) {
  const t0 = context.currentTime + (opts.delay ?? 0);
  const src = context.createBufferSource();
  src.buffer = getNoise(context);
  const filter = context.createBiquadFilter();
  filter.type = opts.filter;
  filter.frequency.value = opts.freq;
  const gain = context.createGain();
  gain.gain.setValueAtTime(opts.gain, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.duration);
  src.connect(filter).connect(gain).connect(out);
  src.start(t0);
  src.stop(t0 + opts.duration + 0.02);
}

/**
 * Reproduce el sonido `kind` con el timbre del mundo `theme`. No hace
 * nada si `unlock()` no ha corrido aún o el contexto no está activo
 * (el provider además nunca llama estando muteado).
 */
export function play(theme: ThemeId, kind: SoundKind) {
  if (!ctx || !master || ctx.state !== "running") return;
  const c = ctx;
  const out = master;

  switch (theme) {
    // Mágico/cristalino: senos agudos con armónicos, colas suaves.
    case "teyvat": {
      if (kind === "hover") {
        tone(c, out, { type: "sine", freq: 1568, gain: 0.045, duration: 0.16 });
      } else if (kind === "click") {
        tone(c, out, { type: "sine", freq: 988, gain: 0.1, duration: 0.5 });
        tone(c, out, { type: "sine", freq: 1976, gain: 0.05, duration: 0.4, delay: 0.012 });
      } else {
        // Barrido ascendente + chime: "asciendes" a Teyvat.
        tone(c, out, { type: "sine", freq: 440, to: 1760, gain: 0.07, duration: 0.55 });
        tone(c, out, { type: "sine", freq: 1319, gain: 0.08, duration: 0.7, delay: 0.3 });
        tone(c, out, { type: "sine", freq: 2637, gain: 0.04, duration: 0.6, delay: 0.34 });
      }
      break;
    }

    // Impactos secos y graves: golpes de hierro.
    case "gym": {
      if (kind === "hover") {
        noise(c, out, { filter: "lowpass", freq: 1800, gain: 0.06, duration: 0.045 });
      } else if (kind === "click") {
        tone(c, out, { type: "sine", freq: 150, to: 48, gain: 0.28, duration: 0.22 });
        noise(c, out, { filter: "bandpass", freq: 420, gain: 0.12, duration: 0.08 });
      } else {
        // Slam doble: caída grave + clang metálico.
        tone(c, out, { type: "sine", freq: 180, to: 40, gain: 0.32, duration: 0.32 });
        noise(c, out, { filter: "bandpass", freq: 900, gain: 0.14, duration: 0.14 });
        tone(c, out, { type: "square", freq: 620, gain: 0.05, duration: 0.1, delay: 0.05 });
      }
      break;
    }

    // Bleeps digitales: ondas cuadradas cortas y precisas.
    case "cyber": {
      if (kind === "hover") {
        tone(c, out, { type: "square", freq: 1760, gain: 0.03, duration: 0.05 });
      } else if (kind === "click") {
        tone(c, out, { type: "square", freq: 740, gain: 0.06, duration: 0.07 });
        tone(c, out, { type: "square", freq: 1109, gain: 0.06, duration: 0.09, delay: 0.07 });
      } else {
        // Boot-up: barrido de sierra + dos bleeps de confirmación.
        tone(c, out, { type: "sawtooth", freq: 220, to: 880, gain: 0.05, duration: 0.3 });
        tone(c, out, { type: "square", freq: 1319, gain: 0.05, duration: 0.07, delay: 0.32 });
        tone(c, out, { type: "square", freq: 1760, gain: 0.05, duration: 0.1, delay: 0.42 });
      }
      break;
    }
  }
}
