/**
 * Procedural Web Audio Engine for Hehe Arcade
 * Generates all laughs, boings, drum hits, and comical FX purely in the browser.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;

  constructor() {
    // Lazily initialized on first user interaction to comply with browser autoplay policies
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.init();
    return this.analyser;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
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
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

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
      default:
        this.playGiggle(pitchMod, speedMod, 4, 400, 560, 'sine');
        break;
    }
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
    const now = this.ctx.currentTime;
    const burstDuration = 0.08 / speed;
    const gap = 0.06 / speed;

    for (let i = 0; i < burstCount; i++) {
      const startTime = now + i * (burstDuration + gap);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = waveType;
      // Pitch inflection: jumps up then slightly glides down per "he"
      const freq = (baseFreq + (peakFreq - baseFreq) * (i / burstCount)) * pitch;
      osc.frequency.setValueAtTime(freq * 0.9, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, startTime + burstDuration * 0.3);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, startTime + burstDuration);

      // Bandpass formant filter for human vowel-like warmth
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.8, startTime);
      filter.Q.setValueAtTime(2.5, startTime);

      // Volume envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + burstDuration * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + burstDuration);

      osc.connect(filter);
      filter.connect(gain);
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
    const now = this.ctx.currentTime;
    const notes = [220, 196, 174, 146, 130]; // Descending sinister minor scale
    const burstDuration = 0.16 / speed;
    const gap = 0.08 / speed;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * (burstDuration + gap);
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const sub = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      sub.type = 'sine';

      const targetFreq = freq * pitch * 0.75;
      osc1.frequency.setValueAtTime(targetFreq, startTime);
      osc1.frequency.exponentialRampToValueAtTime(targetFreq * 0.88, startTime + burstDuration);

      osc2.frequency.setValueAtTime(targetFreq * 1.01, startTime); // Detuned for sinister unison
      osc2.frequency.exponentialRampToValueAtTime(targetFreq * 0.89, startTime + burstDuration);

      sub.frequency.setValueAtTime(targetFreq * 0.5, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 * pitch, startTime);
      filter.frequency.exponentialRampToValueAtTime(300, startTime + burstDuration);
      filter.Q.setValueAtTime(4.0, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + burstDuration * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + burstDuration);

      osc1.connect(filter);
      osc2.connect(filter);
      sub.connect(gain);
      filter.connect(gain);
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
    const now = this.ctx.currentTime;
    const steps = 8;
    const stepDuration = 0.06 / speed;

    for (let i = 0; i < steps; i++) {
      const startTime = now + i * stepDuration;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      const base = ((i % 2 === 0 ? 440 : 660) + (i * 30)) * pitch;
      osc.frequency.setValueAtTime(base, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
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
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * (0.4 / speed);
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
    filter.frequency.linearRampToValueAtTime(1900 * pitch, now + (0.2 / speed));
    filter.frequency.linearRampToValueAtTime(1100 * pitch, now + (0.4 / speed));
    filter.Q.setValueAtTime(5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (0.4 / speed));

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + (0.4 / speed) + 0.05);

    // Add a vocal squeak inside the wheeze
    this.playCartoonSqueak(pitch * 1.3);
  }

  /**
   * Deep Bass Boof / 808-style thud
   */
  private playBassBoof(pitch: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(38 * pitch, now + 0.35);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  /**
   * Cartoon upward squeak
   */
  private playCartoonSqueak(pitch: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(1600 * pitch, now + 0.12);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Classic cartoon spring boing
   */
  private playCartoonBoing(pitch: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
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
    osc.frequency.setValueAtTime(180 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(520 * pitch, now + 0.35);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.45);
    osc.stop(now + 0.45);
  }

  /**
   * Ba-Dum Tss (Snare + Cymbal punchline sound)
   */
  public playBaDumTss() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Ba (Tom 1)
    this.playDrumTom(160, now, 0.12);
    // Dum (Tom 2)
    this.playDrumTom(120, now + 0.16, 0.15);
    // Tss (Cymbal rimshot)
    this.playCymbal(now + 0.34);
  }

  private playDrumTom(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + duration);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private playCymbal(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const duration = 0.4;
    const bufferSize = this.ctx.sampleRate * duration;
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
    gain.gain.setValueAtTime(0.3, time);
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
    const now = this.ctx.currentTime;
    const triad = [261.63, 329.63, 392.00, 523.25]; // C major chord

    triad.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * pitch, now);

      gain.gain.setValueAtTime(0.08, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.03);
      osc.stop(now + 0.65);
    });
  }

  /**
   * Bubble pop sound for physics toys
   */
  public playPop(pitch: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(880 * pitch, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  /**
   * Short gentle blip for UI interactions
   */
  public playBlip(pitch: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(450 * pitch, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Uses SpeechSynthesis to say custom text in a funny way if supported
   */
  public speakHehe(phrase: string, rate: number = 1.3, pitch: number = 1.5) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = Math.max(0.5, Math.min(2.5, rate));
      utterance.pitch = Math.max(0.2, Math.min(2.0, pitch));
      utterance.volume = this.isMuted ? 0 : this.volume;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const audioEngine = new AudioEngine();
