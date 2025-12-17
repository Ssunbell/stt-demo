import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { RecordingState } from '../../types';

interface AudioRecorderProps {
  recordingState: RecordingState;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  recordingState,
  onStart,
  onStop,
  onClear,
}) => {
  const isRecording = recordingState === RecordingState.RECORDING;
  const isConnecting = recordingState === RecordingState.CONNECTING;
  const canRecord = recordingState === RecordingState.IDLE;

  return (
    <View style={styles.container}>
      {/* 오디오 시각화 영역 */}
      <View style={styles.visualizerContainer}>
        {isRecording && (
          <View style={styles.visualizer}>
            <View style={[styles.bar, styles.bar1]} />
            <View style={[styles.bar, styles.bar2]} />
            <View style={[styles.bar, styles.bar3]} />
            <View style={[styles.bar, styles.bar4]} />
            <View style={[styles.bar, styles.bar5]} />
          </View>
        )}
        {!isRecording && !isConnecting && (
          <Text style={styles.visualizerText}>🎤</Text>
        )}
        {isConnecting && (
          <Text style={styles.visualizerText}>⏳</Text>
        )}
      </View>

      {/* 컨트롤 버튼들 */}
      <View style={styles.controlsContainer}>
        {canRecord && (
          <TouchableOpacity
            style={[styles.button, styles.recordButton]}
            onPress={onStart}
          >
            <Text style={styles.buttonText}>녹음 시작</Text>
          </TouchableOpacity>
        )}

        {isRecording && (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={onStop}
          >
            <Text style={styles.buttonText}>녹음 중지</Text>
          </TouchableOpacity>
        )}

        {isConnecting && (
          <TouchableOpacity
            style={[styles.button, styles.disabledButton]}
            disabled
          >
            <Text style={styles.buttonText}>연결 중...</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={onClear}
        >
          <Text style={[styles.buttonText, styles.clearButtonText]}>지우기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  visualizerContainer: {
    width: 200,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  visualizerText: {
    fontSize: 48,
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bar: {
    width: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  bar1: {
    height: 20,
  },
  bar2: {
    height: 40,
  },
  bar3: {
    height: 60,
  },
  bar4: {
    height: 40,
  },
  bar5: {
    height: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#374151',
  },
});

