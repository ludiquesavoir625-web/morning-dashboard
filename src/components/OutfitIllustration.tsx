/**
 * 코디 일러스트 컴포넌트
 * 체감온도 구간별 유아동 코디를 이모지 + 스타일링으로 시각화
 * 추후 AI 생성 이미지로 교체 가능
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface Props {
  temperatureRange: string;  // 'freeze' | 'very_cold' | 'cold' | 'cool' | 'warm' | 'hot'
  precipType?: string;
  dustBad?: boolean;
}

interface OutfitVisual {
  emoji: string;
  backgroundColor: string;
  borderColor: string;
  clothingEmojis: string[];
  label: string;
}

const OUTFIT_VISUALS: Record<string, OutfitVisual> = {
  freeze: {
    emoji: '🧒',
    backgroundColor: '#1a1a3e',
    borderColor: '#4a3f8a',
    clothingEmojis: ['🧥', '🧣', '🧤', '👢', '🧢'],
    label: '완전무장',
  },
  very_cold: {
    emoji: '🧒',
    backgroundColor: '#1a2a4a',
    borderColor: '#3a5a8a',
    clothingEmojis: ['🧥', '🧣', '👖', '🧢'],
    label: '따뜻하게',
  },
  cold: {
    emoji: '🧒',
    backgroundColor: '#1a3a4a',
    borderColor: '#3a7a8a',
    clothingEmojis: ['🧥', '👕', '👖', '🧣'],
    label: '쌀쌀한 날',
  },
  cool: {
    emoji: '🧒',
    backgroundColor: '#1a4a3a',
    borderColor: '#3a8a6a',
    clothingEmojis: ['🧥', '👕', '👖'],
    label: '가벼운 겉옷',
  },
  warm: {
    emoji: '🧒',
    backgroundColor: '#3a4a1a',
    borderColor: '#6a8a3a',
    clothingEmojis: ['👕', '👖'],
    label: '편안하게',
  },
  hot: {
    emoji: '🧒',
    backgroundColor: '#4a3a1a',
    borderColor: '#8a6a3a',
    clothingEmojis: ['👕', '🩳', '🧢'],
    label: '시원하게',
  },
};

/** 체감온도 → 범위 키 */
export function feelsLikeToRange(feelsLike: number): string {
  if (feelsLike < -10) return 'freeze';
  if (feelsLike < 0) return 'very_cold';
  if (feelsLike < 10) return 'cold';
  if (feelsLike < 20) return 'cool';
  if (feelsLike < 25) return 'warm';
  return 'hot';
}

export function OutfitIllustration({ temperatureRange, precipType, dustBad }: Props) {
  const visual = OUTFIT_VISUALS[temperatureRange] || OUTFIT_VISUALS.cold;

  return (
    <View style={[styles.container, { backgroundColor: visual.backgroundColor, borderColor: visual.borderColor }]}>
      {/* 아이 캐릭터 */}
      <View style={styles.characterArea}>
        <Text style={styles.character}>{visual.emoji}</Text>

        {/* 옷 이모지들이 캐릭터 주변에 배치 */}
        <View style={styles.clothingCircle}>
          {visual.clothingEmojis.map((emoji, idx) => {
            const angle = (idx / visual.clothingEmojis.length) * 2 * Math.PI - Math.PI / 2;
            const radius = 70;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <View
                key={idx}
                style={[
                  styles.clothingItem,
                  {
                    transform: [{ translateX: x }, { translateY: y }],
                  },
                ]}
              >
                <Text style={styles.clothingEmoji}>{emoji}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 추가 아이콘 (비/눈/미세먼지) */}
      <View style={styles.extrasRow}>
        {precipType === 'rain' || precipType === 'shower' ? (
          <View style={styles.extraBadge}>
            <Text style={styles.extraEmoji}>☂️</Text>
          </View>
        ) : null}
        {precipType === 'snow' || precipType === 'rain_snow' ? (
          <View style={styles.extraBadge}>
            <Text style={styles.extraEmoji}>⛄</Text>
          </View>
        ) : null}
        {dustBad ? (
          <View style={styles.extraBadge}>
            <Text style={styles.extraEmoji}>😷</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  characterArea: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  character: {
    fontSize: 64,
    position: 'absolute',
    zIndex: 2,
  },
  clothingCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clothingItem: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clothingEmoji: {
    fontSize: 22,
  },
  extrasRow: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
  },
  extraBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraEmoji: {
    fontSize: 16,
  },
});
