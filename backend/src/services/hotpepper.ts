import type { RecommendRequest } from "../schemas/recommend.js";
import type { GroupPreference } from "./gemini.js";

/**
 * 店舗推薦1件。
 */
export interface ShopRecommendation {
  id: string;
  name: string;
  genre: string;
  budget: string;
  access: string;
  reason: string;
  /** 現在地からのおおよその距離（メートル）。 */
  distanceMeters: number;
}

/** スコアリング用の内部属性を持つモック店舗。 */
interface MockShop extends ShopRecommendation {
  budgetLevel: string;
  atmosphere: string[];
}

/**
 * ホットペッパーグルメAPIから店舗候補を取得する。
 *
 * 現時点では実APIを接続せず、固定の候補からAI整理条件で軽く出し分ける
 * モック実装。将来ここを fetch による実API呼び出しへ差し替える想定のため、
 * 非同期シグネチャと戻り値の型は温存する。
 */
export async function searchShops(
  request: RecommendRequest,
  preferences: GroupPreference,
): Promise<ShopRecommendation[]> {
  // 検索範囲コード（1..5）を距離上限（メートル）に変換する。
  const maxDistance = RANGE_TO_METERS[request.range] ?? 1000;

  const candidates = MOCK_SHOPS.filter((shop) => {
    // 範囲外の店は除外する。
    if (shop.distanceMeters > maxDistance) {
      return false;
    }
    // AIが避けたいと判断したジャンルは除外する。
    if (preferences.excludedGenres.includes(shop.genre)) {
      return false;
    }
    return true;
  });

  // AIおすすめ順スコアを付けて降順に並べる（配列先頭ほどおすすめ）。
  // スコアリング用の内部属性（budgetLevel / atmosphere）は公開レスポンスから除く。
  return candidates
    .map((shop) => ({ shop, score: scoreShop(shop, preferences) }))
    .sort((a, b) => b.score - a.score)
    .map(({ shop }) => ({
      id: shop.id,
      name: shop.name,
      genre: shop.genre,
      budget: shop.budget,
      access: shop.access,
      reason: shop.reason,
      distanceMeters: shop.distanceMeters,
    }));
}

/** 検索範囲コード → 距離上限（メートル）。 */
const RANGE_TO_METERS: Record<number, number> = {
  1: 300,
  2: 500,
  3: 1000,
  4: 2000,
  5: 3000,
};

/** AI整理条件に対する店舗の適合スコアを算出する。 */
function scoreShop(shop: MockShop, preferences: GroupPreference): number {
  let score = 0;

  if (preferences.preferredGenres.includes(shop.genre)) {
    score += 3;
  }
  if (
    preferences.budgetLevel !== "any" &&
    shop.budgetLevel === preferences.budgetLevel
  ) {
    score += 2;
  }
  // 希望する雰囲気タグが一致するほど加点する。
  for (const atmosphere of preferences.preferredAtmosphere) {
    if (shop.atmosphere.includes(atmosphere)) {
      score += 1;
    }
  }
  // 徒歩上限がある場合、近い店を優遇する。
  if (preferences.maxWalkingMinutes != null && shop.distanceMeters <= 400) {
    score += 1;
  }

  return score;
}

/**
 * モックの店舗マスタ。budgetLevel / atmosphere はスコアリング用の内部属性で、
 * レスポンスにはそのまま含めず reason などの表示項目へ反映する。
 */
const MOCK_SHOPS: MockShop[] = [
  {
    id: "shop-001",
    name: "居酒屋 のんびり亭",
    genre: "居酒屋",
    budget: "2,000〜3,000円",
    access: "東京駅八重洲口から徒歩3分",
    reason: "個室で静かに話せて、リーズナブルな一品料理が豊富です。",
    distanceMeters: 240,
    budgetLevel: "low",
    atmosphere: ["静か", "個室"],
  },
  {
    id: "shop-002",
    name: "和ダイニング 花みずき",
    genre: "和食",
    budget: "3,000〜4,000円",
    access: "東京駅丸の内南口から徒歩5分",
    reason: "落ち着いた和の空間で、麺類以外の和定食が充実しています。",
    distanceMeters: 420,
    budgetLevel: "medium",
    atmosphere: ["静か"],
  },
  {
    id: "shop-003",
    name: "トラットリア ソーレ",
    genre: "イタリアン",
    budget: "3,500〜5,000円",
    access: "東京駅八重洲中央口から徒歩6分",
    reason: "手打ちパスタと窯焼きピザが自慢。賑やかで盛り上がれます。",
    distanceMeters: 650,
    budgetLevel: "medium",
    atmosphere: ["賑やか"],
  },
  {
    id: "shop-004",
    name: "らーめん 一途",
    genre: "ラーメン",
    budget: "800〜1,200円",
    access: "東京駅日本橋口から徒歩2分",
    reason: "濃厚スープが人気の行列店。安く手早く食べられます。",
    distanceMeters: 180,
    budgetLevel: "low",
    atmosphere: ["賑やか"],
  },
  {
    id: "shop-005",
    name: "喫茶 ことり",
    genre: "カフェ",
    budget: "1,000〜1,500円",
    access: "東京駅丸の内北口から徒歩4分",
    reason: "静かで長居しやすい老舗喫茶。軽食とスイーツが楽しめます。",
    distanceMeters: 360,
    budgetLevel: "low",
    atmosphere: ["静か"],
  },
  {
    id: "shop-006",
    name: "個室和食 まつり",
    genre: "和食",
    budget: "4,000〜6,000円",
    access: "東京駅八重洲南口から徒歩8分",
    reason: "全席個室でゆったり。少し贅沢したい日の会食に向きます。",
    distanceMeters: 900,
    budgetLevel: "high",
    atmosphere: ["静か", "個室"],
  },
  {
    id: "shop-007",
    name: "大衆酒場 かんぱい",
    genre: "居酒屋",
    budget: "1,500〜2,500円",
    access: "東京駅八重洲口から徒歩10分",
    reason: "わいわい賑やかに飲める大衆酒場。コスパ重視の方に。",
    distanceMeters: 1400,
    budgetLevel: "low",
    atmosphere: ["賑やか"],
  },
];
