# iOS 빌드 및 테스트 가이드

## 📱 iOS에서 STT 앱 테스트하기

이 가이드는 iOS 디바이스에서 앱을 빌드하고 테스트하는 방법을 설명합니다.

---

## 🎯 빠른 시작

### 1️⃣ 준비사항 확인

```bash
# Xcode가 설치되어 있는지 확인
xcodebuild -version

# CocoaPods 버전 확인
pod --version

# iOS 시뮬레이터 목록 확인
xcrun simctl list devices available
```

### 2️⃣ iOS 시뮬레이터에서 실행 (추천)

```bash
# 시뮬레이터에서 바로 실행
npm run ios

# 또는 특정 디바이스 지정
npx expo run:ios --device "iPhone 15 Pro"
```

### 3️⃣ 실제 iOS 디바이스에서 실행

```bash
# 연결된 디바이스 확인
xcrun xctrace list devices

# 실제 디바이스에서 실행
npx expo run:ios --device
```

---

## 🔧 상세 설정

### A. Xcode에서 직접 빌드하기

1. **Xcode 프로젝트 열기**
   ```bash
   open ios/STTMobileApp.xcworkspace
   ```

2. **개발 팀 설정**
   - 프로젝트 네비게이터에서 `STTMobileApp` 선택
   - `Signing & Capabilities` 탭 클릭
   - Team 선택 (Apple ID로 로그인 필요)

3. **빌드 및 실행**
   - 상단에서 타겟 디바이스 선택 (시뮬레이터 또는 실제 기기)
   - ⌘ + R 단축키로 빌드 및 실행

### B. 실제 디바이스 테스트 준비

#### 1) 개발자 인증서 설정

Xcode를 통해 자동으로 설정됩니다:

1. Xcode > Settings > Accounts
2. Apple ID 추가 (+버튼)
3. 로그인 후 "Manage Certificates" 클릭
4. "Apple Development" 인증서 생성

#### 2) 디바이스 연결 및 신뢰

1. iPhone을 Mac에 USB로 연결
2. iPhone에서 "이 컴퓨터를 신뢰하겠습니까?" 승인
3. Mac에서도 승인

#### 3) Bundle Identifier 확인

```bash
# ios/STTMobileApp/Info.plist 확인
cat ios/STTMobileApp/Info.plist | grep -A 1 CFBundleIdentifier
```

기본값: `com.anonymous.STTMobileApp`

필요시 변경:
1. Xcode에서 프로젝트 열기
2. General 탭 > Bundle Identifier 수정
3. 고유한 이름으로 변경 (예: `com.yourname.sttapp`)

---

## 🎤 앱 기능 테스트

### 1. 서버 실행 확인

앱 실행 전에 백엔드 서버가 실행 중이어야 합니다:

```bash
# 서버 디렉토리로 이동
cd ../../../server

# 서버 실행
python main.py
```

### 2. 네트워크 설정

**중요**: 실제 디바이스에서 테스트할 때는 `localhost` 대신 Mac의 실제 IP 주소를 사용해야 합니다.

#### Mac IP 주소 찾기:
```bash
# Wi-Fi IP 주소 확인
ipconfig getifaddr en0

# 또는 모든 네트워크 인터페이스 확인
ifconfig | grep "inet " | grep -v 127.0.0.1
```

#### 설정 파일 수정:
```typescript
// src/utils/config.ts
export const getServerConfig = () => {
  const isDev = __DEV__;
  const isWeb = Platform.OS === 'web';
  
  // 실제 디바이스에서 테스트 시 Mac IP로 변경
  const baseUrl = isWeb 
    ? 'localhost:8000' 
    : '192.168.1.100:8000'; // <-- 여기에 Mac IP 입력
  
  return {
    wsUrl: `ws://${baseUrl}/ws/stt`,
    httpUrl: `http://${baseUrl}`,
  };
};
```

### 3. 마이크 권한 확인

첫 실행 시 마이크 권한을 요청합니다:
- "허용" 선택
- 거부한 경우: 설정 > STTMobileApp > 마이크 권한 활성화

### 4. 기능 테스트 체크리스트

- [ ] 앱이 정상적으로 실행됨
- [ ] WebSocket 연결 상태 표시 (상단 녹색 표시)
- [ ] 🎤 버튼 클릭 시 녹음 시작
- [ ] 음성 입력 시 실시간 텍스트 변환
- [ ] ⏹️ 버튼 클릭 시 녹음 중지
- [ ] 🗑️ 버튼으로 텍스트 지우기
- [ ] 에러 메시지 정상 표시

---

## 🐛 문제 해결

### 빌드 실패

#### "No signing certificate found"
```bash
# Xcode에서 자동 서명 활성화
1. Xcode에서 프로젝트 열기
2. Signing & Capabilities
3. "Automatically manage signing" 체크
4. Team 선택
```

#### "Pod install failed"
```bash
# CocoaPods 재설치
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

#### "Module not found"
```bash
# Node modules 재설치
rm -rf node_modules package-lock.json
npm install

# iOS dependencies 재설치
cd ios
pod install
cd ..
```

### 런타임 에러

#### "WebSocket connection failed"
- Mac과 iPhone이 같은 Wi-Fi에 연결되어 있는지 확인
- Mac의 방화벽에서 포트 8000 허용
- `config.ts`에서 올바른 IP 주소 사용

#### "Microphone permission denied"
- 설정 > STTMobileApp > 마이크 권한 확인
- 앱 재설치 후 권한 재요청

#### "Expo Go 경고가 표시됨"
- Expo Go가 아닌 네이티브 빌드를 사용 중이므로 무시 가능
- 경고가 계속 표시되면 앱을 완전히 종료 후 재시작

---

## 📊 성능 확인

### Xcode Instruments로 성능 측정

```bash
# Instruments 실행
open ios/STTMobileApp.xcworkspace
```

1. Product > Profile (⌘ + I)
2. "Leaks" 템플릿 선택하여 메모리 누수 확인
3. "Time Profiler"로 CPU 사용량 확인

### 콘솔 로그 확인

앱 실행 중 터미널에서 로그 확인:
```bash
# iOS 시뮬레이터 로그
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "STTMobileApp"'

# 실제 디바이스 로그 (연결된 디바이스)
idevicesyslog | grep STTMobileApp
```

---

## 🚀 배포 준비 (선택사항)

### TestFlight로 베타 테스트

1. **App Store Connect 설정**
   - https://appstoreconnect.apple.com 접속
   - 새 앱 생성

2. **Archive 생성**
   ```bash
   # Release 빌드
   npx expo run:ios --configuration Release
   ```

3. **Xcode에서 Archive**
   - Product > Archive
   - Organizer에서 "Distribute App"
   - "TestFlight & App Store" 선택

### EAS Build 사용 (대안)

```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 로그인
eas login

# iOS 빌드 설정
eas build:configure

# 빌드 생성
eas build --platform ios
```

---

## 📝 추가 리소스

### 관련 문서
- [AUDIO_DEVICE_GUIDE.md](./AUDIO_DEVICE_GUIDE.md) - 오디오 녹음 상세 가이드
- [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - 문제 해결 가이드
- [TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) - 테스트 가이드

### 유용한 명령어

```bash
# 빌드 캐시 정리
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData

# 시뮬레이터 초기화
xcrun simctl erase all

# 앱 완전 재빌드
npm run ios -- --clean
```

---

## ✅ 빠른 체크리스트

iOS 테스트를 시작하기 전에:

- [ ] Xcode 설치됨 (최신 버전)
- [ ] Apple ID로 개발자 계정 설정됨
- [ ] `pod install` 완료
- [ ] 백엔드 서버 실행 중
- [ ] 네트워크 설정 확인 (실제 디바이스의 경우 IP 주소)
- [ ] 시뮬레이터 또는 디바이스 준비됨

모든 준비가 완료되었다면:

```bash
npm run ios
```

Happy Testing! 🎉

