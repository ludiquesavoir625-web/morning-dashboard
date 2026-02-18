/**
 * 컴팩트 헤더: 시계 + 오늘 날씨 + 7일 비교를 하나의 카드로
 * 핸드폰 화면에 최적화된 작은 사이즈
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { formatTime, formatDate } from '../utils/dateUtils';
import { skyToEmoji } from '../services/weatherApi';
import { dustGradeLabel } from '../services/airQualityApi';
import type { CurrentWeather, DailyWeather, AirQuality, YesterdayComparison } from '../types/weather';

interface Props {
  weather: CurrentWeather | null;
  airQuality: AirQuality | null;
  yesterday: YesterdayComparison | null;
  weekly: DailyWeather[];
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

function getWorstDustGrade(air: AirQuality): string {
  const grades = ['good', 'moderate', 'bad', 'very_bad'];
  const pm10Idx = grades.indexOf(air.pm10Grade);
  const pm25Idx = grades.indexOf(air.pm25Grade);
  return grades[Math.max(pm10Idx, pm25Idx)];
}

export function CompactHeader({ weather, airQuality, yesterday, weekly }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = formatTime(now);
  const dateStr = formatDate(now);

  return (
    <View style={styles.container}>
      {/* 상단: 시계 + 날짜 (한 줄, 작게) */}
      <View style={styles.clockRow}>
        <Text style={styles.time}>{timeStr}</Text>
        <Text style={styles.date}>{dateStr}</Text>
        <Text style={styles.location}>서울</Text>
      </View>

      {/* 오늘 날씨 */}
      {weather && (
        <View style={styles.weatherSection}>
          {/* 기온 + 상태 */}
          <View style={styles.todayRow}>
            <Text style={styles.todayEmoji}>
              {skyToEmoji(weather.sky, weather.precipType)}
            </Text>
            <Text style={styles.todayTemp}>{Math.round(weather.temperature)}°</Text>
            <Text style={styles.feelsLike}>체감 {weather.feelsLike}°</Text>
            {yesterday && (
              <Text style={[styles.comparison, { color: getTempDiffColor(yesterday.tempDiff) }]}>
                {yesterday.message}
              </Text>
            )}
          </View>

          {/* 미세먼지 + 강수 */}
          <View style={styles.infoRow}>
            {airQuality && (
              <Text style={[styles.infoText, { color: getDustColor(getWorstDustGrade(airQuality)) }]}>
                미세먼지 {dustGradeLabel(getWorstDustGrade(airQuality) as any)}
              </Text>
            )}
            <Text style={styles.infoText}>💧 {weather.precipProb}%</Text>
            <Text style={styles.infoText}>
              {Math.round(weather.tempMin)}°/{Math.round(weather.tempMax)}°
            </Text>
          </View>
        </View>
      )}

      {/* 구분선 */}
      {weekly.length > 0 && <View style={styles.divider} />}

      {/* 7일 비교 (컴팩트) */}
      {weekly.length > 0 && (
        <View style={styles.weeklyRow}>
          {weekly.map((day) => (
            <View
              key={day.date}
              style={[
                styles.dayCol,
                day.isToday && styles.todayCol,
                day.isYesterday && styles.yesterdayCol,
              ]}
            >
              <Text style={[
                styles.dayLabel,
                day.isToday && styles.todayLabel,
                day.isYesterday && styles.yesterdayLabel,
              ]}>
                {day.isToday ? '오늘' : day.isYesterday ? '어제' : day.dayOfWeek}
              </Text>
              <Text style={styles.dayEmoji}>
                {skyToEmoji(day.sky, day.precipType)}
              </Text>
              <Text style={[
                styles.dayTempHigh,
                day.isYesterday && styles.yesterdayLabel,
              ]}>
                {Math.round(day.tempMax)}°
              </Text>
              <View style={styles.miniBar}>
                <View
                  style={[
                    styles.miniBarFill,
                    day.isToday && styles.todayBarFill,
                    day.isYesterday && styles.yesterdayBarFill,
                    {
                      height: `${Math.max(20, Math.min(100, (day.tempMax - day.tempMin) * 5 + 30))}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[
                styles.dayTempLow,
                day.isYesterday && styles.yesterdayLabel,
              ]}>
                {Math.round(day.tempMin)}°
              </Text>
            </View>
          ))}
        </View>
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
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
  },
  // 시계
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  time: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  date: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  location: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },
  // 오늘 날씨
  weatherSection: {
    marginBottom: SPACING.xs,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  todayEmoji: {
    fontSize: 22,
  },
  todayTemp: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  feelsLike: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  comparison: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // 구분선
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: SPACING.sm,
  },
  // 7일 비교
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayCol: {
    backgroundColor: COLORS.todayHighlight,
  },
  yesterdayCol: {
    opacity: 0.5,
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  todayLabel: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  yesterdayLabel: {
    color: COLORS.textMuted,
  },
  dayEmoji: {
    fontSize: 14,
    marginVertical: 1,
  },
  dayTempHigh: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  miniBar: {
    width: 4,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    marginVertical: 1,
    justifyContent: 'flex-end',
  },
  miniBarFill: {
    width: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  todayBarFill: {
    backgroundColor: COLORS.accent,
  },
  yesterdayBarFill: {
    backgroundColor: COLORS.textMuted,
  },
  dayTempLow: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
