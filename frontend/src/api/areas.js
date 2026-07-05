const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * エリア一覧（大エリア・中エリア）を取得する。
 * @returns {Promise<{ ok: boolean, data: { largeAreas: {code,name}[], middleAreas: {code,name,largeAreaCode}[] } | null }>}
 */
export async function getAreas() {
  const res = await fetch(`${API_BASE_URL}/api/areas`);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, data };
}
