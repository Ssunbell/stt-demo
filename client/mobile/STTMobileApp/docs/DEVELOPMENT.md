# 💻 개발자 가이드

## 목차
- [아키텍처 개요](#아키텍처-개요)
- [코드 구조](#코드-구조)
- [개발 워크플로우](#개발-워크플로우)
- [주요 컴포넌트](#주요-컴포넌트)
- [상태 관리](#상태-관리)
- [API 통신](#api-통신)
- [테스트](#테스트)
- [코딩 컨벤션](#코딩-컨벤션)
- [최적화 팁](#최적화-팁)

## 아키텍처 개요

### 전체 아키텍처

```
┌─────────────────────────────────────────┐
│           App.tsx (Root)                │
│  - 전역 상태 관리                        │
│  - 에러 핸들링                           │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────────┐      ┌──────▼──────┐
│ Components │      │    Hooks    │
│            │      │             │
│ - UI 표시  │◄─────┤ - 비즈니스  │
│ - 사용자   │      │   로직      │
│   상호작용 │      │ - 상태 관리 │
└────────────┘      └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Services  │
                    │             │
                    │ - WebSocket │
                    │ - Audio     │
                    └─────────────┘
```

### 데이터 흐름

```
User Action → Component → Hook → Service → Server
                  ▲                           │
                  │                           │
                  └───────────────────────────┘
                         (Response)
```

## 코드 구조

### 디렉토리 구조 상세

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── AudioRecorder/
│   │   └── index.tsx   # 녹음 컨트롤 UI
│   ├── StatusIndicator/
│   │   └── index.tsx   # 상태 표시 UI
│   ├── TranscriptView/
│   │   └── index.tsx   # 트랜스크립트 표시
│   └── ErrorDisplay/
│       └── index.tsx   # 에러 메시지 표시
│
├── hooks/              # 커스텀 React 훅
│   └── useRealTimeSTT.ts  # 메인 STT 로직
│
├── services/           # 비즈니스 로직 및 외부 통신
│   ├── WebSocketService.ts  # WebSocket 통신 관리
│   └── AudioService.ts      # 오디오 녹음 관리
│
├── types/              # TypeScript 타입 정의
│   └── index.ts
│
└── utils/              # 유틸리티 함수
    └── config.ts       # 설정 파일
```

## 개발 워크플로우

### 1. 새로운 기능 추가

```bash
# 1. 새 브랜치 생성
git checkout -b feature/new-feature

# 2. 타입 정의 추가 (필요한 경우)
# src/types/index.ts 수정

# 3. 서비스 레이어 구현 (필요한 경우)
# src/services/에 새 서비스 추가

# 4. 훅 구현 또는 수정
# src/hooks/에 새 훅 추가 또는 기존 훅 수정

# 5. 컴포넌트 구현
# src/components/에 새 컴포넌트 추가

# 6. 테스트
npm test

# 7. 커밋 및 푸시
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 2. 버그 수정

```bash
# 1. 버그 재현
# 2. 로그 확인
# 3. 수정
# 4. 테스트
# 5. 커밋
git commit -m "fix: resolve issue with ..."
```

## 주요 컴포넌트

### useRealTimeSTT Hook

메인 비즈니스 로직을 담당하는 커스텀 훅입니다.

```typescript
const {
  recordingState,      // 현재 녹음 상태
  transcripts,         // 변환된 텍스트 목록
  interimText,         // 중간 인식 결과
  error,               // 에러 메시지
  isConnected,         // WebSocket 연결 상태
  startRecording,      // 녹음 시작 함수
  stopRecording,       // 녹음 중지 함수
  clearTranscripts,    // 트랜스크립트 초기화
  clearError,          // 에러 초기화
} = useRealTimeSTT(serverUrl);
```

#### 내부 동작

1. **초기화**: WebSocket과 Audio 서비스 인스턴스 생성
2. **이벤트 리스너**: 서버 메시지, 연결 상태, 에러 핸들링
3. **상태 업데이트**: React 상태를 통한 UI 업데이트

### WebSocketService

WebSocket 연결 관리 클래스입니다.

```typescript
const wsService = new WebSocketService(url);

// 이벤트 리스너 등록
wsService.onMessage((message) => {
  // 메시지 처리
});

wsService.onConnection((connected) => {
  // 연결 상태 처리
});

wsService.onError((error) => {
  // 에러 처리
});

// 연결
await wsService.connect();

// 메시지 전송
wsService.send(message);

// 연결 해제
wsService.disconnect();
```

#### 주요 기능

- 자동 재연결 (최대 3회)
- 메시지 큐잉 (연결 끊김 시)
- 에러 핸들링

### AudioService

오디오 녹음 관리 클래스입니다.

```typescript
const audioService = new AudioService(config);

// 권한 요청
const hasPermission = await audioService.requestPermissions();

// 녹음 시작
await audioService.startRecording((audioData) => {
  // 오디오 데이터 처리
});

// 녹음 중지
const uri = await audioService.stopRecording();
```

#### 주요 기능

- 마이크 권한 관리
- 실시간 오디오 캡처
- 오디오 포맷 변환

## 상태 관리

### 상태 흐름

```typescript
// 1. 사용자 액션
onStart() → startRecording()

// 2. 상태 변경
setRecordingState(RecordingState.CONNECTING)

// 3. 서비스 호출
await wsService.connect()
await audioService.startRecording()

// 4. 상태 업데이트
setRecordingState(RecordingState.RECORDING)

// 5. 서버 응답
onMessage() → setTranscripts() / setInterimText()
```

### 상태 타입

```typescript
enum RecordingState {
  IDLE = 'idle',           // 대기
  CONNECTING = 'connecting', // 연결 중
  RECORDING = 'recording',   // 녹음 중
  PAUSED = 'paused',        // 일시 정지
  ERROR = 'error',          // 에러
}
```

## API 통신

### WebSocket 메시지 프로토콜

#### Client → Server

```typescript
// 스트리밍 시작
{
  event: 'start_stream',
  config: {
    sampleRate: 16000,
    encoding: 'pcm_s16le'
  }
}

// 오디오 데이터
{
  event: 'audio_data',
  payload: 'base64_encoded_audio...'
}

// 스트리밍 종료
{
  event: 'end_stream',
  reason: 'user_stop'
}
```

#### Server → Client

```typescript
// 트랜스크립트 (중간/최종)
{
  type: 'transcript',
  text: '안녕하세요',
  isFinal: false,
  confidence: 0.95
}

// 에러
{
  type: 'error',
  code: 500,
  message: 'STT Engine timeout'
}
```

### 메시지 처리 순서

1. **start_stream**: 클라이언트가 녹음 시작 시 전송
2. **audio_data**: 100-200ms 마다 오디오 청크 전송 (반복)
3. **transcript**: 서버가 인식 결과 반환 (비동기, 여러 번)
4. **end_stream**: 클라이언트가 녹음 종료 시 전송

## 테스트

### 단위 테스트

```typescript
// WebSocketService 테스트 예시
describe('WebSocketService', () => {
  it('should connect successfully', async () => {
    const ws = new WebSocketService('ws://localhost:8000');
    await expect(ws.connect()).resolves.not.toThrow();
  });

  it('should send message', () => {
    const ws = new WebSocketService('ws://localhost:8000');
    const message = { event: 'test', data: 'test' };
    expect(() => ws.send(message)).not.toThrow();
  });
});
```

### 통합 테스트

```typescript
// useRealTimeSTT 훅 테스트 예시
describe('useRealTimeSTT', () => {
  it('should start recording', async () => {
    const { result } = renderHook(() => useRealTimeSTT('ws://localhost:8000'));
    
    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.recordingState).toBe(RecordingState.RECORDING);
  });
});
```

### E2E 테스트

Detox 또는 Appium을 사용하여 E2E 테스트를 구현할 수 있습니다.

## 코딩 컨벤션

### TypeScript

```typescript
// ✅ 좋은 예
interface AudioConfig {
  sampleRate: number;
  channels: number;
}

const config: AudioConfig = {
  sampleRate: 16000,
  channels: 1,
};

// ❌ 나쁜 예
const config = {
  sampleRate: 16000,
  channels: 1,
};
```

### 네이밍

```typescript
// 컴포넌트: PascalCase
const AudioRecorder: React.FC = () => { ... };

// 훅: camelCase, use 접두사
const useRealTimeSTT = () => { ... };

// 서비스: PascalCase, Service 접미사
class WebSocketService { ... }

// 상수: UPPER_SNAKE_CASE
const MAX_RECONNECT_ATTEMPTS = 3;

// 변수/함수: camelCase
const isRecording = true;
const startRecording = () => { ... };
```

### 파일 구조

```typescript
// 1. Import 문
import React from 'react';
import { View } from 'react-native';

// 2. 타입 정의
interface Props {
  // ...
}

// 3. 상수
const DEFAULT_VALUE = 10;

// 4. 컴포넌트/함수
export const Component: React.FC<Props> = () => {
  // ...
};

// 5. 스타일
const styles = StyleSheet.create({
  // ...
});
```

### 주석

```typescript
/**
 * WebSocket 연결을 관리하는 서비스 클래스
 * 
 * @class WebSocketService
 * @param {string} url - WebSocket 서버 URL
 */
class WebSocketService {
  /**
   * 서버에 연결
   * 
   * @returns {Promise<void>}
   * @throws {Error} 연결 실패 시
   */
  async connect(): Promise<void> {
    // 구현
  }
}
```

## 최적화 팁

### 1. 메모이제이션

```typescript
// 컴포넌트 메모이제이션
export const AudioRecorder = React.memo<Props>(({ ... }) => {
  // ...
});

// 콜백 메모이제이션
const handleStart = useCallback(() => {
  startRecording();
}, [startRecording]);

// 값 메모이제이션
const processedTranscripts = useMemo(() => {
  return transcripts.map(process);
}, [transcripts]);
```

### 2. 렌더링 최적화

```typescript
// ✅ 좋은 예: 조건부 렌더링
{isRecording && <AudioVisualizer />}

// ❌ 나쁜 예: 불필요한 컴포넌트 마운트
<AudioVisualizer visible={isRecording} />
```

### 3. 메모리 관리

```typescript
useEffect(() => {
  const ws = new WebSocketService(url);
  
  // 정리 함수로 메모리 누수 방지
  return () => {
    ws.disconnect();
  };
}, [url]);
```

### 4. 배치 업데이트

```typescript
// ✅ 좋은 예: 배치 업데이트
setState(prev => ({
  ...prev,
  field1: value1,
  field2: value2,
}));

// ❌ 나쁜 예: 여러 번 업데이트
setState({ field1: value1 });
setState({ field2: value2 });
```

### 5. 이미지 최적화

```typescript
// 이미지 크기 최적화
<Image
  source={require('./image.png')}
  resizeMode="cover"
  style={{ width: 100, height: 100 }}
/>
```

## 디버깅

### React Native Debugger

1. React Native Debugger 설치
2. 앱에서 Dev Menu 열기 (iOS: Cmd+D, Android: Cmd+M)
3. "Debug" 선택

### Flipper

1. Flipper 설치
2. 앱 실행
3. Flipper에서 자동으로 연결

### 로그 확인

```typescript
// 개발 환경에서만 로그
if (__DEV__) {
  console.log('Debug info:', data);
}

// 프로덕션에서는 에러만
console.error('Error:', error);
```

## 배포 체크리스트

- [ ] 모든 테스트 통과
- [ ] Linter 오류 없음
- [ ] 서버 URL을 프로덕션으로 변경
- [ ] API 키 및 시크릿 확인
- [ ] 버전 번호 업데이트
- [ ] 변경 사항 문서화
- [ ] 성능 테스트 완료
- [ ] 메모리 누수 확인
- [ ] 크래시 리포팅 설정

## 추가 리소스

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Expo Best Practices](https://docs.expo.dev/guides/best-practices/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

