import type { RecommendRequest } from "../schemas/recommend.js";

/**
 * AIが自由文から整理した検索条件。
 */
export interface GroupPreference {
  budgetLevel: "low" | "medium" | "high" | "any";
  excludedGenres: string[];
  preferredGenres: string[];
  preferredAtmosphere: string[];
  maxWalkingMinutes: number | null;
}

/**
 * 複数人の自由文を飲食店検索用の条件へ構造化する。
 *
 * 現時点では Gemini API を接続せず、キーワードによる簡易ルールで
 * GroupPreference を組み立てるモック実装。将来ここを実LLM呼び出しに
 * 差し替える想定のため、非同期シグネチャと戻り値の型は温存する。
 */
export async function parseGroupPreferences(
  request: RecommendRequest,
): Promise<GroupPreference> {
  // 全員分の自由文を連結して、キーワード判定の対象にする。
  const text = request.members.map((m) => m.text).join("\n");

  return {
    budgetLevel: detectBudgetLevel(text),
    excludedGenres: detectExcludedGenres(text),
    preferredGenres: detectPreferredGenres(text),
    preferredAtmosphere: detectAtmosphere(text),
    maxWalkingMinutes: detectMaxWalkingMinutes(text),
  };
}

/** 予算感を推定する。 */
function detectBudgetLevel(text: string): GroupPreference["budgetLevel"] {
  if (/金欠|安め|安く|安い|節約|リーズナブル/.test(text)) {
    return "low";
  }
  if (/高級|贅沢|奮発|ちょっといい/.test(text)) {
    return "high";
  }
  if (/普通|そこそこ/.test(text)) {
    return "medium";
  }
  return "any";
}

/** 避けたいジャンルを推定する。 */
function detectExcludedGenres(text: string): string[] {
  const excluded: string[] = [];
  if (/麺類以外|麺以外|ラーメン(?:は|以外)|昨日ラーメン/.test(text)) {
    excluded.push("ラーメン");
  }
  if (/揚げ物(?:は)?(?:嫌|避け|以外)|脂っこ/.test(text)) {
    excluded.push("揚げ物");
  }
  return excluded;
}

/** 希望ジャンルを推定する。 */
function detectPreferredGenres(text: string): string[] {
  const preferred: string[] = [];
  if (/居酒屋|飲み|お酒/.test(text)) {
    preferred.push("居酒屋");
  }
  if (/和食|寿司|そば|うどん/.test(text)) {
    preferred.push("和食");
  }
  if (/イタリアン|パスタ|ピザ/.test(text)) {
    preferred.push("イタリアン");
  }
  if (/カフェ|甘い物|スイーツ/.test(text)) {
    preferred.push("カフェ");
  }
  return preferred;
}

/** 希望する雰囲気を推定する。 */
function detectAtmosphere(text: string): string[] {
  const atmosphere: string[] = [];
  if (/静か|落ち着い|ゆっくり/.test(text)) {
    atmosphere.push("静か");
  }
  if (/賑やか|わいわい|盛り上が/.test(text)) {
    atmosphere.push("賑やか");
  }
  if (/個室/.test(text)) {
    atmosphere.push("個室");
  }
  return atmosphere;
}

/** 許容する徒歩時間（分）を推定する。指定がなければ null。 */
function detectMaxWalkingMinutes(text: string): number | null {
  // 「徒歩5分」のように明示された数値を優先する。
  const explicit = text.match(/徒歩(\d+)分/);
  if (explicit) {
    return Number(explicit[1]);
  }
  if (/歩きたくない|近く|駅近|あまり歩/.test(text)) {
    return 5;
  }
  return null;
}
