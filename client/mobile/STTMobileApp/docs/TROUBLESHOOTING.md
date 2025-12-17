# 🔧 문제 해결 가이드

WebSocket 연결 오류 및 기타 일반적인 문제 해결 방법입니다.

## 🚨 WebSocket 연결 오류

### 증상
```
ERROR [ERROR] WebSocket Error: readyState: 3 (CLOSED)
```

### 원인 및 해결

#### 1️⃣ 서버가 실행되지 않음

**확인:**
```bash
curl http://localhost:8000
```

**해결:**
```bash
cd /Users/lucas/workspace/stt-demo/server
source .venv/bin/activate
python main.py
```

서버가 정상 실행되면:
```
🚀 Starting Real-time STT Service
📍 Server: http://0.0.0.0:8000
🔌 WebSocket: ws://0.0.0.0:8000/ws/stt
```

#### 2️⃣ 잘못된 서버 주소

**현재 환경 확인:**

- **iOS 시뮬레이터** → `localhost` ✅ (자동 설정됨)
- **Android 에뮬레이터** → `10.0.2.2` ✅ (자동 설정됨)
- **실제 기기** → 로컬 IP 필요 (예: `192.168.1.100`)

**실제 기기에서 테스트하는 경우:**

1. 로컬 IP 확인:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. `src/utils/config.ts` 수정:
   ```typescript
   const DEV_SERVER_HOST = '192.168.1.100'; // 로컬 IP
   ```

자세한 내용: [DEVICE_TESTING.md](./DEVICE_TESTING.md)

#### 3️⃣ 방화벽 차단

**macOS:**
```bash
# 포트 8000이 열려있는지 확인
sudo lsof -i :8000
```

**Windows:**
제어판 → Windows Defender 방화벽 → 고급 설정 → 인바운드 규칙 → 포트 8000 허용

#### 4️⃣ 네트워크 문제

**확인사항:**
- [ ] 컴퓨터와 스마트폰이 같은 WiFi에 연결되어 있나요?
- [ ] VPN이 켜져 있나요? (끄기)
- [ ] 프록시 설정이 있나요?

## 🎤 마이크 권한 문제

### 증상
- 권한 요청 팝업이 나타나지 않음
- "마이크 권한이 필요합니다" 오류

### 해결

#### iOS
1. **시뮬레이터 리셋:**
   ```
   Device → Erase All Content and Settings
   ```

2. **수동 권한 설정:**
   ```
   설정 → 개인 정보 보호 → 마이크 → STTMobileApp → 허용
   ```

3. **앱 재설치:**
   앱 삭제 후 다시 설치

#### Android
1. **수동 권한 설정:**
   ```
   설정 → 앱 → STTMobileApp → 권한 → 마이크 → 허용
   ```

2. **앱 재설치**

## 🐌 앱이 느림

### 원인
개발 모드는 느릴 수 있습니다.

### 해결

**1. Metro 캐시 삭제:**
```bash
npm start -- --reset-cache
```

**2. node_modules 재설치:**
```bash
rm -rf node_modules
npm install
```

**3. 프로덕션 빌드 테스트:**
```bash
expo build:ios    # iOS
expo build:android # Android
```

## 🔋 배터리 소모

### 원인
- 연속 녹음
- 네트워크 전송
- 개발 모드 오버헤드

### 해결

**1. 샘플링 레이트 낮추기:**
`src/utils/config.ts`:
```typescript
export const AUDIO_CONFIG = {
  sampleRate: 8000, // 16000 → 8000
  // ...
};
```

**2. 사용하지 않을 때 연결 끊기:**
녹음 중지 시 WebSocket 자동 종료됨 ✅

## 📱 Platform별 문제

### iOS 시뮬레이터

#### "Build failed" 오류
```bash
cd ios
pod install
cd ..
npm run ios
```

#### "No devices found"
Xcode에서 시뮬레이터 실행:
```
Xcode → Open Developer Tool → Simulator
```

### Android 에뮬레이터

#### "No emulators found"
Android Studio에서 AVD Manager로 에뮬레이터 생성

#### Gradle 오류
```bash
cd android
./gradlew clean
cd ..
```

## 🔍 디버깅 팁

### 1. 콘솔 로그 확인

앱 실행 시 다음 로그를 찾으세요:

```
🔌 Connecting to: ws://localhost:8000/ws/stt
[INFO] WebSocket: Connected
[DEBUG] WebSocket Sent: {...}
[DEBUG] WebSocket Received: {...}
```

### 2. React Native Debugger

```bash
# Dev Menu 열기
# iOS: Cmd + D
# Android: Cmd + M

# "Debug" 선택
```

### 3. 서버 로그 확인

서버 터미널에서:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     WebSocket connection opened
INFO:     Received audio data: 4096 bytes
```

## 🆘 그래도 안 되나요?

### 체크리스트

- [ ] 서버가 실행 중인가요?
- [ ] 올바른 서버 주소를 사용하나요?
- [ ] 마이크 권한이 허용되었나요?
- [ ] 같은 WiFi 네트워크인가요?
- [ ] 방화벽이 포트를 막고 있지 않나요?
- [ ] 앱을 다시 시작했나요?
- [ ] 캐시를 삭제했나요?

### 완전히 새로 시작

```bash
# 1. 서버 재시작
cd server
python main.py

# 2. 앱 캐시 삭제 및 재시작
cd client/mobile/STTMobileApp
rm -rf node_modules
npm install
npm start -- --reset-cache

# 3. 앱 재설치 (에뮬레이터/시뮬레이터에서)
```

### 추가 도움

- **FAQ**: [FAQ.md](./FAQ.md)
- **설치 가이드**: [SETUP.md](./SETUP.md)
- **실제 기기 테스트**: [DEVICE_TESTING.md](./DEVICE_TESTING.md)
- **GitHub Issues**: 문제를 보고하세요

## 📊 진단 명령어 모음

```bash
# 서버 상태 확인
curl http://localhost:8000

# 포트 사용 확인
lsof -i :8000

# 네트워크 연결 확인
ping localhost

# 로컬 IP 확인
ifconfig | grep "inet "

# Node 버전 확인
node --version

# npm 버전 확인
npm --version

# Expo 버전 확인
npx expo --version
```

---

**문제가 해결되셨나요?** 이 문서가 도움이 되었다면 ⭐를 눌러주세요!

