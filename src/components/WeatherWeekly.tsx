/**
 * 7일 날씨 비교 컴포넌트
 * 어제(D-1) ~ D+5 까지 한 줄 컴팩트 UI
 * 오늘 컬럼 하이라이트, 어제 컬럼 회색 톤
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { skyToEmoji } from '../services/weatherApi';
import type { DailyWeather } from '../types/weather';

interface Props {
  weekly: DailyWeather[];
}

export function WeatherWeekly({ weekly }: Props) {
  if (weekly.length === 0) return null;

  // 전체 온도 범위 (바 차트 스케일용)
  const allTemps = weekly.flatMap(d => [d.tempMax, d.tempMin]);
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);
  const range = globalMax - globalMin || 1;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📅 7일 날씨</Text>
      <View style={styles.row}>
        {weekly.map((day, idx) => (
          <View
            key={day.date}
            style={[
              styles.dayColumn,
              day.isToday && styles.todayColumn,
              day.isYesterday && styles.yesterdayColumn,
            ]}
          >
            {/* 요일 */}
            <Text
              style={[
                styles.dayLabel,
                day.isToday && styles.todayText,
                day.isYesterday && styles.yesterdayText,
              ]}
            >
              {day.isToday ? '오늘' : day.isYesterday ? '어제' : day.dayOfWeek}
            </Text>

            {/* 날씨 아이콘 */}
            <Text style={styles.weatherIcon}>
              {skyToEmoji(day.sky, day.precipType)}
            </Text>

            {/* 최고기온 */}
            <Text style={[styles.tempMax, day.isYesterday && styles.yesterdayText]}>
              {Math.round(day.tempMax)}°
            </Text>

            {/* 온도 바 */}
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    top: `${((globalMax - day.tempMax) / range) * 100}%`,
                    bottom: `${((day.tempMin - globalMin) / range) * 100}%`,
                  },
                  day.isToday && styles.todayBar,
                  day.isYesterday && styles.yesterdayBar,
                ]}
              />
            </View>

            {/* 최저기온 */}
            <Text style={[styles.tempMin, day.isYesterday && styles.yesterdayText]}>
              {Math.round(day.tempMin)}°
            </Text>

            {/* 강수확률 */}
            {day.precipProb > 0 && (
              <Text style={styles.precipProb}>{day.precipProb}%</Text>
            )}
          </View>
        ))}
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
  sectionTitle: {
    fontSize: FONT_SIZES.sectionTitle,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  todayColumn: {
    backgroundColor: COLORS.todayHighlight,
  },
  yesterdayColumn: {
    opacity: 0.6,
  },
  dayLabel: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  todayText: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  yesterdayText: {
    color: COLORS.textMuted,
  },
  weatherIcon: {
    fontSize: 18,
    marginVertical: 2,
  },
  tempMax: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  barContainer: {
    width: 6,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    marginVertical: 2,
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  todayBar: {
    backgroundColor: COLORS.accent,
  },
  yesterdayBar: {
    backgroundColor: COLORS.textMuted,
  },
  tempMin: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
  },
  precipProb: {
    fontSize: 10,
    color: COLORS.accentPurple,
    marginTop: 1,
  },
});
