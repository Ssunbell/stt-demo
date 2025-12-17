# 🚀 빠른 시작 가이드

STT Mobile App을 빠르게 시작하는 방법입니다.

## 📋 사전 준비

- Node.js 16+ 설치
- npm 또는 yarn
- iOS: macOS + Xcode (시뮬레이터용)
- Android: Android Studio (에뮬레이터용)

## ⚡ 5분 안에 시작하기

### 1️⃣ 프로젝트로 이동

```bash
cd STTMobileApp
```

### 2️⃣ 의존성 설치

```bash
npm install
```

### 3️⃣ 서버 URL 설정

`src/utils/config.ts` 파일을 열고 서버 주소를 입력하세요:

```typescript
development: {
  wsUrl: 'ws://localhost:8000/ws/stt',  // 서버 주소로 변경
  apiUrl: 'http://localhost:8000/api',
}
```

**팁**: 
- iOS 시뮬레이터: `localhost` 사용
- Android 에뮬레이터: `10.0.2.2` 사용
- 실제 기기: 컴퓨터의 로컬 IP 사용 (예: `192.168.1.100`)

### 4️⃣ 앱 실행

#### Expo Go 앱 사용 (가장 쉬움!)

```bash
npm start
```

그 다음:
1. 스마트폰에 Expo Go 앱 설치
2. QR 코드 스캔
3. 앱이 자동으로 열립니다!

#### iOS 시뮬레이터

```bash
npm run ios
```

#### Android 에뮬레이터

```bash
npm run android
```

## 🎯 사용 방법

1. **권한 허용**: 앱 실행 시 마이크 권한을 허용하세요
2. **녹음 시작**: "녹음 시작" 버튼을 탭하세요
3. **말하기**: 마이크에 대고 말하세요
4. **확인**: 화면에 텍스트가 실시간으로 나타납니다!
5. **중지**: "녹음 중지" 버튼으로 종료하세요

## ❓ 문제 해결

### "WebSocket connection failed" 오류

**원인**: 서버가 실행되지 않았거나 주소가 잘못되었습니다.

**해결**:
1. 서버가 실행 중인지 확인
2. 서버 URL이 올바른지 확인
3. 방화벽 설정 확인

### 마이크 권한이 나타나지 않음

**해결**:
1. 앱 완전 삭제
2. 재설치
3. 앱 실행 시 권한 허용

### 앱이 느림

**원인**: 개발 모드는 느릴 수 있습니다.

**해결**: 프로덕션 빌드로 테스트하세요.

## 📚 더 알아보기

- **자세한 설치 가이드**: [SETUP.md](./STTMobileApp/SETUP.md)
- **개발자 가이드**: [DEVELOPMENT.md](./STTMobileApp/DEVELOPMENT.md)
- **자주 묻는 질문**: [FAQ.md](./STTMobileApp/FAQ.md)
- **프로젝트 개요**: [README.md](./STTMobileApp/README.md)

## 💡 팁

### 로컬 IP 확인하기

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

### 서버 상태 확인

서버가 실행 중인지 확인:
```bash
curl http://localhost:8000/health
```

## 🆘 도움이 필요하신가요?

- [FAQ 확인](./STTMobileApp/FAQ.md)
- [GitHub Issues에 질문하기](https://github.com/your-repo/issues)

---

**즐거운 개발 되세요! 🎉**

