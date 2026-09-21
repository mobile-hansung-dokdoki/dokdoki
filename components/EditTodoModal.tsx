import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { formatDateKorean, fromDateString, todayString, addDays } from '../utils/date';
import { Todo, TagId, Tag } from '../types';
import TagSelector from './TagSelector';

interface EditTodoModalProps {
  visible: boolean;
  todo: Todo | null;
  onClose: () => void;
  onEdit: (id: string, text: string, dueDate?: string, tags?: TagId[]) => void;
  userTags: Tag[];
}

export default function EditTodoModal({ visible, todo, onClose, onEdit, userTags }: EditTodoModalProps) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<TagId[]>([]);
  const inputRef = useRef<TextInput>(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible && todo) {
      setText(todo.text);
      setDueDate(todo.dueDate);
      setTags(todo.tags ?? []);
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(600);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(80),
          Animated.timing(sheetTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setTimeout(() => inputRef.current?.focus(), 50);
      });
    }
  }, [visible, todo]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onClose());
  }, [onClose, overlayOpacity, sheetTranslateY]);

  const handleSave = () => {
    if (!text.trim() || !todo) return;
    onEdit(todo.id, text.trim(), dueDate, tags.length > 0 ? tags : undefined);
    handleClose();
  };

  const canSave = text.trim().length > 0;

  const dateLabel = dueDate
    ? formatDateKorean(fromDateString(dueDate))
    : '날짜 없음';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kvView}
      >
        <Animated.View style={{ transform: [{ translateY: sheetTranslateY }] }}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <Text style={styles.title}>할 일 수정</Text>

            <TextInput
              ref={inputRef}
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="할 일을 입력하세요"
              placeholderTextColor={Colors.textSecondary}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              maxLength={100}
            />

            <View style={styles.dateRow}>
              <TouchableOpacity
                onPress={() => setDueDate(d => addDays(d ?? todayString(), -1))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              <Text style={[styles.dateLabel, !dueDate && styles.dateLabelEmpty]}>
                {dateLabel}
              </Text>

              <TouchableOpacity
                onPress={() => setDueDate(d => addDays(d ?? todayString(), 1))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.todayBtn} onPress={() => setDueDate(todayString())}>
                <Text style={styles.todayBtnText}>오늘</Text>
              </TouchableOpacity>

              {dueDate && (
                <TouchableOpacity
                  onPress={() => setDueDate(undefined)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <TagSelector tags={userTags} selected={tags} onChange={setTags} />

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.8}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !canSave && styles.confirmDisabled]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={!canSave}
              >
                <Text style={styles.confirmText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
  },
  kvView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    gap: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  dateLabelEmpty: {
    color: Colors.textSecondary,
  },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  todayBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDisabled: {
    backgroundColor: Colors.border,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
