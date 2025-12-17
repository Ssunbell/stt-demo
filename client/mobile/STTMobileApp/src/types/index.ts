// WebSocket 메시지 타입 정의
export interface StartStreamMessage {
  event: 'start_stream';
  config: {
    sampleRate: number;
    encoding: string;
  };
}

export interface AudioDataMessage {
  event: 'audio_data';
  payload: string; // Base64 encoded audio data
}

export interface EndStreamMessage {
  event: 'end_stream';
  reason: string;
}

export type ClientMessage = StartStreamMessage | AudioDataMessage | EndStreamMessage;

// 서버 응답 타입
export interface TranscriptMessage {
  type: 'transcript';
  text: string;
  isFinal: boolean;
  confidence?: number;
}

export interface ErrorMessage {
  type: 'error';
  code: number;
  message: string;
}

export type ServerMessage = TranscriptMessage | ErrorMessage;

// 녹음 상태
export enum RecordingState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  RECORDING = 'recording',
  PAUSED = 'paused',
  ERROR = 'error',
}

// 트랜스크립트 아이템
export interface TranscriptItem {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
}

// 오디오 설정
export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  encoding: string;
}

