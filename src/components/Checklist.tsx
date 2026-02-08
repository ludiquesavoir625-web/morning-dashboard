/**
 * 등원 준비물 체크리스트 컴포넌트
 * 날씨 기반 자동 추천 + 기본 준비물
 * 탭하여 체크/해제
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import type { ChecklistItem } from '../types/outfit';

interface Props {
  items: ChecklistItem[];
  onToggle: (itemId: string) => void;
}

export function Checklist({ items, onToggle }: Props) {
  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const autoItems = items.filter(i => i.isAutoRecommended);
  const baseItems = items.filter(i => !i.isAutoRecommended);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>✅ 등원 준비물</Text>
        <Text style={styles.counter}>
          {checkedCount}/{totalCount}
        </Text>
      </View>

      {/* 날씨 기반 필수 아이템 */}
      {autoItems.length > 0 && (
        <View style={styles.autoSection}>
          <Text style={styles.autoLabel}>⚡ 오늘 필수</Text>
          <View style={styles.itemsGrid}>
            {autoItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, item.checked && styles.itemChecked, styles.autoItem]}
                onPress={() => onToggle(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                  {item.name}
                </Text>
                {item.checked && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 기본 준비물 */}
      <View style={styles.itemsGrid}>
        {baseItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.item, item.checked && styles.itemChecked]}
            onPress={() => onToggle(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
              {item.name}
            </Text>
            {item.checked && <Text style={styles.checkMark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* 완료 메시지 */}
      {checkedCount === totalCount && totalCount > 0 && (
        <Text style={styles.completeMessage}>🎉 준비 완료!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sectionTitle,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  counter: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.accent,
  },
  autoSection: {
    marginBottom: SPACING.md,
  },
  autoLabel: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.accentWarm,
    marginBottom: SPACING.sm,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  autoItem: {
    borderColor: 'rgba(248, 81, 73, 0.2)',
  },
  itemChecked: {
    backgroundColor: 'rgba(63, 185, 80, 0.1)',
    borderColor: 'rgba(63, 185, 80, 0.3)',
  },
  itemEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  itemName: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textPrimary,
  },
  itemNameChecked: {
    color: COLORS.accentGreen,
    textDecorationLine: 'line-through',
  },
  checkMark: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.accentGreen,
    fontWeight: '700',
    marginLeft: SPACING.xs,
  },
  completeMessage: {
    textAlign: 'center',
    fontSize: FONT_SIZES.body,
    color: COLORS.accentGreen,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
});
