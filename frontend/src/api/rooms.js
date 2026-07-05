const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * ルーム機能のAPIクライアント。
 * どの関数も { ok, status, data } を返し、判定は呼び出し側で行う。
 */

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}/api/rooms${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

/**
 * 部屋を作成する（幹事）。
 * @param {{ location: { lat: number, lng: number }, range: number }} payload
 */
export function createRoom(payload) {
  return request("", { method: "POST", body: JSON.stringify(payload) });
}

/** 部屋の状態を取得する（人数・参加者名など。希望テキストは含まれない）。 */
export function getRoom(roomId) {
  return request(`/${encodeURIComponent(roomId)}`, { method: "GET" });
}

/**
 * 自分の希望を投稿する（参加者）。
 * @param {string} roomId
 * @param {{ name?: string, text: string }} payload
 */
export function joinRoom(roomId, payload) {
  return request(`/${encodeURIComponent(roomId)}/members`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** 検索を実行する（幹事のみ。hostTokenが必要）。 */
export function runRecommend(roomId, hostToken) {
  return request(`/${encodeURIComponent(roomId)}/recommend`, {
    method: "POST",
    headers: { "x-host-token": hostToken },
  });
}

/** 結果を取得する（参加者のポーリング用。未実行なら status=202）。 */
export function getResult(roomId) {
  return request(`/${encodeURIComponent(roomId)}/result`, { method: "GET" });
}
