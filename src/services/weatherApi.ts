/**
 * 한국 기상청 API 연동 서비스
 *
 * - 초단기실황: 현재 기온, 습도, 풍속 등 (매시 발표)
 * - 단기예보: 오늘~모레 3시간 단위 예보 (하루 8회 발표)
 * - 중기예보: D+3~D+7 기온/날씨 예보
 */

import { API_KEYS, WEATHER_API, MID_FORECAST_REGION } from '../constants/config';
import { DEFAULT_GRID } from '../utils/gridCoord';
import {
  toYYYYMMDD,
  getVilageFcstBaseTime,
  getUltraSrtNcstBaseTime,
  addDays,
  getDayName,
} from '../utils/dateUtils';
import type {
  CurrentWeather,
  DailyWeather,
  SkyStatus,
  PrecipType,
  YesterdayComparison,
} from '../types/weather';

// ─── 기상청 응답 타입 ────────────────────────────────────────────

interface KmaResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body?: {
      items?: {
        item?: KmaItem[];
      };
    };
  };
}

interface KmaItem {
  category: string;
  fcstDate?: string;
  fcstTime?: string;
  obsrValue?: string;
  fcstValue?: string;
  baseDate: string;
  baseTime: string;
}

interface MidTaResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body?: {
      items?: {
        item?: MidTaItem[];
      };
    };
  };
}

interface MidTaItem {
  taMin3: number; taMax3: number;
  taMin4: number; taMax4: number;
  taMin5: number; taMax5: number;
  taMin6: number; taMax6: number;
  taMin7: number; taMax7: number;
}

interface MidLandItem {
  wf3Am: string; wf3Pm: string;
  wf4Am: string; wf4Pm: string;
  wf5Am: string; wf5Pm: string;
  wf6Am: string; wf6Pm: string;
  wf7Am: string; wf7Pm: string;
  rnSt3Am: number; rnSt3Pm: number;
  rnSt4Am: number; rnSt4Pm: number;
  rnSt5Am: number; rnSt5Pm: number;
  rnSt6Am: number; rnSt6Pm: number;
  rnSt7Am: number; rnSt7Pm: number;
}

// ─── 공통 fetch 함수 ────────────────────────────────────────────

async function fetchKma(url: string, params: Record<string, string>): Promise<KmaResponse> {
  // 공공데이터포털 API는 serviceKey를 인코딩하지 않고 그대로 전달해야 함
  const queryParts = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  const fullUrl = `${url}?serviceKey=${API_KEYS.weather}&dataType=JSON&${queryParts}`;

  const response = await fetch(fullUrl);

  // 응답이 JSON이 아닌 경우 (HTML 에러 페이지 등) 처리
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    // 기상청 API는 200을 반환하면서 에러 코드를 보내는 경우가 있음
    if (data.response?.header?.resultCode !== '00') {
      throw new Error(`기상청 API 응답 오류: ${data.response?.header?.resultMsg ?? '알 수 없는 오류'}`);
    }
    return data;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error(`기상청 API 오류: 응답이 올바르지 않습니다 (HTTP ${response.status})`);
    }
    throw e;
  }
}

// ─── 코드 → 타입 변환 ──────────────────────────────────────────

function parseSkyStatus(code: string): SkyStatus {
  switch (code) {
    case '1': return 'clear';         // 맑음
    case '3': return 'partly_cloudy'; // 구름많음
    case '4': return 'overcast';      // 흐림
    default:  return 'partly_cloudy';
  }
}

function parsePrecipType(code: string): PrecipType {
  switch (code) {
    case '0': return 'none';
    case '1': return 'rain';
    case '2': return 'rain_snow';
    case '3': return 'snow';
    case '4': return 'shower';
    default:  return 'none';
  }
}

/** 하늘상태 → 이모지 */
export function skyToEmoji(sky: SkyStatus, precipType: PrecipType): string {
  if (precipType === 'snow') return '🌨️';
  if (precipType === 'rain' || precipType === 'shower') return '🌧️';
  if (precipType === 'rain_snow') return '🌨️';
  switch (sky) {
    case 'clear': return '☀️';
    case 'partly_cloudy': return '⛅';
    case 'cloudy': return '☁️';
    case 'overcast': return '☁️';
    default: return '⛅';
  }
}

/**
 * 체감온도 계산 (Wind Chill)
 * 기상청 체감온도 공식 (기온 10℃ 이하, 풍속 4.8km/h 이상)
 */
export function calculateFeelsLike(temp: number, windSpeed: number, humidity: number): number {
  const windKmh = windSpeed * 3.6; // m/s → km/h

  if (temp <= 10 && windKmh >= 4.8) {
    // 겨울 체감온도 (Wind Chill)
    const wc = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * temp * Math.pow(windKmh, 0.16);
    return Math.round(wc);
  } else if (temp >= 25) {
    // 여름 체감온도 (Heat Index) 간이 공식
    const hi = temp + 0.33 * (humidity / 100 * 6.105 * Math.exp(17.27 * temp / (237.7 + temp))) - 4.0;
    return Math.round(hi);
  }

  return Math.round(temp);
}

// ─── 초단기실황 조회 ────────────────────────────────────────────

interface UltraSrtData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipType: PrecipType;
}

export async function fetchUltraSrtNcst(
  nx: number = DEFAULT_GRID.nx,
  ny: number = DEFAULT_GRID.ny,
  targetDate?: Date,
): Promise<UltraSrtData> {
  const date = targetDate ?? new Date();
  const { baseDate, baseTime } = getUltraSrtNcstBaseTime(date);

  const data = await fetchKma(WEATHER_API.ultraSrtNcst, {
    numOfRows: '10',
    pageNo: '1',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const items = data.response.body?.items?.item ?? [];
  const result: UltraSrtData = {
    temperature: 0,
    humidity: 0,
    windSpeed: 0,
    precipType: 'none',
  };

  for (const item of items) {
    const val = item.obsrValue ?? '0';
    switch (item.category) {
      case 'T1H': result.temperature = parseFloat(val); break;  // 기온
      case 'REH': result.humidity = parseInt(val, 10); break;    // 습도
      case 'WSD': result.windSpeed = parseFloat(val); break;     // 풍속
      case 'PTY': result.precipType = parsePrecipType(val); break; // 강수형태
    }
  }

  return result;
}

// ─── 단기예보 조회 ──────────────────────────────────────────────

interface VilageFcstData {
  tempMax: number;
  tempMin: number;
  sky: SkyStatus;
  precipType: PrecipType;
  precipProb: number;
  /** 시간대별 예보 (fcstTime → { category → value }) */
  hourly: Map<string, Map<string, string>>;
}

export async function fetchVilageFcst(
  nx: number = DEFAULT_GRID.nx,
  ny: number = DEFAULT_GRID.ny,
  targetDate?: Date,
): Promise<VilageFcstData> {
  const date = targetDate ?? new Date();
  const { baseDate, baseTime } = getVilageFcstBaseTime(date);

  const data = await fetchKma(WEATHER_API.vilageFcst, {
    numOfRows: '1000',
    pageNo: '1',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const items = data.response.body?.items?.item ?? [];
  const todayStr = toYYYYMMDD(date);

  let tempMax = -999;
  let tempMin = 999;
  let maxPrecipProb = 0;
  let latestSky: SkyStatus = 'partly_cloudy';
  let latestPrecipType: PrecipType = 'none';
  const hourly = new Map<string, Map<string, string>>();

  for (const item of items) {
    const val = item.fcstValue ?? '0';
    const fcstDate = item.fcstDate ?? '';
    const fcstTime = item.fcstTime ?? '';
    const key = `${fcstDate}_${fcstTime}`;

    if (!hourly.has(key)) {
      hourly.set(key, new Map());
    }
    hourly.get(key)!.set(item.category, val);

    // 오늘 데이터만 집계
    if (fcstDate === todayStr) {
      switch (item.category) {
        case 'TMX':  // 최고기온
          tempMax = Math.max(tempMax, parseFloat(val));
          break;
        case 'TMN':  // 최저기온
          tempMin = Math.min(tempMin, parseFloat(val));
          break;
        case 'POP':  // 강수확률
          maxPrecipProb = Math.max(maxPrecipProb, parseInt(val, 10));
          break;
        case 'SKY':  // 하늘상태
          latestSky = parseSkyStatus(val);
          break;
        case 'PTY':  // 강수형태
          if (val !== '0') latestPrecipType = parsePrecipType(val);
          break;
      }
    }
  }

  // TMX/TMN이 없는 경우 (발표시간에 따라) TMP에서 추출
  if (tempMax === -999 || tempMin === 999) {
    for (const item of items) {
      if (item.fcstDate === todayStr && item.category === 'TMP') {
        const t = parseFloat(item.fcstValue ?? '0');
        if (tempMax === -999 || t > tempMax) tempMax = t;
        if (tempMin === 999 || t < tempMin) tempMin = t;
      }
    }
  }

  return { tempMax, tempMin, sky: latestSky, precipType: latestPrecipType, precipProb: maxPrecipProb, hourly };
}

// ─── 현재 날씨 통합 조회 ────────────────────────────────────────

export async function fetchCurrentWeather(
  nx: number = DEFAULT_GRID.nx,
  ny: number = DEFAULT_GRID.ny,
): Promise<CurrentWeather> {
  const [ncst, fcst] = await Promise.all([
    fetchUltraSrtNcst(nx, ny),
    fetchVilageFcst(nx, ny),
  ]);

  const feelsLike = calculateFeelsLike(ncst.temperature, ncst.windSpeed, ncst.humidity);

  return {
    temperature: ncst.temperature,
    feelsLike,
    tempMax: fcst.tempMax,
    tempMin: fcst.tempMin,
    sky: fcst.sky,
    precipType: ncst.precipType !== 'none' ? ncst.precipType : fcst.precipType,
    precipProb: fcst.precipProb,
    humidity: ncst.humidity,
    windSpeed: ncst.windSpeed,
    updatedAt: new Date().toISOString(),
  };
}

// ─── 어제 날씨 조회 (초단기실황 이용) ──────────────────────────

export async function fetchYesterdayTemp(
  nx: number = DEFAULT_GRID.nx,
  ny: number = DEFAULT_GRID.ny,
): Promise<number> {
  const yesterday = addDays(new Date(), -1);
  // 어제 같은 시각의 데이터
  const data = await fetchUltraSrtNcst(nx, ny, yesterday);
  return data.temperature;
}

// ─── 어제 대비 비교 ────────────────────────────────────────────

export function getYesterdayComparison(todayTemp: number, yesterdayTemp: number): YesterdayComparison {
  const diff = Math.round(todayTemp - yesterdayTemp);
  let message: string;

  if (diff === 0) {
    message = '어제와 비슷해요';
  } else if (diff > 0) {
    message = `어제보다 ${diff}° 높아요`;
  } else {
    message = `어제보다 ${Math.abs(diff)}° 낮아요`;
  }

  return { tempDiff: diff, message };
}

// ─── 중기예보 조회 (D+3 ~ D+7) ─────────────────────────────────

interface MidForecastDay {
  dayOffset: number;  // D+3, D+4 ...
  tempMin: number;
  tempMax: number;
  sky: SkyStatus;
  precipProb: number;
}

export async function fetchMidForecast(): Promise<MidForecastDay[]> {
  // 중기예보 발표시각: 06시, 18시
  const now = new Date();
  const hour = now.getHours();
  const tmFc = hour < 6
    ? (() => { const d = addDays(now, -1); return toYYYYMMDD(d) + '1800'; })()
    : hour < 18
      ? toYYYYMMDD(now) + '0600'
      : toYYYYMMDD(now) + '1800';

  // 중기기온예보 (serviceKey 인코딩 없이 전달)
  const taUrl = `${WEATHER_API.midTa}?serviceKey=${API_KEYS.weather}&dataType=JSON&regId=${MID_FORECAST_REGION.taRegId}&tmFc=${tmFc}&numOfRows=1&pageNo=1`;
  const taRes = await fetch(taUrl);
  const taData: MidTaResponse = await taRes.json();
  const taItem = taData.response.body?.items?.item?.[0];

  // 중기육상예보 (serviceKey 인코딩 없이 전달)
  const landUrl = `${WEATHER_API.midLandFcst}?serviceKey=${API_KEYS.weather}&dataType=JSON&regId=${MID_FORECAST_REGION.landRegId}&tmFc=${tmFc}&numOfRows=1&pageNo=1`;
  const landRes = await fetch(landUrl);
  const landData = await landRes.json();
  const landItem: MidLandItem | undefined = landData.response.body?.items?.item?.[0];

  const result: MidForecastDay[] = [];

  if (taItem && landItem) {
    for (let d = 3; d <= 7; d++) {
      const key = d as 3 | 4 | 5 | 6 | 7;
      const tempMin = taItem[`taMin${key}` as keyof MidTaItem] as number;
      const tempMax = taItem[`taMax${key}` as keyof MidTaItem] as number;
      const wf = landItem[`wf${key}Pm` as keyof MidLandItem] as string;
      const rnSt = Math.max(
        landItem[`rnSt${key}Am` as keyof MidLandItem] as number,
        landItem[`rnSt${key}Pm` as keyof MidLandItem] as number,
      );

      result.push({
        dayOffset: d,
        tempMin,
        tempMax,
        sky: midWeatherToSky(wf),
        precipProb: rnSt,
      });
    }
  }

  return result;
}

/** 중기예보 날씨 문자열 → SkyStatus 변환 */
function midWeatherToSky(wf: string): SkyStatus {
  if (wf.includes('맑음')) return 'clear';
  if (wf.includes('구름많') || wf.includes('구름 많')) return 'partly_cloudy';
  if (wf.includes('흐림') || wf.includes('흐리')) return 'overcast';
  return 'partly_cloudy';
}

// ─── 7일 날씨 통합 (어제 D-1 ~ D+5) ───────────────────────────

export async function fetchWeeklyWeather(
  nx: number = DEFAULT_GRID.nx,
  ny: number = DEFAULT_GRID.ny,
): Promise<DailyWeather[]> {
  const today = new Date();
  const result: DailyWeather[] = [];

  // 1) 어제 날씨 (실패해도 무시 - 초단기실황은 최근 1일만 제공)
  try {
    const yesterdayTemp = await fetchYesterdayTemp(nx, ny);
    const yesterday = addDays(today, -1);
    result.push({
      date: toYYYYMMDD(yesterday),
      dayOfWeek: getDayName(yesterday),
      tempMax: yesterdayTemp + 3,
      tempMin: yesterdayTemp - 3,
      sky: 'partly_cloudy',
      precipType: 'none',
      precipProb: 0,
      isToday: false,
      isYesterday: true,
    });
  } catch (error) {
    console.log('어제 날씨 조회 스킵 (정상):', error);
  }

  // 2) 오늘~D+2: 단기예보
  try {
    const fcst = await fetchVilageFcst(nx, ny);
    for (let d = 0; d <= 2; d++) {
      const targetDate = addDays(today, d);
      const dateStr = toYYYYMMDD(targetDate);

      let dayMax = -999, dayMin = 999, daySky: SkyStatus = 'partly_cloudy';
      let dayPrecipType: PrecipType = 'none', dayPrecipProb = 0;

      for (const [key, values] of fcst.hourly) {
        if (key.startsWith(dateStr)) {
          const tmp = values.get('TMP');
          if (tmp) {
            const t = parseFloat(tmp);
            dayMax = Math.max(dayMax, t);
            dayMin = Math.min(dayMin, t);
          }
          const tmx = values.get('TMX');
          if (tmx) dayMax = Math.max(dayMax, parseFloat(tmx));
          const tmn = values.get('TMN');
          if (tmn) dayMin = Math.min(dayMin, parseFloat(tmn));
          const pop = values.get('POP');
          if (pop) dayPrecipProb = Math.max(dayPrecipProb, parseInt(pop, 10));
          const sky = values.get('SKY');
          if (sky) daySky = parseSkyStatus(sky);
          const pty = values.get('PTY');
          if (pty && pty !== '0') dayPrecipType = parsePrecipType(pty);
        }
      }

      if (d === 0 && dayMax === -999) dayMax = fcst.tempMax;
      if (d === 0 && dayMin === 999) dayMin = fcst.tempMin;

      result.push({
        date: dateStr,
        dayOfWeek: getDayName(targetDate),
        tempMax: dayMax !== -999 ? dayMax : 0,
        tempMin: dayMin !== 999 ? dayMin : 0,
        sky: daySky,
        precipType: dayPrecipType,
        precipProb: dayPrecipProb,
        isToday: d === 0,
        isYesterday: false,
      });
    }
  } catch (error) {
    console.error('단기예보 조회 실패:', error);
  }

  // 3) D+3 ~ D+5: 중기예보
  try {
    const midForecast = await fetchMidForecast();
    for (const mid of midForecast) {
      if (mid.dayOffset <= 5) {
        const targetDate = addDays(today, mid.dayOffset);
        result.push({
          date: toYYYYMMDD(targetDate),
          dayOfWeek: getDayName(targetDate),
          tempMax: mid.tempMax,
          tempMin: mid.tempMin,
          sky: mid.sky,
          precipType: mid.precipProb >= 50 ? 'rain' : 'none',
          precipProb: mid.precipProb,
          isToday: false,
          isYesterday: false,
        });
      }
    }
  } catch (error) {
    console.error('중기예보 조회 실패:', error);
  }

  return result;
}
