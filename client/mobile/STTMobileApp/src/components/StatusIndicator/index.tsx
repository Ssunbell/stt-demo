import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RecordingState } from '../../types';

interface StatusIndicatorProps {
  state: RecordingState;
  isConnected: boolean;
}

const STATUS_COLORS = {
  [RecordingState.IDLE]: '#6B7280',
  [RecordingState.CONNECTING]: '#F59E0B',
  [RecordingState.RECORDING]: '#10B981',
  [RecordingState.PAUSED]: '#3B82F6',
  [RecordingState.ERROR]: '#EF4444',
};

const STATUS_LABELS = {
  [RecordingState.IDLE]: '대기 중',
  [RecordingState.CONNECTING]: '연결 중...',
  [RecordingState.RECORDING]: '녹음 중',
  [RecordingState.PAUSED]: '일시 정지',
  [RecordingState.ERROR]: '오류',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state, isConnected }) => {
  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.indicator, { backgroundColor: STATUS_COLORS[state] }]} />
        <Text style={styles.statusText}>{STATUS_LABELS[state]}</Text>
      </View>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.indicator,
            { backgroundColor: isConnected ? '#10B981' : '#EF4444' },
          ]}
        />
        <Text style={styles.statusText}>
          {isConnected ? '서버 연결됨' : '서버 연결 안됨'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});

