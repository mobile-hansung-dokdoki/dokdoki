import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigation/RootNavigator';
import { TodosProvider } from './navigation/TodosContext';

export default function App() {
  return (
    <TodosProvider>
      <RootNavigator />
      <StatusBar style="dark" />
    </TodosProvider>
  );
}
