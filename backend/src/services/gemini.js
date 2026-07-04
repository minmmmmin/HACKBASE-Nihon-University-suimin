/**
 * 将来、Gemini APIを使って複数人の自由文を
 * 飲食店検索用の条件へ構造化する。
 *
 * @typedef {Object} GroupPreference
 * @property {"low" | "medium" | "high" | "any"} budgetLevel
 * @property {string[]} excludedGenres
 * @property {string[]} preferredGenres
 * @property {string[]} preferredAtmosphere
 * @property {number | null} maxWalkingMinutes
 *
 * @param {import("../schemas/recommend.js").RecommendRequest} request
 * @returns {Promise<never>}
 */
export async function parseGroupPreferences(request) {
  void request;
  throw new Error("Gemini API is not implemented");
}
