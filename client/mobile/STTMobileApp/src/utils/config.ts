/**
 * 앱 설정 파일
 * 환경별로 다른 설정을 사용할 수 있도록 구성
 */

import { Platform } from 'react-native';

// 개발 환경 여부 확인
const isDevelopment = __DEV__;

// 현재 환경에 맞는 설정 선택 (함수로 지연 실행)
export const getServerConfig = () => {
  /**
   * 개발 서버 주소 자동 감지
   * - iOS 시뮬레이터: localhost
   * - Android 에뮬레이터: 10.0.2.2 (Android 에뮬레이터의 호스트 머신 주소)
   * - 실제 기기: 컴퓨터의 로컬 IP (아래에서 수동 설정)
   */
  const getDevServerHost = () => {
    // 개발 서버 IP 주소 (Mac의 로컬 IP)
    // 터미널에서 ifconfig | grep "inet " 로 확인 가능
    const DEV_MACHINE_IP = '172.16.9.176';
    
    try {
      if (Platform.OS === 'web') {
        return 'localhost'; // 웹에서만 localhost 사용
      }
      // iOS 시뮬레이터/Android 에뮬레이터 모두 실제 IP 사용
      return DEV_MACHINE_IP;
    } catch (error) {
      // Platform이 아직 준비되지 않은 경우 기본값 반환
      console.warn('⚠️ Platform not ready, using localhost');
      return 'localhost';
    }
  };

  // 실제 기기에서 테스트할 때는 이 주소를 컴퓨터의 로컬 IP로 변경하세요
  // 예: const DEV_SERVER_HOST = '192.168.1.100';
  const DEV_SERVER_HOST = getDevServerHost();

  // 서버 URL 설정
  const SERVER_CONFIG = {
    // 개발 환경
    development: {
      wsUrl: `ws://${DEV_SERVER_HOST}:8000/ws/stt`,
      apiUrl: `http://${DEV_SERVER_HOST}:8000/api`,
    },
    // 프로덕션 환경
    production: {
      wsUrl: 'wss://your-production-server.com/ws/stt',
      apiUrl: 'https://your-production-server.com/api',
    },
  };

  const config = isDevelopment ? SERVER_CONFIG.development : SERVER_CONFIG.production;
  console.log(`🔌 Connecting to: ${config.wsUrl}`);
  return config;
};

// 오디오 설정
export const AUDIO_CONFIG = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  encoding: 'pcm_s16le',
  // 청크 크기 (ms)
  chunkSize: 100,
};

// WebSocket 설정
export const WEBSOCKET_CONFIG = {
  maxReconnectAttempts: 3,
  reconnectDelay: 2000,
  pingInterval: 30000, // 30초마다 ping
};

// UI 설정
export const UI_CONFIG = {
  // 트랜스크립트 자동 스크롤
  autoScroll: true,
  // 애니메이션 활성화
  enableAnimations: true,
  // 최대 표시할 트랜스크립트 수
  maxTranscripts: 100,
};

// 로깅 설정
export const LOG_CONFIG = {
  enableLogging: isDevelopment,
  logLevel: isDevelopment ? 'debug' : 'error',
};
