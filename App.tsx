/**
 * 아침 등원 대시보드
 * 유아동(만 1~4세) 어린이집 등원을 위한 상시 디스플레이 날씨·코디·준비물 앱
 *
 * 레이아웃: 컴팩트 헤더(시계+날씨+7일) → 코디카드(메인) → 체크리스트(하단)
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
import { CompactHeader } from './src/components/CompactHeader';
import { OutfitCards } from './src/components/OutfitCards';
import { Checklist } from './src/components/Checklist';
import { useWeatherData } from './src/hooks/useWeatherData';
import { COLORS, SPACING } from './src/constants/theme';

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

  // 미세먼지 나쁨 여부
  const dustBad = airQuality
    ? (airQuality.pm10Grade === 'bad' || airQuality.pm10Grade === 'very_bad' ||
       airQuality.pm25Grade === 'bad' || airQuality.pm25Grade === 'very_bad')
    : false;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 데모 모드 안내 배너 */}
        {isDemo && (
          <TouchableOpacity style={styles.demoBanner} onPress={refresh}>
            <Text style={styles.demoBannerText}>
              ⚠️ 데모 모드 (탭하여 재시도)
            </Text>
          </TouchableOpacity>
        )}

        {/* 로딩 */}
        {isLoading && !current ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>날씨 정보를 불러오는 중...</Text>
          </View>
        ) : (
          <>
            {/* 상단: 시계 + 오늘 날씨 + 7일 비교 (하나의 카드) */}
            <CompactHeader
              weather={current}
              airQuality={airQuality}
              yesterday={yesterday}
              weekly={weekly}
            />

            {/* 메인: 코디 추천 카드 (스와이프) */}
            {outfitCards.length > 0 && current && (
              <OutfitCards
                cards={outfitCards}
                feelsLike={current.feelsLike}
                precipType={current.precipType}
                dustBad={dustBad}
              />
            )}

            {/* 하단: 체크리스트 (컴팩트) */}
            {checklist.length > 0 && (
              <Checklist items={checklist} onToggle={toggleCheckItem} />
            )}
          </>
        )}
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  demoBanner: {
    backgroundColor: 'rgba(210, 153, 34, 0.12)',
    borderRadius: 8,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  demoBannerText: {
    fontSize: 12,
    color: COLORS.accentYellow,
    textAlign: 'center',
  },
});
