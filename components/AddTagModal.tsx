import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  PanResponder,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
import { Ionicons } from '@expo/vector-icons';
import { Tag } from '../types';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { COLOR_PALETTE } from '../constants/tags';

const ROW_HEIGHT = 46;

interface DraggableRowProps {
  tag: Tag;
  indexRef: React.MutableRefObject<number>;
  totalCount: number;
  onDelete: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragMove: (dy: number) => void;
  onDragEnd: (dy: number) => void;
  isDragged: boolean;
  dragY: Animated.Value;
  dragScale: Animated.Value;
  shiftY: number;
}

const DraggableRow = memo(function DraggableRow({
  tag, indexRef, totalCount, onDelete, onDragStart, onDragMove, onDragEnd,
  isDragged, dragY, dragScale, shiftY,
}: DraggableRowProps) {
  const draggingRef = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();

  const onDragStartRef = useRef(onDragStart);
  const onDragMoveRef = useRef(onDragMove);
  const onDragEndRef = useRef(onDragEnd);
  onDragStartRef.current = onDragStart;
  onDragMoveRef.current = onDragMove;
  onDragEndRef.current = onDragEnd;

  useEffect(() => {
    return () => clearTimeout(longPressTimer.current);
  }, []);

  const canDrag = totalCount > 1;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => canDrag,
      onShouldBlockNativeResponder: () => false,
      onPanResponderGrant: () => {
        draggingRef.current = false;
        longPressTimer.current = setTimeout(() => {
          draggingRef.current = true;
          onDragStartRef.current(indexRef.current);
        }, 380);
      },
      onPanResponderMove: (_, { dy, dx }) => {
        if (!draggingRef.current) {
          if (Math.abs(dy) > 8 || Math.abs(dx) > 8) {
            clearTimeout(longPressTimer.current);
          }
          return;
        }
        onDragMoveRef.current(dy);
      },
      onPanResponderRelease: (_, { dy }) => {
        clearTimeout(longPressTimer.current);
        if (draggingRef.current) {
          draggingRef.current = false;
          onDragEndRef.current(dy);
        }
      },
      onPanResponderTerminate: () => {
        clearTimeout(longPressTimer.current);
        draggingRef.current = false;
      },
    })
  ).current;

  const rowTransform = isDragged
    ? [{ scale: dragScale }, { translateY: dragY }]
    : shiftY !== 0
    ? [{ translateY: shiftY }]
    : undefined;

  return (
    <Animated.View
      style={[
        styles.tagRow,
        isDragged && styles.tagRowDragged,
        rowTransform ? { transform: rowTransform } : undefined,
      ]}
    >
      {/* 드래그 핸들 + 칩 영역 */}
      <View
        style={styles.dragArea}
        {...(canDrag ? panResponder.panHandlers : {})}
      >
        {canDrag && (
          <Ionicons name="reorder-three-outline" size={20} color={Colors.textSecondary} />
        )}
        <View style={[styles.tagChip, { backgroundColor: tag.bgColor }]}>
          <Text style={[styles.tagChipText, { color: tag.color }]}>{tag.label}</Text>
        </View>
      </View>
      {/* 삭제 버튼 */}
      <TouchableOpacity
        onPress={() => onDelete(tag.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
});

interface AddTagModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (label: string, color: string, bgColor: string) => void;
  onDelete: (tagId: string) => void;
  onReorder: (from: number, to: number) => void;
  userTags: Tag[];
}

export default function AddTagModal({ visible, onClose, onAdd, onDelete, onReorder, userTags }: AddTagModalProps) {
  const [label, setLabel] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(500)).current;

  const [dragInfo, setDragInfo] = useState<{ fromIndex: number; toIndex: number } | null>(null);
  const dragY = useRef(new Animated.Value(0)).current;
  const dragScale = useRef(new Animated.Value(1)).current;
  const fromIndexRef = useRef(0);

  // indexRef 배열 - 항상 userTags.length 크기로 맞춤
  const indexRefs = useRef<React.MutableRefObject<number>[]>([]);
  const needed = userTags.length;
  while (indexRefs.current.length < needed) {
    indexRefs.current.push({ current: indexRefs.current.length });
  }
  indexRefs.current.length = needed;
  indexRefs.current.forEach((ref, i) => { ref.current = i; });

  useEffect(() => {
    if (visible) {
      setLabel('');
      setSelectedColorIdx(0);
      setDragInfo(null);
      dragY.setValue(0);
      dragScale.setValue(1);
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(500);

      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(60),
          Animated.timing(sheetTranslateY, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      // 모달 닫힐 때 드래그 상태 정리
      setDragInfo(null);
      dragY.setValue(0);
      dragScale.setValue(1);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    setDragInfo(null);
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

  const handleDragStart = useCallback((index: number) => {
    fromIndexRef.current = index;
    dragY.setValue(0);
    Animated.spring(dragScale, { toValue: 1.06, useNativeDriver: true }).start();
    setDragInfo({ fromIndex: index, toIndex: index });
  }, [dragY, dragScale]);

  const handleDragMove = useCallback((dy: number) => {
    dragY.setValue(dy);
    const toIndex = Math.max(0, Math.min(userTags.length - 1,
      Math.round(fromIndexRef.current + dy / ROW_HEIGHT)));
    setDragInfo(prev => prev ? { ...prev, toIndex } : null);
  }, [userTags.length]);

  const handleDragEnd = useCallback((dy: number) => {
    const toIndex = Math.max(0, Math.min(userTags.length - 1,
      Math.round(fromIndexRef.current + dy / ROW_HEIGHT)));
    const snapY = (toIndex - fromIndexRef.current) * ROW_HEIGHT;

    Animated.parallel([
      Animated.timing(dragScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(dragY, { toValue: snapY, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      dragY.setValue(0);
      if (toIndex !== fromIndexRef.current) {
        onReorder(fromIndexRef.current, toIndex);
      }
      setDragInfo(null);
    });
  }, [userTags.length, dragScale, dragY, onReorder]);

  const getShiftY = (index: number): number => {
    if (!dragInfo || index === dragInfo.fromIndex) return 0;
    const { fromIndex, toIndex } = dragInfo;
    if (fromIndex < toIndex && index > fromIndex && index <= toIndex) return -ROW_HEIGHT;
    if (fromIndex > toIndex && index >= toIndex && index < fromIndex) return ROW_HEIGHT;
    return 0;
  };

  const canAdd = label.trim().length > 0;
  const { color: previewColor, bgColor: previewBg } = COLOR_PALETTE[selectedColorIdx];

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
          {/* 키보드로 공간 줄어들면 시트 전체를 스크롤로 확인 가능 */}
          <ScrollView
            style={styles.sheet}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            bounces={false}
          >
              <View style={styles.handle} />
              <Text style={styles.title}>태그 관리</Text>

              {/* 기존 태그 목록 — 키보드 열린 상태에서도 스크롤 가능 */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>등록된 태그</Text>
                <View style={styles.tagListContainer}>
                  {userTags.length === 0 ? (
                    <Text style={styles.emptyText}>등록된 태그가 없습니다</Text>
                  ) : (
                    <ScrollView
                      style={styles.tagList}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={!dragInfo}
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled
                    >
                      {userTags.map((tag, idx) => (
                        <DraggableRow
                          key={tag.id}
                          tag={tag}
                          indexRef={indexRefs.current[idx]}
                          totalCount={userTags.length}
                          onDelete={onDelete}
                          onDragStart={handleDragStart}
                          onDragMove={handleDragMove}
                          onDragEnd={handleDragEnd}
                          isDragged={dragInfo?.fromIndex === idx}
                          dragY={dragY}
                          dragScale={dragScale}
                          shiftY={getShiftY(idx)}
                        />
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

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

              {/* 색상 팔레트 — 가로 스크롤, 키보드 열려도 탭 가능 */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                contentContainerStyle={styles.palette}
              >
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
              </ScrollView>

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
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.overlay,
  },
  kvView: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'transparent',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.92,
  },
  sheetContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    gap: 14,
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
  tagListContainer: {
    height: 135,
  },
  tagList: {
    flex: 1,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingVertical: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tagRowDragged: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    borderRadius: 8,
    borderBottomWidth: 0,
    zIndex: 10,
  },
  dragArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
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
    gap: 12,
    paddingVertical: 4,
    paddingHorizontal: 2,
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
