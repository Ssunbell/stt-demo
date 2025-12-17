# 🔧 Platform 에러 해결 방법

## 문제 상황

```
ERROR [runtime not ready]: ReferenceError: Property 'Platform' doesn't exist
```

## 원인

React Native의 `Platform` 객체가 런타임이 완전히 초기화되기 전에 모듈 레벨에서 사용되고 있습니다.

## 해결 방법

### 🔄 완전한 재빌드 (권장)

캐시를 정리하고 완전히 재빌드하면 이 문제가 해결될 수 있습니다:

```bash
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp

# 1. Metro bundler 중지 (Ctrl + C)

# 2. 캐시 정리
rm -rf node_modules/.cache
rm -rf ios/build
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# 3. Node modules 재설치 (선택사항)
# rm -rf node_modules
# npm install

# 4. iOS Pods 재설치 (선택사항)
# cd ios
# rm -rf Pods Podfile.lock
# pod install
# cd ..

# 5. 완전 재빌드
npm run ios -- --clean
```

### 📝 코드 수정 사항

다음 파일들이 수정되었습니다:

1. **App.tsx**
   - `Platform` 사용을 `useEffect`로 지연
   - 초기화 시점을 런타임 이후로 이동

2. **src/utils/config.ts**
   - `getServerConfig()`를 함수로 변경하여 지연 실행
   - `Platform` 접근을 함수 호출 시점으로 이동

3. **src/services/AudioService.ts**
   - Constructor에서 `Platform` 사용을 `setTimeout`으로 지연
   - `startRecording`에서 필요시 초기화

### 🚀 빠른 해결 (터미널에서)

```bash
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp

# Metro bundler가 실행 중이라면 중지 (Ctrl + C)

# 캐시 정리 후 재시작
npm start -- --reset-cache
```

그런 다음 새 터미널에서:

```bash
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp
npm run ios
```

### 🔍 대체 방법: 수동 리로드

시뮬레이터에서:
1. 앱 완전 종료 (홈 화면에서 위로 스와이프)
2. 앱 재실행
3. 또는 ⌘ + R로 리로드

## ✅ 수정 확인

앱이 정상적으로 실행되면 다음을 확인하세요:

```bash
# 터미널 로그에서 확인
# ✅ Platform 에러 없음
# ✅ "Connecting to: ws://localhost:8000/ws/stt" 로그 표시
# ✅ "Audio service initialized" 로그 표시
```

## 🐛 여전히 에러가 발생하면

### 옵션 1: 완전 클린 빌드

```bash
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp

# 모든 빌드 아티팩트 제거
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/STTMobileApp-*
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-* $TMPDIR/haste-map-*

# 재빌드
npm run ios -- --clean
```

### 옵션 2: 시뮬레이터 초기화

```bash
# 시뮬레이터 완전 초기화 (주의: 모든 시뮬레이터 데이터 삭제됨)
xcrun simctl shutdown all
xcrun simctl erase all

# 앱 재설치
npm run ios
```

### 옵션 3: Xcode에서 직접 빌드

```bash
# Xcode 열기
open ios/STTMobileApp.xcworkspace

# Xcode에서:
# 1. Product > Clean Build Folder (⇧ + ⌘ + K)
# 2. Product > Build (⌘ + B)
# 3. Product > Run (⌘ + R)
```

## 📚 기술적 배경

### 왜 이런 에러가 발생하나요?

1. **모듈 로드 순서**: JavaScript 모듈이 로드될 때 최상위 레벨 코드가 즉시 실행됩니다
2. **Platform 준비 시점**: React Native bridge가 완전히 초기화된 후에야 `Platform` 객체가 사용 가능합니다
3. **타이밍 이슈**: 모듈 로드와 런타임 초기화 사이의 타이밍 차이

### 해결 원칙

- ❌ 모듈 레벨에서 `Platform` 사용 금지
- ✅ 함수 내부에서만 `Platform` 사용
- ✅ `useEffect` 또는 이벤트 핸들러에서 사용
- ✅ 지연 초기화 (lazy initialization)

## 🎯 다음 단계

재빌드가 성공하면:

1. **기능 테스트**
   ```
   ✅ 앱 실행
   ✅ WebSocket 연결
   ✅ 마이크 권한
   ✅ 녹음 기능
   ```

2. **로그 확인**
   - Terminal에서 `Platform` 에러가 없어야 함
   - 정상 작동 로그만 표시되어야 함

3. **실제 테스트**
   - 🎤 버튼 클릭
   - 음성 입력
   - 실시간 텍스트 변환 확인

## 📞 추가 도움

문제가 계속되면:

1. **전체 로그 확인**
   ```bash
   tail -f /Users/lucas/.cursor/projects/Users-lucas-workspace-stt-demo/terminals/1.txt
   ```

2. **Node/npm 버전 확인**
   ```bash
   node --version
   npm --version
   ```

3. **Expo 버전 확인**
   ```bash
   npx expo --version
   ```

---

**현재 권장 조치**: 위의 "완전한 재빌드" 섹션을 따라 진행하세요!

