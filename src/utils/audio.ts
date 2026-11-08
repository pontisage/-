/**
 * Web Audio API 原生程序合成音效與背景音樂引擎
 * 完全不依賴外部音訊檔案，保證 0 延遲、無加載問題與純淨手感。
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isBgmMuted: boolean = false;
  private bgmIntervalId: number | null = null;
  private bgmStep: number = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public ensureContext() {
    this.initContext();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public toggleBgmMute(): boolean {
    this.isBgmMuted = !this.isBgmMuted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.isBgmMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.isBgmMuted;
  }

  public getMutedState() {
    return { isMuted: this.isMuted, isBgmMuted: this.isBgmMuted };
  }

  // 1. 復古軟木塞手槍：經典氣壓「啵！」聲
  public playCorkPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // 氣壓釋放瞬態 sine 掃描 (160Hz -> 65Hz)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);

    // 軟木塞塞口摩擦高頻微噪
    this.playNoise(0.04, 800, 2400, 0.4);
  }

  // 2. 連發BB玩具步槍：清脆金屬撞擊與機械彈簧「噠！」
  public playBBFire() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(550, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.045);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);

    this.playNoise(0.025, 2000, 6000, 0.35);
  }

  // 3. 磁吸夜市飛鏢：破空呼嘯與木靶插中沉悶回音
  public playDartThrow() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // 破空聲
    this.playNoise(0.08, 400, 1600, 0.3);
  }

  public playDartImpact() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.09);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // 4. 霓虹雷射手槍：科幻音頻下掃穿透音
  public playLaserZap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // 氣球爆破音效 (逼真氣流瞬間破口聲)
  public playBalloonPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // 低頻震波
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);

    // 氣球皮破裂高頻撕裂聲
    this.playNoise(0.08, 1200, 7000, 0.6);
  }

  // 黃金招財貓金屬鈴鐺 / 幸運金幣敲擊音
  public playLuckyCatBell() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const freqs = [1046.5, 1318.5, 2093.0]; // C6, E6, C7
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const delay = idx * 0.05;
      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.4, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + delay);
      osc.stop(t + delay + 0.4);
    });
  }

  // 惡作劇炸彈爆炸音效 (重低音轟隆聲)
  public playBombExplosion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.4);

    this.playNoise(0.35, 100, 1200, 0.8);
  }

  // 無辜夜市小狗誤擊懲罰喇叭與扣分音
  public playDogBarkPenalty() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.setValueAtTime(200, t + 0.1);
    osc.frequency.setValueAtTime(140, t + 0.2);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // 填彈/上膛機械聲
  public playReload() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // 喀嗒一 (slide back)
    this.playClick(t, 600, 0.04);
    // 喀嗒二 (spring latch)
    this.playClick(t + 0.12, 900, 0.05);
  }

  // 出彩票打孔聲
  public playTicketSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    this.playClick(t, 1200, 0.03);
  }

  // 關卡勝利大獎號角
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);

      gain.gain.setValueAtTime(0.4, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.35);
    });
  }

  // 遊戲結束聲
  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.15);

      gain.gain.setValueAtTime(0.3, t + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.15 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + idx * 0.15);
      osc.stop(t + idx * 0.15 + 0.25);
    });
  }

  // 復古夜市 8-Bit 輕快小調背景音樂循環
  public startNightMarketBGM() {
    if (this.bgmIntervalId !== null) return;
    this.initContext();

    // 經典台灣夜市歡樂五聲音階小調節奏
    const melody = [
      523.25, 0, 587.33, 659.25, 0, 783.99, 880.0, 783.99,
      659.25, 0, 587.33, 523.25, 0, 440.0, 523.25, 0,
      659.25, 783.99, 880.0, 0, 1046.5, 880.0, 783.99, 0,
      659.25, 587.33, 523.25, 440.0, 523.25, 0, 0, 0
    ];

    const bass = [
      130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.0, 196.0,
      130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.0, 196.0,
      174.61, 174.61, 196.0, 196.0, 220.0, 220.0, 196.0, 196.0,
      174.61, 174.61, 164.81, 164.81, 130.81, 130.81, 196.0, 130.81
    ];

    const stepDuration = 140; // ms per 16th note (~107 BPM)

    this.bgmIntervalId = window.setInterval(() => {
      if (this.isMuted || this.isBgmMuted || !this.ctx || !this.bgmGain) {
        this.bgmStep = (this.bgmStep + 1) % melody.length;
        return;
      }

      const t = this.ctx.currentTime;
      const freq = melody[this.bgmStep];
      const bassFreq = bass[this.bgmStep];

      // 主旋律 (Square)
      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + 0.12);
      }

      // 低音伴奏 (Triangle)
      if (this.bgmStep % 2 === 0 && bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, t);

        bassGain.gain.setValueAtTime(0.12, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(t);
        bassOsc.stop(t + 0.22);
      }

      this.bgmStep = (this.bgmStep + 1) % melody.length;
    }, stepDuration);
  }

  public stopNightMarketBGM() {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  // 輔助噪聲產生器
  private playNoise(duration: number, lowCut: number, highCut: number, volume: number) {
    if (!this.ctx || !this.sfxGain) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime((lowCut + highCut) / 2, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  // 輔助機械卡榫點擊聲
  private playClick(time: number, freq: number, dur: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + dur);
  }
}

export const soundEngine = new SoundEngine();
