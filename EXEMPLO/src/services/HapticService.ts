
/**
 * HapticService: Gerencia feedback tátil e sonoro de alta fidelidade
 */
export enum SoundStyle {
  CRYSTAL = 'crystal',      // Limpo, sines, estilo Apple
  MECHANICAL = 'mechanical', // Tátil, clicks curtos, leve ruído
  FLUID = 'fluid',          // Suave, harmônicos orgânicos
  RETRO = 'retro'           // 8-bit, square waves, nostálgico
}

class HapticService {
  private audioCtx: AudioContext | null = null;
  private currentStyle: SoundStyle = (localStorage.getItem('sound_style') as SoundStyle) || SoundStyle.CRYSTAL;

  private initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  getCurrentStyle() {
    return this.currentStyle;
  }

  setStyle(style: SoundStyle) {
    this.currentStyle = style;
    localStorage.setItem('sound_style', style);
    // Tocar um preview curto
    this.lightClick();
  }

  /**
   * Synthesis Engine Pro - Síntese Multi-Camada (Impacto Hifi)
   */
  private playSynthesized(freq: number, dur: number, vol: number = 0.4) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      
      // Master Gain
      const masterGain = this.audioCtx.createGain();
      masterGain.connect(this.audioCtx.destination);
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(vol * 2.8, now + 0.002);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      // --- CAMADA 1: TRANSIENTE SECO (O "Click Inteligente") ---
      // Simula o deslocamento físico do cone do alto-falante
      const clickOsc = this.audioCtx.createOscillator();
      const clickGain = this.audioCtx.createGain();
      const clickFilter = this.audioCtx.createBiquadFilter();
      
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(freq * 1.2, now);
      clickOsc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.015);
      
      clickFilter.type = 'highpass';
      clickFilter.frequency.setValueAtTime(1500, now);
      
      clickGain.gain.setValueAtTime(0.8, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      
      clickOsc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(masterGain);
      
      clickOsc.start();
      clickOsc.stop(now + 0.015);

      // --- CAMADA 2: CORPO SINTETIZADO (FM MODULAR) ---
      // Síntese FM avançada para timbre "Computacional/Adulto"
      const carrier = this.audioCtx.createOscillator();
      const modulator = this.audioCtx.createOscillator();
      const modGain = this.audioCtx.createGain();
      
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, now);

      modulator.type = 'sine';
      // Ratio de 3.5 para harmonias inarmônicas "Tech" ou 1.5 para harmônicas "Musicais"
      const ratio = this.currentStyle === SoundStyle.CRYSTAL ? 3.5 : 1.5;
      modulator.frequency.setValueAtTime(freq * ratio, now);
      
      modGain.gain.setValueAtTime(freq * 0.5, now);
      modGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(masterGain);

      carrier.start();
      modulator.start();
      carrier.stop(now + dur);
      modulator.stop(now + dur);

      // --- CAMADA 3: SUB-GRAVE PROFUNDO (A "Pressão") ---
      const sub = this.audioCtx.createOscillator();
      const subGain = this.audioCtx.createGain();
      
      sub.type = 'sine';
      sub.frequency.setValueAtTime(freq * 0.5, now);
      
      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.6, now + 0.005);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + dur);
      
      sub.connect(subGain);
      subGain.connect(this.audioCtx.destination);
      
      sub.start();
      sub.stop(now + dur);

    } catch (e) {
      console.warn('Audio feedback blocked');
    }
  }

  vibrate(pattern: number | number[]) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // --- Efeitos e Famílias de Sons Expandida ---

  lightClick() {
    this.playSynthesized(220, 0.04, 0.2); 
    this.vibrate(5);
  }

  mediumClick() {
    this.playSynthesized(160, 0.06, 0.35);
    this.vibrate(10);
  }

  heavyClick() {
    this.playSynthesized(90, 0.12, 0.5);
    this.vibrate(20);
  }

  selection() {
    this.playSynthesized(440, 0.03, 0.2);
    this.vibrate(5);
  }

  toggle(isOn: boolean) {
    if (isOn) {
      this.playSynthesized(260, 0.1, 0.3);
      setTimeout(() => this.playSynthesized(380, 0.15, 0.25), 50);
    } else {
      this.playSynthesized(380, 0.1, 0.25);
      setTimeout(() => this.playSynthesized(260, 0.15, 0.3), 50);
    }
    this.vibrate(10);
  }

  open() {
    this.playSynthesized(110, 0.4, 0.4);
    this.playSynthesized(220, 0.5, 0.2);
    this.vibrate([10, 30]);
  }

  close() {
    this.playSynthesized(90, 0.25, 0.35);
    this.vibrate(15);
  }

  success() {
    // Cadência Triunfal - Arpejo de Quinta Justa com harmonia premium
    this.playSynthesized(261.63, 0.4, 0.35); // C4
    setTimeout(() => this.playSynthesized(329.63, 0.4, 0.3), 80); // E4
    setTimeout(() => this.playSynthesized(392, 0.5, 0.25), 160); // G4
    setTimeout(() => this.playSynthesized(523.25, 0.6, 0.2), 240); // C5 (O brilho final)
    this.vibrate([20, 50, 20]);
  }

  error() {
    // Impacto de Dissolução - Grave descendente com "ruído" controlado
    this.playSynthesized(60, 0.8, 0.5); 
    this.vibrate([60, 100, 60]);
  }

  transition() {
    // Som de passagem - Sweep harmônico suave
    this.playSynthesized(220, 0.6, 0.15); // A3
    setTimeout(() => this.playSynthesized(277.18, 0.6, 0.1), 100); // C#4
  }

  dataSave() {
    this.playSynthesized(330, 0.05, 0.2);
    setTimeout(() => this.playSynthesized(330, 0.05, 0.2), 60);
    this.vibrate(10);
  }

  focusGain() {
    this.playSynthesized(300, 0.3, 0.15);
  }

  actionCritical() {
    this.playSynthesized(120, 0.1, 0.6);
    this.vibrate(40);
  }

  send() {
    this.initAudio();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    
    const master = this.audioCtx.createGain();
    master.connect(this.audioCtx.destination);
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.35, now + 0.05);
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    const osc = this.audioCtx.createOscillator();
    const sub = this.audioCtx.createOscillator();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

    sub.type = 'sine';
    sub.frequency.setValueAtTime(70, now);
    sub.frequency.exponentialRampToValueAtTime(220, now + 0.4);
    
    osc.connect(master);
    sub.connect(master);
    
    osc.start();
    sub.start();
    osc.stop(now + 0.5);
    sub.stop(now + 0.5);
    
    this.vibrate(30);
  }

  notification() {
    // Duas notas graves calmas (Elegância)
    this.playSynthesized(329.63, 0.25, 0.25); // E4
    setTimeout(() => this.playSynthesized(261.63, 0.4, 0.2), 200); // C4
    this.vibrate([10, 150, 10]);
  }
}

export const haptics = new HapticService();
