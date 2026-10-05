/**
 * Procedural Web Audio Engine for Hehe Arcade
 * Rock-solid browser audio synthesis with reliable user-gesture unlocking,
 * direct hardware routing, safe lookahead timing, and punchy audio output.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.9;
  private cosmicOverdrive: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    // Attach automatic gesture unlockers on window
    if (typeof window !== 'undefined') {
      const unlockHandler = () => {
        this.unlock();
      };
      window.addEventListener('click', unlockHandler, { passive: true });
      window.addEventListener('touchstart', unlockHandler, { passive: true });
      window.addEventListener('keydown', unlockHandler, { passive: true });
    }
  }

  public setCosmicOverdrive(enabled: boolean) {
    this.cosmicOverdrive = enabled;
  }

  public getCosmicOverdrive(): boolean {
    return this.cosmicOverdrive;
  }

  /**
   * Explicitly unlock audio context on user interaction
   */
  public async unlock(): Promise<boolean> {
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        this.isUnlocked = true;
      } catch (err) {
        console.warn('AudioContext resume error:', err);
      }
    } else if (this.ctx && this.ctx.state === 'running') {
      this.isUnlocked = true;
    }
    return this.isUnlocked;
  }

  public isRunning(): boolean {
    return !!(this.ctx && this.ctx.state === 'running');
  }

  private ensureContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;

      // Connect both directly to destination and to analyser for visualization
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.connect(this.analyser);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.ensureContext();
    return this.analyser;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volume;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.value = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Play procedural sound by name with pitch and tempo modifiers
   */
  public play(
    soundId: string,
    pitchMod: number = 1.0,
    speedMod: number = 1.0
  ) {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.executePlay(soundId, pitchMod, speedMod);
      });
    } else {
      this.executePlay(soundId, pitchMod, speedMod);
    }
  }

  private executePlay(
    soundId: string,
    pitchMod: number,
    speedMod: number
  ) {
    switch (soundId) {
      case 'snicker':
        this.playGiggle(pitchMod * 1.1, speedMod, 4, 380, 520, 'triangle');
        break;
      case 'evil':
        this.playEvilLaugh(pitchMod, speedMod);
        break;
      case 'tehehe':
        this.playGiggle(pitchMod * 1.5, speedMod * 1.3, 6, 600, 850, 'sine');
        break;
      case 'chipmunk':
        this.playGiggle(pitchMod * 2.2, speedMod * 1.6, 7, 900, 1400, 'sawtooth');
        break;
      case 'chuckle':
        this.playGiggle(pitchMod * 0.85, speedMod * 0.9, 3, 220, 310, 'triangle');
        break;
      case 'boof':
        this.playBassBoof(pitchMod);
        break;
      case 'robot':
        this.playRobotLaugh(pitchMod, speedMod);
        break;
      case 'wheeze':
        this.playWheeze(pitchMod, speedMod);
        break;
      case 'squeak':
        this.playCartoonSqueak(pitchMod);
        break;
      case 'boing':
        this.playCartoonBoing(pitchMod);
        break;
      case 'rimshot':
        this.playBaDumTss();
        break;
      case 'horn':
        this.playFanfare(pitchMod);
        break;
      case 'pop':
        this.playPop(pitchMod);
        break;
      case 'click':
        this.playBlip(pitchMod);
        break;
      case 'cosmic':
        this.playCosmicSingularity(pitchMod);
        break;
      default:
        this.playGiggle(pitchMod, speedMod, 4, 400, 560, 'sine');
        break;
    }

    if (this.cosmicOverdrive && soundId !== 'cosmic') {
      this.playCosmicShimmer(pitchMod);
    }
  }

  /**
   * Safe schedule start time: Lookahead by 30ms to prevent audio glitches
   */
  private getStartTime(): number {
    if (!this.ctx) return 0;
    return this.ctx.currentTime + 0.03;
  }

  /**
   * Procedural rhythmic giggle generator (He-He-He-He)
   */
  private playGiggle(
    pitch: number,
    speed: number,
    burstCount: number,
    baseFreq: number,
    peakFreq: number,
    waveType: OscillatorType
  ) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const burstDuration = 0.1 / Math.max(0.2, speed);
    const gap = 0.07 / Math.max(0.2, speed);

    for (let i = 0; i < burstCount; i++) {
      const startTime = now + i * (burstDuration + gap);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = waveType;
      const freq = (baseFreq + (peakFreq - baseFreq) * (i / burstCount)) * pitch;
      osc.frequency.setValueAtTime(freq * 0.9, startTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 1.3), startTime + burstDuration * 0.4);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.95), startTime + burstDuration);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.65, startTime + burstDuration * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + burstDuration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + burstDuration + 0.02);
    }
  }

  /**
   * Heavy villainous downward laugh: "MWA-HA-HA-HA-HA!"
   */
  private playEvilLaugh(pitch: number, speed: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const notes = [220, 196, 174, 146, 130];
    const burstDuration = 0.18 / Math.max(0.2, speed);
    const gap = 0.09 / Math.max(0.2, speed);

    notes.forEach((freq, idx) => {
      const startTime = now + idx * (burstDuration + gap);
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const sub = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      sub.type = 'sine';

      const targetFreq = freq * pitch * 0.8;
      osc1.frequency.setValueAtTime(targetFreq, startTime);
      osc1.frequency.exponentialRampToValueAtTime(Math.max(20, targetFreq * 0.85), startTime + burstDuration);

      osc2.frequency.setValueAtTime(targetFreq * 1.02, startTime);
      osc2.frequency.exponentialRampToValueAtTime(Math.max(20, targetFreq * 0.86), startTime + burstDuration);

      sub.frequency.setValueAtTime(Math.max(20, targetFreq * 0.5), startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.6, startTime + burstDuration * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + burstDuration);

      osc1.connect(gain);
      osc2.connect(gain);
      sub.connect(gain);
      gain.connect(this.masterGain!);

      osc1.start(startTime);
      osc2.start(startTime);
      sub.start(startTime);

      const endTime = startTime + burstDuration + 0.03;
      osc1.stop(endTime);
      osc2.stop(endTime);
      sub.stop(endTime);
    });
  }

  /**
   * Robot chortle: stepped FM synthesis
   */
  private playRobotLaugh(pitch: number, speed: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const steps = 8;
    const stepDuration = 0.07 / Math.max(0.2, speed);

    for (let i = 0; i < steps; i++) {
      const startTime = now + i * stepDuration;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      const base = ((i % 2 === 0 ? 440 : 660) + i * 30) * pitch;
      osc.frequency.setValueAtTime(base, startTime);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + stepDuration * 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + stepDuration);
    }
  }

  /**
   * Wheeze / snort: Bandpass filtered noise bursts
   */
  private playWheeze(pitch: number, speed: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const duration = 0.45 / Math.max(0.2, speed);
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 * pitch, now);
    filter.frequency.linearRampToValueAtTime(1900 * pitch, now + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(1100 * pitch, now + duration);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.08);
    gain.gain.linearRampToValueAtTime(0.3, now + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration + 0.05);

    // Accompanying vocal squeak
    this.playCartoonSqueak(pitch * 1.2);
  }

  /**
   * Deep Bass Boof / 808-style thud
   */
  private playBassBoof(pitch: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, 42 * pitch), now + 0.35);

    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.48);
  }

  /**
   * Cartoon upward squeak
   */
  private playCartoonSqueak(pitch: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(1800 * pitch, now + 0.15);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Classic cartoon spring boing
   */
  private playCartoonBoing(pitch: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(25, now);
    lfo.frequency.exponentialRampToValueAtTime(8, now + 0.4);

    lfoGain.gain.setValueAtTime(120, now);
    lfoGain.gain.exponentialRampToValueAtTime(10, now + 0.4);

    lfo.connect(osc.frequency);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(560 * pitch, now + 0.38);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.48);
    osc.stop(now + 0.48);
  }

  /**
   * Ba-Dum Tss (Snare + Cymbal punchline sound)
   */
  public playBaDumTss() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();

    this.playDrumTom(160, now, 0.14);
    this.playDrumTom(120, now + 0.18, 0.16);
    this.playCymbal(now + 0.38);
  }

  private playDrumTom(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.4), time + duration);

    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private playCymbal(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const duration = 0.5;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + duration + 0.05);
  }

  /**
   * Joyful brass fanfare chord
   */
  private playFanfare(pitch: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const triad = [261.63, 329.63, 392.0, 523.25];

    triad.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * pitch, now);

      gain.gain.setValueAtTime(0.18, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.03);
      osc.stop(now + 0.7);
    });
  }

  /**
   * Bubble pop sound for physics toys
   */
  public playPop(pitch: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(340 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(950 * pitch, now + 0.06);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Short gentle blip for UI interactions
   */
  public playBlip(pitch: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(480 * pitch, now + 0.06);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Cosmic Singularity laugh (HEHE to the power of 100,000)
   */
  public playCosmicSingularity(pitch: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const harmonics = [1, 1.25, 1.5, 1.875, 2.25, 2.8125, 3.5];

    harmonics.forEach((h, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      const base = 261.63 * pitch * h;
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.linearRampToValueAtTime(base * 1.08, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, base * 0.96), now + 1.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.15 + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.03);
      osc.stop(now + 1.5);
    });

    this.playGiggle(pitch * 2.0, 1.6, 8, 800, 1600, 'sine');
  }

  /**
   * Shimmering overtone chime for Cosmic Overdrive mode
   */
  private playCosmicShimmer(pitch: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.getStartTime();
    const notes = [1046.5, 1318.5, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * pitch, now + idx * 0.05);

      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.35);
    });
  }

  /**
   * Uses SpeechSynthesis to say custom text in a funny way
   */
  public speakHehe(phrase: string, rate: number = 1.3, pitch: number = 1.5) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = Math.max(0.5, Math.min(2.5, rate));
        utterance.pitch = Math.max(0.2, Math.min(2.0, pitch));
        utterance.volume = this.isMuted ? 0 : this.volume;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }
  }
}

export const audioEngine = new AudioEngine();
