# 🔧 네이티브 모듈 에러 해결 가이드

## ✅ 경고 팝업 추가 완료

이제 네이티브 모듈 에러가 발생하면 화면에 명확한 Alert 팝업이 표시됩니다!

### 팝업 내용
```
⚠️ 네이티브 모듈 오류

Expo Go는 네이티브 모듈을 지원하지 않습니다.

해결 방법:
1. 웹에서 테스트: npm run web
2. 네이티브 빌드 실행: npx expo run:ios

네이티브 빌드를 사용 중인데도 이 에러가 나타나면 
앱을 완전히 종료 후 재시작하세요.

[상세 정보] [확인]
```

---

## 🐛 현재 문제

로그를 보니 `LiveAudioStream` 네이티브 모듈이 제대로 로드되지 않고 있습니다:

```
ERROR [ERROR] Failed to initialize LiveAudioStream: 
[Error: LiveAudioStream module not properly loaded (Expo Go environment)]
```

이것은 네이티브 빌드를 사용 중인데도 네이티브 모듈이 제대로 링크되지 않았음을 의미합니다.

---

## 🔧 해결 방법

### 방법 1: 앱 완전 재빌드 (권장) ⭐

```bash
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp

# 1. 실행 중인 프로세스 종료
killall -9 node

# 2. 빌드 캐시 정리
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/STTMobileApp-*

# 3. CocoaPods 재설치
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# 4. 완전 재빌드
npm run ios
```

### 방법 2: 시뮬레이터 초기화 후 재설치

```bash
# 시뮬레이터에서 앱 삭제
xcrun simctl uninstall booted com.anonymous.STTMobileApp

# 재빌드 및 설치
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp
npm run ios
```

### 방법 3: 시뮬레이터 완전 재시작

```bash
# 모든 시뮬레이터 종료
xcrun simctl shutdown all

# iPhone 16 Pro만 부팅
xcrun simctl boot "iPhone 16 Pro"

# 시뮬레이터 앱 열기
open -a Simulator

# 앱 재빌드
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp
npm run ios
```

### 방법 4: Xcode에서 직접 빌드

```bash
# Xcode 열기
open ios/STTMobileApp.xcworkspace

# Xcode에서:
# 1. Product > Clean Build Folder (⇧ + ⌘ + K)
# 2. 타겟 선택: STTMobileApp
# 3. 디바이스 선택: iPhone 16 Pro
# 4. Product > Run (⌘ + R)
```

---

## 🧪 테스트 방법

재빌드 후 다음을 확인하세요:

### 1. 로그 확인
정상적으로 로드되면 다음 로그가 표시됩니다:

```
✅ LiveAudioStream initialized for mobile
✅ Audio service initialized
```

에러가 없어야 합니다:
```
❌ ERROR Failed to initialize LiveAudioStream
```

### 2. 앱에서 테스트

#### a. 마이크 버튼 클릭
- 🎤 버튼 클릭
- 경고 팝업이 **나타나지 않아야** 함
- 녹음이 정상적으로 시작되어야 함

#### b. 실제 녹음
```
1. 서버 실행 확인 (포트 8000)
2. 🎤 버튼 클릭
3. 버튼이 빨간색으로 변경
4. 음성 입력
5. 실시간 텍스트 변환 확인
```

---

## 📊 문제 진단

### 로그 확인
```bash
# 실시간 로그 모니터링
tail -f /Users/lucas/.cursor/projects/Users-lucas-workspace-stt-demo/terminals/7.txt
```

### 네이티브 모듈 확인
```bash
# react-native-live-audio-stream이 설치되어 있는지 확인
ls -la node_modules/react-native-live-audio-stream

# iOS 네이티브 파일 확인
ls -la ios/Pods/
```

### 앱 설치 확인
```bash
# 시뮬레이터에 설치된 앱 확인
xcrun simctl listapps booted | grep STTMobileApp
```

---

## ⚠️ 알려진 이슈

### 이슈 1: "Expo Go environment" 에러
**원인**: 네이티브 모듈이 번들링되지 않음

**해결**: 
- CocoaPods 재설치
- 완전 재빌드

### 이슈 2: 빌드는 성공하지만 런타임 에러
**원인**: 네이티브 모듈 링킹 실패

**해결**:
```bash
# React Native 캐시 정리
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp
npx react-native-clean-project

# 또는 수동 정리
rm -rf node_modules
rm -rf ios/Pods ios/build
npm install
cd ios && pod install && cd ..
npm run ios
```

### 이슈 3: 시뮬레이터가 느리거나 응답 없음
**해결**:
- Mac 재시작
- 시뮬레이터만 재시작
- 다른 시뮬레이터 디바이스 사용

---

## 🎯 다음 단계

재빌드가 성공하면:

### 1. 경고 팝업 테스트
만약 여전히 에러가 발생한다면:
- 🎤 버튼 클릭
- Alert 팝업이 표시되는지 확인
- "상세 정보" 버튼 동작 확인

### 2. 정상 작동 확인
에러가 해결되면:
- 🎤 버튼 클릭 → 녹음 시작
- 음성 입력 → 텍스트 변환
- ⏹️ 버튼 → 녹음 중지
- 🗑️ 버튼 → 텍스트 삭제

---

## 💡 대안: 웹 버전 테스트

네이티브 빌드 문제가 계속되면 웹 버전으로 먼저 테스트할 수 있습니다:

```bash
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp
npm run web
```

웹 버전은:
- ✅ 네이티브 모듈 필요 없음
- ✅ Web Audio API 사용
- ✅ 실시간 음성 인식 동작
- ✅ 빠른 테스트 가능

---

## 📞 추가 도움

### 로그 전체 보기
```bash
cat /Users/lucas/.cursor/projects/Users-lucas-workspace-stt-demo/terminals/7.txt
```

### Node/npm 버전 확인
```bash
node --version
npm --version
npx expo --version
```

### 네이티브 의존성 확인
```bash
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp
npm list react-native-live-audio-stream
```

---

## ✅ 변경된 파일

1. **src/hooks/useRealTimeSTT.ts**
   - 에러 메시지를 원본 그대로 보존
   - `Error` 객체의 `message` 추출

2. **App.tsx**
   - 네이티브 모듈 에러 감지 시 Alert 팝업 표시
   - "상세 정보" 버튼으로 ExpoGoWarning 표시
   - "확인" 버튼으로 에러 제거

---

## 🚀 권장 조치

**지금 바로 실행:**

```bash
# 터미널에서 실행
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp

# 기존 프로세스 종료
killall -9 node

# iOS 재설치
cd ios
pod install
cd ..

# 재빌드
npm run ios
```

빌드가 완료되면:
1. 시뮬레이터에서 앱 확인
2. 🎤 버튼 클릭
3. 팝업이 나타나지 않으면 성공!
4. 음성 인식 테스트 시작

---

**현재 상태**: ✅ 경고 팝업 추가 완료, 네이티브 모듈 재빌드 필요

