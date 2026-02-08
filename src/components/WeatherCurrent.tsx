/**
 * 오늘 날씨 컴포넌트
 * 현재 기온, 체감온도, 어제 대비, 미세먼지, 강수확률
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { skyToEmoji } from '../services/weatherApi';
import { dustGradeLabel, dustGradeEmoji } from '../services/airQualityApi';
import type { CurrentWeather, AirQuality, YesterdayComparison } from '../types/weather';

interface Props {
  weather: CurrentWeather;
  airQuality: AirQuality;
  yesterday: YesterdayComparison;
}

function getDustColor(grade: string): string {
  switch (grade) {
    case 'good': return COLORS.dustGood;
    case 'moderate': return COLORS.dustModerate;
    case 'bad': return COLORS.dustBad;
    case 'very_bad': return COLORS.dustVeryBad;
    default: return COLORS.textSecondary;
  }
}

function getTempDiffColor(diff: number): string {
  if (diff > 0) return COLORS.accentWarm;
  if (diff < 0) return COLORS.tempCool;
  return COLORS.textSecondary;
}

export function WeatherCurrent({ weather, airQuality, yesterday }: Props) {
  const emoji = skyToEmoji(weather.sky, weather.precipType);
  const worstDustGrade = airQuality.pm25Grade === 'very_bad' || airQuality.pm10Grade === 'very_bad'
    ? 'very_bad'
    : airQuality.pm25Grade === 'bad' || airQuality.pm10Grade === 'bad'
      ? 'bad'
      : airQuality.pm25Grade === 'moderate' || airQuality.pm10Grade === 'moderate'
        ? 'moderate'
        : 'good';

  return (
    <View style={styles.container}>
      {/* 상단: 기온 + 아이콘 + 체감온도 */}
      <View style={styles.mainRow}>
        <Text style={styles.temperature}>{Math.round(weather.temperature)}°</Text>
        <Text style={styles.weatherEmoji}>{emoji}</Text>
        <View style={styles.tempDetails}>
          <Text style={styles.feelsLike}>체감 {weather.feelsLike}°</Text>
          <Text style={styles.tempRange}>
            {Math.round(weather.tempMin)}° / {Math.round(weather.tempMax)}°
          </Text>
        </View>
      </View>

      {/* 어제 대비 */}
      <Text style={[styles.comparison, { color: getTempDiffColor(yesterday.tempDiff) }]}>
        {yesterday.message}
      </Text>

      {/* 하단: 미세먼지 + 강수확률 */}
      <View style={styles.bottomRow}>
        <View style={styles.infoChip}>
          <Text style={[styles.chipText, { color: getDustColor(worstDustGrade) }]}>
            {dustGradeEmoji(worstDustGrade as any)} 미세먼지 {dustGradeLabel(worstDustGrade as any)}
          </Text>
        </View>
        <View style={styles.infoChip}>
          <Text style={styles.chipText}>
            💧 강수 {weather.precipProb}%
          </Text>
        </View>
      </View>
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
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    fontSize: FONT_SIZES.tempLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  weatherEmoji: {
    fontSize: 36,
    marginHorizontal: SPACING.md,
  },
  tempDetails: {
    flex: 1,
  },
  feelsLike: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  tempRange: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  comparison: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  infoChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  chipText: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textSecondary,
  },
});
