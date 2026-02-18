/**
 * 코디 추천 카드 (메인 영역)
 * 화면의 가장 큰 영역을 차지하는 스와이프 카드
 * 일러스트 이미지 + 코디 정보
 */

import React, { useState } from 'react';
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
import { OutfitIllustration, feelsLikeToRange } from './OutfitIllustration';
import type { OutfitCard } from '../types/outfit';

interface Props {
  cards: OutfitCard[];
  feelsLike: number;
  precipType?: string;
  dustBad?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = SPACING.md;
const CARD_WIDTH = SCREEN_WIDTH - CARD_PADDING * 2;

export function OutfitCards({ cards, feelsLike, precipType, dustBad }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);
    setActiveIndex(index);
  };

  if (cards.length === 0) return null;

  const tempRange = feelsLikeToRange(feelsLike);

  // 각 카드별 온도 범위 (대안 카드는 한 단계 위/아래)
  const cardTempRanges = cards.map((card) => {
    if (card.id === 'warmer') {
      const ranges = ['freeze', 'very_cold', 'cold', 'cool', 'warm', 'hot'];
      const idx = ranges.indexOf(tempRange);
      return idx > 0 ? ranges[idx - 1] : tempRange;
    }
    if (card.id === 'cooler') {
      const ranges = ['freeze', 'very_cold', 'cold', 'cool', 'warm', 'hot'];
      const idx = ranges.indexOf(tempRange);
      return idx < ranges.length - 1 ? ranges[idx + 1] : tempRange;
    }
    return tempRange;
  });

  return (
    <View style={styles.container}>
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
            {/* 일러스트 이미지 영역 */}
            <OutfitIllustration
              temperatureRange={cardTempRanges[idx]}
              precipType={precipType}
              dustBad={dustBad}
            />

            {/* 카드 제목 */}
            <Text style={styles.cardTitle}>{card.title}</Text>

            {/* 착장 아이템 (가로 스크롤) */}
            <View style={styles.itemsRow}>
              {card.items.map((item, i) => (
                <View key={i} style={styles.itemChip}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
              ))}
            </View>

            {/* 추가 필수 아이템 */}
            {card.extras.length > 0 && (
              <View style={styles.extrasRow}>
                {card.extras.map((item, i) => (
                  <View key={i} style={styles.extraChip}>
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                    <Text style={styles.extraName}>{item.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 추천 이유 */}
            <Text style={styles.reason}>{card.reason}</Text>
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
    flex: 1,
    marginVertical: SPACING.xs,
  },
  scrollContent: {
    paddingHorizontal: CARD_PADDING,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
  },
  itemEmoji: {
    fontSize: 15,
    marginRight: 4,
  },
  itemName: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  extrasRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  extraChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 81, 73, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.25)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
  },
  extraName: {
    fontSize: 13,
    color: COLORS.accentWarm,
    fontWeight: '600',
  },
  reason: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
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
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
});
