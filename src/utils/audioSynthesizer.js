// Martian Web Audio API Synthesizer
// Generates authentic procedural sounds: Martian wind, suit respirators, geiger clicks, and NASA Quindar beeps

class MarsAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isMuted = true;
    this.masterGain = null;
    
    // Wind nodes
    this.windNode = null;
    this.windFilter = null;
    this.windGain = null;
    
    // Breathing nodes & intervals
    this.breathGain = null;
    this.breathTimer = null;
    
    // Geiger timer
    this.geigerTimer = null;
  }

  init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      
      this.isInitialized = true;
      this.setupWindGenerator();
      this.setupRespirator();
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  setupWindGenerator() {
    if (!this.ctx) return;
    
    // Create 4-second pink noise buffer
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    this.windNode = this.ctx.createBufferSource();
    this.windNode.buffer = noiseBuffer;
    this.windNode.loop = true;

    // Resonant bandpass filter for atmospheric howling
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);

    this.windNode.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    this.windNode.start(0);

    // Gently modulate wind frequency for realistic gusting
    this.modulateWind();
  }

  modulateWind() {
    if (!this.ctx || !this.windFilter) return;
    const now = this.ctx.currentTime;
    const targetFreq = 180 + Math.random() * 220; // 180 to 400 Hz gust
    const duration = 2 + Math.random() * 3;
    this.windFilter.frequency.linearRampToValueAtTime(targetFreq, now + duration);
    setTimeout(() => this.modulateWind(), duration * 1000);
  }

  setupRespirator() {
    if (!this.ctx) return;
    
    this.breathGain = this.ctx.createGain();
    this.breathGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.breathGain.connect(this.masterGain);

    // 4.5 second breathing cycle (inhalation + exhalation)
    const runBreathCycle = () => {
      if (!this.isMuted && this.ctx && this.ctx.state === 'running') {
        const now = this.ctx.currentTime;
        // Inhale (filtered white noise)
        this.createBreathingPuff(now, 1.8, 0.04, 380);
        // Exhale
        this.createBreathingPuff(now + 2.3, 1.4, 0.03, 260);
      }
      this.breathTimer = setTimeout(runBreathCycle, 5200);
    };

    runBreathCycle();
  }

  createBreathingPuff(startTime, duration, peakVol, freq) {
    if (!this.ctx) return;
    const osc = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    osc.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, startTime);
    filter.Q.setValueAtTime(3.0, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peakVol, startTime + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // NASA Quindar Tone (Iconic Apollo/Mars mission radio beep: 2525 Hz)
  playQuindarTone(isIntro = true) {
    if (this.isMuted || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      
      const freq = isIntro ? 2525 : 2475;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Error playing tone:', e);
    }
  }

  // Geiger Counter Click (Triggered occasionally or when radiation spikes)
  playGeigerClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createBufferSource();
      const buf = this.ctx.createBuffer(1, 100, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < 100; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      osc.buffer = buf;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
    } catch (e) {}
  }

  startGeigerLoop(clicksPerSec = 2) {
    this.stopGeigerLoop();
    const trigger = () => {
      this.playGeigerClick();
      const delay = (1000 / clicksPerSec) * (0.4 + Math.random() * 1.2);
      this.geigerTimer = setTimeout(trigger, delay);
    };
    trigger();
  }

  stopGeigerLoop() {
    if (this.geigerTimer) {
      clearTimeout(this.geigerTimer);
      this.geigerTimer = null;
    }
  }

  toggleMute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    this.isMuted = !this.isMuted;
    if (this.windGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.windGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.25, now + 0.5);
    }

    if (!this.isMuted) {
      this.playQuindarTone(true);
      this.startGeigerLoop(1.5);
    } else {
      this.stopGeigerLoop();
    }

    return !this.isMuted;
  }

  setVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }
}

export const marsAudio = new MarsAudioSynthesizer();
