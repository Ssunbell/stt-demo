# 🎙️ 실시간 오디오 스트리밍 가이드

이 문서는 `react-native-live-audio-stream`을 사용한 실시간 오디오 스트리밍 구현에 대한 가이드입니다.

## 📋 목차

1. [개요](#개요)
2. [설치](#설치)
3. [플랫폼별 구현](#플랫폼별-구현)
4. [사용 방법](#사용-방법)
5. [문제 해결](#문제-해결)

---

## 개요

### 구현 방식

| 플랫폼 | 라이브러리/API | 특징 |
|--------|---------------|------|
| **iOS/Android** | `react-native-live-audio-stream` | 실시간 PCM 오디오 스트리밍 |
| **Web** | Web Audio API (AudioContext) | 브라우저 네이티브 오디오 처리 |

### 오디오 형식

- **샘플레이트**: 16000 Hz (음성 인식 최적화)
- **채널**: 1 (모노)
- **비트 깊이**: 16 bit
- **인코딩**: PCM s16le (Signed 16-bit Little Endian)
- **전송 형식**: Base64

---

## 설치

### 1. 의존성 설치

```bash
cd /path/to/STTMobileApp
npm install react-native-live-audio-stream
```

### 2. iOS 설정 (iOS만 해당)

`ios/Podfile`에서 권한 추가:

```ruby
# 마이크 권한
pod 'Permission-Microphone', :path => '../node_modules/react-native-permissions/ios/Microphone'
```

`ios/STTMobileApp/Info.plist`에 마이크 권한 설명 추가:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>음성을 녹음하여 실시간으로 텍스트로 변환합니다.</string>
```

Pod 설치:

```bash
cd ios && pod install && cd ..
```

### 3. Android 설정

`android/app/src/main/AndroidManifest.xml`에 권한 추가:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

---

## 플랫폼별 구현

### 🤖 Android / 🍎 iOS - react-native-live-audio-stream

```typescript
import LiveAudioStream from 'react-native-live-audio-stream';

// 초기화
LiveAudioStream.init({
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  audioSource: 6, // VOICE_RECOGNITION (Android)
  bufferSize: 4096,
});

// 오디오 데이터 리스너
LiveAudioStream.on('data', (base64AudioData: string) => {
  // base64로 인코딩된 PCM 데이터를 WebSocket으로 전송
  websocket.send(JSON.stringify({
    event: 'audio_data',
    payload: base64AudioData,
  }));
});

// 녹음 시작
LiveAudioStream.start();

// 녹음 중지
LiveAudioStream.stop();
LiveAudioStream.off('data');
```

### 🌐 Web - Web Audio API

```typescript
// AudioContext 생성
const audioContext = new AudioContext({ sampleRate: 16000 });

// 마이크 스트림 획득
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    sampleRate: 16000,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
  },
});

// MediaStream을 AudioContext에 연결
const source = audioContext.createMediaStreamSource(stream);
const processor = audioContext.createScriptProcessor(4096, 1, 1);

// 실시간 오디오 처리
processor.onaudioprocess = (e) => {
  const inputData = e.inputBuffer.getChannelData(0);
  
  // Float32 -> Int16 변환
  const pcmData = convertFloat32ToInt16(inputData);
  
  // Base64 인코딩
  const base64Audio = arrayBufferToBase64(pcmData.buffer);
  
  // WebSocket 전송
  websocket.send(JSON.stringify({
    event: 'audio_data',
    payload: base64Audio,
  }));
};

source.connect(processor);
processor.connect(audioContext.destination);
```

---

## 사용 방법

### AudioService 사용 예제

```typescript
import { AudioService } from './services/AudioService';
import { AUDIO_CONFIG } from './utils/config';

// AudioService 인스턴스 생성
const audioService = new AudioService(AUDIO_CONFIG);

// 권한 요청
const hasPermission = await audioService.requestPermissions();
if (!hasPermission) {
  console.error('마이크 권한이 필요합니다.');
  return;
}

// 녹음 시작
await audioService.startRecording((base64AudioData) => {
  // WebSocket으로 오디오 데이터 전송
  if (wsService.isConnected()) {
    wsService.send({
      event: 'audio_data',
      payload: base64AudioData,
    });
  }
});

// 녹음 중지
await audioService.stopRecording();
```

### useRealTimeSTT Hook 사용

```typescript
import { useRealTimeSTT } from './hooks/useRealTimeSTT';

function App() {
  const {
    recordingState,
    transcripts,
    interimText,
    error,
    isConnected,
    startRecording,
    stopRecording,
  } = useRealTimeSTT('ws://localhost:8000/ws/stt');

  return (
    <View>
      <Button 
        title={recordingState === 'recording' ? '중지' : '녹음 시작'}
        onPress={recordingState === 'recording' ? stopRecording : startRecording}
      />
      <Text>{interimText}</Text>
      {transcripts.map(t => (
        <Text key={t.id}>{t.text}</Text>
      ))}
    </View>
  );
}
```

---

## 문제 해결

### 1. Android에서 녹음이 시작되지 않음

**증상**: `LiveAudioStream.start()` 호출 후 오디오 데이터가 수신되지 않음

**해결 방법**:
- 마이크 권한이 부여되었는지 확인
- `android/app/src/main/AndroidManifest.xml`에 `RECORD_AUDIO` 권한 추가
- 앱 재시작

### 2. iOS에서 "Microphone permission not granted" 오류

**증상**: 권한 요청 팝업이 표시되지 않음

**해결 방법**:
- `Info.plist`에 `NSMicrophoneUsageDescription` 추가
- 앱 삭제 후 재설치 (권한 캐시 초기화)

### 3. 웹에서 AudioContext가 자동 재생 정책에 의해 차단됨

**증상**: "The AudioContext was not allowed to start" 오류

**해결 방법**:
- 사용자 제스처(버튼 클릭 등) 후에만 `startRecording()` 호출
- AudioContext를 resume 해야 할 수 있음:

```typescript
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}
```

### 4. 오디오 데이터가 너무 빠르게 전송됨

**증상**: 서버가 과부하되거나 네트워크 대역폭 초과

**해결 방법**:
- `bufferSize` 증가 (4096 → 8192)
- 샘플레이트 감소 (16000 → 8000)
- 청크 압축 고려

### 5. 오디오 품질이 낮음

**증상**: 음성 인식 정확도가 낮음

**해결 방법**:
- 노이즈 제거 활성화 (웹만 해당):
  ```typescript
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  }
  ```
- `audioSource: 6` 사용 (Android - VOICE_RECOGNITION)

---

## 추가 리소스

- [react-native-live-audio-stream GitHub](https://github.com/prscX/react-native-live-audio-stream)
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [AudioContext - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
- [ScriptProcessorNode - MDN](https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode)

---

## 성능 최적화

### 1. 버퍼 크기 조정

- **작은 버퍼** (2048): 낮은 지연시간, 높은 CPU 사용
- **큰 버퍼** (8192): 높은 지연시간, 낮은 CPU 사용
- **권장**: 4096 (균형)

### 2. 샘플레이트 선택

- **8000 Hz**: 전화 품질, 가장 낮은 대역폭
- **16000 Hz**: 음성 인식 권장 (최적)
- **44100 Hz**: CD 품질, 불필요하게 높음

### 3. 네트워크 최적화

- WebSocket 연결 재사용
- 오디오 청크 배칭 (여러 청크를 한 번에 전송)
- 압축 고려 (Opus, AAC 등)

---

**작성일**: 2024-12-14
**버전**: 1.0.0

