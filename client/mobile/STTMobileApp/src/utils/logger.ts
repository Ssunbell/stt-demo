/**
 * 로깅 유틸리티
 * 개발 환경에서만 로그를 출력하고, 프로덕션에서는 에러만 기록
 */

const isDevelopment = __DEV__;

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  // WebSocket 관련 로그
  ws: {
    connected: () => logger.info('WebSocket: Connected'),
    disconnected: () => logger.warn('WebSocket: Disconnected'),
    error: (error: any) => logger.error('WebSocket Error:', error),
    sent: (message: any) => logger.debug('WebSocket Sent:', message),
    received: (message: any) => logger.debug('WebSocket Received:', message),
  },

  // 오디오 관련 로그
  audio: {
    started: () => logger.info('Audio: Recording started'),
    stopped: () => logger.info('Audio: Recording stopped'),
    error: (error: any) => logger.error('Audio Error:', error),
    permission: (granted: boolean) => 
      logger.info(`Audio Permission: ${granted ? 'Granted' : 'Denied'}`),
  },

  // STT 관련 로그
  stt: {
    interim: (text: string) => logger.debug('STT Interim:', text),
    final: (text: string) => logger.info('STT Final:', text),
    error: (error: any) => logger.error('STT Error:', error),
  },
};

