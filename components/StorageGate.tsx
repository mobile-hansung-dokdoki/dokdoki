import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTodosContext } from '../navigation/TodosContext';
import { useProfile } from '../navigation/ProfileContext';

export default function StorageGate({ children }: { children: React.ReactNode }) {
  const { storage: todos } = useTodosContext();
  const { storage: profile } = useProfile();
  const loaded = todos.loaded && profile.loaded;
  const error = todos.error || profile.error;
  const retry = () => { void todos.retry(); void profile.retry(); };
  if (!loaded) return <SafeAreaView style={styles.loading}>
    {error ? <><Text accessibilityRole="alert" style={styles.text}>{error}</Text><TouchableOpacity onPress={retry} style={styles.button}><Text>다시 불러오기</Text></TouchableOpacity></> : <><ActivityIndicator /><Text>저장된 데이터를 불러오는 중…</Text></>}
  </SafeAreaView>;
  return <View style={{ flex: 1 }}>
    {children}
    <SafeAreaView edges={['bottom']} style={styles.status}>
      {error ? <><Text accessibilityRole="alert" style={styles.text}>{error}</Text><TouchableOpacity onPress={retry} style={styles.button}><Text>저장 다시 시도</Text></TouchableOpacity></> : <Text accessibilityLiveRegion="polite">{todos.saving || profile.saving ? '기기에 저장 중…' : '기기에 저장됨'}</Text>}
    </SafeAreaView>
  </View>;
}
const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  status: { padding: 8, alignItems: 'center', backgroundColor: '#F1F5F9', gap: 4 },
  text: { textAlign: 'center', color: '#9F1239' },
  button: { backgroundColor: '#DBEAFE', padding: 12, borderRadius: 8 },
});
