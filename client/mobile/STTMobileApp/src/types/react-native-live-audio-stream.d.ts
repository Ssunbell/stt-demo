/**
 * react-native-live-audio-stream 타입 정의
 * 
 * @see https://github.com/prscX/react-native-live-audio-stream
 */

declare module 'react-native-live-audio-stream' {
  interface AudioStreamOptions {
    /**
     * 샘플레이트 (Hz)
     * 기본값: 44100
     * 권장값: 16000 (음성 인식용)
     */
    sampleRate: number;

    /**
     * 채널 수
     * 1 = 모노, 2 = 스테레오
     */
    channels: 1 | 2;

    /**
     * 비트 깊이
     * 8 또는 16
     */
    bitsPerSample: 8 | 16;

    /**
     * 오디오 소스 (Android only)
     * 0 = DEFAULT
     * 1 = MIC
     * 6 = VOICE_RECOGNITION
     * 7 = VOICE_COMMUNICATION
     */
    audioSource?: number;

    /**
     * 버퍼 크기
     * 기본값: 2048
     */
    bufferSize?: number;
  }

  interface LiveAudioStream {
    /**
     * 오디오 스트림 초기화
     */
    init(options: AudioStreamOptions): void;

    /**
     * 녹음 시작
     */
    start(): void;

    /**
     * 녹음 중지
     */
    stop(): void;

    /**
     * 이벤트 리스너 등록
     * @param event 'data' - 오디오 데이터 수신 이벤트
     * @param callback 콜백 함수 (base64 인코딩된 PCM 데이터)
     */
    on(event: 'data', callback: (data: string) => void): void;

    /**
     * 이벤트 리스너 제거
     */
    off(event: 'data'): void;
  }

  const LiveAudioStream: LiveAudioStream;
  export default LiveAudioStream;
}

