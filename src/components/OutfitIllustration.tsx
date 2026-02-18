/**
 * 코디 일러스트 컴포넌트
 * 체감온도 구간별 유아동 코디 이미지 표시
 * assets/outfits/ 폴더의 이미지를 사용하고, 없으면 이모지 폴백
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface Props {
  temperatureRange: string;
  precipType?: string;
  dustBad?: boolean;
}

/** 체감온도 → 범위 키 */
export function feelsLikeToRange(feelsLike: number): string {
  if (feelsLike < -10) return 'freeze';
  if (feelsLike < 0) return 'very_cold';
  if (feelsLike < 10) return 'cold';
  if (feelsLike < 20) return 'cool';
  if (feelsLike < 25) return 'warm';
  return 'hot';
}

// 이미지 매핑 (static require)
const OUTFIT_IMAGES: Record<string, ImageSourcePropType> = {
  freeze: require('../../assets/outfits/outfit_freeze.png'),
  very_cold: require('../../assets/outfits/outfit_very_cold.png'),
  cold: require('../../assets/outfits/outfit_cold.png'),
  cool: require('../../assets/outfits/outfit_cool.png'),
  warm: require('../../assets/outfits/outfit_warm.png'),
  hot: require('../../assets/outfits/outfit_hot.png'),
};

// 이모지 폴백 (이미지가 없을 때)
const OUTFIT_FALLBACK: Record<string, { emoji: string; bg: string }> = {
  freeze: { emoji: '🧥🧣🧤👢🧢', bg: '#1a1a3e' },
  very_cold: { emoji: '🧥🧣👖🧢', bg: '#1a2a4a' },
  cold: { emoji: '🧥👕👖🧣', bg: '#1a3a4a' },
  cool: { emoji: '🧥👕👖', bg: '#1a4a3a' },
  warm: { emoji: '👕👖', bg: '#3a4a1a' },
  hot: { emoji: '👕🩳🧢', bg: '#4a3a1a' },
};

export function OutfitIllustration({ temperatureRange, precipType, dustBad }: Props) {
  const imageSource = OUTFIT_IMAGES[temperatureRange];
  const fallback = OUTFIT_FALLBACK[temperatureRange] || OUTFIT_FALLBACK.cold;

  // 이미지가 있으면 이미지 표시
  if (imageSource) {
    return (
      <View style={styles.container}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
        {/* 추가 아이콘 (비/눈/미세먼지) 오버레이 */}
        {(precipType === 'rain' || precipType === 'shower' || precipType === 'snow' || precipType === 'rain_snow' || dustBad) && (
          <View style={styles.overlayRow}>
            {(precipType === 'rain' || precipType === 'shower') && (
              <View style={styles.overlayBadge}>
                <Text style={styles.overlayEmoji}>☂️</Text>
              </View>
            )}
            {(precipType === 'snow' || precipType === 'rain_snow') && (
              <View style={styles.overlayBadge}>
                <Text style={styles.overlayEmoji}>⛄</Text>
              </View>
            )}
            {dustBad && (
              <View style={styles.overlayBadge}>
                <Text style={styles.overlayEmoji}>😷</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  // 폴백: 이모지 표시
  return (
    <View style={[styles.container, styles.fallbackContainer, { backgroundColor: fallback.bg }]}>
      <Text style={styles.fallbackEmoji}>{fallback.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  overlayRow: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
  },
  overlayBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayEmoji: {
    fontSize: 18,
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackEmoji: {
    fontSize: 48,
    letterSpacing: 8,
  },
});
