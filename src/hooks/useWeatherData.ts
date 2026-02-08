/**
 * 날씨 데이터 통합 관리 훅
 *
 * 기상청 + 에어코리아 API를 주기적으로 호출하고,
 * 코디 추천과 체크리스트를 자동으로 갱신합니다.
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
import type { CurrentWeather, DailyWeather, AirQuality, YesterdayComparison } from '../types/weather';
import type { OutfitCard, ChecklistItem } from '../types/outfit';

interface WeatherState {
  current: CurrentWeather | null;
  weekly: DailyWeather[];
  airQuality: AirQuality | null;
  yesterday: YesterdayComparison | null;
  outfitCards: OutfitCard[];
  checklist: ChecklistItem[];
  isLoading: boolean;
  error: string | null;
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
    lastUpdated: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const nx = DEFAULT_GRID.nx;
      const ny = DEFAULT_GRID.ny;

      // API 병렬 호출
      const [current, weekly, airQuality, yesterdayTemp] = await Promise.all([
        fetchCurrentWeather(nx, ny),
        fetchWeeklyWeather(nx, ny),
        fetchAirQuality('종로구'),
        fetchYesterdayTemp(nx, ny),
      ]);

      // 어제 대비 비교
      const yesterday = getYesterdayComparison(current.temperature, yesterdayTemp);

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
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.',
      }));
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
