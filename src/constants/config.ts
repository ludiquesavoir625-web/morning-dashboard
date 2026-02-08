/**
 * 앱 설정
 * API 키는 .env 파일에서 관리합니다.
 * .env 파일이 없거나 키가 설정되지 않으면 빈 문자열이 됩니다.
 */

// 환경변수에서 API 키 로드 (Expo의 환경변수 시스템 사용)
export const API_KEYS = {
  weather: process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '',
  airQuality: process.env.EXPO_PUBLIC_AIR_QUALITY_API_KEY ?? '',
};

/** 기상청 API 엔드포인트 */
export const WEATHER_API = {
  /** 단기예보 조회 */
  vilageFcst: 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst',
  /** 초단기실황 조회 */
  ultraSrtNcst: 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst',
  /** 초단기예보 조회 */
  ultraSrtFcst: 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst',
  /** 중기기온예보 */
  midTa: 'https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa',
  /** 중기육상예보 */
  midLandFcst: 'https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst',
};

/** 에어코리아 API 엔드포인트 */
export const AIR_API = {
  /** 측정소별 실시간 대기오염 */
  realtime: 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty',
  /** 가까운 측정소 찾기 */
  nearStation: 'https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getNearbyMsrstnList',
  /** TM좌표 변환 */
  tmCoord: 'https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getTMStdrCrdnt',
};

/** 데이터 갱신 주기 (밀리초) */
export const REFRESH_INTERVAL = 30 * 60 * 1000; // 30분

/** 중기예보 지역 코드 (서울) */
export const MID_FORECAST_REGION = {
  /** 중기기온예보 지역 ID: 서울 */
  taRegId: '11B10101',
  /** 중기육상예보 지역 ID: 서울·인천·경기도 */
  landRegId: '11B00000',
};
