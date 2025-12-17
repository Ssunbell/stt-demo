# 🚀 실시간 오디오 스트리밍 빠른 시작 가이드

이 문서는 `react-native-live-audio-stream`을 사용한 실시간 오디오 스트리밍을 빠르게 시작하는 방법을 안내합니다.

## ⚡️ 5분 안에 시작하기

### 1️⃣ 백엔드 서버 실행

```bash
# 터미널 1: 서버 실행
cd /Users/lucas/workspace/stt-demo/server
python main.py

# 출력 확인:
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2️⃣ 의존성 설치 확인

```bash
# 터미널 2: 클라이언트 디렉토리
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp

# 패키지 확인
npm list react-native-live-audio-stream

# 출력 예시:
# └── react-native-live-audio-stream@1.1.1
```

### 3️⃣ 플랫폼별 실행

#### 🌐 웹 (가장 빠름)

```bash
npm run web
```

브라우저가 자동으로 열리면:
1. 마이크 권한 "허용" 클릭
2. "녹음 시작" 버튼 클릭
3. 말하기: "안녕하세요, 테스트입니다"
4. 실시간으로 텍스트가 표시됨! 🎉

#### 🍎 iOS

```bash
# iOS Pod 설치 (처음 한 번만)
cd ios && pod install && cd ..

# 실행
npm run ios
```

> ⚠️ **중요**: iOS 시뮬레이터는 마이크를 지원하지 않습니다. 실제 기기에서 테스트하세요!

**실제 기기에서 테스트**:
```bash
# 1. Expo Go 앱 설치 (App Store)
# 2. 로컬 IP 설정
vim src/utils/config.ts
# DEV_SERVER_HOST를 자신의 로컬 IP로 변경 (예: 192.168.1.100)

# 3. 로컬 IP 확인
ifconfig | grep "inet " | grep -v 127.0.0.1

# 4. 앱 실행 및 QR 코드 스캔
npm start
```

#### 🤖 Android

```bash
npm run android
```

> 💡 **팁**: 실제 기기 사용 권장. 에뮬레이터는 오디오 품질이 낮습니다.

---

## 🎯 동작 확인

### ✅ 정상 동작 시 로그

**콘솔 출력**:
```
🎧 Audio service initialized
🔌 Connecting to: ws://localhost:8000/ws/stt
✅ LiveAudioStream initialized for mobile
🎙️ Starting recording...
WebSocket: CONNECTED
📤 Sent: {"event":"start_stream",...}
📤 Sent: {"event":"audio_data","payload":"..."}
📥 Received: {"type":"transcript","text":"안녕하세요","isFinal":false}
📥 Received: {"type":"transcript","text":"안녕하세요 테스트입니다","isFinal":true}
```

### ✅ UI 상태 변화

1. **IDLE** (처음 상태)
   - 버튼: "녹음 시작"
   - 색상: 회색

2. **CONNECTING** (연결 중)
   - 상태: "연결 중..."
   - 색상: 주황색

3. **RECORDING** (녹음 중)
   - 버튼: "중지"
   - 색상: 빨간색
   - 실시간 텍스트 표시

4. **IDLE** (중지 후)
   - 최종 텍스트가 목록에 추가됨

---

## 🐛 문제 해결

### 문제 1: "LiveAudioStream module not initialized"

**해결**:
```bash
# iOS
cd ios && pod install && cd ..
npm run ios

# Android
cd android && ./gradlew clean && cd ..
npm run android
```

### 문제 2: 마이크 권한이 요청되지 않음

**iOS**:
```bash
# Info.plist 확인
cat ios/STTMobileApp/Info.plist | grep Microphone

# 없으면 수동으로 추가:
# <key>NSMicrophoneUsageDescription</key>
# <string>음성을 녹음하여 실시간으로 텍스트로 변환합니다.</string>
```

**Android**:
```bash
# AndroidManifest.xml 확인
cat android/app/src/main/AndroidManifest.xml | grep RECORD_AUDIO

# 없으면 수동으로 추가:
# <uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### 문제 3: WebSocket 연결 실패

**원인**: 서버가 실행되지 않았거나 URL이 잘못됨

**해결**:
```bash
# 1. 서버가 실행 중인지 확인
curl http://localhost:8000/health

# 2. 실제 기기 사용 시 로컬 IP로 변경
vim src/utils/config.ts
# const DEV_SERVER_HOST = '192.168.1.100'; // 자신의 IP
```

### 문제 4: 오디오 데이터가 전송되지 않음

**웹 브라우저**:
- F12 → Console → 오류 확인
- Network 탭 → WS 필터 → 메시지 확인

**모바일**:
```bash
# iOS
# Xcode → Window → Devices → 기기 선택 → Console

# Android
adb logcat | grep -i "audio\|websocket"
```

---

## 📊 성능 체크

### 지연 시간 측정

1. "녹음 시작" 클릭
2. "테스트"라고 말하기
3. 화면에 텍스트가 나타나는 시간 측정
4. **목표**: < 1초

### 오디오 품질 확인

- 조용한 환경에서 테스트
- 명확하게 발음
- 인식률 확인: **목표** > 90%

### 네트워크 사용량

**웹 브라우저**:
- F12 → Network 탭
- 약 **43 KB/s** (16kHz, 16-bit, 모노)

---

## 🎓 다음 단계

### 1. 고급 설정

설정 커스터마이징:
```typescript
// src/utils/config.ts

// 저대역폭 네트워크용
export const AUDIO_CONFIG = {
  sampleRate: 8000,  // 16000 → 8000
  channels: 1,
  bitsPerSample: 8,  // 16 → 8
  encoding: 'pcm_s16le',
};
```

### 2. 프로덕션 배포

프로덕션 서버 URL 설정:
```typescript
// src/utils/config.ts
production: {
  wsUrl: 'wss://your-domain.com/ws/stt',
  apiUrl: 'https://your-domain.com/api',
},
```

### 3. 상세 문서 읽기

- 📖 [AUDIO_STREAMING_GUIDE.md](./AUDIO_STREAMING_GUIDE.md) - 상세 구현 가이드
- 🧪 [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 완전한 테스트 가이드
- 📝 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 구현 요약

---

## ✅ 체크리스트

시작하기 전에 확인:

- [ ] Node.js 16+ 설치됨
- [ ] 서버가 실행 중 (`http://localhost:8000`)
- [ ] `react-native-live-audio-stream` 설치됨
- [ ] iOS: Pod 설치 완료
- [ ] Android: RECORD_AUDIO 권한 추가
- [ ] 실제 기기 준비 (시뮬레이터는 마이크 미지원)

기본 테스트:

- [ ] 앱이 실행됨
- [ ] 마이크 권한이 허용됨
- [ ] WebSocket 연결 성공
- [ ] "녹음 시작" 버튼이 작동함
- [ ] 실시간 텍스트가 표시됨
- [ ] "중지" 버튼이 작동함

---

## 💡 유용한 명령어

```bash
# 로그 실시간 확인
npm start -- --clear  # 캐시 클리어 후 시작

# iOS 로그 확인
react-native log-ios

# Android 로그 확인
react-native log-android

# 패키지 재설치
rm -rf node_modules package-lock.json
npm install

# iOS 클린 빌드
cd ios && pod deintegrate && pod install && cd ..
npm run ios

# Android 클린 빌드
cd android && ./gradlew clean && cd ..
npm run android
```

---

## 🎉 완료!

모든 것이 정상적으로 작동하면 이제 실시간 음성 인식 앱을 사용할 수 있습니다! 🚀

문제가 있으면:
1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 확인
2. GitHub Issues 검색
3. 로그를 첨부하여 이슈 생성

**즐거운 코딩 되세요!** 😊

