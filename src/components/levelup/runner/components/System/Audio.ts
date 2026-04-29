/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export class AudioController {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  musicGain: GainNode | null = null;
  isMusicPlaying: boolean = false;
  
  sequenceTimer: number | null = null;
  nextNoteTime: number = 0;
  currentStep: number = 0;

  constructor() {
    // Lazy initialization
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);

      // Handle visibility changes to strictly prevent background audio
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.mute();
        } else {
          // Note: We don't auto-unmute here to prevent sound 
          // starting if the game was paused while in background.
          // AudioSync.tsx will handle the unmute based on GameStatus.
        }
      });
    }
  }

  mute() {
    // Only suspend if not already suspended
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  unmute() {
    // Only resume if the tab is visible
    if (this.ctx && this.ctx.state === 'suspended' && !document.hidden) {
      this.ctx.resume().catch(() => {});
    }
  }

  setMasterVolume(val: number) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx?.currentTime || 0, 0.1);
    }
  }

  // Audio caching for performance
  distCurve: Float32Array | null = null;
  noiseBuffer: AudioBuffer | null = null;

  getDistortionCurve(amount: number = 200) {
      if (this.distCurve) return this.distCurve;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0 ; i < n_samples; ++i ) {
        const x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + amount ) * x * 20 * deg / ( Math.PI + amount * Math.abs(x) );
      }
      this.distCurve = curve;
      return curve;
  }

  getNoiseBuffer() {
      if (this.noiseBuffer) return this.noiseBuffer;
      if (!this.ctx) return null;
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buffer;
      return buffer;
  }

  // --- Background Music (Cyber-Nu-Metal Loop) ---
  startMusic() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain || this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    const t = this.ctx.currentTime;
    
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.linearRampToValueAtTime(0.3, t + 0.5);

    this.nextNoteTime = t + 0.1;
    this.currentStep = 0;
    this.scheduleMusicNotes();
  }

  scheduleMusicNotes() {
    if (!this.ctx || !this.musicGain || !this.isMusicPlaying) return;

    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.playMusicStep(this.nextNoteTime, this.currentStep);
      
      const tempo = 135; // Nu-metal / Dubstep bounce tempo
      const secondsPerBeat = 60.0 / tempo;
      this.nextNoteTime += 0.25 * secondsPerBeat; // 16th note timing
      
      this.currentStep = (this.currentStep + 1) % 64; // 4 bar loop
    }

    this.sequenceTimer = window.setTimeout(() => this.scheduleMusicNotes(), 25);
  }

  // Intruments
  playKick(time: number) {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const dist = this.ctx.createWaveShaper();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
      
      gain.gain.setValueAtTime(0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      
      dist.curve = this.getDistortionCurve(20);
      
      osc.connect(dist);
      dist.connect(gain);
      gain.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.16);
  }

  playSnare(time: number) {
      if (!this.ctx || !this.musicGain) return;
      
      // Body
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);
      oscGain.gain.setValueAtTime(0.6, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      
      // Crack
      const noise = this.ctx.createBufferSource();
      const nBuffer = this.getNoiseBuffer();
      if (nBuffer) noise.buffer = nBuffer;
      
      const noiseFilter = this.ctx.createBiquadFilter();
      const nGain = this.ctx.createGain();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 2000;
      noiseFilter.Q.value = 0.5;
      nGain.gain.setValueAtTime(0.7, time);
      nGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      
      const dist = this.ctx.createWaveShaper();
      dist.curve = this.getDistortionCurve(100);

      osc.connect(oscGain);
      oscGain.connect(dist);
      noise.connect(noiseFilter);
      noiseFilter.connect(nGain);
      nGain.connect(dist);
      dist.connect(this.musicGain);
      
      osc.start(time); osc.stop(time + 0.15);
      noise.start(time); noise.stop(time + 0.25);
  }

  playHat(time: number, isOpen: boolean = false) {
      if (!this.ctx || !this.musicGain) return;
      const noise = this.ctx.createBufferSource();
      const nBuffer = this.getNoiseBuffer();
      if (nBuffer) noise.buffer = nBuffer;
      
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      
      filter.type = 'highpass';
      filter.frequency.value = 6000;
      
      const duration = isOpen ? 0.3 : 0.05;
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      
      noise.connect(filter); filter.connect(gain); gain.connect(this.musicGain);
      noise.start(time); noise.stop(time + duration + 0.05);
  }

  playCyberGuitar(freq: number, time: number, isMuted: boolean) {
      if (!this.ctx || !this.musicGain) return;
      const root = this.ctx.createOscillator();
      const fifth = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const dist = this.ctx.createWaveShaper();

      root.type = 'sawtooth';
      fifth.type = 'square'; // Adds digital grossness
      root.frequency.value = freq;
      fifth.frequency.value = freq * 1.5;

      dist.curve = this.getDistortionCurve(200);

      // Cabinet emulation & palm mute
      filter.type = 'lowpass';
      filter.Q.value = isMuted ? 1.0 : 4.0;
      filter.frequency.setValueAtTime(isMuted ? 1500 : 4000, time);
      filter.frequency.exponentialRampToValueAtTime(isMuted ? 200 : 800, time + (isMuted ? 0.1 : 0.4));

      gain.gain.setValueAtTime(0.4, time);
      gain.gain.linearRampToValueAtTime(0.01, time + (isMuted ? 0.15 : 0.4));

      root.connect(filter);
      fifth.connect(filter);
      filter.connect(dist);
      dist.connect(gain);
      gain.connect(this.musicGain);

      root.start(time); fifth.start(time);
      root.stop(time + 0.45); fifth.stop(time + 0.45);
  }

  playWobbleBass(freq: number, time: number, wobbleHz: number) {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const dist = this.ctx.createWaveShaper();

      osc.type = 'sawtooth';
      sub.type = 'sine';
      osc.frequency.value = freq;
      sub.frequency.value = freq / 2;

      // LFO for Wobble
      lfo.frequency.value = wobbleHz;
      lfoGain.gain.value = 2500;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, time);
      filter.Q.value = 6.0; // Resonant squeal

      gain.gain.setValueAtTime(0.5, time);
      gain.gain.linearRampToValueAtTime(0.01, time + 0.5);

      dist.curve = this.getDistortionCurve(50);

      osc.connect(filter);
      sub.connect(gain);
      filter.connect(gain);
      gain.connect(dist);
      dist.connect(this.musicGain);

      osc.start(time); sub.start(time); lfo.start(time);
      osc.stop(time + 0.55); sub.stop(time + 0.55); lfo.stop(time + 0.55);
  }

  playLeadSynth(freq: number, time: number) {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq / 2, time);
      osc.frequency.exponentialRampToValueAtTime(freq, time + 0.05); // Glide
      
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(time); osc.stop(time + 0.2);
  }

  playMusicStep(time: number, step: number) {
      if (!this.ctx || !this.musicGain) return;

      const bar = Math.floor(step / 16);
      const stepInBar = step % 16;
      const isDrop = bar >= 2;

      const E2 = 82.41;
      const G2 = 98.00;
      const A2 = 110.0;
      const C3 = 130.81;

      // --- DRUMS ---
      if (!isDrop) { 
          // Nu-Metal Rock beat
          if (stepInBar === 0 || stepInBar === 8 || stepInBar === 10) this.playKick(time);
          if (stepInBar === 4 || stepInBar === 12) this.playSnare(time);
          if (step % 2 === 0) this.playHat(time, stepInBar === 14);
      } else { 
          // Dubstep / Cyber Trap heavy halftime beat
          if (stepInBar === 0 || stepInBar === 2 || (stepInBar === 14 && bar === 3)) this.playKick(time);
          if (stepInBar === 8) this.playSnare(time);
          if (step % 4 === 0 || stepInBar >= 12) this.playHat(time, stepInBar === 6);
      }

      // --- INSTRUMENTALS ---
      if (!isDrop) {
          // Linkin Park style Chug Riff
          if (stepInBar === 0) this.playCyberGuitar(E2, time, false); // Open
          if (stepInBar === 3 || stepInBar === 5) this.playCyberGuitar(E2, time, true); // Chugs
          if (stepInBar === 6) this.playCyberGuitar(G2, time, false); 
          if (stepInBar === 8) this.playCyberGuitar(E2, time, false);
          if (stepInBar === 11) this.playCyberGuitar(E2, time, true);
          if (stepInBar === 14) this.playCyberGuitar(bar === 0 ? C3 : A2, time, false);
      } else {
          // Drop - Wobble Bass
          let wobbleNote = E2;
          let wobbleSpeed = 3; // LFO hz syncs ~1 beat
          
          if (stepInBar === 0) { wobbleNote = E2; wobbleSpeed = 3; }
          if (stepInBar === 6) { wobbleNote = G2; wobbleSpeed = 6; }
          if (stepInBar === 8) { wobbleNote = A2; wobbleSpeed = 4.5; }
          if (stepInBar === 12) { wobbleNote = C3 / 2; wobbleSpeed = 12; } // Fast aggressive

          if ([0, 6, 8, 12].includes(stepInBar)) {
              this.playWobbleBass(wobbleNote / 2, time, wobbleSpeed);
          }

          // Cyber Lead Line over the dark drop
          const leadNotes = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
          if (stepInBar % 3 === 0) {
              this.playLeadSynth(leadNotes[stepInBar % 4], time);
          }
      }
  }

  stopMusic() {
    if (!this.isMusicPlaying) return;
    this.isMusicPlaying = false;
    
    if (this.sequenceTimer !== null) {
        window.clearTimeout(this.sequenceTimer);
        this.sequenceTimer = null;
    }
    
    if (this.musicGain && this.ctx) {
        const t = this.ctx.currentTime;
        this.musicGain.gain.cancelScheduledValues(t);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t);
        this.musicGain.gain.linearRampToValueAtTime(0, t + 0.1);
    }
  }

  playGemCollect() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // High pitch "ding" with slight upward inflection
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playLetterCollect() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // Play a major chord (C Majorish: C5, E5, G5) for a rewarding sound
    const freqs = [523.25, 659.25, 783.99]; 
    
    freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = f;
        
        // Stagger start times slightly for an arpeggio feel
        const start = t + (i * 0.04);
        const dur = 0.3;

        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.start(start);
        osc.stop(start + dur);
    });
  }

  playJump(isDouble = false) {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Sine wave for a smooth "whoop" sound
    osc.type = 'sine';
    
    // Pitch shift up for double jump
    const startFreq = isDouble ? 400 : 200;
    const endFreq = isDouble ? 800 : 450;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.15);

    // Lower volume for jump as it is a frequent action
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playDamage() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // 1. Distortion Node
    const distortion = this.ctx.createWaveShaper();
    function makeDistortionCurve(amount: number) {
      const k = typeof amount === 'number' ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0 ; i < n_samples; ++i ) {
        const x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
      }
      return curve;
    }
    distortion.curve = makeDistortionCurve(400);
    distortion.oversample = '4x';

    // 2. High Noise layer for "explosion"
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i/bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // 3. Sub-thump layer
    const osc = this.ctx.createOscillator();
    osc.type = 'square'; // Buzzier for T-Mobile energy
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.8, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1.0, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    // Filters to shape the impact
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1000, t);
    lowpass.frequency.exponentialRampToValueAtTime(200, t + 0.4);

    osc.connect(distortion);
    distortion.connect(oscGain);
    oscGain.connect(lowpass);
    lowpass.connect(this.masterGain);
    
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.4);
    noise.start(t);
    noise.stop(t + 0.4);
  }
}

export const audio = new AudioController();
