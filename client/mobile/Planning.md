# 📄 기술 설계서: Real-time Voice Streaming to STT

## 1\. 개요 (Overview)

  * **목표:** React Native 클라이언트에서 마이크 입력을 실시간으로 캡처하여 WebSocket을 통해 서버로 전송하고, 서버에서 STT 엔진(Google, AWS, Whisper 등)을 거쳐 변환된 텍스트를 즉시 클라이언트로 반환하여 표출한다.
  * **핵심 요구사항:**
      * **Low Latency:** 발화와 텍스트 출력 간 지연 시간 최소화.
      * **Binary Stream:** 오버헤드를 줄이기 위해 오디오 데이터를 Raw PCM 형태의 바이너리(혹은 Base64)로 전송.
      * **Partial Result:** 문장이 완성되기 전이라도 중간 인식 결과(Interim Results)를 보여주어 사용자 경험(UX) 향상.

## 2\. 시스템 아키텍처 (System Architecture)

데이터 흐름은 단방향 스트리밍이 아닌 **양방향 비동기 통신**입니다.

1.  **Client (React Native):** 오디오 샘플링(16kHz, Mono, PCM 16bit) → 버퍼링 → WebSocket 전송.
2.  **Transport (WebSocket):** 지속적인 연결 유지, 패킷 순서 보장.
3.  **Server (Node.js/Python):** 오디오 청크(Chunk) 수신 → STT 엔진 스트림에 파이프(Pipe) 연결.
4.  **STT Engine:** 오디오 분석 → 텍스트 변환 이벤트 발생.
5.  **Return Path:** 서버가 변환된 텍스트를 WebSocket을 통해 클라이언트로 Push.

## 3\. 인터페이스 프로토콜 (Protocol Design)

효율적인 통신을 위해 메시지 타입을 정의합니다. JSON 포맷을 기본으로 하되, 오디오 데이터는 바이너리로 전송합니다.

### 3.1. Client $\rightarrow$ Server

| 이벤트 타입 | 데이터 포맷 | 설명 |
| :--- | :--- | :--- |
| `connection` | Handshake | 소켓 연결 시도 |
| `start_stream` | JSON | `{ "sampleRate": 16000, "encoding": "pcm_s16le" }` <br> 스트리밍 시작 알림 및 메타데이터 전송 |
| `audio_data` | **Binary / Base64** | 실제 마이크 음성 데이터 청크 (약 100ms\~200ms 단위 권장) |
| `end_stream` | JSON | `{ "reason": "user_stop" }` <br> 녹음 종료 알림 |

### 3.2. Server $\rightarrow$ Client

| 이벤트 타입 | 데이터 포맷 | 설명 |
| :--- | :--- | :--- |
| `transcript` | JSON | `{ "text": "안녕하세요", "isFinal": false }` <br> `isFinal`: 문장 완성 여부 (중간 결과인지 확정 결과인지) |
| `error` | JSON | `{ "code": 500, "message": "STT Engine timeout" }` |

## 4\. 클라이언트 구현 상세 (React Native)

### 4.1. 기술 스택 선정 (Tech Stack)

  * **Language:** TypeScript (강력 권장)
  * **Library:**
      * `react-native-live-audio-stream`: 실시간 Raw PCM 데이터 추출에 유리함 (일반적인 `react-native-audio-recorder-player`는 파일 저장 위주라 스트리밍에 부적합할 수 있음).
      * `socket.io-client` 또는 Native `WebSocket`: 여기서는 표준 `WebSocket`을 기준으로 설명합니다.

### 4.2. 주요 구현 로직 (Code Snippet)

이 코드는 개념 증명(PoC) 레벨의 핵심 로직입니다.

```typescript
import LiveAudioStream from 'react-native-live-audio-stream';
import { useState, useRef, useEffect } from 'react';

// STT 설정 상수
const STT_CONFIG = {
  sampleRate: 16000, // 대부분의 STT 엔진 표준
  channels: 1,       // Mono
  bitsPerSample: 16, // PCM 16bit
  bufferSize: 4096,  // 버퍼 사이즈 (조절 필요)
  wavFile: '',       // 저장 안 함
};

export const useRealTimeSTT = () => {
  const [transcribedText, setTranscribedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. 오디오 초기화
    LiveAudioStream.init(STT_CONFIG);

    // 2. 오디오 데이터 수신 이벤트 리스너 (Chunk 단위)
    LiveAudioStream.on('data', (data) => {
      // data는 base64 encoded string으로 옴
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        // 서버로 전송
        ws.current.send(JSON.stringify({
           event: 'audio_data',
           payload: data 
        }));
      }
    });

    return () => {
        LiveAudioStream.stop();
        ws.current?.close();
    };
  }, []);

  const startRecording = () => {
    // 3. 웹소켓 연결
    ws.current = new WebSocket('wss://your-api-server.com/stt');

    ws.current.onopen = () => {
      console.log('Connected');
      // 시작 신호 전송
      ws.current?.send(JSON.stringify({ event: 'start_stream', config: STT_CONFIG }));
      
      // 녹음 시작
      LiveAudioStream.start();
      setIsRecording(true);
    };

    ws.current.onmessage = (e) => {
      // 4. 서버로부터 텍스트 수신
      const response = JSON.parse(e.data);
      if (response.type === 'transcript') {
        // 기존 텍스트에 덮어쓰거나 이어붙이기 (UX 정책에 따라 결정)
        // 예: isFinal이 true면 확정, false면 회색으로 표시 등
        setTranscribedText(prev => 
            response.isFinal ? prev + ' ' + response.text : prev + ' (' + response.text + ')'
        );
      }
    };
    
    ws.current.onerror = (e) => console.error('WebSocket Error', e);
  };

  const stopRecording = () => {
    LiveAudioStream.stop();
    ws.current?.send(JSON.stringify({ event: 'end_stream' }));
    setIsRecording(false);
    // 소켓은 잠시 후 닫거나 유지 (정책에 따름)
  };

  return { isRecording, transcribedText, startRecording, stopRecording };
};
```

## 5\. 서버 구현 고려사항 (Backend Considerations)

단순히 React Native 코드만으로는 완성되지 않습니다. 서버 사이드에서의 처리가 성능을 좌우합니다.

1.  **스트림 파이프라인 (Stream Pipeline):**
      * Node.js의 경우 `PassThrough` 스트림을 사용하여 WebSocket으로 들어오는 바이너리 청크를 즉시 STT SDK(Google Speech API 등)의 `recognizeStream`에 `write` 해줘야 합니다.
2.  **VAD (Voice Activity Detection):**
      * 사용자가 말을 멈추면(Silence), 불필요한 API 호출 비용을 아끼기 위해 서버단에서 침묵을 감지하여 STT 요청을 일시 중지하거나 세션을 끊는 로직이 필요합니다.
3.  **인코딩 (Encoding):**
      * 클라이언트에서 Base64로 보낼 경우, 서버에서는 다시 Buffer(Binary)로 디코딩하여 STT 엔진에 넘겨야 합니다. (CPU 오버헤드 주의)

## 6\. 20년차 개발자의 Pro Tips (개발 시 주의사항)

아래 내용은 주니어 개발자들이 자주 놓치는 부분입니다. 반드시 체크하십시오.

  * **⚠️ 권한(Permission) 처리:**
      * **iOS:** `Info.plist`에 `NSMicrophoneUsageDescription`을 반드시 상세히 적어야 리젝당하지 않습니다.
      * **Android:** `RECORD_AUDIO` 퍼미션을 런타임에 요청해야 합니다.
  * **⚠️ 오디오 샘플링 레이트 (Sample Rate):**
      * 일반적인 VoIP는 8kHz를 쓰지만, 최신 STT 엔진은 **16kHz**를 권장합니다. 44.1kHz나 48kHz는 데이터 양만 많아지고 인식률에 큰 도움이 되지 않으며 네트워크 대역폭만 낭비합니다.
  * **⚠️ 네트워크 불안정성 (Jitter & Packet Loss):**
      * WebSocket이 끊어졌을 때를 대비해 **재연결(Reconnection)** 로직이 필수입니다. 녹음 중 끊기면 로컬에 임시 버퍼링했다가 재연결 시 전송하는 큐(Queue) 시스템을 고려하세요.
  * **⚠️ UI UX:**
      * 사용자는 "내가 말하고 있는 게 듣고 있나?"를 궁금해합니다. \*\*오디오 파형(Visualizer)\*\*이나 볼륨 미터를 UI에 반드시 포함시켜 마이크가 정상 작동 중임을 시각적으로 피드백하세요.

## 7\. 결론 및 Next Step

이 문서를 바탕으로 개발을 시작한다면 다음 순서로 진행하는 것을 추천합니다.

1.  **서버:** WebSocket Echo 서버를 먼저 만들어 오디오 데이터가 바이너리로 잘 들어오는지 확인.
2.  **클라이언트:** `react-native-live-audio-stream`을 통해 마이크 권한을 얻고 로그에 Base64 데이터가 찍히는지 확인.
3.  **통합:** STT 엔진을 붙여 `Hello` 한마디가 텍스트로 돌아오는 레이턴시 측정.
