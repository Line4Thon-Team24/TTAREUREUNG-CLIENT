// Web Audio 전화 벨소리
type AudioCtor = typeof AudioContext;

const getAudioCtor = (): AudioCtor | undefined => {
  const w = window as unknown as {
    AudioContext?: AudioCtor;
    webkitAudioContext?: AudioCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext;
};

const RING_SECONDS = 1;
const CYCLE_SECONDS = 3;
const BELL_HZ = 1000;
const TREMOLO_HZ = 8;

// 브라우저가 사용자 터치 전에는 소리를 막으므로, 막혔으면 첫 터치 때 다시 시도함
export const startRingtone = (): (() => void) => {
  const Ctor = getAudioCtor();
  if (!Ctor) return () => {};

  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = 0.3;
  master.connect(ctx.destination);

  let stopped = false;

  const ringOnce = () => {
    const start = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = BELL_HZ;

    const tremolo = ctx.createOscillator();
    tremolo.frequency.value = TREMOLO_HZ;
    const depth = ctx.createGain();
    depth.gain.value = 0.5;
    const amp = ctx.createGain();
    amp.gain.value = 0.5;
    tremolo.connect(depth).connect(amp.gain);

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(1, start + 0.03);
    envelope.gain.setValueAtTime(1, start + RING_SECONDS - 0.05);
    envelope.gain.linearRampToValueAtTime(0, start + RING_SECONDS);

    osc.connect(amp).connect(envelope).connect(master);
    osc.start(start);
    tremolo.start(start);
    osc.stop(start + RING_SECONDS);
    tremolo.stop(start + RING_SECONDS);
  };

  const tick = () => {
    if (stopped || ctx.state !== 'running') return;
    ringOnce();
  };

  const resume = () => {
    void ctx
      .resume()
      .then(tick)
      .catch(() => {});
  };

  const unlock = () => {
    if (stopped || ctx.state === 'running') return;
    resume();
  };
  window.addEventListener('pointerdown', unlock);

  resume();
  const timer = window.setInterval(tick, CYCLE_SECONDS * 1000);

  return () => {
    stopped = true;
    window.clearInterval(timer);
    window.removeEventListener('pointerdown', unlock);
    master.gain.value = 0;
    void ctx.close().catch(() => {});
  };
};
