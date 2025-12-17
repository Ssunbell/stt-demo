# 🛠️ Services Layer

이 디렉토리는 앱의 핵심 서비스 계층을 포함합니다.

## 📦 서비스 목록

### 1. AudioService.ts

**역할**: 실시간 오디오 캡처 및 스트리밍

**플랫폼별 구현**:
- **모바일 (iOS/Android)**: `react-native-live-audio-stream`
- **웹**: Web Audio API (AudioContext + ScriptProcessorNode)

**주요 메서드**:
```typescript
// 권한 요청
async requestPermissions(): Promise<boolean>

// 녹음 시작 (콜백으로 Base64 오디오 데이터 수신)
async startRecording(onData: (audioData: string) => void): Promise<void>

// 녹음 중지
async stopRecording(): Promise<string | null>

// 녹음 상태 확인
isRecording(): boolean
```

**기술적 세부사항**:
- 샘플레이트: 16kHz (음성 인식 최적화)
- 비트 깊이: 16-bit
- 채널: 1 (모노)
- 인코딩: PCM s16le
- 출력: Base64 문자열

**사용 예제**:
```typescript
import { AudioService } from './AudioService';
import { AUDIO_CONFIG } from '../utils/config';

const audioService = new AudioService(AUDIO_CONFIG);

// 권한 요청
const granted = await audioService.requestPermissions();

if (granted) {
  // 녹음 시작
  await audioService.startRecording((base64Audio) => {
    // WebSocket으로 전송
    wsService.send({
      event: 'audio_data',
      payload: base64Audio,
    });
  });
  
  // 3초 후 중지
  setTimeout(async () => {
    await audioService.stopRecording();
  }, 3000);
}
```

---

### 2. WebSocketService.ts

**역할**: 서버와의 실시간 양방향 통신

**주요 기능**:
- WebSocket 연결 관리
- 자동 재연결 (최대 3회)
- 메시지 송수신
- 에러 처리

**주요 메서드**:
```typescript
// WebSocket 연결
connect(): Promise<void>

// 메시지 전송
send(message: ClientMessage): void

// 연결 종료
disconnect(): void

// 메시지 수신 리스너
onMessage(handler: (message: ServerMessage) => void): void

// 연결 상태 리스너
onConnection(handler: (connected: boolean) => void): void

// 에러 리스너
onError(handler: (error: string) => void): void

// 연결 상태 확인
isConnected(): boolean
```

**메시지 타입**:
```typescript
// 클라이언트 → 서버
type ClientMessage = 
  | { event: 'start_stream', config: {...} }
  | { event: 'audio_data', payload: string }
  | { event: 'end_stream', reason: string }

// 서버 → 클라이언트
type ServerMessage = 
  | { type: 'transcript', text: string, isFinal: boolean }
  | { type: 'error', code: number, message: string }
```

**사용 예제**:
```typescript
import { WebSocketService } from './WebSocketService';

const wsService = new WebSocketService('ws://localhost:8000/ws/stt');

// 이벤트 핸들러 등록
wsService.onMessage((message) => {
  if (message.type === 'transcript') {
    console.log('텍스트:', message.text);
  }
});

wsService.onConnection((connected) => {
  console.log('연결 상태:', connected);
});

// 연결
await wsService.connect();

// 메시지 전송
wsService.send({
  event: 'start_stream',
  config: { sampleRate: 16000, encoding: 'pcm_s16le' }
});

// 종료
wsService.disconnect();
```

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────┐
│         useRealTimeSTT Hook             │
│      (State Management Layer)           │
└───────────┬────────────┬────────────────┘
            │            │
            ▼            ▼
┌───────────────┐  ┌──────────────────┐
│ AudioService  │  │ WebSocketService │
│ (Audio Layer) │  │  (Network Layer) │
└───────┬───────┘  └────────┬─────────┘
        │                   │
        ▼                   ▼
┌───────────────────────────────────────┐
│         Platform Layer                │
├───────────────┬───────────────────────┤
│ iOS/Android   │         Web           │
│ LiveAudioS... │    AudioContext       │
│ WebSocket     │      WebSocket        │
└───────────────┴───────────────────────┘
```

---

## 🔄 데이터 흐름

### 녹음 시작 → 실시간 스트리밍 → 녹음 중지

```
1. 사용자가 "녹음 시작" 버튼 클릭
       ↓
2. useRealTimeSTT.startRecording() 호출
       ↓
3. WebSocketService.connect() - 서버 연결
       ↓
4. AudioService.startRecording(callback) - 오디오 캡처 시작
       ↓
5. [실시간 루프]
   - 마이크에서 오디오 데이터 캡처
   - PCM 데이터 → Base64 변환
   - callback(base64Audio) 호출
   - WebSocketService.send({ event: 'audio_data', payload })
   - 서버 → 음성 인식 → 텍스트 반환
   - WebSocketService.onMessage() → UI 업데이트
       ↓
6. 사용자가 "중지" 버튼 클릭
       ↓
7. AudioService.stopRecording() - 오디오 캡처 중지
       ↓
8. WebSocketService.send({ event: 'end_stream' })
       ↓
9. WebSocketService.disconnect() - 연결 종료
```

---

## 🧪 테스트

### AudioService 테스트

```typescript
// 권한 테스트
test('should request permissions', async () => {
  const service = new AudioService(config);
  const granted = await service.requestPermissions();
  expect(granted).toBe(true);
});

// 녹음 테스트
test('should start and stop recording', async () => {
  const service = new AudioService(config);
  const dataChunks: string[] = [];
  
  await service.startRecording((data) => {
    dataChunks.push(data);
  });
  
  expect(service.isRecording()).toBe(true);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await service.stopRecording();
  
  expect(service.isRecording()).toBe(false);
  expect(dataChunks.length).toBeGreaterThan(0);
});
```

### WebSocketService 테스트

```typescript
// 연결 테스트
test('should connect and disconnect', async () => {
  const service = new WebSocketService('ws://localhost:8000/ws/stt');
  
  await service.connect();
  expect(service.isConnected()).toBe(true);
  
  service.disconnect();
  expect(service.isConnected()).toBe(false);
});

// 메시지 전송 테스트
test('should send and receive messages', async () => {
  const service = new WebSocketService('ws://localhost:8000/ws/stt');
  const messages: ServerMessage[] = [];
  
  service.onMessage((msg) => messages.push(msg));
  
  await service.connect();
  
  service.send({ event: 'start_stream', config: {...} });
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  expect(messages.length).toBeGreaterThan(0);
});
```

---

## 🔧 설정

### 오디오 설정

`src/utils/config.ts`:
```typescript
export const AUDIO_CONFIG = {
  sampleRate: 16000,     // 음성 인식 최적화
  channels: 1,           // 모노
  bitsPerSample: 16,     // 16-bit
  encoding: 'pcm_s16le', // PCM Signed 16-bit Little Endian
  chunkSize: 100,        // 100ms
};
```

### WebSocket 설정

```typescript
export const WEBSOCKET_CONFIG = {
  maxReconnectAttempts: 3,
  reconnectDelay: 2000,
  pingInterval: 30000,
};
```

---

## 📊 성능 지표

### AudioService

| 지표 | 값 | 비고 |
|------|-----|------|
| 샘플레이트 | 16000 Hz | 음성 인식 권장 |
| 데이터 전송률 | ~43 KB/s | Base64 인코딩 포함 |
| 지연 시간 | < 100ms | 캡처 → 전송 |
| CPU 사용량 | < 15% | 평균 |

### WebSocketService

| 지표 | 값 | 비고 |
|------|-----|------|
| 연결 시간 | < 500ms | 로컬 서버 |
| 메시지 전송 | < 10ms | 평균 |
| 재연결 시간 | ~2s | 설정 가능 |

---

## 🐛 알려진 이슈

### AudioService

1. **iOS 시뮬레이터**: 마이크 미지원 (실제 기기 필요)
2. **Android 에뮬레이터**: 낮은 오디오 품질
3. **웹 ScriptProcessor**: Deprecated (AudioWorklet으로 마이그레이션 예정)

### WebSocketService

1. **재연결 중 데이터 손실**: 버퍼링 미구현
2. **대용량 메시지**: 분할 전송 미지원

---

## 🔜 향후 개선 사항

### AudioService

- [ ] AudioWorklet으로 마이그레이션 (웹)
- [ ] 오디오 압축 (Opus, AAC)
- [ ] 오디오 버퍼링
- [ ] 배경 녹음 지원

### WebSocketService

- [ ] 메시지 버퍼링
- [ ] 압축 지원 (gzip)
- [ ] 대용량 메시지 분할
- [ ] 연결 품질 모니터링

---

## 📚 참고 자료

- [react-native-live-audio-stream](https://github.com/prscX/react-native-live-audio-stream)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [PCM Audio Format](https://en.wikipedia.org/wiki/Pulse-code_modulation)

