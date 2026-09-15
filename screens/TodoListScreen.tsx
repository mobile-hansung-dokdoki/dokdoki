import React, { useState } from 'react';
import { View, FlatList, SafeAreaView, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useTodos } from '../hooks/useTodos';
import AppHeader from '../components/AppHeader';
import FilterTabs from '../components/FilterTabs';
import EmptyState from '../components/EmptyState';
import TodoItem from '../components/TodoItem';
import BottomBar from '../components/BottomBar';
import AddTodoModal from '../components/AddTodoModal';
import EditTodoModal from '../components/EditTodoModal';
import CalendarSheet from '../components/CalendarSheet';
import SettingsScreen from './SettingsScreen';
import SearchBar from '../components/SearchBar';
import { Colors } from '../constants/colors';

export default function TodoListScreen() {
  const { todos, filteredTodos, doneCount, filter, setFilter, searchQuery, setSearchQuery, sortOrder, setSortOrder, addTodo, toggleTodo, editTodo, deleteTodo } = useTodos();
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<import('../types').Todo | null>(null);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          onSettingsPress={() => setSettingsVisible(true)}
          onCalendarPress={() => setCalendarVisible(true)}
        />
        <FilterTabs activeFilter={filter} onFilterChange={setFilter} doneCount={doneCount} />
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} sortOrder={sortOrder} onSortChange={setSortOrder} />

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
                onEdit={setEditingTodo}
                onDelete={deleteTodo}
              />
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
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
      <EditTodoModal
        visible={editingTodo !== null}
        todo={editingTodo}
        onClose={() => setEditingTodo(null)}
        onEdit={editTodo}
      />
      <CalendarSheet
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        todos={todos}
      />
      <SettingsScreen
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
    </TouchableWithoutFeedback>
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
