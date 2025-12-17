# 🚀 iOS 빠른 시작 가이드

## ✅ 빌드 완료!

앱이 성공적으로 빌드되어 **iPhone 16 Pro 시뮬레이터**에서 실행 중입니다!

```
✓ 빌드 성공
✓ iPhone 16 Pro에 설치됨
✓ 앱 실행됨 (com.anonymous.STTMobileApp)
```

---

## 🎯 지금 바로 테스트하기

### 1단계: 백엔드 서버 실행 ⚡

**새 터미널 창을 열고** 다음 명령어를 실행하세요:

```bash
cd /Users/lucas/workspace/stt-demo/server
python main.py
```

서버가 정상 실행되면 다음과 같은 메시지가 표시됩니다:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     WebSocket endpoint: ws://localhost:8000/ws/stt
```

### 2단계: 앱에서 테스트 🎤

시뮬레이터에서 앱이 실행 중입니다. 다음 순서로 테스트하세요:

1. **WebSocket 연결 확인**
   - 앱 상단에 연결 상태가 표시됩니다
   - 🟢 녹색 = 연결됨 ✓
   - 🔴 빨간색 = 연결 안됨

2. **녹음 시작**
   - 🎤 마이크 버튼 클릭
   - 처음 실행 시 마이크 권한 요청 → "허용" 선택

3. **음성 입력 테스트**
   - 말하기 시작
   - 실시간으로 텍스트가 화면에 표시됩니다
   
   **테스트 문장 예시:**
   - "안녕하세요"
   - "오늘 날씨가 좋네요"
   - "실시간 음성 인식 테스트입니다"

4. **녹음 중지**
   - ⏹️ 정지 버튼 클릭

5. **텍스트 지우기**
   - 🗑️ 삭제 버튼으로 모든 텍스트 지우기

---

## 📱 현재 실행 정보

### 앱 정보
- **디바이스**: iPhone 16 Pro (시뮬레이터)
- **Bundle ID**: com.anonymous.STTMobileApp
- **빌드 타입**: Debug
- **위치**: `/Users/lucas/Library/Developer/Xcode/DerivedData/STTMobileApp-*/Build/Products/Debug-iphonesimulator/STTMobileApp.app`

### 네트워크 설정
- **WebSocket URL**: `ws://localhost:8000/ws/stt`
- **HTTP URL**: `http://localhost:8000`

시뮬레이터는 `localhost`를 사용하여 Mac의 서버에 직접 연결됩니다.

---

## 🔧 앱 다시 실행하기

### 방법 1: Metro Bundler에서 리로드 (가장 빠름)
시뮬레이터에서 키보드 단축키:
- **⌘ + R**: 리로드
- **⌘ + D**: 개발자 메뉴 열기

### 방법 2: 터미널에서 재실행
```bash
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp
npm run ios
```

### 방법 3: Xcode에서 실행
```bash
# Xcode 프로젝트 열기
open ios/STTMobileApp.xcworkspace

# Xcode에서 ⌘ + R로 실행
```

---

## 🐛 문제 해결

### 서버 연결 실패 (빨간색 상태)

**증상**: WebSocket이 연결되지 않음

**해결 방법**:
```bash
# 1. 서버가 실행 중인지 확인
lsof -i :8000

# 2. 서버 재시작
cd /Users/lucas/workspace/stt-demo/server
python main.py

# 3. 앱 리로드 (시뮬레이터에서 ⌘ + R)
```

### 마이크가 작동하지 않음

**증상**: 녹음 버튼을 눌러도 아무 일도 일어나지 않음

**해결 방법**:
```
1. Mac 시스템 설정 열기
2. 보안 및 개인 정보 보호 > 개인 정보 보호
3. 마이크 탭에서 시뮬레이터 또는 앱 확인
4. 시뮬레이터 설정 > 개인 정보 보호 및 보안 > 마이크
```

### 음성 인식이 안됨

**증상**: 녹음은 되지만 텍스트가 표시되지 않음

**확인사항**:
1. 서버 터미널에서 에러 로그 확인
2. 서버에 Google Cloud 인증 정보 설정 확인
3. 앱 콘솔 로그 확인

```bash
# 서버 로그 확인
cd /Users/lucas/workspace/stt-demo/server
tail -f 로그파일
```

### 앱이 충돌함

**해결 방법**:
```bash
# 완전히 재빌드
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp

# 캐시 정리
rm -rf ios/build

# 재빌드
npm run ios
```

---

## 📊 성능 모니터링

### Metro Bundler 로그 확인
터미널에서 JavaScript 로그가 실시간으로 표시됩니다:
```
LOG  🔌 Connecting to: ws://localhost:8000/ws/stt
INFO  [INFO] WebSocket: Connected
LOG  🎤 Recording started
```

### Xcode 콘솔 로그 확인
더 상세한 네이티브 로그를 보려면:
```bash
# 시뮬레이터 로그 스트림
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "STTMobileApp"' --level=debug
```

---

## 🎬 다음 단계

### 추가 기능 테스트
테스트 체크리스트 전체를 따라가려면:
```bash
open IOS_TEST_CHECKLIST.md
```

### 실제 디바이스에서 테스트
iPhone을 USB로 연결하고:
```bash
# 연결된 디바이스 확인
xcrun xctrace list devices

# 디바이스에서 실행
npx expo run:ios --device
```

**주의**: 실제 디바이스에서는 `src/utils/config.ts`에서 Mac의 실제 IP 주소를 설정해야 합니다.

```typescript
// Mac IP 주소 확인
// 터미널에서: ipconfig getifaddr en0

const baseUrl = '192.168.0.124:8000'; // 실제 IP로 변경
```

### 상세 가이드 참고
- 📖 `IOS_BUILD_GUIDE.md` - 빌드 전체 가이드
- 📋 `IOS_TEST_CHECKLIST.md` - 테스트 체크리스트
- 🎤 `AUDIO_DEVICE_GUIDE.md` - 오디오 설정 가이드
- 🔧 `TROUBLESHOOTING.md` - 문제 해결

---

## 💡 유용한 팁

### 빠른 개발 사이클
1. 코드 수정
2. 저장 (⌘ + S)
3. 시뮬레이터에서 ⌘ + R (리로드)
4. 변경사항 즉시 확인

### Hot Reload 활성화
Metro Bundler가 실행 중일 때:
- 파일 저장 시 자동으로 앱이 리로드됩니다
- TypeScript/JavaScript 변경사항은 즉시 반영
- 네이티브 코드 변경 시에만 재빌드 필요

### 개발자 메뉴
시뮬레이터에서 **⌘ + D**로 개발자 메뉴 열기:
- Reload: 앱 리로드
- Debug: Chrome DevTools 연결
- Performance Monitor: FPS, 메모리 확인
- Element Inspector: UI 요소 검사

---

## 📞 도움이 필요하신가요?

### 자주 묻는 질문
1. **Q**: 시뮬레이터가 느려요
   **A**: Xcode > Window > Devices and Simulators에서 다른 시뮬레이터를 선택하거나, Mac을 재시작해보세요.

2. **Q**: 코드를 수정했는데 반영이 안돼요
   **A**: 시뮬레이터에서 ⌘ + R로 리로드하거나, Metro Bundler를 재시작하세요.

3. **Q**: 빌드가 실패해요
   **A**: `npm run ios -- --clean`으로 클린 빌드를 시도하세요.

### 로그 수집
문제 보고 시 다음 정보를 포함하세요:
- Metro Bundler 터미널 출력
- Xcode 콘솔 로그
- 서버 로그
- 에러 메시지 스크린샷

---

## ✨ 요약

```bash
# 1. 서버 실행 (새 터미널)
cd /Users/lucas/workspace/stt-demo/server
python main.py

# 2. 앱 이미 실행 중! (시뮬레이터 확인)
# 또는 재실행:
cd /Users/lucas/workspace/stt-demo/client/mobile/STTMobileApp
npm run ios

# 3. 테스트 시작!
# - 🎤 버튼 클릭
# - 음성 입력
# - 실시간 텍스트 확인
```

**현재 상태**: ✅ iOS 앱 실행 중

이제 실시간 음성 인식을 테스트할 준비가 완료되었습니다! 🎉

