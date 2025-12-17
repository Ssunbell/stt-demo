import { useState, useRef, useEffect, useCallback } from 'react';
import { WebSocketService } from '../services/WebSocketService';
import { AudioService } from '../services/AudioService';
import { RecordingState, TranscriptItem, AudioConfig } from '../types';
import { logger } from '../utils/logger';

const DEFAULT_CONFIG: AudioConfig = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  encoding: 'pcm_s16le',
};

export const useRealTimeSTT = (serverUrl: string) => {
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [interimText, setInterimText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const wsService = useRef<WebSocketService | null>(null);
  const audioService = useRef<AudioService | null>(null);
  const isStoppingRef = useRef<boolean>(false); // 중지 중인지 추적
  const isStartingRef = useRef<boolean>(false); // 시작 중인지 추적
  const recordingStateRef = useRef<RecordingState>(RecordingState.IDLE); // 상태 추적용 ref
  
  // recordingStateRef 동기화
  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  useEffect(() => {
    // 오디오 서비스만 초기화 (WebSocket은 startRecording에서 생성)
    audioService.current = new AudioService(DEFAULT_CONFIG);
    
    logger.info('🎧 Audio service initialized');

    return () => {
      // 클린업: 모든 연결 종료
      if (wsService.current) {
        wsService.current.disconnect();
        wsService.current = null;
      }
      logger.info('🧹 Cleanup: All services disconnected');
    };
  }, []);

  const startRecording = useCallback(async () => {
    // 디버깅: 호출 스택 로그
    console.log('🚨 startRecording called!', {
      isStarting: isStartingRef.current,
      isStopping: isStoppingRef.current,
      state: recordingStateRef.current
    });
    console.trace('Call stack:');
    
    // 이미 시작 중이면 무시 (중복 클릭 방지)
    if (isStartingRef.current) {
      logger.warn('⚠️ Already starting, ignoring duplicate request');
      return;
    }
    
    // 중지 중이면 시작하지 않음
    if (isStoppingRef.current) {
      logger.warn('⚠️ Recording is stopping, cannot start new recording');
      return;
    }

    // 이미 녹음 중이면 시작하지 않음 (ref 사용)
    if (recordingStateRef.current === RecordingState.RECORDING || 
        recordingStateRef.current === RecordingState.CONNECTING) {
      logger.warn('⚠️ Already recording, ignoring start request');
      return;
    }

    if (!audioService.current) {
      setError('서비스가 초기화되지 않았습니다.');
      return;
    }

    try {
      // 시작 플래그 설정
      isStartingRef.current = true;
      
      logger.info('🎙️ Starting recording...');
      setError('');
      setRecordingState(RecordingState.CONNECTING);

      // 권한 확인
      const hasPermission = await audioService.current.requestPermissions();
      if (!hasPermission) {
        setError('마이크 권한이 필요합니다.');
        setRecordingState(RecordingState.ERROR);
        return;
      }

      // 새로운 WebSocket 서비스 생성 (항상 깨끗한 상태)
      if (wsService.current) {
        wsService.current.disconnect();
        wsService.current = null;
      }
      
      wsService.current = new WebSocketService(serverUrl);
      
      // 이벤트 핸들러 재등록
      wsService.current.onMessage((message) => {
        if (message.type === 'transcript') {
          if (message.isFinal) {
            logger.stt.final(message.text);
            const newTranscript: TranscriptItem = {
              id: Date.now().toString(),
              text: message.text,
              isFinal: true,
              timestamp: Date.now(),
            };
            setTranscripts((prev) => [...prev, newTranscript]);
            setInterimText('');
          } else {
            logger.stt.interim(message.text);
            setInterimText(message.text);
          }
        } else if (message.type === 'error') {
          logger.stt.error(message.message);
          setError(message.message);
          setRecordingState(RecordingState.ERROR);
        }
      });

      wsService.current.onConnection((connected) => {
        logger.info(`WebSocket: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
        setIsConnected(connected);
      });

      wsService.current.onError((errorMsg) => {
        setError(errorMsg);
        setRecordingState(RecordingState.ERROR);
      });

      // WebSocket 연결
      logger.info('Creating new WebSocket connection...');
      await wsService.current.connect();

      // 스트리밍 시작 신호 전송
      wsService.current.send({
        event: 'start_stream',
        config: {
          sampleRate: DEFAULT_CONFIG.sampleRate,
          encoding: DEFAULT_CONFIG.encoding,
        },
      });

      // 오디오 녹음 시작
      await audioService.current.startRecording((audioData) => {
        if (wsService.current?.isConnected()) {
          wsService.current.send({
            event: 'audio_data',
            payload: audioData,
          });
        }
      });

      setRecordingState(RecordingState.RECORDING);
      logger.info('✅ Recording started successfully');
      
      // 시작 완료 후 플래그 해제
      isStartingRef.current = false;
    } catch (err) {
      logger.error('Failed to start recording:', err);
      
      // 에러 메시지 추출 (원본 에러 메시지 보존)
      const errorMessage = err instanceof Error ? err.message : '녹음을 시작할 수 없습니다.';
      setError(errorMessage);
      setRecordingState(RecordingState.ERROR);
      
      // 에러 발생 시에도 플래그 해제
      isStartingRef.current = false;
    }
  }, [serverUrl]); // ✅ recordingState 제거!

  const stopRecording = useCallback(async () => {
    // 디버깅: 호출 스택 로그
    console.log('🛑 stopRecording called!');
    console.trace('Call stack:');
    
    // 중지 플래그 설정 (startRecording 방지)
    isStoppingRef.current = true;
    
    if (!audioService.current) {
      isStoppingRef.current = false;
      return;
    }

    try {
      logger.info('⏹️ Stopping recording...');
      
      // 녹음 상태를 즉시 IDLE로 변경 (버튼 UI 즉시 업데이트)
      setRecordingState(RecordingState.IDLE);
      
      // 오디오 녹음 중지
      await audioService.current.stopRecording();

      // WebSocket 연결 종료
      if (wsService.current) {
        if (wsService.current.isConnected()) {
          // end_stream 메시지 전송
          wsService.current.send({
            event: 'end_stream',
            reason: 'user_stop',
          });
          
          // 메시지 전송 후 연결 종료
          setTimeout(() => {
            if (wsService.current) {
              wsService.current.disconnect();
              wsService.current = null; // 완전히 제거
              setIsConnected(false);
              logger.info('✅ WebSocket disconnected and cleared');
            }
            // 중지 완료 후 플래그 해제
            isStoppingRef.current = false;
          }, 150);
        } else {
          logger.info('WebSocket already disconnected');
          wsService.current = null;
          setIsConnected(false);
          isStoppingRef.current = false;
        }
      } else {
        isStoppingRef.current = false;
      }
      
      logger.info('✅ Recording stopped successfully');
    } catch (err) {
      logger.error('Failed to stop recording:', err);
      setError('녹음을 중지할 수 없습니다.');
      setRecordingState(RecordingState.ERROR);
      isStoppingRef.current = false;
    }
  }, []);

  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
    setInterimText('');
  }, []);

  const clearError = useCallback(() => {
    setError('');
    if (recordingStateRef.current === RecordingState.ERROR) {
      setRecordingState(RecordingState.IDLE);
    }
  }, []);

  return {
    recordingState,
    transcripts,
    interimText,
    error,
    isConnected,
    startRecording,
    stopRecording,
    clearTranscripts,
    clearError,
  };
};

