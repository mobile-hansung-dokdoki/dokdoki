import React, { useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Keyboard, TouchableWithoutFeedback, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useTodos } from '../hooks/useTodos';
import { Todo } from '../types';
import AppHeader from '../components/AppHeader';
import FilterTabs from '../components/FilterTabs';
import EmptyState from '../components/EmptyState';
import TodoItem from '../components/TodoItem';
import BottomBar from '../components/BottomBar';
import AddTodoModal from '../components/AddTodoModal';
import EditTodoModal from '../components/EditTodoModal';
import AddTagModal from '../components/AddTagModal';
import CalendarSheet from '../components/CalendarSheet';
import SettingsScreen from './SettingsScreen';
import SearchBar from '../components/SearchBar';
import TagFilter from '../components/TagFilter';
import { Colors } from '../constants/colors';

export default function TodoListScreen() {
  const {
    todos, filteredTodos, doneCount,
    filter, setFilter,
    searchQuery, setSearchQuery,
    sortOrder, setSortOrder,
    activeTags, toggleActiveTag, setActiveTags,
    userTags, tagMap, addUserTag, deleteUserTag, reorderUserTags,
    addTodo, toggleTodo, editTodo, deleteTodo,
  } = useTodos();

  const handleToggle = useCallback((id: string) => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: { type: 'easeInEaseOut', property: 'scaleXY' },
    });
    toggleTodo(id);
  }, [toggleTodo]);

  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [addTagVisible, setAddTagVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  return (
    <TouchableWithoutFeedback
      onPress={() => { Keyboard.dismiss(); setSortDropdownOpen(false); }}
      accessible={false}
    >
      <View style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <AppHeader
            onSettingsPress={() => setSettingsVisible(true)}
            onCalendarPress={() => setCalendarVisible(true)}
            doneCount={doneCount}
            totalCount={todos.length}
          />
          <FilterTabs activeFilter={filter} onFilterChange={setFilter} doneCount={doneCount} />
          <TagFilter
            tags={userTags}
            activeTags={activeTags}
            onTagToggle={toggleActiveTag}
            onClearTags={() => setActiveTags([])}
            onAddPress={() => setAddTagVisible(true)}
          />
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            dropdownOpen={sortDropdownOpen}
            onDropdownChange={setSortDropdownOpen}
          />

          {filteredTodos.length === 0 ? (
            <EmptyState />
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
            >
              {filteredTodos.map(item => (
                <TodoItem
                  key={item.id}
                  todo={item}
                  onToggle={handleToggle}
                  onEdit={setEditingTodo}
                  onDelete={deleteTodo}
                  tagMap={tagMap}
                />
              ))}
            </ScrollView>
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
          userTags={userTags}
        />
        <EditTodoModal
          visible={editingTodo !== null}
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onEdit={editTodo}
          userTags={userTags}
        />
        <AddTagModal
          visible={addTagVisible}
          onClose={() => setAddTagVisible(false)}
          onAdd={addUserTag}
          onDelete={deleteUserTag}
          onReorder={reorderUserTags}
          userTags={userTags}
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
