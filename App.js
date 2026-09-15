import { StatusBar } from 'expo-status-bar';
import TodoListScreen from './screens/TodoListScreen';

export default function App() {
  return (
    <>
      <TodoListScreen />
      <StatusBar style="dark" />
    </>
  );
}
