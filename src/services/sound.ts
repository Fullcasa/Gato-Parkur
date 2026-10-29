/**
 * Procedural Web Audio API sound synthesizer for GatoParkour 3D.
 * 100% zero-dependency, rich feline acoustic feedback.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 0.6;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.6, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Procedural Cat Meow ("Miau!")
   * Simulates feline vocal cords with vocal tract formant filter
   */
  public meow(pitchMod: number = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    const formant = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Base pitch variations (default around 480Hz - 600Hz)
    const baseFreq = (460 + Math.random() * 80) * pitchMod;

    osc.type = 'triangle';
    // Frequency envelope: quick rise "m-ee", then downward glide "-ow"
    osc.frequency.setValueAtTime(baseFreq * 0.85, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, t + 0.45);

    // Subtle feline vibrato
    vibrato.frequency.value = 6.0;
    vibratoGain.gain.value = 15;
    vibrato.connect(osc.frequency);

    // Formant filter for "ee-ow" vowel sound
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(1400, t);
    formant.frequency.exponentialRampToValueAtTime(800, t + 0.4);
    formant.Q.value = 2.5;

    // Amplitude envelope
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);

    osc.connect(formant);
    formant.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    vibrato.start(t);
    osc.stop(t + 0.5);
    vibrato.stop(t + 0.5);
  }

  /**
   * Cat Purr ("Rrrrr")
   */
  public purr() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);

    // Modulation for rhythmic purring
    lfo.frequency.setValueAtTime(26, t);
    lfoGain.gain.setValueAtTime(0.5, t);
    lfo.connect(lfoGain.gain);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.1);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.8);

    osc.connect(lfoGain);
    lfoGain.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.85);
    lfo.stop(t + 0.85);
  }

  /**
   * Jump sound (springy airy whoosh)
   */
  public jump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.22);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * Landing on rooftop
   */
  public land() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.14);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  /**
   * Paw step on roof
   */
  public pawStep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  /**
   * Delicious munching + sparkle chime for collected food
   */
  public eatFood(type: string = 'fish') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // 1. Crunchy munch "nom"
    const munchOsc = this.ctx.createOscillator();
    const munchGain = this.ctx.createGain();
    munchOsc.type = 'sawtooth';
    munchOsc.frequency.setValueAtTime(220, t);
    munchOsc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    munchGain.gain.setValueAtTime(0.15, t);
    munchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    munchOsc.connect(munchGain);
    munchGain.connect(this.masterGain);
    munchOsc.start(t);
    munchOsc.stop(t + 0.13);

    // 2. High sparkle chime (notes vary by food type)
    const pitches = type === 'tuna_can' ? [523.25, 659.25, 783.99] :
                    type === 'catnip' ? [659.25, 830.61, 1046.50] :
                    type === 'milk' ? [440, 554.37, 659.25] :
                    [587.33, 739.99, 880.00];

    pitches.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteOsc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const noteTime = t + idx * 0.06;

      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(freq, noteTime);

      noteGain.gain.setValueAtTime(0.001, noteTime);
      noteGain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.28);

      noteOsc.connect(noteGain);
      noteGain.connect(this.masterGain);

      noteOsc.start(noteTime);
      noteOsc.stop(noteTime + 0.3);
    });
  }

  /**
   * Special ability trigger sound (whoosh / burst)
   */
  public specialAbility(type: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (type === 'shadow_dash') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.18);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.Q.value = 3.0;
    } else if (type === 'double_jump') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(640, t + 0.22);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, t);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(500, t + 0.25);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t);
    }

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * Level Complete Victory Fanfare
   */
  public levelComplete() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, time: 0.0, dur: 0.15 }, // C5
      { f: 659.25, time: 0.15, dur: 0.15 }, // E5
      { f: 783.99, time: 0.30, dur: 0.15 }, // G5
      { f: 1046.50, time: 0.45, dur: 0.45 }, // C6 (long finish)
    ];

    notes.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + note.time;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + note.dur + 0.05);
    });

    // Also a happy little meow at the end!
    setTimeout(() => {
      this.meow(1.25);
    }, 550);
  }

  /**
   * Wall Climb & Claw Spring Sound ("¡Escalada Felina!")
   */
  public wallClimb() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // 1. Soft claw grab click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.08);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);

    // 2. Upward spring leap chime
    const spring = this.ctx.createOscillator();
    const sGain = this.ctx.createGain();
    spring.type = 'sine';
    spring.frequency.setValueAtTime(240, t + 0.03);
    spring.frequency.exponentialRampToValueAtTime(620, t + 0.22);

    sGain.gain.setValueAtTime(0.01, t + 0.03);
    sGain.gain.linearRampToValueAtTime(0.16, t + 0.07);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    spring.connect(sGain);
    sGain.connect(this.masterGain);
    spring.start(t + 0.03);
    spring.stop(t + 0.25);
  }

  /**
   * Fall reset sound (gentle cartoon soft landing with 9 lives recovery)
   * Warm, soft, comforting - no jarring or scary buzzers
   */
  public fallRescue() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Sweet, soft ascending bells (C5 -> E5 -> G5)
    const chords = [523.25, 659.25, 783.99];
    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.12, st + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(st);
      osc.stop(st + 0.28);
    });

    // Soft cute kitten chirp
    setTimeout(() => {
      this.meow(1.1);
    }, 280);
  }

  /**
   * The Viral "Ay, Mi Gatito Miau Miau" Meme Soundtrack!
   * Accurately reproduces the melody from the viral short:
   * "¡Miau Miau Miau! La canción del gatito más pequeño del mundo".
   * Synthesized with sweet, pleasant music-box sine bells and gentle kitten vocal warmth.
   */
  public memeMiauMiau() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Frequencies (Hz)
    const E5 = 659.25;
    const F5 = 698.46;
    const G5 = 783.99;
    const A5 = 880.00;
    const B5 = 987.77;
    const C6 = 1046.50;

    // Melody notes for "Ay Mi Gatito Miau Miau":
    // 1. "Miau, miau, miau, miau" -> E5, F5, A5, C6
    // 2. "Miau, miau, miau, miau" -> E5, F5, A5, C6
    // 3. "Ay, mi gatito..." -> A5, E5, F5, A5
    // 4. "Fa Fa La La Sol Sol Do Do" -> F5, F5, A5, A5, G5, G5, C6, C6
    // 5. "La Sol La Si Si La" -> A5, G5, A5, B5, B5, A5
    const melody = [
      // Phrase 1: Mi - Fa - La - Do
      { time: 0.00, dur: 0.14, freq: E5 },
      { time: 0.15, dur: 0.14, freq: F5 },
      { time: 0.30, dur: 0.14, freq: A5 },
      { time: 0.45, dur: 0.22, freq: C6 },

      // Phrase 2: Mi - Fa - La - Do
      { time: 0.72, dur: 0.14, freq: E5 },
      { time: 0.87, dur: 0.14, freq: F5 },
      { time: 1.02, dur: 0.14, freq: A5 },
      { time: 1.17, dur: 0.22, freq: C6 },

      // Phrase 3: La - Mi - Fa - La
      { time: 1.45, dur: 0.14, freq: A5 },
      { time: 1.60, dur: 0.14, freq: E5 },
      { time: 1.75, dur: 0.14, freq: F5 },
      { time: 1.90, dur: 0.26, freq: A5 },

      // Phrase 4: Fa - Fa - La - La - Sol - Sol - Do - Do
      { time: 2.20, dur: 0.11, freq: F5 },
      { time: 2.32, dur: 0.11, freq: F5 },
      { time: 2.44, dur: 0.11, freq: A5 },
      { time: 2.56, dur: 0.11, freq: A5 },
      { time: 2.68, dur: 0.11, freq: G5 },
      { time: 2.80, dur: 0.11, freq: G5 },
      { time: 2.92, dur: 0.14, freq: C6 },

      // Phrase 5: La - Sol - La - Si - Si - La ("¡Miau Miau!")
      { time: 3.12, dur: 0.13, freq: A5 },
      { time: 3.26, dur: 0.13, freq: G5 },
      { time: 3.40, dur: 0.13, freq: A5 },
      { time: 3.54, dur: 0.13, freq: B5 },
      { time: 3.68, dur: 0.15, freq: B5 },
      { time: 3.84, dur: 0.35, freq: A5 },
    ];

    // Synthesize vocal cat melody with sweet, gentle flute/bell timbre
    melody.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const formant = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      const noteStart = t + note.time;

      // Pure smooth sine wave with soft kitten inflection
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq * 0.96, noteStart);
      osc.frequency.exponentialRampToValueAtTime(note.freq * 1.04, noteStart + note.dur * 0.3);
      osc.frequency.exponentialRampToValueAtTime(note.freq, noteStart + note.dur);

      formant.type = 'lowpass';
      formant.frequency.setValueAtTime(2400, noteStart);

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.16, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.dur);

      osc.connect(formant);
      formant.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteStart);
      osc.stop(noteStart + note.dur + 0.02);
    });

    // Gentle marimba / kalimba bassline accompaniment (warm sine waves, no harsh buzz)
    const bassline = [
      { time: 0.00, freq: 146.83 }, // D3
      { time: 0.36, freq: 174.61 }, // F3
      { time: 0.72, freq: 146.83 }, // D3
      { time: 1.08, freq: 220.00 }, // A3
      { time: 1.45, freq: 174.61 }, // F3
      { time: 1.80, freq: 130.81 }, // C3
      { time: 2.20, freq: 174.61 }, // F3
      { time: 2.56, freq: 196.00 }, // G3
      { time: 2.92, freq: 130.81 }, // C3
      { time: 3.26, freq: 146.83 }, // D3
      { time: 3.68, freq: 220.00 }, // A3
    ];

    bassline.forEach((b) => {
      if (!this.ctx || !this.masterGain) return;
      const bOsc = this.ctx.createOscillator();
      const bFilter = this.ctx.createBiquadFilter();
      const bGain = this.ctx.createGain();
      const bStart = t + b.time;

      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(b.freq, bStart);

      bFilter.type = 'lowpass';
      bFilter.frequency.setValueAtTime(260, bStart);

      bGain.gain.setValueAtTime(0.001, bStart);
      bGain.gain.linearRampToValueAtTime(0.09, bStart + 0.03);
      bGain.gain.exponentialRampToValueAtTime(0.0001, bStart + 0.24);

      bOsc.connect(bFilter);
      bFilter.connect(bGain);
      bGain.connect(this.masterGain);

      bOsc.start(bStart);
      bOsc.stop(bStart + 0.26);
    });
  }

  /**
   * Dog Bark ("¡Guau! ¡Guau!")
   */
  public dogBark() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    [0, 0.22].forEach((offset) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      const start = t + offset;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, start);
      osc.frequency.exponentialRampToValueAtTime(80, start + 0.16);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, start);
      filter.frequency.exponentialRampToValueAtTime(150, start + 0.16);

      gain.gain.setValueAtTime(0.35, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  /**
   * Rival Cat Hiss ("¡Fffffssss!")
   */
  public catHiss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // White noise through highpass
    const bufferSize = this.ctx.sampleRate * 0.45;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(t);
  }

  /**
   * Water Puddle Splash ("¡Splash!")
   */
  public waterSplash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.2);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Mouse Squeak ("¡Iiii-iiii!")
   */
  public mouseSqueak() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(3200, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(2200, t + 0.16);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Pigeons Flutter Flap
   */
  public pigeonFlap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + i * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, start);
      osc.frequency.exponentialRampToValueAtTime(50, start + 0.06);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.08);
    }
  }

  /**
   * Turbine Air Wind Whoosh
   */
  public windBlast() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.4);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.46);
  }
}

export const sound = new SoundEngine();

