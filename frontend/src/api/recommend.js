const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * @typedef {Object} RecommendPayload
 * @property {{ lat: number, lng: number }} location
 * @property {{ text: string }[]} members
 */

/**
 * @typedef {Object} RecommendResult
 * @property {boolean} ok       レスポンスが2xxかどうか
 * @property {number} status    HTTPステータスコード
 * @property {any} data         パース済みのレスポンスボディ（失敗時はnull）
 */

/**
 * 店舗推薦APIへリクエストする。
 * fetchのみを使用し、ステータスに応じた判定は呼び出し側で行う。
 *
 * @param {RecommendPayload} payload
 * @returns {Promise<RecommendResult>}
 */
export async function requestRecommendation(payload) {
  const res = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { ok: res.ok, status: res.status, data };
}
