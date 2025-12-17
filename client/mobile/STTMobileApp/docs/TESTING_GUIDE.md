# 🧪 오디오 스트리밍 테스트 가이드

이 문서는 실시간 오디오 스트리밍 기능을 테스트하는 방법을 설명합니다.

## 📋 사전 준비

### 1. 서버 실행

먼저 백엔드 서버가 실행 중이어야 합니다:

```bash
# 서버 디렉토리로 이동
cd /Users/lucas/workspace/stt-demo/server

# 서버 실행
python main.py
```

서버가 `http://localhost:8000`에서 실행되는지 확인합니다.

### 2. 의존성 확인

```bash
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp

# node_modules 확인
ls node_modules | grep react-native-live-audio-stream

# 없다면 설치
npm install
```

---

## 🌐 웹에서 테스트

### 1. 웹 앱 실행

```bash
npm run web
```

브라우저가 자동으로 열립니다 (일반적으로 `http://localhost:19006`)

### 2. 테스트 순서

1. **마이크 권한 허용**
   - 브라우저에서 마이크 권한 요청 팝업이 표시됨
   - "허용" 클릭

2. **녹음 시작**
   - "녹음 시작" 버튼 클릭
   - 상태 표시기가 "연결 중..." → "녹음 중"으로 변경
   - 브라우저 콘솔을 열어 로그 확인:
     ```
     ✅ Web Audio API 실시간 스트리밍 시작
     WebSocket: CONNECTED
     📤 Sent: {"event":"audio_data","payload":"..."}
     ```

3. **음성 테스트**
   - 마이크에 대고 말하기: "안녕하세요, 테스트입니다"
   - 실시간으로 텍스트가 표시되는지 확인

4. **녹음 중지**
   - "중지" 버튼 클릭
   - 로그 확인:
     ```
     ✅ Web recording stopped
     WebSocket: DISCONNECTED
     ```

### 3. 디버깅 (웹)

개발자 도구 열기 (F12) → Console 탭:

```javascript
// AudioContext 상태 확인
console.log('AudioContext state:', audioContext.state);

// WebSocket 연결 상태 확인
console.log('WebSocket state:', ws.readyState);
// 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED

// 오디오 데이터 전송 확인
// Network 탭 → WS 필터 → 메시지 확인
```

---

## 📱 iOS에서 테스트

### 1. iOS 시뮬레이터 실행

```bash
# Expo 앱 실행
npm run ios
```

### 2. 실제 기기에서 테스트 (권장)

iOS 시뮬레이터는 마이크를 지원하지 않으므로, 실제 기기에서 테스트하는 것이 좋습니다.

```bash
# Expo Go 앱 설치 (App Store에서)
# QR 코드 스캔
npm start
```

서버 URL 변경 (`src/utils/config.ts`):

```typescript
// 실제 기기에서 테스트 시 컴퓨터의 로컬 IP로 변경
const DEV_SERVER_HOST = '192.168.1.100'; // 예시
```

로컬 IP 확인:

```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# 출력 예시: inet 192.168.1.100
```

### 3. 테스트 순서

1. **앱 실행 및 권한 허용**
   - 마이크 권한 요청 팝업 → "허용"

2. **녹음 시작**
   - "녹음 시작" 버튼 탭
   - 상태: "연결 중..." → "녹음 중"

3. **음성 테스트**
   - 아이폰 마이크에 대고 말하기
   - 실시간 텍스트 확인

4. **로그 확인**
   - Expo 터미널에서 로그 확인:
     ```
     LOG  ✅ 모바일 실시간 오디오 스트리밍 시작 (LiveAudioStream)
     LOG  WebSocket: CONNECTED
     ```

### 4. 문제 해결 (iOS)

**권한이 요청되지 않는 경우**:

1. `Info.plist` 확인:
   ```bash
   cat ios/STTMobileApp/Info.plist | grep Microphone
   ```

2. 앱 삭제 후 재설치

**"LiveAudioStream module not initialized" 오류**:

```bash
cd ios
pod install
cd ..
npm run ios
```

---

## 🤖 Android에서 테스트

### 1. Android 에뮬레이터 실행

```bash
npm run android
```

### 2. 실제 기기에서 테스트

USB 디버깅 활성화 후:

```bash
# 기기 연결 확인
adb devices

# 앱 실행
npm run android
```

또는 Expo Go 사용:

```bash
npm start
# QR 코드 스캔
```

### 3. 테스트 순서

iOS와 동일하게 진행

### 4. 로그 확인 (Android)

```bash
# 실시간 로그 확인
adb logcat | grep -i "audio\|websocket\|stt"

# 또는 Expo 터미널에서 확인
```

### 5. 문제 해결 (Android)

**권한이 거부되는 경우**:

1. `AndroidManifest.xml` 확인:
   ```bash
   cat android/app/src/main/AndroidManifest.xml | grep RECORD_AUDIO
   ```

2. 앱 설정에서 수동으로 마이크 권한 허용:
   - 설정 → 앱 → STTMobileApp → 권한 → 마이크

**"AudioRecord" 관련 오류**:

```bash
# 앱 재빌드
cd android
./gradlew clean
cd ..
npm run android
```

---

## 🔍 통합 테스트 체크리스트

### ✅ 기본 기능

- [ ] 앱이 정상적으로 실행됨
- [ ] 마이크 권한이 요청됨
- [ ] "녹음 시작" 버튼이 작동함
- [ ] WebSocket 연결이 성공함
- [ ] 상태 표시기가 올바르게 업데이트됨

### ✅ 오디오 스트리밍

- [ ] 오디오 데이터가 서버로 전송됨 (로그 확인)
- [ ] 오디오 품질이 적절함 (왜곡/노이즈 없음)
- [ ] 실시간으로 텍스트 변환이 표시됨
- [ ] 중간 결과(interim)와 최종 결과(final)가 구분됨

### ✅ 녹음 중지

- [ ] "중지" 버튼이 작동함
- [ ] WebSocket 연결이 정상적으로 종료됨
- [ ] 오디오 리소스가 해제됨 (메모리 누수 없음)
- [ ] 상태가 "idle"로 돌아감

### ✅ 에러 처리

- [ ] 마이크 권한이 거부되면 오류 메시지 표시
- [ ] WebSocket 연결 실패 시 오류 메시지 표시
- [ ] 네트워크 끊김 시 재연결 시도
- [ ] 에러 발생 시 상태가 "error"로 변경됨

### ✅ 성능

- [ ] 지연 시간이 1초 미만
- [ ] CPU 사용량이 적절함
- [ ] 배터리 소모가 과도하지 않음
- [ ] 장시간 사용 시 안정적임

---

## 🐛 디버깅 도구

### 1. 로그 확인

**콘솔 로그 활성화** (`src/utils/logger.ts`):

```typescript
export const LOG_CONFIG = {
  enableLogging: true, // 항상 활성화
  logLevel: 'debug',
};
```

**로그 필터링**:

```bash
# 웹
# 브라우저 콘솔에서: Settings → Console → Filter
# 입력: audio|websocket|stt

# iOS
# Xcode → Window → Devices and Simulators → 기기 선택 → Open Console

# Android
adb logcat | grep -E "audio|websocket|stt"
```

### 2. 네트워크 모니터링

**웹**:
- 개발자 도구 → Network 탭 → WS 필터
- WebSocket 메시지 확인

**React Native Debugger**:

```bash
# React Native Debugger 설치
brew install --cask react-native-debugger

# 실행
open "rndebugger://set-debugger-loc?host=localhost&port=19000"
```

### 3. 오디오 데이터 확인

**서버 로그**:

```bash
# 서버 터미널에서
# 수신된 오디오 데이터 크기 확인
```

**클라이언트 로그**:

```typescript
// AudioService.ts에 추가
console.log('Audio chunk size:', base64Audio.length);
```

---

## 📊 성능 테스트

### 1. 오디오 품질 테스트

다양한 환경에서 테스트:

- [ ] 조용한 환경
- [ ] 소음이 있는 환경
- [ ] 여러 사람이 동시에 말하는 환경
- [ ] 먼 거리에서 말하기

### 2. 네트워크 테스트

다양한 네트워크 조건:

- [ ] Wi-Fi (안정적인 연결)
- [ ] 4G/5G (모바일 데이터)
- [ ] 느린 네트워크 (3G 시뮬레이션)
- [ ] 불안정한 연결 (끊김/재연결)

**네트워크 시뮬레이션** (크롬):

1. 개발자 도구 → Network 탭
2. Throttling 선택: "Slow 3G", "Fast 3G", "Offline" 등

### 3. 장시간 테스트

- [ ] 10분 이상 연속 녹음
- [ ] 메모리 누수 확인
- [ ] 배터리 소모 확인
- [ ] CPU 사용량 모니터링

---

## 🎯 예상 결과

### 정상 동작 시

**콘솔 로그**:

```
🎧 Audio service initialized
🔌 Connecting to: ws://localhost:8000/ws/stt
✅ LiveAudioStream initialized for mobile (또는 Web Audio API)
🎙️ Starting recording...
WebSocket: CONNECTED
📤 Sent: {"event":"start_stream","config":{"sampleRate":16000,"encoding":"pcm_s16le"}}
📤 Sent: {"event":"audio_data","payload":"[base64 data]"}
📥 Received: {"type":"transcript","text":"안녕하세요","isFinal":false}
📥 Received: {"type":"transcript","text":"안녕하세요 테스트입니다","isFinal":true}
⏹️ Stopping recording...
✅ Recording stopped successfully
WebSocket: DISCONNECTED
```

**UI 상태 변화**:

1. IDLE → CONNECTING → RECORDING → IDLE
2. 실시간 텍스트 표시
3. 최종 텍스트가 트랜스크립트 목록에 추가

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. [AUDIO_STREAMING_GUIDE.md](./AUDIO_STREAMING_GUIDE.md)
3. [GitHub Issues](https://github.com/prscX/react-native-live-audio-stream/issues)

---

**작성일**: 2024-12-14
**테스트 버전**: 1.0.0

