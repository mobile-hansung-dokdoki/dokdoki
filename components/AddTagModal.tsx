import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tag } from '../types';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { COLOR_PALETTE } from '../constants/tags';

interface AddTagModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (label: string, color: string, bgColor: string) => void;
  onDelete: (tagId: string) => void;
  userTags: Tag[];
}

export default function AddTagModal({ visible, onClose, onAdd, onDelete, userTags }: AddTagModalProps) {
  const [label, setLabel] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      setLabel('');
      setSelectedColorIdx(0);
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(500);

      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(60),
          Animated.timing(sheetTranslateY, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, { toValue: 500, duration: 240, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(80),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]),
    ]).start(() => onClose());
  }, [onClose, overlayOpacity, sheetTranslateY]);

  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const { color, bgColor } = COLOR_PALETTE[selectedColorIdx];
    onAdd(trimmed, color, bgColor);
    setLabel('');
    setSelectedColorIdx(0);
  };

  const canAdd = label.trim().length > 0;
  const { color: previewColor, bgColor: previewBg } = COLOR_PALETTE[selectedColorIdx];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>태그 관리</Text>

        {/* 기존 태그 목록 */}
        {userTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>등록된 태그</Text>
            <ScrollView
              style={styles.tagList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {userTags.map(tag => (
                <View key={tag.id} style={styles.tagRow}>
                  <View style={[styles.tagChip, { backgroundColor: tag.bgColor }]}>
                    <Text style={[styles.tagChipText, { color: tag.color }]}>{tag.label}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onDelete(tag.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.divider} />

        {/* 새 태그 추가 */}
        <Text style={styles.sectionLabel}>새 태그 추가</Text>

        {/* 미리보기 */}
        <View style={styles.previewRow}>
          <View style={[styles.previewChip, { backgroundColor: previewBg }]}>
            <Text style={[styles.previewChipText, { color: previewColor }]}>
              {label.trim() || '태그명'}
            </Text>
          </View>
        </View>

        {/* 태그명 입력 */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="태그 이름 (최대 10자)"
          placeholderTextColor={Colors.textSecondary}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
          maxLength={10}
        />

        {/* 색상 팔레트 */}
        <View style={styles.palette}>
          {COLOR_PALETTE.map((c, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.colorCircle,
                { backgroundColor: c.bgColor, borderColor: c.color },
                selectedColorIdx === idx && styles.colorCircleSelected,
              ]}
              onPress={() => setSelectedColorIdx(idx)}
              activeOpacity={0.7}
            >
              <View style={[styles.colorDot, { backgroundColor: c.color }]} />
              {selectedColorIdx === idx && <View style={styles.selectedRing} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* 버튼 */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.8}>
            <Text style={styles.cancelText}>닫기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, !canAdd && styles.confirmDisabled]}
            onPress={handleAdd}
            activeOpacity={0.8}
            disabled={!canAdd}
          >
            <Text style={styles.confirmText}>추가</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    gap: 14,
    maxHeight: '85%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tagList: {
    maxHeight: 140,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: -2,
  },
  previewRow: {
    alignItems: 'flex-start',
    marginBottom: -4,
  },
  previewChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 50,
  },
  previewChipText: {
    fontSize: 14,
    fontWeight: '600',
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
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 40, height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
  },
  colorDot: {
    width: 16, height: 16,
    borderRadius: 8,
  },
  selectedRing: {
    position: 'absolute',
    top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
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
