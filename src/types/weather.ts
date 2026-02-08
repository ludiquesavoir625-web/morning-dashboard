/** 하늘 상태 */
export type SkyStatus = 'clear' | 'partly_cloudy' | 'cloudy' | 'overcast';

/** 강수 형태 */
export type PrecipType = 'none' | 'rain' | 'rain_snow' | 'snow' | 'shower';

/** 현재 날씨 (초단기실황 + 단기예보 조합) */
export interface CurrentWeather {
  temperature: number;       // 현재 기온 (℃)
  feelsLike: number;         // 체감온도 (℃)
  tempMax: number;           // 오늘 최고기온
  tempMin: number;           // 오늘 최저기온
  sky: SkyStatus;            // 하늘상태
  precipType: PrecipType;    // 강수형태
  precipProb: number;        // 강수확률 (%)
  humidity: number;          // 습도 (%)
  windSpeed: number;         // 풍속 (m/s)
  updatedAt: string;         // 갱신 시각
}

/** 일별 날씨 (7일 비교용) */
export interface DailyWeather {
  date: string;              // YYYY-MM-DD
  dayOfWeek: string;         // 요일 (월, 화, ...)
  tempMax: number;
  tempMin: number;
  sky: SkyStatus;
  precipType: PrecipType;
  precipProb: number;
  isToday: boolean;
  isYesterday: boolean;
}

/** 미세먼지 등급 */
export type DustGrade = 'good' | 'moderate' | 'bad' | 'very_bad';

/** 미세먼지 데이터 */
export interface AirQuality {
  pm10Value: number;         // PM10 (㎍/㎥)
  pm10Grade: DustGrade;
  pm25Value: number;         // PM2.5 (㎍/㎥)
  pm25Grade: DustGrade;
  stationName: string;       // 측정소
  updatedAt: string;
}

/** 어제와 비교 정보 */
export interface YesterdayComparison {
  tempDiff: number;          // 어제 대비 온도 차이
  message: string;           // "어제보다 3° 낮아요"
}
