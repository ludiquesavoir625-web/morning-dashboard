/**
 * 등원 준비물 체크리스트 (컴팩트 버전)
 * 하단에 한 줄로 아이콘+이름, 탭하여 체크
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import type { ChecklistItem } from '../types/outfit';

interface Props {
  items: ChecklistItem[];
  onToggle: (itemId: string) => void;
}

export function Checklist({ items, onToggle }: Props) {
  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const allDone = checkedCount === totalCount && totalCount > 0;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {allDone ? '🎉 준비 완료!' : '✅ 준비물'}
        </Text>
        <Text style={styles.counter}>{checkedCount}/{totalCount}</Text>
      </View>

      {/* 아이템 가로 스크롤 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemsScroll}
      >
        {items.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.item,
              item.checked && styles.itemChecked,
              item.isAutoRecommended && !item.checked && styles.itemAuto,
            ]}
            onPress={() => onToggle(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[
              styles.name,
              item.checked && styles.nameChecked,
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  counter: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  itemsScroll: {
    gap: SPACING.xs,
    paddingVertical: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemAuto: {
    borderColor: 'rgba(248, 81, 73, 0.2)',
    backgroundColor: 'rgba(248, 81, 73, 0.06)',
  },
  itemChecked: {
    backgroundColor: 'rgba(63, 185, 80, 0.1)',
    borderColor: 'rgba(63, 185, 80, 0.25)',
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  name: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  nameChecked: {
    color: COLORS.accentGreen,
    textDecorationLine: 'line-through',
  },
});
