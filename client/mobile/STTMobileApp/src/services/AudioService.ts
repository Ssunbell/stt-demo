import { Audio } from 'expo-av';
import { AudioConfig } from '../types';
import { logger } from '../utils/logger';
import { Platform } from 'react-native';

// react-native-live-audio-stream 타입 정의
interface LiveAudioStream {
  init: (options: {
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
    audioSource?: number;
    bufferSize?: number;
  }) => void;
  start: () => void;
  stop: () => void;
  on: (event: 'data', callback: (data: string) => void) => void;
  off: (event: 'data') => void;
}

// 동적 import를 위한 타입
let LiveAudioStreamModule: LiveAudioStream | null = null;
let isExpoGo = false; // Expo Go 환경 감지

export class AudioService {
  private recording: Audio.Recording | null = null;
  private config: AudioConfig;
  private onDataCallback?: (audioData: string) => void;
  private recordingInterval?: NodeJS.Timeout;
  
  // 웹용 Web Audio API
  private audioContext?: AudioContext;
  private mediaStream?: MediaStream;
  private scriptProcessor?: ScriptProcessorNode;
  private sourceNode?: MediaStreamAudioSourceNode;
  
  private isCurrentlyRecording: boolean = false;

  constructor(config: AudioConfig) {
    this.config = config;
    
    // Platform이 준비된 후 초기화 (지연 실행)
    setTimeout(() => {
      try {
        // 모바일에서 react-native-live-audio-stream 초기화
        if (Platform.OS !== 'web') {
          this.initializeLiveAudioStream();
        }
      } catch (error) {
        logger.warn('⚠️ Platform not ready in constructor, will initialize on first use');
      }
    }, 0);
  }

  private initializeLiveAudioStream() {
    try {
      // react-native-live-audio-stream 동적 import
      const LiveAudioStreamRaw = require('react-native-live-audio-stream');
      // default export 처리 (CommonJS/ESM 호환)
      const LiveAudioStream = LiveAudioStreamRaw.default || LiveAudioStreamRaw;
      
      // 디버그 로깅
      logger.info('LiveAudioStream module loaded:', {
        hasDefault: !!LiveAudioStreamRaw.default,
        hasInit: typeof LiveAudioStream?.init === 'function',
        keys: Object.keys(LiveAudioStream || {}),
      });
      
      // 모듈이 제대로 로드되었는지 확인
      if (!LiveAudioStream || typeof LiveAudioStream.init !== 'function') {
        throw new Error('LiveAudioStream module not properly loaded (check native module linking)');
      }
      
      LiveAudioStreamModule = LiveAudioStream as LiveAudioStream;
      
      // 오디오 스트림 설정
      LiveAudioStreamModule.init({
        sampleRate: this.config.sampleRate,
        channels: this.config.channels,
        bitsPerSample: this.config.bitsPerSample,
        audioSource: 6, // VOICE_RECOGNITION (Android)
        bufferSize: 4096,
      });
      
      logger.info('✅ LiveAudioStream initialized for mobile');
    } catch (error) {
      // Expo Go 환경으로 표시
      isExpoGo = true;
      LiveAudioStreamModule = null;
      
      logger.error('Failed to initialize LiveAudioStream:', error);
      logger.warn('⚠️ Running in Expo Go - Native modules not available');
      logger.info('💡 Use "npm run web" for testing, or run "npx expo run:ios/android" for native build');
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // 웹에서는 getUserMedia로 권한 확인
        await navigator.mediaDevices.getUserMedia({ audio: true });
        logger.audio.permission(true);
        return true;
      }
      
      // 모바일에서는 Expo Audio 권한 사용
      const { granted } = await Audio.requestPermissionsAsync();
      logger.audio.permission(granted);
      return granted;
    } catch (error) {
      logger.audio.error(error);
      return false;
    }
  }

  async startRecording(onData: (audioData: string) => void): Promise<void> {
    if (this.isCurrentlyRecording) {
      logger.warn('⚠️ Already recording');
      return;
    }

    this.onDataCallback = onData;
    this.isCurrentlyRecording = true;

    try {
      // LiveAudioStream이 초기화되지 않았다면 지금 초기화
      if (!LiveAudioStreamModule && Platform.OS !== 'web') {
        this.initializeLiveAudioStream();
      }
      
      if (Platform.OS === 'web') {
        await this.startWebRecording(onData);
      } else {
        await this.startMobileRecording(onData);
      }
      
      logger.audio.started();
    } catch (error) {
      this.isCurrentlyRecording = false;
      logger.audio.error(error);
      throw error;
    }
  }

  /**
   * 웹 플랫폼: Web Audio API를 사용한 실시간 PCM 스트리밍
   */
  private async startWebRecording(onData: (audioData: string) => void): Promise<void> {
    try {
      // MediaStream 획득
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // AudioContext 생성
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.sampleRate,
      });

      // MediaStream을 AudioContext에 연결
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // ScriptProcessor 생성 (실시간 오디오 처리)
      const bufferSize = 4096;
      this.scriptProcessor = this.audioContext.createScriptProcessor(
        bufferSize,
        this.config.channels,
        this.config.channels
      );

      // 오디오 데이터 처리
      this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        if (!this.isCurrentlyRecording) return;

        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0); // 모노 채널

        // Float32Array를 Int16Array로 변환 (PCM s16le)
        const pcmData = this.convertFloat32ToInt16(inputData);

        // ArrayBuffer를 Base64로 인코딩
        const base64Audio = this.arrayBufferToBase64(pcmData.buffer);

        // 콜백 호출
        onData(base64Audio);
      };

      // 노드 연결
      this.sourceNode.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      logger.info('✅ Web Audio API 실시간 스트리밍 시작');
    } catch (error) {
      logger.error('Failed to start web recording:', error);
      throw error;
    }
  }

  /**
   * 모바일 플랫폼: react-native-live-audio-stream 사용
   */
  private async startMobileRecording(onData: (audioData: string) => void): Promise<void> {
    if (!LiveAudioStreamModule) {
      // Expo Go 환경에서는 명확한 에러 메시지
      if (isExpoGo) {
        const errorMessage = 
          '❌ Expo Go에서는 실시간 오디오 스트리밍을 사용할 수 없습니다.\n\n' +
          '해결 방법:\n' +
          '1. 웹에서 테스트: npm run web\n' +
          '2. 네이티브 빌드 실행:\n' +
          '   - iOS: npx expo run:ios\n' +
          '   - Android: npx expo run:android\n' +
          '3. Development Build 생성: eas build --profile development\n\n' +
          '자세한 내용은 QUICKSTART_STREAMING.md를 참고하세요.';
        
        logger.error(errorMessage);
        throw new Error('Expo Go는 네이티브 모듈을 지원하지 않습니다. 웹 버전을 사용하거나 네이티브 빌드를 생성하세요.');
      }
      
      throw new Error('LiveAudioStream module not initialized');
    }

    try {
      // iOS에서 오디오 세션 설정
      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: 1, // Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX
        });
      }

      // 오디오 데이터 리스너 등록
      LiveAudioStreamModule.on('data', (data: string) => {
        if (this.isCurrentlyRecording && this.onDataCallback) {
          // data는 이미 base64로 인코딩된 PCM 데이터
          this.onDataCallback(data);
        }
      });

      // 녹음 시작
      LiveAudioStreamModule.start();

      logger.info('✅ 모바일 실시간 오디오 스트리밍 시작 (LiveAudioStream)');
    } catch (error) {
      logger.error('Failed to start mobile recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.isCurrentlyRecording) {
      return null;
    }

    this.isCurrentlyRecording = false;

    try {
      if (Platform.OS === 'web') {
        await this.stopWebRecording();
      } else {
        await this.stopMobileRecording();
      }

      logger.audio.stopped();
      return null;
    } catch (error) {
      logger.audio.error(error);
      return null;
    }
  }

  /**
   * 웹 녹음 중지
   */
  private async stopWebRecording(): Promise<void> {
    try {
      // ScriptProcessor 연결 해제
      if (this.scriptProcessor) {
        this.scriptProcessor.disconnect();
        this.scriptProcessor.onaudioprocess = null;
        this.scriptProcessor = undefined;
      }

      // SourceNode 연결 해제
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = undefined;
      }

      // MediaStream 트랙 중지
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = undefined;
      }

      // AudioContext 닫기
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = undefined;
      }

      logger.info('✅ Web recording stopped');
    } catch (error) {
      logger.error('Failed to stop web recording:', error);
    }
  }

  /**
   * 모바일 녹음 중지
   */
  private async stopMobileRecording(): Promise<void> {
    if (!LiveAudioStreamModule) {
      return;
    }

    try {
      // 녹음 중지
      LiveAudioStreamModule.stop();

      // 리스너 제거
      LiveAudioStreamModule.off('data');

      logger.info('✅ Mobile recording stopped');
    } catch (error) {
      logger.error('Failed to stop mobile recording:', error);
    }
  }

  /**
   * Float32Array를 Int16Array로 변환 (PCM s16le)
   */
  private convertFloat32ToInt16(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // -1.0 ~ 1.0 범위를 -32768 ~ 32767로 변환
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  /**
   * ArrayBuffer를 Base64 문자열로 변환
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  isRecording(): boolean {
    return this.isCurrentlyRecording;
  }
}

