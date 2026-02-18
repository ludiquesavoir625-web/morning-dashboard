/**
 * 코디 일러스트 컴포넌트
 * 체감온도 구간별 유아동 코디 카드 표시
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

// 온도 구간별 이모지 + 색상 + 라벨
const OUTFIT_DISPLAY: Record<string, { emoji: string; label: string; bg: string; items: string }> = {
  freeze: { emoji: '🧥', label: '완전 방한', bg: '#2d1b69', items: '패딩 · 목도리 · 장갑 · 귀마개 · 방한부츠' },
  very_cold: { emoji: '🧥', label: '따뜻하게', bg: '#1b3d6e', items: '두꺼운 패딩 · 목도리 · 기모바지 · 털모자' },
  cold: { emoji: '🧶', label: '겉옷 필수', bg: '#1b5a6e', items: '자켓 · 니트 · 긴바지 · 목도리' },
  cool: { emoji: '🧥', label: '가벼운 겉옷', bg: '#1b6e5a', items: '후드집업 · 긴팔 · 긴바지' },
  warm: { emoji: '👕', label: '편하게', bg: '#4a6e1b', items: '긴팔 · 면바지 · 가벼운 겉옷' },
  hot: { emoji: '👕', label: '시원하게', bg: '#6e5a1b', items: '반팔 · 반바지 · 모자 · 샌들' },
};

// 날씨 오버레이 배지
function WeatherOverlay({ precipType, dustBad }: { precipType?: string; dustBad?: boolean }) {
  const showOverlay = precipType === 'rain' || precipType === 'shower' || precipType === 'snow' || precipType === 'rain_snow' || dustBad;
  if (!showOverlay) return null;
  return (
    <View style={styles.overlayRow}>
      {(precipType === 'rain' || precipType === 'shower') && (
        <View style={styles.overlayBadge}><Text style={styles.overlayEmoji}>☂️</Text></View>
      )}
      {(precipType === 'snow' || precipType === 'rain_snow') && (
        <View style={styles.overlayBadge}><Text style={styles.overlayEmoji}>⛄</Text></View>
      )}
      {dustBad && (
        <View style={styles.overlayBadge}><Text style={styles.overlayEmoji}>😷</Text></View>
      )}
    </View>
  );
}

export function OutfitIllustration({ temperatureRange, precipType, dustBad }: Props) {
  const display = OUTFIT_DISPLAY[temperatureRange] || OUTFIT_DISPLAY.cold;

  return (
    <View style={[styles.container, { backgroundColor: display.bg }]}>
      <Text style={styles.bigEmoji}>{display.emoji}</Text>
      <Text style={styles.label}>{display.label}</Text>
      <Text style={styles.items}>{display.items}</Text>
      <WeatherOverlay precipType={precipType} dustBad={dustBad} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bigEmoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  label: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 8,
  },
  items: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
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
});
