// Zero-dependency Web Audio API Cyberpunk Sound Synthesizer (High-Performance & Leak-Free)

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = true; // Muted by default to avoid annoying users
  private lastEmpTime: number = 0;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zanex_audio_muted");
      if (saved !== null) {
        this.muted = saved === "true";
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (typeof window !== "undefined") {
      localStorage.setItem("zanex_audio_muted", String(mute));
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    if (!this.muted) {
      this.playBeep(880, 0.08);
      this.haptic(40);
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

  private cleanNode(osc: OscillatorNode, gain: GainNode) {
    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };
  }

  // Crisp mechanical UI click
  public playClick() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      this.cleanNode(osc, gain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
      this.haptic(12);
    } catch {}
  }

  // Terminal keystroke click
  public playKeypress() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 600 + Math.random() * 400;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      this.cleanNode(osc, gain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    } catch {}
  }

  // Cyber Beep
  public playBeep(freq = 880, duration = 0.06, type: OscillatorType = "sine") {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      this.cleanNode(osc, gain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  // Futuristic boot chord
  public playBoot() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const chords = [220, 330, 440, 550];
      chords.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.04, this.ctx!.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.05 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        this.cleanNode(osc, gain);

        osc.start(this.ctx!.currentTime + idx * 0.05);
        osc.stop(this.ctx!.currentTime + idx * 0.05 + 0.3);
      });
    } catch {}
  }

  // Success / Achievement chime
  public playSuccess() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.08, this.ctx!.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        this.cleanNode(osc, gain);

        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.25);
      });
      this.haptic([50, 40, 90]);
    } catch {}
  }

  // Error / Glitch buzz
  public playError() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      this.cleanNode(osc, gain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
      this.haptic([100, 50, 100]);
    } catch {}
  }

  // Deep Sub-Bass Matrix Ignition Drop
  public playMatrixDrop() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      this.cleanNode(osc, gain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
      this.haptic([120, 60, 160]);
    } catch {}
  }

  // High-Energy EMP Pulse / Shockwave (Throttled)
  public playEmpPulse() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastEmpTime < 180) return; // Prevent audio congestion
    this.lastEmpTime = now;

    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      this.cleanNode(osc, gain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
      this.haptic([40, 20, 70]);
    } catch {}
  }

  // High-Precision Sonar / Radar Sweep Ping
  public playRadarPing() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1760, this.ctx.currentTime); // A6
      osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      this.cleanNode(osc, gain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
      this.haptic(15);
    } catch {}
  }

  // Magical Zane Astral Overdrive Chime
  public playZane() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.06, this.ctx!.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + idx * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        this.cleanNode(osc, gain);

        osc.start(this.ctx!.currentTime + idx * 0.05);
        osc.stop(this.ctx!.currentTime + idx * 0.05 + 0.42);
      });
      this.haptic([40, 30, 60, 30, 80]);
    } catch {}
  }
}

export const sound = new SoundManager();
