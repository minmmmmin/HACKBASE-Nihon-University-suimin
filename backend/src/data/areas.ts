/**
 * エリア選択用の静的マスタ（大エリア → 中エリア）。
 *
 * 構造・フィールド名はホットペッパーグルメAPIのエリアマスタに合わせてある：
 *   - 大エリア（large_area）: code, name
 *   - 中エリア（middle_area）: code, name, 親の large_area コード
 *
 * ⚠️ ここのコードは本接続前の暫定値。実接続時は大エリア/中エリアマスタAPI
 *   （large_area/v1・middle_area/v1）から取得した値へ差し替える想定。
 *   その際もこのファイルの型（LargeArea / MiddleArea）はそのまま使える。
 */

export interface LargeArea {
  code: string;
  name: string;
}

export interface MiddleArea {
  code: string;
  name: string;
  /** 所属する大エリアのコード。 */
  largeAreaCode: string;
}

/** 大エリア（都道府県〜広域レベル）。 */
export const LARGE_AREAS: LargeArea[] = [
  { code: "Z011", name: "東京" },
  { code: "Z012", name: "神奈川" },
  { code: "Z023", name: "大阪" },
  { code: "Z024", name: "京都" },
  { code: "Z045", name: "愛知" },
  { code: "Z091", name: "福岡" },
  { code: "Z041", name: "北海道" },
];

/** 中エリア（駅・地区レベル）。name は代表的なものを収録。 */
export const MIDDLE_AREAS: MiddleArea[] = [
  // 東京
  { code: "Y030", name: "新宿", largeAreaCode: "Z011" },
  { code: "Y031", name: "渋谷", largeAreaCode: "Z011" },
  { code: "Y032", name: "池袋", largeAreaCode: "Z011" },
  { code: "Y033", name: "銀座・有楽町・新橋", largeAreaCode: "Z011" },
  { code: "Y034", name: "東京・日本橋・八重洲", largeAreaCode: "Z011" },
  { code: "Y035", name: "上野・浅草", largeAreaCode: "Z011" },
  { code: "Y036", name: "秋葉原・神田", largeAreaCode: "Z011" },
  { code: "Y037", name: "六本木・麻布・赤坂", largeAreaCode: "Z011" },
  // 神奈川
  { code: "Y055", name: "横浜", largeAreaCode: "Z012" },
  { code: "Y056", name: "川崎", largeAreaCode: "Z012" },
  { code: "Y057", name: "鎌倉・湘南", largeAreaCode: "Z012" },
  // 大阪
  { code: "Y070", name: "梅田・大阪駅", largeAreaCode: "Z023" },
  { code: "Y071", name: "難波・心斎橋", largeAreaCode: "Z023" },
  { code: "Y072", name: "天王寺・阿倍野", largeAreaCode: "Z023" },
  // 京都
  { code: "Y090", name: "河原町・烏丸・四条", largeAreaCode: "Z024" },
  { code: "Y091", name: "京都駅周辺", largeAreaCode: "Z024" },
  // 愛知
  { code: "Y110", name: "名古屋駅・名駅", largeAreaCode: "Z045" },
  { code: "Y111", name: "栄・錦・伏見", largeAreaCode: "Z045" },
  // 福岡
  { code: "Y130", name: "天神", largeAreaCode: "Z091" },
  { code: "Y131", name: "博多駅周辺", largeAreaCode: "Z091" },
  // 北海道
  { code: "Y150", name: "札幌駅・大通", largeAreaCode: "Z041" },
  { code: "Y151", name: "すすきの", largeAreaCode: "Z041" },
];

/** 中エリアコードから中エリアを引く。存在しなければ undefined。 */
export function findMiddleArea(code: string): MiddleArea | undefined {
  return MIDDLE_AREAS.find((area) => area.code === code);
}
