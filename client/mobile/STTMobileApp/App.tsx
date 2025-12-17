import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, Platform, Alert, Linking } from 'react-native';
import { useRealTimeSTT } from './src/hooks/useRealTimeSTT';
import { StatusIndicator } from './src/components/StatusIndicator';
import { TranscriptView } from './src/components/TranscriptView';
import { AudioRecorder } from './src/components/AudioRecorder';
import { ErrorDisplay } from './src/components/ErrorDisplay';
import { ExpoGoWarning } from './src/components/ExpoGoWarning';
import { getServerConfig } from './src/utils/config';

export default function App() {
  const [showExpoGoWarning, setShowExpoGoWarning] = useState(false);
  const [serverUrl, setServerUrl] = useState('ws://localhost:8000/ws/stt');
  const [isExpoGo, setIsExpoGo] = useState(false);
  
  // Platform과 서버 URL을 useEffect에서 초기화
  useEffect(() => {
    // 서버 URL 설정
    try {
      const config = getServerConfig();
      setServerUrl(config.wsUrl);
    } catch (error) {
      console.log('⚠️ Using default server URL');
    }
    
    // Expo Go 환경 감지
    try {
      if (Platform.OS === 'web') {
        setIsExpoGo(false);
      } else {
        // react-native-live-audio-stream이 없으면 Expo Go
        const module = require('react-native-live-audio-stream');
        setIsExpoGo(!module || typeof module.init !== 'function');
      }
    } catch {
      setIsExpoGo(true);
    }
  }, []);
  
  const {
    recordingState,
    transcripts,
    interimText,
    error,
    isConnected,
    startRecording,
    stopRecording,
    clearTranscripts,
    clearError,
  } = useRealTimeSTT(serverUrl);

  // 핸들러를 useCallback으로 래핑 (안정화)
  const handleStart = useCallback(() => {
    console.log('📱 App: Start button pressed');
    startRecording();
  }, [startRecording]);

  const handleStop = useCallback(() => {
    console.log('📱 App: Stop button pressed');
    stopRecording();
  }, [stopRecording]);

  const handleClear = useCallback(() => {
    console.log('📱 App: Clear button pressed');
    clearTranscripts();
  }, [clearTranscripts]);

  // Expo Go 경고 표시
  useEffect(() => {
    if (isExpoGo && Platform.OS !== 'web') {
      // 2초 후에 경고 표시 (초기 로딩 후)
      const timer = setTimeout(() => {
        setShowExpoGoWarning(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Expo Go 에러 감지 - Alert로 즉시 표시
  useEffect(() => {
    if (error.includes('Expo Go') || error.includes('네이티브 모듈')) {
      // 즉시 Alert 표시
      Alert.alert(
        '⚠️ 네이티브 모듈 오류',
        'Expo Go는 네이티브 모듈을 지원하지 않습니다.\n\n해결 방법:\n1. 웹에서 테스트: npm run web\n2. 네이티브 빌드 실행: npx expo run:ios\n\n네이티브 빌드를 사용 중인데도 이 에러가 나타나면 앱을 완전히 종료 후 재시작하세요.',
        [
          { 
            text: '상세 정보', 
            onPress: () => setShowExpoGoWarning(true),
            style: 'default'
          },
          { 
            text: '확인', 
            style: 'cancel',
            onPress: () => clearError()
          },
        ],
        { cancelable: false }
      );
    }
  }, [error, clearError]);

  // 마이크 권한 안내
  useEffect(() => {
    if (error.includes('권한') && !error.includes('Expo Go') && !error.includes('네이티브 모듈')) {
      Alert.alert(
        '마이크 권한 필요',
        '이 앱은 음성 녹음을 위해 마이크 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: () => Linking.openSettings() },
        ]
      );
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        
        {/* Expo Go 경고 (오버레이) */}
        {showExpoGoWarning && (
          <ExpoGoWarning onDismiss={() => setShowExpoGoWarning(false)} />
        )}
        
        {/* 에러 표시 */}
        {!showExpoGoWarning && <ErrorDisplay error={error} onDismiss={clearError} />}

        {/* 상태 표시 */}
        <StatusIndicator state={recordingState} isConnected={isConnected} />

        {/* 트랜스크립트 뷰 */}
        <TranscriptView transcripts={transcripts} interimText={interimText} />

        {/* 오디오 레코더 컨트롤 */}
        <AudioRecorder
          recordingState={recordingState}
          onStart={handleStart}
          onStop={handleStop}
          onClear={handleClear}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
});
