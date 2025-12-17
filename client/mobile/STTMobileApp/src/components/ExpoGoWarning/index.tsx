import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';

interface ExpoGoWarningProps {
  onDismiss?: () => void;
}

export const ExpoGoWarning: React.FC<ExpoGoWarningProps> = ({ onDismiss }) => {
  const openDocs = () => {
    Linking.openURL('https://docs.expo.dev/develop/development-builds/introduction/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Expo Go 제한 사항</Text>
        <Text style={styles.message}>
          실시간 오디오 스트리밍은 네이티브 모듈이 필요하여{'\n'}
          Expo Go에서는 작동하지 않습니다.
        </Text>

        <View style={styles.solutionsContainer}>
          <Text style={styles.solutionsTitle}>해결 방법:</Text>
          
          <View style={styles.solution}>
            <Text style={styles.solutionNumber}>1️⃣</Text>
            <View style={styles.solutionText}>
              <Text style={styles.solutionTitle}>웹에서 테스트 (권장)</Text>
              <Text style={styles.solutionCommand}>npm run web</Text>
            </View>
          </View>

          <View style={styles.solution}>
            <Text style={styles.solutionNumber}>2️⃣</Text>
            <View style={styles.solutionText}>
              <Text style={styles.solutionTitle}>네이티브 빌드 실행</Text>
              <Text style={styles.solutionCommand}>npx expo run:ios</Text>
              <Text style={styles.solutionCommand}>npx expo run:android</Text>
            </View>
          </View>

          <View style={styles.solution}>
            <Text style={styles.solutionNumber}>3️⃣</Text>
            <View style={styles.solutionText}>
              <Text style={styles.solutionTitle}>Development Build</Text>
              <Text style={styles.solutionCommand}>eas build --profile development</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={openDocs}>
            <Text style={styles.buttonText}>📖 문서 보기</Text>
          </TouchableOpacity>
          
          {onDismiss && (
            <TouchableOpacity style={[styles.button, styles.dismissButton]} onPress={onDismiss}>
              <Text style={[styles.buttonText, styles.dismissButtonText]}>닫기</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.footer}>
          자세한 내용은 QUICKSTART_STREAMING.md를 참고하세요
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  solutionsContainer: {
    marginBottom: 24,
  },
  solutionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  solution: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  solutionNumber: {
    fontSize: 20,
    marginRight: 12,
  },
  solutionText: {
    flex: 1,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  solutionCommand: {
    fontSize: 13,
    fontFamily: 'monospace', // Platform 사용 제거
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
    color: '#1F2937',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: '#E5E7EB',
  },
  dismissButtonText: {
    color: '#374151',
  },
  footer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

