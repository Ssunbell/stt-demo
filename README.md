# stt-demo

Google Cloud Speech-to-Text API를 사용한 실시간 음성 인식 데모 프로젝트입니다.

## 프로젝트 구조

```
stt-demo/
├── server/          # FastAPI 백엔드 서버
└── client/
    └── web/         # Next.js 웹 클라이언트
```

## 서버 설정 및 실행

### 1. 사전 요구사항
- Python 3.13 이상
- Google Cloud 프로젝트 및 Speech-to-Text API 활성화
- Google Cloud 서비스 계정 JSON 키

### 2. 환경 설정

서버 디렉토리로 이동:
```bash
cd server
```

환경 변수 파일 생성:
```bash
cp .env.example .env
```

`.env` 파일 편집하여 다음 값들을 설정:
```
GOOGLE_CLOUD_PROJECT="your-google-cloud-project-id"
GOOGLE_APPLICATION_CREDENTIALS="path/to/your-service-account-key.json"
STT_LOCATION=asia-northeast1
STT_MODEL=chirp_3
HOST=0.0.0.0
PORT=8000
```

### 3. 의존성 설치

[uv](https://docs.astral.sh/uv/)를 사용하여 의존성 설치:
```bash
uv sync
```

또는 pip를 사용하는 경우:
```bash
pip install -r requirements.txt
```

### 4. 서버 실행

```bash
python main.py
```

또는 uv를 사용:
```bash
uv run python main.py
```

서버가 실행되면 다음 주소에서 접근 가능합니다:
- HTTP: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws/stt`
- API 문서: `http://localhost:8000/docs`

## 클라이언트 설정 및 실행

### 1. 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 2. 환경 설정

클라이언트 웹 디렉토리로 이동:
```bash
cd client/web
```

환경 변수 파일 생성:
```bash
cp .env.local.example .env.local
```

`.env.local` 파일의 WebSocket URL 확인 (기본값):
```
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/stt
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접근하여 애플리케이션을 사용할 수 있습니다.

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## 전체 실행 순서

1. **서버 실행** (터미널 1)
   ```bash
   cd server
   python main.py
   ```

2. **클라이언트 실행** (터미널 2)
   ```bash
   cd client/web
   npm run dev
   ```

3. 브라우저에서 `http://localhost:3000` 접속

## 기술 스택

### 서버
- FastAPI - 웹 프레임워크
- Google Cloud Speech-to-Text API - 음성 인식
- WebSocket - 실시간 통신
- Uvicorn - ASGI 서버

### 클라이언트
- Next.js 14 - React 프레임워크
- TypeScript - 타입 안정성
- TailwindCSS - 스타일링
- Lucide React - 아이콘
