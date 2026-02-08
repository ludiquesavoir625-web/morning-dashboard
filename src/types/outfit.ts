/** 코디 아이템 */
export interface OutfitItem {
  name: string;              // 아이템 이름
  emoji: string;             // 이모지 아이콘
}

/** 코디 추천 카드 */
export interface OutfitCard {
  id: string;
  title: string;             // "따뜻한 겨울 외출룩"
  items: OutfitItem[];       // 착장 아이템 목록
  reason: string;            // 추천 이유
  tags: string[];            // 태그 (예: ["방한", "필수"])
  extras: OutfitItem[];      // 추가 아이템 (날씨 조건)
}

/** 체크리스트 아이템 */
export interface ChecklistItem {
  id: string;
  name: string;
  emoji: string;
  checked: boolean;
  isAutoRecommended: boolean; // 날씨 기반 자동 추천 여부
}
