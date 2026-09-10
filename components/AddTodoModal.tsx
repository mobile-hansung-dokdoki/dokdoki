import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (text: string) => void;
}

export default function AddTodoModal({ visible, onClose, onAdd }: AddTodoModalProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setText('');
      // 모달 애니메이션 후 포커스
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    onClose();
  };

  const canAdd = text.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* 딤 배경 — 누르면 닫힘 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kvView}
      >
        <View style={styles.sheet}>
          {/* 핸들 */}
          <View style={styles.handle} />

          <Text style={styles.title}>할 일 추가하기</Text>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="할 일을 입력하세요"
            placeholderTextColor={Colors.textSecondary}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            maxLength={100}
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !canAdd && styles.confirmDisabled]}
              onPress={handleAdd}
              activeOpacity={0.8}
              disabled={!canAdd}
            >
              <Text style={styles.confirmText}>완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
