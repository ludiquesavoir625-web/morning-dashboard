/**
 * 에어코리아 미세먼지 API 연동 서비스
 *
 * 측정소별 실시간 대기오염 데이터 조회
 */

import { API_KEYS, AIR_API } from '../constants/config';
import type { AirQuality, DustGrade } from '../types/weather';

/** 미세먼지 수치 → 등급 변환 (PM10 기준) */
function pm10ToGrade(value: number): DustGrade {
  if (value <= 30) return 'good';
  if (value <= 80) return 'moderate';
  if (value <= 150) return 'bad';
  return 'very_bad';
}

/** 초미세먼지 수치 → 등급 변환 (PM2.5 기준) */
function pm25ToGrade(value: number): DustGrade {
  if (value <= 15) return 'good';
  if (value <= 35) return 'moderate';
  if (value <= 75) return 'bad';
  return 'very_bad';
}

/** 등급 → 한국어 라벨 */
export function dustGradeLabel(grade: DustGrade): string {
  switch (grade) {
    case 'good': return '좋음';
    case 'moderate': return '보통';
    case 'bad': return '나쁨';
    case 'very_bad': return '매우나쁨';
  }
}

/** 등급 → 이모지 */
export function dustGradeEmoji(grade: DustGrade): string {
  switch (grade) {
    case 'good': return '😊';
    case 'moderate': return '😐';
    case 'bad': return '😷';
    case 'very_bad': return '🤢';
  }
}

/**
 * 측정소별 실시간 대기오염 조회
 * @param stationName 측정소 이름 (예: "종로구")
 */
export async function fetchAirQuality(stationName: string = '종로구'): Promise<AirQuality> {
  const url = `${AIR_API.realtime}?serviceKey=${encodeURIComponent(API_KEYS.airQuality)}&returnType=json&numOfRows=1&pageNo=1&stationName=${encodeURIComponent(stationName)}&dataTerm=DAILY&ver=1.0`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`에어코리아 API 오류: ${response.status}`);
  }

  const data = await response.json();
  const item = data.response?.body?.items?.[0];

  if (!item) {
    throw new Error('미세먼지 데이터 없음');
  }

  const pm10 = parseInt(item.pm10Value, 10) || 0;
  const pm25 = parseInt(item.pm25Value, 10) || 0;

  return {
    pm10Value: pm10,
    pm10Grade: pm10ToGrade(pm10),
    pm25Value: pm25,
    pm25Grade: pm25ToGrade(pm25),
    stationName: item.stationName ?? stationName,
    updatedAt: item.dataTime ?? new Date().toISOString(),
  };
}
