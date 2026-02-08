/**
 * 등원 준비물 체크리스트 엔진
 *
 * 날씨 조건에 따라 필수 아이템을 자동 추천하고,
 * 기본 준비물과 함께 체크리스트를 생성합니다.
 */

import type { ChecklistItem } from '../types/outfit';
import type { CurrentWeather, AirQuality } from '../types/weather';

/** 항상 포함되는 기본 준비물 */
const BASE_ITEMS: Omit<ChecklistItem, 'checked'>[] = [
  { id: 'spare_clothes', name: '여벌옷', emoji: '👚', isAutoRecommended: false },
  { id: 'water_bottle', name: '물통', emoji: '🥤', isAutoRecommended: false },
  { id: 'wet_tissue', name: '물티슈', emoji: '🧻', isAutoRecommended: false },
];

/** 날씨 조건별 자동 추천 아이템 */
interface AutoItem {
  id: string;
  name: string;
  emoji: string;
  condition: (weather: CurrentWeather, air: AirQuality) => boolean;
}

const AUTO_ITEMS: AutoItem[] = [
  {
    id: 'mask',
    name: '마스크',
    emoji: '😷',
    condition: (_, air) =>
      air.pm10Grade === 'bad' || air.pm10Grade === 'very_bad' ||
      air.pm25Grade === 'bad' || air.pm25Grade === 'very_bad',
  },
  {
    id: 'gloves',
    name: '장갑',
    emoji: '🧤',
    condition: (w) => w.feelsLike <= 0,
  },
  {
    id: 'hat_warm',
    name: '방한모자',
    emoji: '🧢',
    condition: (w) => w.feelsLike <= 0,
  },
  {
    id: 'umbrella',
    name: '우산',
    emoji: '☂️',
    condition: (w) => w.precipProb >= 50,
  },
  {
    id: 'raincoat',
    name: '우비',
    emoji: '🌂',
    condition: (w) => w.precipProb >= 60,
  },
  {
    id: 'sunscreen',
    name: '선크림',
    emoji: '🧴',
    condition: (w) => w.feelsLike >= 25,
  },
  {
    id: 'hat_sun',
    name: '햇빛차단 모자',
    emoji: '👒',
    condition: (w) => w.feelsLike >= 25,
  },
];

/**
 * 오늘의 체크리스트 생성
 */
export function generateChecklist(
  weather: CurrentWeather,
  airQuality: AirQuality,
): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // 1) 날씨 기반 자동 추천 아이템 (상단에 배치)
  for (const auto of AUTO_ITEMS) {
    if (auto.condition(weather, airQuality)) {
      items.push({
        id: auto.id,
        name: auto.name,
        emoji: auto.emoji,
        checked: false,
        isAutoRecommended: true,
      });
    }
  }

  // 2) 기본 준비물
  for (const base of BASE_ITEMS) {
    items.push({
      ...base,
      checked: false,
    });
  }

  return items;
}
