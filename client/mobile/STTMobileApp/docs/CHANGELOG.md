# 📝 Changelog

모든 주요 변경사항은 이 파일에 기록됩니다.

## [1.1.0] - 2024-12-14

### ✨ 추가됨

#### 실시간 오디오 스트리밍
- **react-native-live-audio-stream** 통합
  - iOS/Android에서 실시간 PCM 오디오 스트리밍 지원
  - 16kHz, 16-bit, 모노 채널 오디오 캡처
  - Base64 인코딩 자동 처리

#### 웹 플랫폼 지원 개선
- **Web Audio API** 구현
  - AudioContext + ScriptProcessorNode 사용
  - 실시간 Float32 → Int16 PCM 변환
  - 노이즈 제거 및 에코 캔슬레이션 지원

#### 타입 정의
- `react-native-live-audio-stream.d.ts` 추가
  - 완전한 TypeScript 타입 지원

#### 문서
- `AUDIO_STREAMING_GUIDE.md` - 상세 구현 가이드
- `TESTING_GUIDE.md` - 완전한 테스트 가이드
- `IMPLEMENTATION_SUMMARY.md` - 구현 요약
- `QUICKSTART_STREAMING.md` - 빠른 시작 가이드
- `CHANGELOG.md` - 변경 이력 (현재 파일)

### 🔄 변경됨

#### AudioService 개선
- **src/services/AudioService.ts** 완전히 재작성
  - 플랫폼별 오디오 캡처 구현 (웹/모바일)
  - 실시간 스트리밍 지원
  - 메모리 누수 방지
  - 리소스 자동 해제

#### 설정 관리
- `src/utils/config.ts`에 오디오 설정 중앙 관리
  - AUDIO_CONFIG 추가
  - WEBSOCKET_CONFIG 추가
  - UI_CONFIG 추가

### 🐛 수정됨

- iOS/Android에서 실시간 오디오 데이터 전송 안 되던 문제 해결
- 웹에서 오디오 지연 시간 감소
- 플랫폼 간 일관된 오디오 품질

### 📦 의존성

- ➕ `react-native-live-audio-stream@1.1.1` 추가

### 🔧 내부

- 플랫폼별 오디오 캡처 로직 분리
- PCM 데이터 변환 로직 최적화
- Base64 인코딩 성능 개선

---

## [1.0.0] - 2024-12-13

### ✨ 초기 릴리스

#### 핵심 기능
- 실시간 음성 인식 (STT)
- WebSocket 기반 서버 통신
- 중간/최종 결과 표시
- 자동 재연결
- 권한 관리

#### 컴포넌트
- AudioRecorder - 녹음 컨트롤
- StatusIndicator - 상태 표시
- TranscriptView - 트랜스크립트 뷰
- ErrorDisplay - 에러 표시

#### 서비스
- WebSocketService - WebSocket 통신
- AudioService - 오디오 녹음 (Expo Audio 기반)

#### 훅
- useRealTimeSTT - 메인 STT 로직

#### 플랫폼
- iOS 지원
- Android 지원
- 웹 지원 (제한적)

### 📦 의존성

- `expo@54.0.29`
- `expo-av@16.0.8`
- `react@19.1.0`
- `react-native@0.81.5`

---

## 범례

- ✨ 추가됨 - 새로운 기능
- 🔄 변경됨 - 기존 기능의 변경
- 🐛 수정됨 - 버그 수정
- ❌ 제거됨 - 기능 제거
- 🔒 보안 - 보안 관련 변경
- 📦 의존성 - 의존성 변경
- 🔧 내부 - 내부 구조 변경
- 📝 문서 - 문서 변경

---

## 버전 관리

이 프로젝트는 [Semantic Versioning](https://semver.org/)을 따릅니다:

- **MAJOR** (1.x.x): 호환되지 않는 API 변경
- **MINOR** (x.1.x): 하위 호환성을 유지하면서 기능 추가
- **PATCH** (x.x.1): 하위 호환성을 유지하는 버그 수정

---

## 다음 릴리스 계획

### [1.2.0] (예정)

- [ ] 오프라인 모드 지원
- [ ] 음성 명령 지원
- [ ] 다국어 지원 (영어, 일본어)
- [ ] 텍스트 편집 기능
- [ ] 저장/내보내기 기능

### [2.0.0] (예정)

- [ ] 오디오 압축 (Opus)
- [ ] 클라우드 동기화
- [ ] 커스텀 단어장
- [ ] 음성 프로필 저장
- [ ] 배경 녹음 지원
