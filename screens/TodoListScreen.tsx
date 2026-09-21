import React, { useState } from 'react';
import { View, Text, FlatList, SafeAreaView, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
import { Spacing } from '../constants/spacing';

export default function TodoListScreen() {
  const { todos, filteredTodos, doneCount, filter, setFilter, searchQuery, setSearchQuery, sortOrder, setSortOrder, addTodo, toggleTodo, editTodo, deleteTodo } = useTodos();
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<import('../types').Todo | null>(null);

  // 검색·필터 결과가 아니라 전체 목록을 기준으로 완료율을 계산합니다.
  const totalCount = todos.length;
  const completionRate = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          onSettingsPress={() => setSettingsVisible(true)}
          onCalendarPress={() => setCalendarVisible(true)}
        />
        <View
          style={styles.progressCard}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="전체 할 일 완료율"
          accessibilityValue={{
            min: 0, max: 100, now: completionRate,
            text: `전체 ${totalCount}개 중 ${doneCount}개 완료, ${completionRate}퍼센트`,
          }}
        >
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>전체 완료율</Text>
              <Text style={styles.progressCount}>완료 {doneCount} / 전체 {totalCount}</Text>
            </View>
            <Text style={styles.progressPercent}>{completionRate}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
          </View>
        </View>
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
  progressCard: {
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.surface,
  },
  progressHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    marginBottom: 10,
  },
  progressInfo: { flex: 1, gap: 3 },
  progressTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  progressCount: { fontSize: 12, color: Colors.textSecondary },
  progressPercent: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  progressTrack: {
    height: 8, borderRadius: 4, backgroundColor: Colors.border, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.primary },
  list: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  listContent: {
    flexGrow: 1,
  },
});
