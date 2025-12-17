# ❓ 자주 묻는 질문 (FAQ)

## 일반 질문

### Q: 이 앱은 무엇을 하나요?
A: 실시간으로 음성을 텍스트로 변환하는 모바일 애플리케이션입니다. 마이크로 말하면 즉시 텍스트로 변환되어 화면에 표시됩니다.

### Q: 어떤 플랫폼을 지원하나요?
A: iOS (13.0 이상)와 Android (API 26/Android 8.0 이상)를 모두 지원합니다.

### Q: 오프라인에서도 작동하나요?
A: 아니요, 현재 버전은 서버와의 실시간 통신이 필요하므로 인터넷 연결이 필수입니다.

### Q: 데이터 사용량은 얼마나 되나요?
A: 1분 녹음 시 약 1-2MB의 데이터가 사용됩니다. (오디오 품질에 따라 다름)

## 기술 질문

### Q: 어떤 STT 엔진을 사용하나요?
A: 서버에서 Google Cloud Speech-to-Text, AWS Transcribe, 또는 OpenAI Whisper 등을 사용할 수 있습니다.

### Q: 지연 시간은 얼마나 되나요?
A: 일반적으로 500ms 이하의 지연 시간을 목표로 합니다. 네트워크 상태와 서버 성능에 따라 달라질 수 있습니다.

### Q: 왜 Expo Audio를 사용하나요? 실시간 스트리밍에 적합한가요?
A: Expo Audio는 MVP 단계에서 빠른 개발을 위해 선택했습니다. 프로덕션에서는 `react-native-live-audio-stream` 같은 네이티브 모듈 사용을 권장합니다.

### Q: 서버 코드는 어디에 있나요?
A: 서버 코드는 이 저장소의 `server/` 디렉토리에 있습니다.

## 설치 및 설정

### Q: 설치 중 "Permission denied" 오류가 발생합니다.
A: Node.js와 관련 패키지에 대한 권한을 확인하세요. macOS/Linux에서는 `sudo` 없이 설치하는 것을 권장합니다.

```bash
# nvm 사용 권장
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Q: iOS에서 "Could not find iPhone Simulator" 오류가 발생합니다.
A: Xcode Command Line Tools가 올바르게 설치되어 있는지 확인하세요.

```bash
sudo xcode-select --switch /Applications/Xcode.app
```

### Q: Android 빌드가 실패합니다.
A: ANDROID_HOME 환경 변수가 올바르게 설정되어 있는지 확인하세요.

```bash
echo $ANDROID_HOME
# 결과: /Users/username/Library/Android/sdk (또는 유사한 경로)
```

## 사용 중 문제

### Q: 마이크 권한 요청이 나타나지 않습니다.
A: 앱을 완전히 삭제하고 다시 설치해보세요. 또는 기기 설정에서 권한을 수동으로 변경해보세요.

**iOS:**
설정 → 개인 정보 보호 → 마이크 → STTMobileApp

**Android:**
설정 → 앱 → STTMobileApp → 권한 → 마이크

### Q: "WebSocket connection failed" 오류가 계속 발생합니다.
A: 다음 사항을 확인하세요:

1. **서버가 실행 중인가요?**
   ```bash
   # 서버 디렉토리에서
   python main.py
   ```

2. **서버 URL이 올바른가요?**
   - iOS 시뮬레이터: `ws://localhost:8000/ws/stt`
   - Android 에뮬레이터: `ws://10.0.2.2:8000/ws/stt`
   - 실제 기기: `ws://YOUR_COMPUTER_IP:8000/ws/stt`

3. **방화벽이 차단하고 있나요?**
   방화벽 설정에서 포트 8000을 허용하세요.

4. **네트워크에 연결되어 있나요?**
   WiFi 연결을 확인하세요.

### Q: 음성이 인식되지 않습니다.
A: 다음을 확인하세요:

1. **마이크가 작동하나요?**
   - 다른 앱(예: 음성 메모)에서 녹음을 테스트해보세요.

2. **너무 조용하거나 시끄러운가요?**
   - 적절한 음량으로 명확하게 말해보세요.

3. **서버가 STT 결과를 반환하나요?**
   - 서버 로그를 확인하세요.

### Q: 앱이 느리거나 멈춥니다.
A: 다음을 시도해보세요:

1. **앱 재시작**
   앱을 완전히 종료하고 다시 시작하세요.

2. **캐시 삭제**
   ```bash
   npm start -- --reset-cache
   ```

3. **프로덕션 빌드 테스트**
   개발 모드는 느릴 수 있습니다. 프로덕션 빌드로 테스트하세요.

### Q: 배터리 소모가 심합니다.
A: 다음 최적화를 고려하세요:

1. **샘플링 레이트 낮추기**
   `src/utils/config.ts`에서 16kHz → 8kHz

2. **사용하지 않을 때 연결 끊기**
   녹음하지 않을 때는 WebSocket 연결을 끊으세요.

## 개발 관련

### Q: 새로운 기능을 추가하고 싶습니다.
A: 다음 순서로 진행하세요:

1. 타입 정의 추가 (`src/types/`)
2. 서비스 레이어 구현 (`src/services/`)
3. 훅 구현 (`src/hooks/`)
4. 컴포넌트 구현 (`src/components/`)
5. 테스트 작성

자세한 내용은 [DEVELOPMENT.md](./DEVELOPMENT.md)를 참고하세요.

### Q: 테스트는 어떻게 작성하나요?
A: Jest와 React Native Testing Library를 사용합니다.

```bash
npm test
```

### Q: 코드 스타일 가이드가 있나요?
A: [DEVELOPMENT.md](./DEVELOPMENT.md)의 코딩 컨벤션 섹션을 참고하세요.

### Q: 버그를 발견했습니다. 어떻게 보고하나요?
A: GitHub Issues에 다음 정보와 함께 보고해주세요:

- 버그 설명
- 재현 단계
- 예상 동작 vs 실제 동작
- 환경 정보 (OS, 디바이스, 앱 버전)
- 에러 로그 (있다면)

## 성능 관련

### Q: 인식 정확도를 높이려면?
A: 다음 방법을 시도하세요:

1. **명확하게 발음하기**
2. **배경 소음 줄이기**
3. **적절한 거리 유지** (마이크로부터 10-30cm)
4. **좋은 마이크 사용**
5. **서버 STT 엔진 설정 조정**

### Q: 지연 시간을 줄이려면?
A: 다음 최적화를 시도하세요:

1. **네트워크 최적화**
   - 더 빠른 WiFi 사용
   - 서버를 가까운 리전에 배포

2. **오디오 청크 크기 조정**
   `src/utils/config.ts`에서 `chunkSize` 조정

3. **WebSocket 설정 최적화**
   압축 활성화, 연결 유지 시간 조정

## 보안 관련

### Q: 음성 데이터는 어떻게 처리되나요?
A: 서버 설정에 따라 다르지만, 기본적으로:

- 음성은 실시간으로만 처리되며 저장되지 않습니다.
- WebSocket 통신은 암호화(WSS) 권장
- 프로덕션에서는 HTTPS/WSS 필수

### Q: 개인정보는 안전한가요?
A: 네, 하지만 다음을 확인하세요:

- 프로덕션에서 WSS 사용
- 서버에 적절한 보안 설정
- 개인정보 처리방침 준수

## 기타

### Q: 상업적으로 사용할 수 있나요?
A: MIT 라이선스를 따르므로 자유롭게 사용 가능합니다. 단, STT API 제공업체의 라이선스도 확인하세요.

### Q: 다국어를 지원하나요?
A: 현재 버전은 한국어 위주로 개발되었지만, 서버의 STT 엔진 설정을 변경하면 다국어 지원이 가능합니다.

### Q: 기여하고 싶습니다!
A: 환영합니다! Pull Request를 보내주세요. 기여 가이드라인은 DEVELOPMENT.md를 참고하세요.

### Q: 추가 질문이 있습니다.
A: GitHub Issues에 질문을 올려주세요. 가능한 빨리 답변드리겠습니다.

---

**도움이 되셨나요?** 더 많은 정보는 [README.md](./README.md), [SETUP.md](./SETUP.md), [DEVELOPMENT.md](./DEVELOPMENT.md)를 참고하세요.

