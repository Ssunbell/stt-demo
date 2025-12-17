import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
        <Text style={styles.dismissText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 24,
    color: '#991B1B',
    fontWeight: 'bold',
  },
});

