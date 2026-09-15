import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <Ionicons name="clipboard-outline" size={60} color={Colors.border} />
      <Text style={styles.title}>첫 할 일을 추가해보세요</Text>
      <Text style={styles.subtitle}>메모 스캔 + 버튼으로 시작하세요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
