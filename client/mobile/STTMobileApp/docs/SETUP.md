# 🛠 설치 및 설정 가이드

## 목차
- [시스템 요구사항](#시스템-요구사항)
- [개발 환경 설정](#개발-환경-설정)
- [프로젝트 설정](#프로젝트-설정)
- [서버 연동](#서버-연동)
- [빌드 및 배포](#빌드-및-배포)
- [문제 해결](#문제-해결)

## 시스템 요구사항

### 공통
- **Node.js**: 16.x 이상 (권장: 18.x LTS)
- **npm**: 8.x 이상 또는 **yarn**: 1.22.x 이상
- **Git**: 최신 버전

### iOS 개발
- **macOS**: Monterey (12.0) 이상
- **Xcode**: 14.0 이상
- **CocoaPods**: 1.11.x 이상
- **iOS Simulator** 또는 **실제 iOS 기기**

### Android 개발
- **Android Studio**: Flamingo 이상
- **Android SDK**: API 26 (Android 8.0) 이상
- **Java JDK**: 11 이상
- **Android Emulator** 또는 **실제 Android 기기**

## 개발 환경 설정

### 1. Node.js 설치

#### macOS (Homebrew 사용)
```bash
brew install node
```

#### Windows (Chocolatey 사용)
```bash
choco install nodejs
```

#### 또는 공식 웹사이트에서 다운로드
https://nodejs.org/

### 2. Expo CLI 설치

```bash
npm install -g expo-cli
```

또는 yarn 사용:
```bash
yarn global add expo-cli
```

### 3. iOS 개발 환경 설정 (macOS만 해당)

#### Xcode 설치
1. App Store에서 Xcode 다운로드 및 설치
2. Xcode 실행 후 추가 구성요소 설치 완료
3. Command Line Tools 설치:
```bash
xcode-select --install
```

#### CocoaPods 설치
```bash
sudo gem install cocoapods
```

### 4. Android 개발 환경 설정

#### Android Studio 설치
1. https://developer.android.com/studio 에서 다운로드
2. Android Studio 설치 및 실행
3. SDK Manager에서 다음 항목 설치:
   - Android SDK Platform 26 이상
   - Android SDK Build-Tools
   - Android Emulator
   - Intel x86 Emulator Accelerator (HAXM)

#### 환경 변수 설정

**macOS/Linux** (~/.bash_profile, ~/.zshrc 등):
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows** (시스템 환경 변수):
```
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
```

Path에 추가:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

## 프로젝트 설정

### 1. 저장소 클론
```bash
git clone <repository-url>
cd stt-demo/client/mobile/STTMobileApp
```

### 2. 의존성 설치
```bash
npm install
```

또는 yarn 사용:
```bash
yarn install
```

### 3. iOS 의존성 설치 (macOS만)
```bash
cd ios
pod install
cd ..
```

## 서버 연동

### 1. 서버 URL 설정

`src/utils/config.ts` 파일을 열어 서버 URL을 설정하세요:

```typescript
export const SERVER_CONFIG = {
  development: {
    wsUrl: 'ws://YOUR_SERVER_IP:8000/ws/stt',  // 여기를 수정
    apiUrl: 'http://YOUR_SERVER_IP:8000/api',
  },
  production: {
    wsUrl: 'wss://your-domain.com/ws/stt',
    apiUrl: 'https://your-domain.com/api',
  },
};
```

### 2. 로컬 서버 테스트

로컬에서 서버를 실행 중이라면:

#### iOS 시뮬레이터
```typescript
wsUrl: 'ws://localhost:8000/ws/stt'
```

#### Android 에뮬레이터
```typescript
wsUrl: 'ws://10.0.2.2:8000/ws/stt'  // Android 에뮬레이터의 호스트 머신 IP
```

#### 실제 기기
```typescript
wsUrl: 'ws://192.168.x.x:8000/ws/stt'  // 컴퓨터의 로컬 네트워크 IP
```

컴퓨터의 로컬 IP 확인:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

### 3. 네트워크 보안 설정

#### iOS (Info.plist)
개발 중 HTTP 사용을 허용하려면 `app.json`에서 설정을 추가할 수 있습니다.

#### Android (network_security_config.xml)
개발 중 HTTP 사용을 허용하려면 별도 설정이 필요할 수 있습니다.

## 빌드 및 배포

### 개발 모드 실행

#### Expo Go 사용 (가장 쉬움)
```bash
npm start
```
- iOS 기기: 카메라로 QR 코드 스캔
- Android 기기: Expo Go 앱에서 QR 코드 스캔

#### iOS 시뮬레이터
```bash
npm run ios
```

#### Android 에뮬레이터
```bash
npm run android
```

### 프로덕션 빌드

#### EAS Build 사용 (권장)

1. EAS CLI 설치:
```bash
npm install -g eas-cli
```

2. Expo 계정으로 로그인:
```bash
eas login
```

3. 프로젝트 설정:
```bash
eas build:configure
```

4. iOS 빌드:
```bash
eas build --platform ios
```

5. Android 빌드:
```bash
eas build --platform android
```

#### 로컬 빌드

##### iOS
```bash
expo prebuild
cd ios
xcodebuild -workspace STTMobileApp.xcworkspace -scheme STTMobileApp -configuration Release
```

##### Android
```bash
expo prebuild
cd android
./gradlew assembleRelease
```

## 문제 해결

### 일반적인 문제

#### 1. Metro bundler 오류
```bash
# 캐시 삭제
expo start -c
# 또는
npm start -- --reset-cache
```

#### 2. 의존성 충돌
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

#### 3. iOS Pod 오류
```bash
cd ios
pod deintegrate
pod install
cd ..
```

#### 4. Android Gradle 오류
```bash
cd android
./gradlew clean
cd ..
```

### 권한 문제

#### iOS 마이크 권한이 작동하지 않음
1. 시뮬레이터 리셋: Device → Erase All Content and Settings
2. `app.json`에서 권한 설명 확인
3. 앱 재설치

#### Android 마이크 권한이 작동하지 않음
1. 앱 설정에서 권한 수동 확인
2. `app.json`에서 권한 설정 확인
3. 앱 재설치

### WebSocket 연결 문제

#### "WebSocket connection failed"
1. 서버가 실행 중인지 확인
2. 서버 URL이 올바른지 확인
3. 방화벽 설정 확인
4. 네트워크 연결 확인

#### iOS에서 "Insecure connection" 오류
개발 중 HTTP 사용을 위해 `app.json`에 다음 추가:
```json
"ios": {
  "infoPlist": {
    "NSAppTransportSecurity": {
      "NSAllowsArbitraryLoads": true
    }
  }
}
```

⚠️ **주의**: 프로덕션에서는 HTTPS(WSS) 사용 필수!

### 성능 문제

#### 앱이 느리거나 멈춤
1. 개발 모드가 아닌 프로덕션 빌드로 테스트
2. 메모리 누수 확인
3. 오디오 버퍼 크기 조정

#### 배터리 소모가 심함
1. 오디오 샘플링 레이트 낮추기 (16kHz → 8kHz)
2. WebSocket 연결 유지 시간 최적화
3. 불필요한 재렌더링 제거

## 추가 자원

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://github.com/react-native-community)

## 지원

문제가 지속되면:
1. GitHub Issues에 보고
2. 상세한 오류 로그 포함
3. 환경 정보 (OS, Node 버전 등) 제공

