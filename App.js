import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StorageGate from './components/StorageGate';
import RootNavigator from './navigation/RootNavigator';
import { TodosProvider } from './navigation/TodosContext';
import { ProfileProvider } from './navigation/ProfileContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <TodosProvider>
        <ProfileProvider>
          <StorageGate><RootNavigator /></StorageGate>
          <StatusBar style="dark" />
        </ProfileProvider>
      </TodosProvider>
    </SafeAreaProvider>
  );
}
