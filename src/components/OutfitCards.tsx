/**
 * 코디 추천 카드 컴포넌트
 * 좌우 스와이프 가능한 카드 UI (2~3장)
 * 화면의 메인 영역을 차지
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import type { OutfitCard } from '../types/outfit';

interface Props {
  cards: OutfitCard[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = SPACING.lg;
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;

export function OutfitCards({ cards }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);
    setActiveIndex(index);
  };

  if (cards.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>👶 코디 추천</Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((card, idx) => (
          <View key={card.id} style={styles.card}>
            {/* 카드 헤더 */}
            <Text style={styles.cardTitle}>{card.title}</Text>

            {/* 착장 아이템 */}
            <View style={styles.itemsRow}>
              {card.items.map((item, i) => (
                <View key={i} style={styles.itemChip}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
              ))}
            </View>

            {/* 추가 아이템 (날씨 조건) */}
            {card.extras.length > 0 && (
              <View style={styles.extrasSection}>
                <Text style={styles.extrasLabel}>⚡ 필수 추가</Text>
                <View style={styles.itemsRow}>
                  {card.extras.map((item, i) => (
                    <View key={i} style={[styles.itemChip, styles.extraChip]}>
                      <Text style={styles.itemEmoji}>{item.emoji}</Text>
                      <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 추천 이유 */}
            <Text style={styles.reason}>{card.reason}</Text>

            {/* 태그 */}
            <View style={styles.tagsRow}>
              {card.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 페이지 인디케이터 */}
      {cards.length > 1 && (
        <View style={styles.indicators}>
          {cards.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === activeIndex && styles.activeDot]}
            />
          ))}
          <Text style={styles.swipeHint}>← 스와이프 →</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sectionTitle,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.cardTitle,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  extraChip: {
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.3)',
  },
  itemEmoji: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  itemName: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textPrimary,
  },
  extrasSection: {
    marginTop: SPACING.md,
  },
  extrasLabel: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.accentWarm,
    marginBottom: SPACING.xs,
  },
  reason: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  tag: {
    backgroundColor: 'rgba(88, 166, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
  },
  tagText: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.accent,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
  },
  activeDot: {
    backgroundColor: COLORS.accent,
    width: 18,
  },
  swipeHint: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
});
