/**
 * 유아동 코디 추천 엔진
 *
 * 체감온도 + 강수확률 + 미세먼지 → 룰 기반 매핑
 * 2~3장의 코디 카드를 생성합니다.
 */

import { TEMP_RANGES, WEATHER_EXTRAS } from '../constants/outfitRules';
import type { OutfitCard, OutfitItem } from '../types/outfit';
import type { CurrentWeather, AirQuality, DustGrade } from '../types/weather';

function isDustBad(grade: DustGrade): boolean {
  return grade === 'bad' || grade === 'very_bad';
}

/**
 * 코디 추천 카드 생성
 * @returns 2~3장의 코디 카드
 */
export function generateOutfitCards(
  weather: CurrentWeather,
  airQuality: AirQuality,
): OutfitCard[] {
  const { feelsLike, precipProb } = weather;
  const dustBad = isDustBad(airQuality.pm10Grade) || isDustBad(airQuality.pm25Grade);
  const uvHigh = false; // MVP에서는 자외선 지수 미지원, 추후 추가

  // 1) 체감온도에 맞는 기본 코디 찾기
  const baseRange = TEMP_RANGES.find(r => feelsLike >= r.min && feelsLike < r.max);
  if (!baseRange) return [];

  // 2) 추가 아이템 수집
  const extras: OutfitItem[] = [];
  const extraTags: string[] = [];
  for (const extra of WEATHER_EXTRAS) {
    if (extra.condition(feelsLike, precipProb, dustBad, uvHigh)) {
      extras.push(...extra.items);
      extraTags.push(extra.tag);
    }
  }

  // 3) 메인 카드 (추천 코디)
  const mainCard: OutfitCard = {
    id: 'main',
    title: `${baseRange.emoji} ${baseRange.cardTitle}`,
    items: baseRange.items,
    reason: baseRange.reason,
    tags: [...baseRange.tags, ...extraTags],
    extras,
  };

  const cards: OutfitCard[] = [mainCard];

  // 4) 대안 카드: 한 단계 따뜻한 코디 (아이가 추위를 많이 탈 때)
  const currentIdx = TEMP_RANGES.indexOf(baseRange);
  if (currentIdx > 0) {
    const warmerRange = TEMP_RANGES[currentIdx - 1];
    cards.push({
      id: 'warmer',
      title: `🔥 좀 더 따뜻하게`,
      items: warmerRange.items,
      reason: '아이가 추위를 많이 탄다면 이렇게 입혀주세요.',
      tags: ['따뜻하게', ...extraTags],
      extras,
    });
  }

  // 5) 대안 카드: 한 단계 시원한 코디 (아이가 더위를 많이 탈 때)
  if (currentIdx < TEMP_RANGES.length - 1) {
    const coolerRange = TEMP_RANGES[currentIdx + 1];
    cards.push({
      id: 'cooler',
      title: `💨 좀 더 가볍게`,
      items: coolerRange.items,
      reason: '아이가 더위를 많이 탄다면 이렇게 입혀주세요.',
      tags: ['가볍게', ...extraTags],
      extras,
    });
  }

  return cards;
}
