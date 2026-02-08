/**
 * 유아동(만 1~4세) 코디 추천 규칙
 *
 * 체감온도 구간별 기본 코디 + 날씨 조건에 따른 추가 아이템
 */

import type { OutfitCard, OutfitItem } from '../types/outfit';

/** 체감온도 구간 정의 */
interface TempRange {
  min: number;
  max: number;
  label: string;
  cardTitle: string;
  emoji: string;
  items: OutfitItem[];
  reason: string;
  tags: string[];
}

export const TEMP_RANGES: TempRange[] = [
  {
    min: -Infinity,
    max: -10,
    label: '한파',
    cardTitle: '완전무장 한파 룩',
    emoji: '🥶',
    items: [
      { name: '두꺼운 패딩', emoji: '🧥' },
      { name: '기모 내복', emoji: '👕' },
      { name: '기모바지', emoji: '👖' },
      { name: '목도리', emoji: '🧣' },
      { name: '장갑', emoji: '🧤' },
      { name: '방한모자', emoji: '🧢' },
      { name: '방한부츠', emoji: '👢' },
    ],
    reason: '체감온도가 매우 낮아요. 노출 부위를 최소화해주세요.',
    tags: ['한파', '완전방한', '필수'],
  },
  {
    min: -10,
    max: 0,
    label: '매우 추움',
    cardTitle: '따뜻한 겨울 외출룩',
    emoji: '🧥',
    items: [
      { name: '패딩', emoji: '🧥' },
      { name: '기모 내복', emoji: '👕' },
      { name: '기모바지', emoji: '👖' },
      { name: '목도리', emoji: '🧣' },
      { name: '방한모자', emoji: '🧢' },
    ],
    reason: '두꺼운 외투와 기모 안감이 필요한 날씨예요.',
    tags: ['겨울', '방한'],
  },
  {
    min: 0,
    max: 10,
    label: '추움',
    cardTitle: '쌀쌀한 날 외출룩',
    emoji: '🧤',
    items: [
      { name: '점퍼/자켓', emoji: '🧥' },
      { name: '긴팔 티셔츠', emoji: '👕' },
      { name: '긴바지', emoji: '👖' },
      { name: '얇은 목도리', emoji: '🧣' },
    ],
    reason: '겉옷을 꼭 챙겨주세요. 실내는 따뜻할 수 있어요.',
    tags: ['가을겨울', '겉옷필수'],
  },
  {
    min: 10,
    max: 20,
    label: '선선함',
    cardTitle: '가벼운 봄가을 룩',
    emoji: '🌤️',
    items: [
      { name: '가디건/후드', emoji: '🧥' },
      { name: '긴팔 티셔츠', emoji: '👕' },
      { name: '긴바지', emoji: '👖' },
    ],
    reason: '아침저녁 온도 차이가 있어요. 겉옷을 준비해주세요.',
    tags: ['봄가을', '레이어드'],
  },
  {
    min: 20,
    max: 25,
    label: '따뜻함',
    cardTitle: '편한 외출룩',
    emoji: '😊',
    items: [
      { name: '얇은 긴팔', emoji: '👕' },
      { name: '면바지', emoji: '👖' },
    ],
    reason: '활동하기 좋은 날씨예요!',
    tags: ['초여름', '편안'],
  },
  {
    min: 25,
    max: Infinity,
    label: '더움',
    cardTitle: '시원한 여름 룩',
    emoji: '☀️',
    items: [
      { name: '반팔 티셔츠', emoji: '👕' },
      { name: '반바지', emoji: '🩳' },
      { name: '모자', emoji: '🧢' },
    ],
    reason: '더운 날씨예요. 통풍이 잘 되는 옷을 입혀주세요.',
    tags: ['여름', '시원하게'],
  },
];

/** 날씨 조건별 추가 아이템 */
interface WeatherExtra {
  condition: (feelsLike: number, precipProb: number, dustBad: boolean, uvHigh: boolean) => boolean;
  items: OutfitItem[];
  tag: string;
}

export const WEATHER_EXTRAS: WeatherExtra[] = [
  {
    condition: (_, precipProb) => precipProb >= 50,
    items: [
      { name: '우비', emoji: '🌂' },
      { name: '장화', emoji: '👢' },
    ],
    tag: '비대비',
  },
  {
    condition: (feelsLike, precipProb) => feelsLike <= -10 && precipProb >= 30,
    items: [
      { name: '스노우팬츠', emoji: '👖' },
      { name: '방수장갑', emoji: '🧤' },
    ],
    tag: '눈대비',
  },
  {
    condition: (_, __, dustBad) => dustBad,
    items: [
      { name: '마스크', emoji: '😷' },
    ],
    tag: '미세먼지',
  },
  {
    condition: (feelsLike, _, __, uvHigh) => feelsLike >= 20 && uvHigh,
    items: [
      { name: '선크림', emoji: '🧴' },
      { name: '모자', emoji: '🧢' },
    ],
    tag: '자외선',
  },
];
