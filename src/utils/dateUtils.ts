/**
 * 날짜/시간 유틸리티
 * 기상청 API는 특정 시간 포맷(YYYYMMDD, HHmm)을 요구합니다.
 */

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/** 현재 시각을 HH:MM:SS 형태로 반환 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** 날짜를 "M월 D일 X요일" 형태로 반환 */
export function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = DAY_NAMES[date.getDay()];
  return `${month}월 ${day}일 ${dayName}요일`;
}

/** YYYYMMDD 형태 반환 (기상청 API용) */
export function toYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/** HHmm 형태 반환 (기상청 API용) */
export function toHHmm(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}${m}`;
}

/**
 * 기상청 단기예보 base_time 계산
 * 단기예보는 하루 8번 발표: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
 * API 제공 시각은 발표시각 + 10분 (예: 0210)
 */
export function getVilageFcstBaseTime(date: Date): { baseDate: string; baseTime: string } {
  const baseTimes = ['2300', '2000', '1700', '1400', '1100', '0800', '0500', '0200'];
  const now = new Date(date);
  const currentHHmm = toHHmm(now);

  // 현재 시각에서 10분을 빼서 사용 가능한 가장 최근 발표 시각을 찾음
  const adjustedMinutes = now.getHours() * 60 + now.getMinutes() - 10;

  for (const bt of baseTimes) {
    const btMinutes = parseInt(bt.substring(0, 2)) * 60 + parseInt(bt.substring(2, 4));
    if (adjustedMinutes >= btMinutes) {
      return { baseDate: toYYYYMMDD(now), baseTime: bt };
    }
  }

  // 자정~02:10 사이: 전날 23:00 데이터 사용
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return { baseDate: toYYYYMMDD(yesterday), baseTime: '2300' };
}

/**
 * 기상청 초단기실황 base_time 계산
 * 매시 정각에 발표, 약 15분 후 API 제공
 */
export function getUltraSrtNcstBaseTime(date: Date): { baseDate: string; baseTime: string } {
  const now = new Date(date);
  const minutes = now.getMinutes();

  if (minutes < 15) {
    // 아직 현재 시각의 데이터 미제공 → 1시간 전
    now.setHours(now.getHours() - 1);
  }

  return {
    baseDate: toYYYYMMDD(now),
    baseTime: `${String(now.getHours()).padStart(2, '0')}00`,
  };
}

/** 요일 약어 반환 */
export function getDayName(date: Date): string {
  return DAY_NAMES[date.getDay()];
}

/** D+n 날짜 생성 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
