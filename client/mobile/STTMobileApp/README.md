# 🎤 STT Mobile App

실시간 음성-텍스트 변환(Speech-to-Text) 모바일 애플리케이션입니다.

## 📋 개요

이 앱은 사용자의 음성을 실시간으로 텍스트로 변환하여 보여주는 React Native (Expo) 기반 모바일 애플리케이션입니다.

### 주요 기능

- ✅ **실시간 오디오 스트리밍**: 마이크를 통한 실시간 PCM 오디오 캡처 및 스트리밍
- ✅ **크로스 플랫폼 지원**: iOS, Android, Web 모두 지원
- ✅ **WebSocket 통신**: 서버와의 실시간 양방향 통신
- ✅ **중간/최종 결과 표시**: 음성 인식 중간 결과와 최종 결과를 구분하여 표시
- ✅ **저지연 처리**: 16kHz 샘플레이트로 최적화된 음성 인식
- ✅ **자동 재연결**: 네트워크 불안정 시 자동 재연결
- ✅ **권한 관리**: iOS/Android 마이크 권한 자동 처리
- ✅ **노이즈 제거**: 에코 캔슬레이션 및 노이즈 억제 (웹)

## 🛠 기술 스택

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Audio**: 
  - 모바일: `react-native-live-audio-stream` (실시간 PCM 스트리밍)
  - 웹: Web Audio API (AudioContext)
  - Fallback: `expo-av`
- **Network**: Native WebSocket
- **State Management**: React Hooks

## 📂 프로젝트 구조

```
STTMobileApp/
├── src/
│   ├── components/        # UI 컴포넌트
│   │   ├── AudioRecorder/ # 녹음 컨트롤
│   │   ├── StatusIndicator/ # 상태 표시
│   │   ├── TranscriptView/ # 트랜스크립트 뷰
│   │   └── ErrorDisplay/  # 에러 표시
│   ├── hooks/            # 커스텀 훅
│   │   └── useRealTimeSTT.ts # STT 메인 로직
│   ├── services/         # 서비스 계층
│   │   ├── WebSocketService.ts # WebSocket 통신
│   │   └── AudioService.ts # 오디오 녹음
│   ├── types/            # TypeScript 타입 정의
│   │   ├── index.ts
│   │   └── react-native-live-audio-stream.d.ts
│   └── utils/            # 유틸리티 함수
├── App.tsx               # 메인 앱 컴포넌트
├── app.json              # Expo 설정
└── package.json
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 16.x 이상
- npm 또는 yarn
- Expo CLI
- iOS: Xcode (macOS 필요)
- Android: Android Studio

### 설치

1. 의존성 설치:
```bash
cd STTMobileApp
npm install
```

2. iOS Pod 설치 (iOS만 해당):
```bash
cd ios
pod install
cd ..
```

3. 서버 URL 설정:
`src/utils/config.ts` 파일에서 서버 URL을 실제 서버 주소로 변경하세요:
```typescript
// 실제 기기 테스트 시 컴퓨터의 로컬 IP로 변경
const DEV_SERVER_HOST = '192.168.1.100'; // 예시
```

### 실행

#### iOS 시뮬레이터
```bash
npm run ios
```

#### Android 에뮬레이터
```bash
npm run android
```

#### 웹 (개발/테스트용)
```bash
npm run web
```

#### Expo Go로 실행
```bash
npm start
```

그 다음 Expo Go 앱에서 QR 코드를 스캔하세요.

## 📱 사용 방법

1. **앱 실행**: 앱을 실행하면 마이크 권한을 요청합니다.
2. **권한 허용**: "허용"을 눌러 마이크 권한을 부여합니다.
3. **녹음 시작**: "녹음 시작" 버튼을 눌러 음성 녹음을 시작합니다.
4. **실시간 변환 확인**: 말하는 내용이 실시간으로 텍스트로 변환되어 화면에 표시됩니다.
5. **녹음 중지**: "녹음 중지" 버튼을 눌러 녹음을 종료합니다.
6. **텍스트 지우기**: "지우기" 버튼으로 변환된 텍스트를 모두 삭제할 수 있습니다.

## 🔧 설정

### 오디오 설정 변경

`src/utils/config.ts`에서 오디오 설정을 변경할 수 있습니다:

```typescript
export const AUDIO_CONFIG = {
  sampleRate: 16000,     // 샘플링 레이트 (8000, 16000, 44100)
  channels: 1,           // 채널 수 (1: Mono, 2: Stereo)
  bitsPerSample: 16,     // 비트 깊이 (8, 16)
  encoding: 'pcm_s16le', // 인코딩 방식
  chunkSize: 100,        // 청크 크기 (ms)
};
```

#### 권장 설정:

**음성 인식 (기본)**:
- 샘플레이트: 16000 Hz
- 채널: 1 (모노)
- 비트: 16

**저대역폭 네트워크**:
- 샘플레이트: 8000 Hz
- 채널: 1
- 비트: 8

### WebSocket 재연결 설정

`src/utils/config.ts`에서 재연결 설정을 변경할 수 있습니다:

```typescript
export const WEBSOCKET_CONFIG = {
  maxReconnectAttempts: 3,  // 최대 재연결 시도 횟수
  reconnectDelay: 2000,      // 재연결 대기 시간 (ms)
  pingInterval: 30000,       // Ping 주기 (ms)
};
```

## 🔐 권한

### iOS
- `NSMicrophoneUsageDescription`: 마이크 권한 설명
- `NSSpeechRecognitionUsageDescription`: 음성 인식 권한 설명

### Android
- `RECORD_AUDIO`: 오디오 녹음 권한
- `INTERNET`: 네트워크 통신 권한

권한 설정은 `app.json` 파일에서 관리됩니다.

## ⚠️ Expo Go 제한사항

**중요**: 이 앱은 `react-native-live-audio-stream` 네이티브 모듈을 사용하므로 **Expo Go에서는 작동하지 않습니다**.

### 해결 방법:

1. **웹에서 테스트** (가장 빠름) ⭐️ 권장
   ```bash
   npm run web
   ```

2. **로컬 네이티브 빌드**
   ```bash
   npx expo run:ios
   # 또는
   npx expo run:android
   ```

3. **EAS Development Build**
   ```bash
   eas build --profile development
   ```

자세한 내용은 [EXPO_GO_GUIDE.md](./EXPO_GO_GUIDE.md)를 참고하세요.

---

## 🐛 알려진 이슈 및 제한사항

1. **Expo Go 호환성**: 네이티브 모듈 사용으로 Expo Go 미지원 (위 해결 방법 참고)

2. **iOS 시뮬레이터**: 마이크가 지원되지 않아 실제 기기에서 테스트해야 합니다.

3. **Android 에뮬레이터**: 오디오 품질이 낮을 수 있으며, 실제 기기 사용을 권장합니다.

4. **네트워크 안정성**: WebSocket 연결은 네트워크 상태에 민감합니다. 불안정한 네트워크에서는 자동 재연결이 작동하지만, 재연결 중 일부 오디오 데이터가 손실될 수 있습니다.

5. **배터리 소모**: 연속적인 녹음과 네트워크 전송은 배터리를 많이 소모할 수 있습니다.

6. **웹 브라우저**: 자동 재생 정책으로 인해 사용자 제스처(버튼 클릭) 후에만 녹음을 시작할 수 있습니다.

## 🔄 다음 단계

현재 구현은 완전한 실시간 오디오 스트리밍을 지원합니다. 다음 기능들을 추가로 개발할 수 있습니다:

- [x] 실시간 오디오 스트리밍 (react-native-live-audio-stream)
- [x] 크로스 플랫폼 지원 (iOS/Android/Web)
- [ ] 오프라인 모드 지원
- [ ] 음성 명령 지원 ("줄바꿈", "마침표" 등)
- [ ] 다국어 지원
- [ ] 커스텀 단어장
- [ ] 텍스트 편집 및 저장 기능
- [ ] 클라우드 동기화
- [ ] 오디오 압축 (Opus, AAC 등)

## 📚 참고 문서

### 프로젝트 문서

- [PRD (제품 요구사항 문서)](../PRD.md)
- [기술 설계서](../Planning.md)
- [Expo Go 사용자 가이드](./EXPO_GO_GUIDE.md) ⭐️ **필독!**
- [빠른 시작 가이드](./QUICKSTART_STREAMING.md) ⭐️ **권장**
- [오디오 스트리밍 가이드](./AUDIO_STREAMING_GUIDE.md)
- [테스트 가이드](./TESTING_GUIDE.md)
- [구현 요약](./IMPLEMENTATION_SUMMARY.md)
- [문제 해결 가이드](./TROUBLESHOOTING.md)
- [오디오 장치 가이드](./AUDIO_DEVICE_GUIDE.md)

### 외부 문서

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [react-native-live-audio-stream](https://github.com/prscX/react-native-live-audio-stream)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 🤝 기여

이 프로젝트에 기여하고 싶으시다면:

1. 이슈를 먼저 생성하여 논의해주세요.
2. Fork하고 feature branch를 만드세요.
3. 변경사항을 커밋하고 PR을 생성하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📞 연락처

문제가 있거나 질문이 있으시면 이슈를 생성해주세요.

