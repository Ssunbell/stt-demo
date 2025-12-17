/**
 * 헬퍼 유틸리티 함수들
 */

/**
 * Base64 인코딩
 * @param data - 인코딩할 데이터
 * @returns Base64 인코딩된 문자열
 */
export const encodeBase64 = (data: string): string => {
  try {
    return btoa(data);
  } catch (error) {
    console.error('Base64 encoding failed:', error);
    return '';
  }
};

/**
 * Base64 디코딩
 * @param data - 디코딩할 Base64 문자열
 * @returns 디코딩된 문자열
 */
export const decodeBase64 = (data: string): string => {
  try {
    return atob(data);
  } catch (error) {
    console.error('Base64 decoding failed:', error);
    return '';
  }
};

/**
 * 시간 포맷팅 (mm:ss 형식)
 * @param seconds - 초 단위 시간
 * @returns 포맷된 시간 문자열
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 디바운스 함수
 * @param func - 실행할 함수
 * @param wait - 대기 시간 (ms)
 * @returns 디바운스된 함수
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * 쓰로틀 함수
 * @param func - 실행할 함수
 * @param limit - 제한 시간 (ms)
 * @returns 쓰로틀된 함수
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * UUID 생성
 * @returns UUID 문자열
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 바이트 크기를 사람이 읽기 쉬운 형식으로 변환
 * @param bytes - 바이트 크기
 * @returns 포맷된 크기 문자열
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 텍스트 트림 및 다중 공백 제거
 * @param text - 처리할 텍스트
 * @returns 정리된 텍스트
 */
export const cleanText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * 배열을 청크로 나누기
 * @param array - 나눌 배열
 * @param size - 청크 크기
 * @returns 청크로 나뉜 배열
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

