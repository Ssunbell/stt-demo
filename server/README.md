# STT Backend Service

FastAPI 기반 실시간 음성-텍스트 변환 백엔드 서버

## 기능

- WebSocket 기반 실시간 STT 스트리밍
- Google Cloud Speech-to-Text v2 API (Chirp 3 모델)
- 한국어 최적화
- 4분마다 자동 세션 재시작

## 설치

```bash
# 의존성 설치
pip install -r requirements.txt

# 또는 uv 사용
uv pip install -r requirements.txt
```

## 환경 설정

```bash
# .env 파일 생성
cp .env.example .env

# Google Cloud 인증 파일 경로 확인
# GOOGLE_APPLICATION_CREDENTIALS가 올바른 경로를 가리키는지 확인
```

## 실행

```bash
# 개발 모드 (자동 재시작)
python main.py

# 또는 uvicorn 직접 실행
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API 엔드포인트

### HTTP

- `GET /` - 서비스 정보
- `GET /health` - 헬스 체크

### WebSocket

- `WS /ws/stt` - 실시간 STT 스트리밍

## WebSocket 프로토콜

### 클라이언트 → 서버

바이너리 오디오 데이터 (16kHz, mono, LINEAR16)

### 서버 → 클라이언트

JSON 메시지:

```json
{
  "type": "transcript",
  "transcript": "인식된 텍스트",
  "is_final": false,
  "timestamp": 12345,
  "confidence": 0.95  // final 결과에만 포함
}
```

에러 메시지:

```json
{
  "type": "error",
  "message": "에러 메시지"
}
```

## 테스트

```bash
# Python으로 WebSocket 테스트
python test_websocket.py
```

## 구조

```
backend/
├── main.py              # FastAPI 앱 및 WebSocket 핸들러
├── stt_service.py       # STT 스트리밍 서비스
├── config.py            # 설정
├── requirements.txt     # 의존성
└── .env                 # 환경 변수
```

## 주의사항

1. Google Cloud 인증 파일 (`telos-7b2f6-098fa70d75c7.json`)이 필요합니다
2. Speech-to-Text v2 API가 활성화되어야 합니다
3. Chirp 3 모델 사용을 위해 적절한 권한이 필요합니다
4. 오디오 포맷: 16kHz, mono, LINEAR16 (PCM)
