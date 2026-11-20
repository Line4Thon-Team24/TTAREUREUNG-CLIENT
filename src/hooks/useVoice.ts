import { useEffect, useRef, useState } from 'react';
import {
  cancelSpeech,
  requestMicPermission,
  speak,
  startListening,
  type VoiceAction,
} from '@/utils/speech';

type UseVoiceOptions = {
  text?: string | null; // 화면에 들어오면 읽어 줄 문장
  commands?: Partial<Record<VoiceAction, () => void>>; // 받을 명령과 할 일
  enabled?: boolean; // false면 읽지도 듣지도 않음
  restartKey?: number; // 값이 바뀌면 처음부터 다시 읽고 듣기 (명령을 처리하지 못했을 때)
};

// 화면 음성 처리: 문장을 읽고(TTS), 읽기가 끝난 뒤에 명령을 듣는다(STT)
// - 소리와 마이크를 동시에 켜면 스피커 소리를 마이크가 듣기 때문에 순서를 지킴
// - 화면을 나가거나 text가 바뀌면 읽기·듣기를 모두 끊음
// - 명령 하나가 들리면 듣기를 멈춤 (다시 듣게 하려면 text나 enabled가 바뀌어야 함)
export default function useVoice({
  text,
  commands,
  enabled = true,
  restartKey = 0,
}: UseVoiceOptions) {
  const [isMicDenied, setIsMicDenied] = useState(false);
  // 끝까지 읽은 문장 (읽는 도중 끊기거나 text가 바뀌면 비움)
  const [spokenText, setSpokenText] = useState<string | null>(null);
  // 렌더마다 바뀌는 핸들러 때문에 듣기가 재시작되지 않도록 ref에 보관
  const commandsRef = useRef(commands);
  useEffect(() => {
    commandsRef.current = commands;
  });

  const actions = Object.keys(commands ?? {})
    .sort()
    .join(',');

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let stopListening = () => {};

    const run = async () => {
      // 듣기가 필요하면 마이크 허용 팝업은 읽는 동안 미리 띄움 (듣기 시작은 읽기가 끝난 뒤)
      const micPromise = actions ? requestMicPermission() : null;
      if (text) {
        await speak(text);
        if (!cancelled) setSpokenText(text);
      }
      if (micPromise && !(await micPromise)) {
        if (!cancelled) setIsMicDenied(true);
        return;
      }
      if (cancelled || !actions) return;
      stopListening = startListening(
        actions.split(',') as VoiceAction[],
        (action) => commandsRef.current?.[action]?.(),
        () => setIsMicDenied(true)
      );
    };
    void run();

    return () => {
      cancelled = true;
      setSpokenText(null);
      stopListening();
      cancelSpeech();
    };
  }, [text, actions, enabled, restartKey]);

  // 읽을 문장이 없거나 끝까지 읽었으면 true (읽기가 끝난 뒤에 화면을 넘길 때 사용)
  const isSpoken = !enabled || !text || spokenText === text;
  return { isMicDenied, isSpoken };
}
