/** 다크 테마 색상 (상시 디스플레이용) */
export const COLORS = {
  // 배경
  background: '#0D1117',
  cardBackground: '#161B22',
  cardBorder: '#21262D',

  // 텍스트
  textPrimary: '#F0F6FC',
  textSecondary: '#8B949E',
  textMuted: '#484F58',

  // 강조
  accent: '#58A6FF',
  accentWarm: '#F78166',
  accentGreen: '#3FB950',
  accentYellow: '#D29922',
  accentPurple: '#BC8CFF',

  // 미세먼지 등급 색상
  dustGood: '#3FB950',
  dustModerate: '#D29922',
  dustBad: '#F78166',
  dustVeryBad: '#F85149',

  // 기온 색상
  tempHot: '#F85149',
  tempWarm: '#F78166',
  tempMild: '#D29922',
  tempCool: '#58A6FF',
  tempCold: '#79C0FF',
  tempFreeze: '#BC8CFF',

  // 오늘 하이라이트
  todayHighlight: 'rgba(88, 166, 255, 0.15)',
  yesterdayMuted: 'rgba(139, 148, 158, 0.3)',
} as const;

export const FONT_SIZES = {
  clockTime: 64,
  clockDate: 20,
  sectionTitle: 18,
  cardTitle: 22,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tempLarge: 36,
  tempMedium: 24,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
