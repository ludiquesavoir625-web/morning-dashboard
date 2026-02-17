/**
 * 아침 등원 대시보드
 * 유아동(만 1~4세) 어린이집 등원을 위한 상시 디스플레이 날씨·코디·준비물 앱
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Clock } from './src/components/Clock';
import { WeatherCurrent } from './src/components/WeatherCurrent';
import { WeatherWeekly } from './src/components/WeatherWeekly';
import { OutfitCards } from './src/components/OutfitCards';
import { Checklist } from './src/components/Checklist';
import { useWeatherData } from './src/hooks/useWeatherData';
import { COLORS, FONT_SIZES, SPACING } from './src/constants/theme';
import { API_KEYS } from './src/constants/config';

export default function App() {
  // 화면 꺼짐 방지 (상시 디스플레이)
  useKeepAwake();

  const {
    current,
    weekly,
    airQuality,
    yesterday,
    outfitCards,
    checklist,
    isLoading,
    error,
    isDemo,
    lastUpdated,
    refresh,
    toggleCheckItem,
  } = useWeatherData();

  // API 키 미설정 안내
  if (!API_KEYS.weather || API_KEYS.weather === 'your_api_key_here') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.setupContainer}>
          <Text style={styles.setupEmoji}>🔑</Text>
          <Text style={styles.setupTitle}>API 키 설정이 필요해요</Text>
          <Text style={styles.setupDesc}>
            1. data.go.kr 에서 API 키를 발급받으세요{'\n'}
            2. 프로젝트 폴더의 .env 파일을 열어주세요{'\n'}
            3. EXPO_PUBLIC_WEATHER_API_KEY= 뒤에 키를 입력하세요{'\n'}
            4. EXPO_PUBLIC_AIR_QUALITY_API_KEY= 도 입력하세요{'\n'}
            5. 앱을 다시 시작하세요
          </Text>
          <View style={styles.envBox}>
            <Text style={styles.envText}>
              EXPO_PUBLIC_WEATHER_API_KEY=발급받은키{'\n'}
              EXPO_PUBLIC_AIR_QUALITY_API_KEY=발급받은키
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>서울 · 어린이집 등원 대시보드</Text>
          {lastUpdated && (
            <Text style={styles.headerUpdated}>
              {lastUpdated.getHours()}:{String(lastUpdated.getMinutes()).padStart(2, '0')} 갱신
            </Text>
          )}
        </View>

        {/* 시계 */}
        <Clock />

        {/* 데모 모드 안내 배너 */}
        {isDemo && (
          <TouchableOpacity style={styles.demoBanner} onPress={refresh}>
            <Text style={styles.demoBannerText}>
              ⚠️ API 연결 실패 — 데모 데이터로 표시 중 (탭하여 재시도)
            </Text>
            {error && (
              <Text style={styles.demoBannerDetail}>{error}</Text>
            )}
          </TouchableOpacity>
        )}

        {/* 로딩 / 데이터 */}
        {isLoading && !current ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>날씨 정보를 불러오는 중...</Text>
          </View>
        ) : error && !current ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 오늘 날씨 */}
            {current && airQuality && yesterday && (
              <WeatherCurrent
                weather={current}
                airQuality={airQuality}
                yesterday={yesterday}
              />
            )}

            {/* 7일 비교 */}
            {weekly.length > 0 && (
              <WeatherWeekly weekly={weekly} />
            )}

            {/* 코디 추천 */}
            {outfitCards.length > 0 && (
              <OutfitCards cards={outfitCards} />
            )}

            {/* 체크리스트 */}
            {checklist.length > 0 && (
              <Checklist items={checklist} onToggle={toggleCheckItem} />
            )}
          </>
        )}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  headerUpdated: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.xl,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  retryText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
  // 데모 모드 배너
  demoBanner: {
    backgroundColor: 'rgba(210, 153, 34, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(210, 153, 34, 0.3)',
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  demoBannerText: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.accentYellow,
    textAlign: 'center',
    fontWeight: '600',
  },
  demoBannerDetail: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  // API 키 설정 화면
  setupContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  setupEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  setupTitle: {
    fontSize: FONT_SIZES.cardTitle,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  setupDesc: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 28,
    textAlign: 'left',
  },
  envBox: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: SPACING.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  envText: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.accentGreen,
    fontFamily: 'monospace',
    lineHeight: 24,
  },
});
