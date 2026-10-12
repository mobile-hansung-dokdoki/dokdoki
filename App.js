import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import { TodosProvider } from './navigation/TodosContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <TodosProvider>
        <RootNavigator />
        <StatusBar style="dark" />
      </TodosProvider>
    </SafeAreaProvider>
  );
}
