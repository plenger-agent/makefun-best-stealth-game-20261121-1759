// Night Archive — sound, synthesized live with WebAudio.
// No audio files: soft footstep ticks, a guard's steps when one is near,
// a rising sting when suspicion grows and a low alarm when you are caught
// out. Everything is quiet until the first key or click wakes the context.

export function createAudio() {
  const audio = {
    ctx: null,
    muted: false,
    master: null,
  };

  audio.ensure = () => {
    if (audio.ctx) {
      if (audio.ctx.state === 'suspended') audio.ctx.resume().catch(() => {});
      return;
    }
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audio.ctx = new Ctx();
      audio.master = audio.ctx.createGain();
      audio.master.gain.value = 0.5;
      audio.master.connect(audio.ctx.destination);
    } catch {
      audio.ctx = null;
    }
  };

  function tone(freq, dur, type, vol, when = 0) {
    if (!audio.ctx || audio.muted) return;
    const t0 = audio.ctx.currentTime + when;
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // A short filtered thud: a footstep. Louder and lower when running.
  audio.footstep = (running, distance = 0) => {
    if (!audio.ctx || audio.muted) return;
    const vol = Math.max(0.02, (running ? 0.16 : 0.07) - distance * 0.0004);
    tone(running ? 95 : 130, 0.07, 'sine', vol);
  };

  // A guard's step, heard only when a guard is close enough to matter.
  audio.guardStep = (distance) => {
    if (!audio.ctx || audio.muted || distance > 320) return;
    tone(82, 0.09, 'triangle', Math.max(0.02, 0.14 - distance * 0.0004));
  };

  // A soft page rustle when a document is collected.
  audio.pickup = () => {
    tone(660, 0.09, 'sine', 0.12);
    tone(990, 0.12, 'sine', 0.09, 0.07);
  };

  // Two rising notes when a guard grows suspicious.
  audio.spotted = () => {
    tone(392, 0.16, 'square', 0.07);
    tone(523, 0.2, 'square', 0.07, 0.12);
  };

  // The alarm: three low blasts.
  audio.alarm = () => {
    for (let i = 0; i < 3; i++) {
      tone(220, 0.22, 'sawtooth', 0.09, i * 0.22);
      tone(185, 0.22, 'sawtooth', 0.07, i * 0.22);
    }
  };

  // A warm chime when a level is cleared.
  audio.levelClear = () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'sine', 0.1, i * 0.1));
  };

  audio.toggleMute = () => {
    audio.muted = !audio.muted;
    return audio.muted;
  };

  return audio;
}
