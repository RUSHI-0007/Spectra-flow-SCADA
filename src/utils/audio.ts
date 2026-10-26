class IndustrialSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private alarmOsc: OscillatorNode | null = null;
  private alarmGain: GainNode | null = null;
  private alarmInterval: number | null = null;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopMotorSound();
      this.stopAlarmSound();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Button mechanical click sound
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Optical sensor beam break beep
  public playSensorBeep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Pneumatic pusher hiss & clack
  public playPneumaticPusher() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // White noise for air burst
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to sound like compressed air
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.5;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    // Mechanical thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.08);

    oscGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start();
    osc.start();
    noise.stop(this.ctx.currentTime + 0.12);
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Bottle sorted clink into bin
  public playBottleDrop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // E-Stop hard slam
  public playEmergencyStop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Continuous motor hum dependent on VFD frequency
  public updateMotorSound(running: boolean, frequencyHz: number) {
    if (this.isMuted || !running || frequencyHz <= 1) {
      this.stopMotorSound();
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    // Pitch directly proportional to VFD Hz: 40Hz -> 60Hz hum, 100Hz -> 150Hz
    const pitch = 40 + frequencyHz * 1.2;

    if (!this.motorOsc) {
      this.motorOsc = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();

      this.motorOsc.type = 'sawtooth';
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;

      this.motorOsc.connect(filter);
      filter.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);

      this.motorGain.gain.setValueAtTime(0.025, this.ctx.currentTime);
      this.motorOsc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      this.motorOsc.start();
    } else {
      this.motorOsc.frequency.setTargetAtTime(pitch, this.ctx.currentTime, 0.1);
      if (this.motorGain) {
        this.motorGain.gain.setTargetAtTime(0.025, this.ctx.currentTime, 0.1);
      }
    }
  }

  public stopMotorSound() {
    if (this.motorGain && this.ctx) {
      this.motorGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      setTimeout(() => {
        if (this.motorOsc) {
          try {
            this.motorOsc.stop();
            this.motorOsc.disconnect();
          } catch {
            // Already stopped
          }
          this.motorOsc = null;
          this.motorGain = null;
        }
      }, 60);
    }
  }

  // Industrial alarm siren (alternating pitch)
  public startAlarmSound() {
    if (this.isMuted || this.alarmInterval !== null) return;
    this.initContext();
    if (!this.ctx) return;

    let high = true;
    const tick = () => {
      if (this.isMuted || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(high ? 980 : 720, this.ctx.currentTime);
      high = !high;

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1600;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    };

    tick();
    this.alarmInterval = window.setInterval(tick, 350);
  }

  public stopAlarmSound() {
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.alarmOsc) {
      try {
        this.alarmOsc.stop();
        this.alarmOsc.disconnect();
      } catch {
        // Ignored
      }
      this.alarmOsc = null;
    }
  }
}

export const industrialAudio = new IndustrialSoundEngine();
