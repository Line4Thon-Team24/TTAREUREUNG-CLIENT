// 브라우저 내장 Web Speech API 래퍼 (TTS: speechSynthesis, STT: SpeechRecognition)

// 시니어가 말로 내리는 명령
export type VoiceAction = 'FOUND' | 'TAKEN' | 'NOT_FOUND' | 'HELP' | 'MORE';

// 글자 안에 명령어가 들어 있는지만 확인 (띄어쓰기 무시)
// 앞에서부터 찾으므로 헷갈리기 쉬운 말("못 찾겠어" vs "찾았어")은 구체적인 쪽을 먼저 둠
const COMMANDS: { words: string[]; action: VoiceAction }[] = [
  { words: ['못 찾겠어', '못찾', '모르겠', '없어'], action: 'NOT_FOUND' },
  { words: ['도와줘', '도움', '살려'], action: 'HELP' },
  { words: ['더 찾아볼게', '더찾아', '조금 더'], action: 'MORE' },
  { words: ['다 먹었어', '먹었어', '먹었다', '다먹'], action: 'TAKEN' },
  { words: ['찾았어', '찾았다', '찾음'], action: 'FOUND' },
];

const stripSpaces = (text: string) => text.replace(/\s/g, '');

// "아직 안 먹었어" 같은 부정 표현은 "먹었어"가 들어 있어도 복용 완료로 보지 않음
const NEGATIVE_TAKEN = ['안먹', '못먹', '아직', '않았', '안했', '먹지'];

// 화면이 허용한 명령(allowed) 중에서만 찾음
export const matchCommand = (
  text: string,
  allowed: readonly VoiceAction[]
): VoiceAction | null => {
  const target = stripSpaces(text);
  const isNegative = NEGATIVE_TAKEN.some((word) => target.includes(word));
  const found = COMMANDS.find(
    (command) =>
      allowed.includes(command.action) &&
      !(command.action === 'TAKEN' && isNegative) &&
      command.words.some((word) => target.includes(stripSpaces(word)))
  );
  return found?.action ?? null;
};

// ---- TTS ----

export const isSpeechSynthesisSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

// 이 시간 안에 읽기가 시작되지 않으면 엔진이 멈춘 것으로 보고 포기(ms)
const START_TIMEOUT = 1500;

// 읽기가 끝나지 않는 경우를 대비한 최대 대기 시간
const speakTimeout = (text: string) => 2000 + text.length * 300;

// 글자를 소리로 읽고, 읽기가 끝나면(실패·중단 포함) resolve
export const speak = (text: string): Promise<void> =>
  new Promise((resolve) => {
    if (!isSpeechSynthesisSupported() || !text.trim()) {
      resolve();
      return;
    }
    const synth = window.speechSynthesis;
    // 앞 문장이 남아 있을 때만 끊고 새로 읽음
    // (아무것도 없는데 cancel 직후 speak를 부르면 Chrome 엔진이 멈추는 경우가 있음)
    if (synth.speaking || synth.pending) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // 시니어용으로 조금 느리게
    const korean = synth.getVoices().find((v) => v.lang.startsWith('ko'));
    if (korean) utterance.voice = korean;

    const timer = window.setTimeout(resolve, speakTimeout(text));
    // 엔진이 멈추면 읽기가 시작되지도 않으므로 오래 기다리지 않고 넘어감
    const startTimer = window.setTimeout(() => {
      synth.cancel();
      done();
    }, START_TIMEOUT);
    const done = () => {
      window.clearTimeout(timer);
      window.clearTimeout(startTimer);
      resolve();
    };
    utterance.onstart = () => window.clearTimeout(startTimer);
    utterance.onend = done;
    utterance.onerror = done; // 실패해도 흐름이 멈추지 않게
    synth.speak(utterance);
  });

export const cancelSpeech = () => {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
};

// ---- STT ----

// 마이크 권한을 미리 요청
// 스트림은 바로 닫고 허용 여부만 돌려줌
export const requestMicPermission = async (): Promise<boolean> => {
  if (!navigator.mediaDevices?.getUserMedia) return true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
};

// lib.dom에 없는 최소 타입
type RecognitionResultList = ArrayLike<ArrayLike<{ transcript: string }>>;
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: RecognitionResultList }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getRecognitionCtor = (): SpeechRecognitionCtor | undefined => {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

export const isSpeechRecognitionSupported = () =>
  typeof window !== 'undefined' && getRecognitionCtor() !== undefined;

// 명령이 들리면 인식을 멈추고 onCommand 호출. 반환값은 듣기를 끝내는 함수
// (안드로이드 Chrome은 침묵이 몇 초 이어지면 꺼지므로 onend에서 다시 켬)
export const startListening = (
  allowed: readonly VoiceAction[],
  onCommand: (action: VoiceAction) => void,
  onDenied?: () => void
): (() => void) => {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return () => {};

  const rec = new Ctor();
  rec.lang = 'ko-KR';
  rec.continuous = true; // 한 마디 듣고 끝나지 않게
  rec.interimResults = true; // 말하는 중간에도 반응

  let active = true;
  const stop = () => {
    active = false;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
    try {
      rec.stop();
    } catch {
      // 이미 멈춘 경우
    }
  };

  rec.onresult = (e) => {
    if (!active) return;
    const text = Array.from(e.results)
      .map((result) => result[0].transcript)
      .join(' ');
    const action = matchCommand(text, allowed);
    if (action) {
      stop();
      onCommand(action);
    }
  };
  rec.onerror = (e) => {
    // 마이크 권한 거부면 다시 켜지 않음
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      stop();
      onDenied?.();
    }
  };
  rec.onend = () => {
    if (!active) return;
    window.setTimeout(() => {
      if (!active) return;
      try {
        rec.start();
      } catch {
        // 이미 시작됨
      }
    }, 300);
  };

  try {
    rec.start();
  } catch {
    active = false;
  }
  return stop;
};
