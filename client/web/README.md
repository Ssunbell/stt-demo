# STT Frontend

Next.js 기반 실시간 음성-텍스트 변환 웹 애플리케이션

## 기능

- 🎤 브라우저 마이크를 통한 실시간 음성 입력
- 🔄 WebSocket 기반 실시간 STT 스트리밍
- 📝 임시 및 확정 텍스트 구분 표시
- 📋 텍스트 복사 기능
- 🎨 모던하고 반응형 UI (TailwindCSS)
- 🌙 다크 모드 지원

## 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 편집:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/stt
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 프로젝트 구조

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── AudioRecorder.tsx   # 녹음 컨트롤 및 WebSocket
│   ├── TranscriptView.tsx  # 텍스트 표시
│   └── StatusIndicator.tsx # 상태 표시
├── lib/
│   └── (utility functions)
└── public/
    └── (static assets)
```

## 컴포넌트 설명

### AudioRecorder
- 마이크 권한 요청
- WebSocket 연결 관리
- 오디오 스트림 캡처 및 전송
- 16kHz, mono 오디오 포맷

### TranscriptView
- 실시간 텍스트 표시
- 임시/확정 텍스트 구분
- 타임스탬프 표시
- 텍스트 복사 기능
- 자동 스크롤

### StatusIndicator
- 연결 상태 시각화
- 에러 메시지 표시

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
npm run start
```

### 환경 변수 (프로덕션)

프로덕션 환경에서는 `.env.local`에 실제 백엔드 URL 설정:

```env
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com/ws/stt
```

## 브라우저 호환성

- ✅ Chrome 80+
- ✅ Edge 80+
- ✅ Safari 14+
- ✅ Firefox 75+

**요구사항:**
- MediaRecorder API 지원
- WebSocket API 지원
- getUserMedia() 지원

## 트러블슈팅

### 마이크 권한 오류
- 브라우저 설정에서 마이크 권한 확인
- HTTPS 또는 localhost에서만 작동 (보안 컨텍스트 필요)

### WebSocket 연결 실패
- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인
- 방화벽 설정 확인

### 오디오 품질 문제
- 마이크 입력 레벨 확인
- 노이즈가 적은 환경에서 테스트
- 브라우저별 MediaRecorder 설정 차이 확인

## 개발 가이드

### 새 기능 추가

1. 컴포넌트 생성: `components/YourComponent.tsx`
2. 타입 정의: `app/page.tsx` 또는 별도 타입 파일
3. 스타일링: TailwindCSS 유틸리티 클래스 사용

### 오디오 처리 커스터마이징

`components/AudioRecorder.tsx`의 `startMediaRecorder` 함수에서:
- 청크 크기 조정 (`mediaRecorder.start(100)`)
- 오디오 포맷 변경
- 리샘플링 로직 추가

## 라이선스

MIT
