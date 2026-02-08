/**
 * 시계 컴포넌트
 * 현재 시각 (시:분:초) + 날짜 + 요일 표시
 * 1초마다 자동 갱신
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime, formatDate } from '../utils/dateUtils';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';

export function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(now)}</Text>
      <Text style={styles.date}>{formatDate(now)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  time: {
    fontSize: FONT_SIZES.clockTime,
    fontWeight: '200',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  date: {
    fontSize: FONT_SIZES.clockDate,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
