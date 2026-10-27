// Zero-dependency Web Audio API Heavy-Bass Spaceship Sound Synthesizer (High-Performance & Leak-Free)

export const AUDIO_MUTE_EVENT = "zanex:audio-mute-change";

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterBus: AudioNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted: boolean = false; // Enabled on user interaction unless explicitly muted in localStorage
  private lastEmpTime: number = 0;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zanex_audio_muted");
      if (saved !== null) {
        this.muted = saved === "true";
      }
    }
  }

  // Soft-saturation tanh curve so 32Hz-85Hz sub-bass punches cleanly and translates on laptop/phone speakers
  private createWarmBassCurve(samples = 512): Float32Array<ArrayBuffer> {
    const buffer = new ArrayBuffer(samples * 4);
    const curve = new Float32Array(buffer);
    const drive = 1.65;
    const norm = Math.tanh(drive);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / (samples - 1) - 1;
      curve[i] = Math.tanh(x * drive) / norm;
    }
    return curve;
  }

  // Pre-computed brownian-weighted noise buffer for pressurized spaceship thrusters & hull switches
  private createThrusterNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 1.5);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.055 * white) / 1.055;
      data[i] = Math.max(-1, Math.min(1, last * 3.4));
    }
    return buffer;
  }

  private initCtx(): AudioNode | null {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        this.ctx = ctx;

        // Master Starship Sub-Bass Signal Chain:
        // Voice -> Low-Shelf Bass Boost (+6.5dB @ 85Hz) -> Warm Saturation -> Hull High-Cut (2600Hz) -> Compressor -> Destination
        const subShelf = ctx.createBiquadFilter();
        subShelf.type = "lowshelf";
        subShelf.frequency.value = 85;
        subShelf.gain.value = 6.5;

        const shaper = ctx.createWaveShaper();
        shaper.curve = this.createWarmBassCurve(512);
        shaper.oversample = "2x";

        const hullCut = ctx.createBiquadFilter();
        hullCut.type = "lowpass";
        hullCut.frequency.value = 2600;
        hullCut.Q.value = 0.7;

        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -14;
        compressor.knee.value = 10;
        compressor.ratio.value = 8;
        compressor.attack.value = 0.002;
        compressor.release.value = 0.16;

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.92;

        subShelf.connect(shaper);
        shaper.connect(hullCut);
        hullCut.connect(compressor);
        compressor.connect(masterGain);
        masterGain.connect(ctx.destination);

        this.masterBus = subShelf;
        this.noiseBuffer = this.createThrusterNoiseBuffer(ctx);
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.masterBus || (this.ctx ? this.ctx.destination : null);
  }

  private bindCleanup(source: AudioScheduledSourceNode, nodes: AudioNode[]) {
    source.onended = () => {
      for (const node of nodes) {
        try {
          node.disconnect();
        } catch {}
      }
    };
  }

  private playThrusterBurst(
    startTime: number,
    duration: number,
    peakGain: number,
    startCutoff: number,
    endCutoff: number,
    q = 1.8
  ) {
    if (!this.ctx || !this.noiseBuffer) return;
    const bus = this.masterBus || this.ctx.destination;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.setValueAtTime(q, startTime);
    filter.frequency.setValueAtTime(Math.max(30, startCutoff), startTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(28, endCutoff), startTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.012, duration * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    this.bindCleanup(src, [src, filter, gain]);

    const maxOffset = Math.max(0, this.noiseBuffer.duration - duration - 0.02);
    const offset = maxOffset > 0 ? Math.random() * maxOffset : 0;
    src.start(startTime, offset);
    src.stop(startTime + duration + 0.01);
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (typeof window !== "undefined") {
      localStorage.setItem("zanex_audio_muted", String(mute));
      window.dispatchEvent(new CustomEvent<boolean>(AUDIO_MUTE_EVENT, { detail: mute }));
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    if (!this.muted) {
      this.playBoot();
      this.haptic([35, 25, 55]);
    }
    return this.muted;
  }

  // Tactile phone haptics (safe fallback if unsupported)
  public haptic(pattern: number | number[] = 25) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  // Deep pressurized spaceship bridge switch & hull sub-thud
  public playClick() {
    if (this.muted) return;
    const bus = this.initCtx();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Sub-bass hull thud (118Hz -> 34Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(118, t);
      subOsc.frequency.exponentialRampToValueAtTime(34, t + 0.09);

      subGain.gain.setValueAtTime(0.0001, t);
      subGain.gain.linearRampToValueAtTime(0.4, t + 0.004);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.095);

      subOsc.connect(subGain);
      subGain.connect(bus);
      this.bindCleanup(subOsc, [subOsc, subGain]);
      subOsc.start(t);
      subOsc.stop(t + 0.1);

      // 2. Warm low-pass cockpit console body (175Hz -> 52Hz)
      const bodyOsc = this.ctx.createOscillator();
      const bodyFilter = this.ctx.createBiquadFilter();
      const bodyGain = this.ctx.createGain();

      bodyOsc.type = "triangle";
      bodyOsc.frequency.setValueAtTime(175, t);
      bodyOsc.frequency.exponentialRampToValueAtTime(52, t + 0.06);

      bodyFilter.type = "lowpass";
      bodyFilter.frequency.setValueAtTime(230, t);
      bodyFilter.Q.setValueAtTime(1.6, t);

      bodyGain.gain.setValueAtTime(0.0001, t);
      bodyGain.gain.linearRampToValueAtTime(0.18, t + 0.003);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.065);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(bus);
      this.bindCleanup(bodyOsc, [bodyOsc, bodyFilter, bodyGain]);
      bodyOsc.start(t);
      bodyOsc.stop(t + 0.07);

      // 3. Subtle pneumatic airlock micro-transient
      this.playThrusterBurst(t, 0.032, 0.11, 310, 85, 2.0);
      this.haptic(14);
    } catch {}
  }

  // Deep cushioned starship cockpit relay keystroke
  public playKeypress() {
    if (this.muted) return;
    const bus = this.initCtx();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime;
      const jitter = 0.92 + Math.random() * 0.16;

      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(96 * jitter, t);
      subOsc.frequency.exponentialRampToValueAtTime(38, t + 0.055);

      subGain.gain.setValueAtTime(0.0001, t);
      subGain.gain.linearRampToValueAtTime(0.25, t + 0.003);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.058);

      subOsc.connect(subGain);
      subGain.connect(bus);
      this.bindCleanup(subOsc, [subOsc, subGain]);
      subOsc.start(t);
      subOsc.stop(t + 0.062);

      const relayOsc = this.ctx.createOscillator();
      const relayFilter = this.ctx.createBiquadFilter();
      const relayGain = this.ctx.createGain();

      relayOsc.type = "triangle";
      relayOsc.frequency.setValueAtTime(152 * jitter, t);
      relayOsc.frequency.exponentialRampToValueAtTime(56, t + 0.038);

      relayFilter.type = "lowpass";
      relayFilter.frequency.setValueAtTime(240, t);

      relayGain.gain.setValueAtTime(0.0001, t);
      relayGain.gain.linearRampToValueAtTime(0.11, t + 0.002);
      relayGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

      relayOsc.connect(relayFilter);
      relayFilter.connect(relayGain);
      relayGain.connect(bus);
      this.bindCleanup(relayOsc, [relayOsc, relayFilter, relayGain]);
      relayOsc.start(t);
      relayOsc.stop(t + 0.045);
    } catch {}
  }

  // Deep starship telemetry bass pulse (transposes shrill frequencies down into heavy deck register)
  public playBeep(freq = 880, duration = 0.06, type: OscillatorType = "sine") {
    if (this.muted) return;
    const bus = this.initCtx();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime;
      const dur = Math.max(duration, 0.12);
      const bassFreq = Math.max(48, Math.min(148, freq * 0.16));
      const subFreq = Math.max(32, bassFreq * 0.5);

      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(subFreq * 1.35, t);
      subOsc.frequency.exponentialRampToValueAtTime(subFreq, t + dur);

      subGain.gain.setValueAtTime(0.0001, t);
      subGain.gain.linearRampToValueAtTime(0.36, t + 0.005);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      subOsc.connect(subGain);
      subGain.connect(bus);
      this.bindCleanup(subOsc, [subOsc, subGain]);
      subOsc.start(t);
      subOsc.stop(t + dur + 0.01);

      const toneOsc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const toneGain = this.ctx.createGain();

      toneOsc.type = type === "sine" ? "triangle" : type;
      toneOsc.frequency.setValueAtTime(bassFreq, t);
      toneOsc.frequency.exponentialRampToValueAtTime(bassFreq * 0.78, t + dur);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(bassFreq * 2.6, t);
      filter.Q.setValueAtTime(2.6, t);

      toneGain.gain.setValueAtTime(0.0001, t);
      toneGain.gain.linearRampToValueAtTime(0.18, t + 0.006);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      toneOsc.connect(filter);
      filter.connect(toneGain);
      toneGain.connect(bus);
      this.bindCleanup(toneOsc, [toneOsc, filter, toneGain]);
      toneOsc.start(t);
      toneOsc.stop(t + dur + 0.01);
    } catch {}
  }

  // Spaceship fusion reactor & sub-thruster ignition swell
  public playBoot() {
    if (this.muted) return;
    const bus = this.initCtx();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime;
      const dur = 0.62;

      // 1. Containment sub-bass thud into deep reactor hum (115Hz -> 36Hz -> 55Hz -> 41.2Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(115, t);
      subOsc.frequency.exponentialRampToValueAtTime(36, t + 0.11);
      subOsc.frequency.exponentialRampToValueAtTime(55, t + 0.36);
      subOsc.frequency.exponentialRampToValueAtTime(41.2, t + dur);

      subGain.gain.setValueAtTime(0.0001, t);
      subGain.gain.linearRampToValueAtTime(0.44, t + 0.012);
      subGain.gain.setValueAtTime(0.36, t + 0.28);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      subOsc.connect(subGain);
      subGain.connect(bus);
      this.bindCleanup(subOsc, [subOsc, subGain]);
      subOsc.start(t);
      subOsc.stop(t + dur + 0.02);

      // 2. Detuned dual-oscillator Reese engine growl through resonant lowpass sweep
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.setValueAtTime(3.8, t);
      filter.frequency.setValueAtTime(75, t);
      filter.frequency.exponentialRampToValueAtTime(360, t + 0.28);
      filter.frequency.exponentialRampToValueAtTime(110, t + dur);

      const driveGain = this.ctx.createGain();
      driveGain.gain.setValueAtTime(0.0001, t);
      driveGain.gain.linearRampToValueAtTime(0.22, t + 0.06);
      driveGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      filter.connect(driveGain);
      driveGain.connect(bus);

      [-10, 10].forEach((detuneCents, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = "sawtooth";
        osc.detune.setValueAtTime(detuneCents, t);
        osc.frequency.setValueAtTime(55, t);
        osc.frequency.exponentialRampToValueAtTime(82.41, t + 0.32);
        osc.frequency.exponentialRampToValueAtTime(55, t + dur);
        osc.connect(filter);
        if (idx === 1) {
          this.bindCleanup(osc, [osc, filter, driveGain]);
        } else {
          this.bindCleanup(osc, [osc]);
        }
        osc.start(t);
        osc.stop(t + dur + 0.02);
      });

      // 3. Pressurized sub-thruster exhaust rumble
      this.playThrusterBurst(t, 0.52, 0.22, 260, 75, 2.2);
    } catch {}
  }

  // Heavy airlock seal & hyperdrive lock bass chord
  public playSuccess() {
    if (this.muted) return;
    const bus = this.initCtx();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Pneumatic docking latch sub-impact
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = "sine";
      kickOsc.frequency.setValueAtTime(138, t);
      kickOsc.frequency.exponentialRampToValueAtTime(35, t + 0.16);

      kickGain.gain.setValueAtTime(0.0001, t);
      kickGain.gain.linearRampToValueAtTime(0.44, t + 0.005);
      kickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

      kickOsc.connect(kickGain);
      kickGain.connect(bus);
      this.bindCleanup(kickOsc, [kickOsc, kickGain]);
      kickOsc.start(t);
      kickOsc.stop(t + 0.22);

      // 2. Deep sustained A1 (55Hz) sub foundation
      const subHold = this.ctx.createOscillator();
      const subHoldGain = this.ctx.createGain();
      subHold.type = "sine";
      subHold.frequency.setValueAtTime(55, t + 0.03);

      subHoldGain.gain.setValueAtTime(0.0001, t + 0.03);
      subHoldGain.gain.linearRampToValueAtTime(0.36, t + 0.09);
      subHoldGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.72);

      subHold.connect(subHoldGain);
      subHoldGain.connect(bus);
      this.bindCleanup(subHold, [subHold, subHoldGain]);
      subHold.start(t + 0.03);
      subHold.stop(t + 0.74);

      // 3. Warm low-passed starship fifth stack (E2, A2, E3)
      const chordFilter = this.ctx.createBiquadFilter();
      chordFilter.type = "lowpass";
      chordFilter.Q.setValueAtTime(2.5, t);
      chordFilter.frequency.setValueAtTime(110, t);
      chordFilter.frequency.exponentialRampToValueAtTime(480, t + 0.24);
      chordFilter.frequency.exponentialRampToValueAtTime(160, t + 0.72);
      chordFilter.connect(bus);

      const notes = [82.41, 110, 164.81];
      notes.forEach((freq, idx) => {
        const start = t + idx * 0.05;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.14, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.62);

        osc.connect(gain);
        gain.connect(chordFilter);
        if (idx === notes.length - 1) {
          this.bindCleanup(osc, [osc, gain, chordFilter]);
        } else {
          this.bindCleanup(osc, [osc, gain]);
        }

        osc.start(start);
        osc.stop(start + 0.64);
      });

      this.playThrusterBurst(t, 0.28, 0.14, 300, 90, 1.8);
      this.haptic([50, 40, 90]);
    } catch {}
  }

  // Heavy bulkhead warning / reactor stall sub-bass growl
  public playError() {
    if (this.muted) return;
    const bus = this.initCtx();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime;

      [0, 0.17].forEach((offset) => {
        const start = t + offset;
        const dur = 0.16;

        const subOsc = this.ctx!.createOscillator();
        const subGain = this.ctx!.createGain();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(96, start);
        subOsc.frequency.exponentialRampToValueAtTime(34, start + dur);

        subGain.gain.setValueAtTime(0.0001, start);
        subGain.gain.linearRampToValueAtTime(0.42, start + 0.006);
        subGain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        subOsc.connect(subGain);
        subGain.connect(bus);
        this.bindCleanup(subOsc, [subOsc, subGain]);
        subOsc.start(start);
        subOsc.stop(start + dur + 0.01);

        const growlOsc = this.ctx!.createOscillator();
        const growlFilter = this.ctx!.createBiquadFilter();
        const growlGain = this.ctx!.createGain();

        growlOsc.type = "sawtooth";
        growlOsc.frequency.setValueAtTime(92, start);
        growlOsc.frequency.exponentialRampToValueAtTime(41, start + dur);

        growlFilter.type = "lowpass";
        growlFilter.Q.setValueAtTime(4.6, start);
        growlFilter.frequency.setValueAtTime(240, start);
        growlFilter.frequency.exponentialRampToValueAtTime(68, start + dur);

        growlGain.gain.setValueAtTime(0.0001, start);
        growlGain.gain.linearRampToValueAtTime(0.22, start + 0.008);
        growlGain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        growlOsc.connect(growlFilter);
        growlFilter.connect(growlGain);
        growlGain.connect(bus);
        this.bindCleanup(growlOsc, [growlOsc, growlFilter, growlGain]);
        growlOsc.start(start);
        growlOsc.stop(start + dur + 0.01);
      });

      this.haptic([100, 50, 100]);
    } catch {}
  }

  // Capital-ship orbital warp jump / tectonic sub-bass drop
  public playMatrixDrop() {
    if (this.muted) return;
    const bus = this.initCtx();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime;
      const dur = 0.95;

      // 1. Seismic sub-sine drop (150Hz -> 28Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(150, t);
      subOsc.frequency.exponentialRampToValueAtTime(28, t + dur);

      subGain.gain.setValueAtTime(0.0001, t);
      subGain.gain.linearRampToValueAtTime(0.52, t + 0.01);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      subOsc.connect(subGain);
      subGain.connect(bus);
      this.bindCleanup(subOsc, [subOsc, subGain]);
      subOsc.start(t);
      subOsc.stop(t + dur + 0.02);

      // 2. Heavy detuned Reese warp-core sweep
      const reeseFilter = this.ctx.createBiquadFilter();
      reeseFilter.type = "lowpass";
      reeseFilter.Q.setValueAtTime(4.5, t);
      reeseFilter.frequency.setValueAtTime(520, t);
      reeseFilter.frequency.exponentialRampToValueAtTime(55, t + dur);

      const reeseGain = this.ctx.createGain();
      reeseGain.gain.setValueAtTime(0.0001, t);
      reeseGain.gain.linearRampToValueAtTime(0.24, t + 0.02);
      reeseGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      reeseFilter.connect(reeseGain);
      reeseGain.connect(bus);

      [-14, 14].forEach((cents, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = "sawtooth";
        osc.detune.setValueAtTime(cents, t);
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + dur);
        osc.connect(reeseFilter);
        if (idx === 1) {
          this.bindCleanup(osc, [osc, reeseFilter, reeseGain]);
        } else {
          this.bindCleanup(osc, [osc]);
        }
        osc.start(t);
        osc.stop(t + dur + 0.02);
      });

      // 3. Sub-thruster decompression boom
      this.playThrusterBurst(t, 0.65, 0.28, 380, 55, 2.4);
      this.haptic([120, 60, 160]);
    } catch {}
  }

  // Deep-space seismic charge / gravity-wave bass shockwave (Throttled)
  public playEmpPulse() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastEmpTime < 180) return;
    this.lastEmpTime = now;

    const bus = this.initCtx();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime;
      const dur = 0.42;

      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(170, t);
      subOsc.frequency.exponentialRampToValueAtTime(30, t + dur);

      subGain.gain.setValueAtTime(0.0001, t);
      subGain.gain.linearRampToValueAtTime(0.48, t + 0.006);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      subOsc.connect(subGain);
      subGain.connect(bus);
      this.bindCleanup(subOsc, [subOsc, subGain]);
      subOsc.start(t);
      subOsc.stop(t + dur + 0.02);

      const sweepOsc = this.ctx.createOscillator();
      const sweepFilter = this.ctx.createBiquadFilter();
      const sweepGain = this.ctx.createGain();

      sweepOsc.type = "sawtooth";
      sweepOsc.frequency.setValueAtTime(230, t);
      sweepOsc.frequency.exponentialRampToValueAtTime(38, t + dur);

      sweepFilter.type = "lowpass";
      sweepFilter.Q.setValueAtTime(6.0, t);
      sweepFilter.frequency.setValueAtTime(620, t);
      sweepFilter.frequency.exponentialRampToValueAtTime(52, t + dur);

      sweepGain.gain.setValueAtTime(0.0001, t);
      sweepGain.gain.linearRampToValueAtTime(0.22, t + 0.008);
      sweepGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      sweepOsc.connect(sweepFilter);
      sweepFilter.connect(sweepGain);
      sweepGain.connect(bus);
      this.bindCleanup(sweepOsc, [sweepOsc, sweepFilter, sweepGain]);
      sweepOsc.start(t);
      sweepOsc.stop(t + dur + 0.02);

      this.playThrusterBurst(t, 0.2, 0.2, 280, 65, 2.2);
      this.haptic([40, 20, 70]);
    } catch {}
  }

  // Deep-space starship hull sonar pulse (sub-bass resonance + warm low-mid hull echo)
  public playRadarPing() {
    if (this.muted) return;
    const bus = this.initCtx();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Sub-hull resonance pulse (73.4Hz D2 -> 41.2Hz E1)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(73.42, t);
      subOsc.frequency.exponentialRampToValueAtTime(41.2, t + 0.56);

      subGain.gain.setValueAtTime(0.0001, t);
      subGain.gain.linearRampToValueAtTime(0.36, t + 0.008);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.56);

      subOsc.connect(subGain);
      subGain.connect(bus);
      this.bindCleanup(subOsc, [subOsc, subGain]);
      subOsc.start(t);
      subOsc.stop(t + 0.58);

      // 2. Warm low-mid sonar ping + hull reflection echo
      [
        { delay: 0, peak: 0.15, dur: 0.42 },
        { delay: 0.16, peak: 0.06, dur: 0.34 },
      ].forEach(({ delay, peak, dur }) => {
        const start = t + delay;
        const pingOsc = this.ctx!.createOscillator();
        const pingFilter = this.ctx!.createBiquadFilter();
        const pingGain = this.ctx!.createGain();

        pingOsc.type = "triangle";
        pingOsc.frequency.setValueAtTime(293.66, start);
        pingOsc.frequency.exponentialRampToValueAtTime(220, start + dur);

        pingFilter.type = "lowpass";
        pingFilter.frequency.setValueAtTime(420, start);
        pingFilter.Q.setValueAtTime(2.4, start);

        pingGain.gain.setValueAtTime(0.0001, start);
        pingGain.gain.linearRampToValueAtTime(peak, start + 0.006);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        pingOsc.connect(pingFilter);
        pingFilter.connect(pingGain);
        pingGain.connect(bus);
        this.bindCleanup(pingOsc, [pingOsc, pingFilter, pingGain]);
        pingOsc.start(start);
        pingOsc.stop(start + dur + 0.02);
      });

      this.haptic(18);
    } catch {}
  }

  // Hyperdrive singularity bass swell
  public playZane() {
    if (this.muted) return;
    const bus = this.initCtx();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime;
      const dur = 0.88;

      // 1. Deep hyperdrive sub-core (36.7Hz -> 55Hz -> 41.2Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(36.71, t);
      subOsc.frequency.exponentialRampToValueAtTime(55, t + 0.42);
      subOsc.frequency.exponentialRampToValueAtTime(41.2, t + dur);

      subGain.gain.setValueAtTime(0.0001, t);
      subGain.gain.linearRampToValueAtTime(0.46, t + 0.03);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      subOsc.connect(subGain);
      subGain.connect(bus);
      this.bindCleanup(subOsc, [subOsc, subGain]);
      subOsc.start(t);
      subOsc.stop(t + dur + 0.02);

      // 2. Starship low-brass / synth power stack through warm filter bloom
      const stackFilter = this.ctx.createBiquadFilter();
      stackFilter.type = "lowpass";
      stackFilter.Q.setValueAtTime(3.0, t);
      stackFilter.frequency.setValueAtTime(90, t);
      stackFilter.frequency.exponentialRampToValueAtTime(560, t + 0.38);
      stackFilter.frequency.exponentialRampToValueAtTime(150, t + dur);
      stackFilter.connect(bus);

      const notes = [55, 82.41, 110, 138.59, 164.81];
      notes.forEach((freq, idx) => {
        const start = t + idx * 0.045;
        const noteDur = dur - idx * 0.045;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx < 2 ? "sawtooth" : "triangle";
        osc.detune.setValueAtTime(idx % 2 === 0 ? -7 : 7, start);
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.13, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDur);

        osc.connect(gain);
        gain.connect(stackFilter);
        if (idx === notes.length - 1) {
          this.bindCleanup(osc, [osc, gain, stackFilter]);
        } else {
          this.bindCleanup(osc, [osc, gain]);
        }

        osc.start(start);
        osc.stop(start + noteDur + 0.02);
      });

      this.playThrusterBurst(t, 0.62, 0.22, 320, 70, 2.0);
      this.haptic([40, 30, 60, 30, 80]);
    } catch {}
  }
}

export const sound = new SoundManager();
