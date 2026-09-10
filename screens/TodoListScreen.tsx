import React, { useState } from 'react';
import { View, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { useTodos } from '../hooks/useTodos';
import AppHeader from '../components/AppHeader';
import FilterTabs from '../components/FilterTabs';
import EmptyState from '../components/EmptyState';
import TodoItem from '../components/TodoItem';
import BottomBar from '../components/BottomBar';
import AddTodoModal from '../components/AddTodoModal';
import SettingsScreen from './SettingsScreen';
import { Colors } from '../constants/colors';

export default function TodoListScreen() {
  const { filteredTodos, filter, setFilter, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <AppHeader onSettingsPress={() => setSettingsVisible(true)} />
        <FilterTabs activeFilter={filter} onFilterChange={setFilter} />

        {filteredTodos.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={filteredTodos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TodoItem
                todo={item}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <BottomBar
          onMemoScan={() => {/* MP4에서 구현 */}}
          onAdd={() => setModalVisible(true)}
        />
      </SafeAreaView>

      <AddTodoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addTodo}
      />
      <SettingsScreen
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  list: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  listContent: {
    flexGrow: 1,
  },
});
