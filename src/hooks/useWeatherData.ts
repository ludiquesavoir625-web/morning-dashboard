/**
 * 날씨 데이터 통합 관리 훅
 *
 * 기상청 + 에어코리아 API를 주기적으로 호출하고,
 * 코디 추천과 체크리스트를 자동으로 갱신합니다.
 * API 실패 시 데모 데이터로 폴백합니다.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchCurrentWeather,
  fetchYesterdayTemp,
  fetchWeeklyWeather,
  getYesterdayComparison,
} from '../services/weatherApi';
import { fetchAirQuality } from '../services/airQualityApi';
import { generateOutfitCards } from '../services/outfitEngine';
import { generateChecklist } from '../services/checklistEngine';
import { REFRESH_INTERVAL } from '../constants/config';
import { DEFAULT_GRID } from '../utils/gridCoord';
import { getDayName, toYYYYMMDD, addDays } from '../utils/dateUtils';
import type { CurrentWeather, DailyWeather, AirQuality, YesterdayComparison } from '../types/weather';
import type { OutfitCard, ChecklistItem } from '../types/outfit';

// ─── 데모 데이터 (API 실패 시 사용) ──────────────────────────────

function getDemoData() {
  const today = new Date();
  const month = today.getMonth() + 1;

  // 계절에 따른 기본 기온 설정
  let baseTemp: number;
  if (month >= 3 && month <= 5) baseTemp = 12;       // 봄
  else if (month >= 6 && month <= 8) baseTemp = 27;   // 여름
  else if (month >= 9 && month <= 11) baseTemp = 14;  // 가을
  else baseTemp = -2;                                  // 겨울

  const demoCurrent: CurrentWeather = {
    temperature: baseTemp,
    feelsLike: baseTemp - 3,
    tempMax: baseTemp + 5,
    tempMin: baseTemp - 4,
    sky: 'partly_cloudy',
    precipType: 'none',
    precipProb: 20,
    humidity: 55,
    windSpeed: 2.5,
    updatedAt: new Date().toISOString(),
  };

  const demoAir: AirQuality = {
    pm10Value: 45,
    pm10Grade: 'moderate',
    pm25Value: 22,
    pm25Grade: 'moderate',
    stationName: '서울 (데모)',
    updatedAt: new Date().toISOString(),
  };

  const demoWeekly: DailyWeather[] = [];
  for (let d = -1; d <= 5; d++) {
    const date = addDays(today, d);
    const variation = Math.round(Math.sin(d) * 3);
    demoWeekly.push({
      date: toYYYYMMDD(date),
      dayOfWeek: getDayName(date),
      tempMax: baseTemp + 5 + variation,
      tempMin: baseTemp - 4 + variation,
      sky: d % 3 === 0 ? 'clear' : 'partly_cloudy',
      precipType: 'none',
      precipProb: d === 2 ? 60 : 10,
      isToday: d === 0,
      isYesterday: d === -1,
    });
  }

  const demoYesterday: YesterdayComparison = {
    tempDiff: 2,
    message: '어제보다 2° 높아요',
  };

  return { demoCurrent, demoAir, demoWeekly, demoYesterday };
}

// ─── 메인 훅 ────────────────────────────────────────────────────

interface WeatherState {
  current: CurrentWeather | null;
  weekly: DailyWeather[];
  airQuality: AirQuality | null;
  yesterday: YesterdayComparison | null;
  outfitCards: OutfitCard[];
  checklist: ChecklistItem[];
  isLoading: boolean;
  error: string | null;
  isDemo: boolean;
  lastUpdated: Date | null;
}

export function useWeatherData() {
  const [state, setState] = useState<WeatherState>({
    current: null,
    weekly: [],
    airQuality: null,
    yesterday: null,
    outfitCards: [],
    checklist: [],
    isLoading: true,
    error: null,
    isDemo: false,
    lastUpdated: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const nx = DEFAULT_GRID.nx;
      const ny = DEFAULT_GRID.ny;

      // API 병렬 호출 (각각 실패해도 다른 것은 계속 진행)
      const [current, weekly, airQuality] = await Promise.all([
        fetchCurrentWeather(nx, ny),
        fetchWeeklyWeather(nx, ny),
        fetchAirQuality('종로구').catch(() => null),
      ]);

      // 어제 대비 비교 (실패해도 무시)
      let yesterday: YesterdayComparison | null = null;
      try {
        const yesterdayTemp = await fetchYesterdayTemp(nx, ny);
        yesterday = getYesterdayComparison(current.temperature, yesterdayTemp);
      } catch {
        yesterday = { tempDiff: 0, message: '' };
      }

      // 코디 추천
      const outfitCards = generateOutfitCards(current, airQuality);

      // 체크리스트
      const checklist = generateChecklist(current, airQuality);

      setState({
        current,
        weekly,
        airQuality,
        yesterday,
        outfitCards,
        checklist,
        isLoading: false,
        error: null,
        isDemo: false,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error('데이터 로드 실패:', err);

      // API 실패 시 데모 데이터로 폴백
      const { demoCurrent, demoAir, demoWeekly, demoYesterday } = getDemoData();
      const outfitCards = generateOutfitCards(demoCurrent, demoAir);
      const checklist = generateChecklist(demoCurrent, demoAir);

      setState({
        current: demoCurrent,
        weekly: demoWeekly,
        airQuality: demoAir,
        yesterday: demoYesterday,
        outfitCards,
        checklist,
        isLoading: false,
        error: err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.',
        isDemo: true,
        lastUpdated: new Date(),
      });
    }
  }, []);

  // 체크리스트 토글
  const toggleCheckItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      ),
    }));
  }, []);

  // 초기 로드 + 주기적 갱신
  useEffect(() => {
    loadData();

    intervalRef.current = setInterval(loadData, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadData]);

  return {
    ...state,
    refresh: loadData,
    toggleCheckItem,
  };
}
