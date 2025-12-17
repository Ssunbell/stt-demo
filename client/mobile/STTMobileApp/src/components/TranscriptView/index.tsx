import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TranscriptItem } from '../../types';

interface TranscriptViewProps {
  transcripts: TranscriptItem[];
  interimText: string;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  transcripts,
  interimText,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 새로운 트랜스크립트가 추가되면 자동으로 스크롤
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [transcripts, interimText]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>실시간 전사</Text>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {transcripts.length === 0 && !interimText && (
          <Text style={styles.placeholderText}>
            녹음을 시작하면 여기에 텍스트가 표시됩니다.
          </Text>
        )}
        
        {transcripts.map((item) => (
          <View key={item.id} style={styles.transcriptItem}>
            <Text style={styles.finalText}>{item.text}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString('ko-KR')}
            </Text>
          </View>
        ))}
        
        {interimText && (
          <View style={styles.transcriptItem}>
            <Text style={styles.interimText}>{interimText}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
  transcriptItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  finalText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  interimText: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

