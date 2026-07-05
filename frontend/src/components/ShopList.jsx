import { useMemo, useState } from "react";

/**
 * @typedef {Object} Shop
 * @property {string} id
 * @property {string} name
 * @property {string} genre
 * @property {string} budget
 * @property {string} access
 * @property {string} reason
 * @property {number} distanceMeters
 */

/**
 * 店舗一覧。AIおすすめ順（APIの配列順）と距離順を切り替えられる。
 *
 * @param {{ shops: Shop[] }} props
 */
export default function ShopList({ shops }) {
  const [sortBy, setSortBy] = useState("recommended");

  const sortedShops = useMemo(() => {
    if (sortBy === "distance") {
      // 元配列を壊さないよう複製してから距離昇順に並べる。
      return [...shops].sort((a, b) => a.distanceMeters - b.distanceMeters);
    }
    // recommended: APIが返した配列順（おすすめ順）をそのまま使う。
    return shops;
  }, [shops, sortBy]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">お店の候補（{shops.length}件）</h2>
        <div role="tablist" className="tabs tabs-boxed tabs-sm">
          <button
            type="button"
            role="tab"
            className={`tab ${sortBy === "recommended" ? "tab-active" : ""}`}
            onClick={() => setSortBy("recommended")}
          >
            AIおすすめ順
          </button>
          <button
            type="button"
            role="tab"
            className={`tab ${sortBy === "distance" ? "tab-active" : ""}`}
            onClick={() => setSortBy("distance")}
          >
            距離順
          </button>
        </div>
      </div>

      {sortedShops.length === 0 ? (
        <div className="alert">
          <span>
            条件に合うお店が見つかりませんでした。範囲を広げてみてください。
          </span>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedShops.map((shop) => (
            <li key={shop.id}>
              <ShopCard shop={shop} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * 店舗1件のカード。
 * @param {{ shop: Shop }} props
 */
function ShopCard({ shop }) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-base">{shop.name}</h3>
          <span className="badge badge-neutral whitespace-nowrap">
            {formatDistance(shop.distanceMeters)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="badge badge-outline">{shop.genre}</span>
          <span className="badge badge-outline">{shop.budget}</span>
        </div>

        <p className="text-sm opacity-80">{shop.access}</p>

        <div className="rounded-box bg-base-200 p-2 text-sm">
          <span className="mr-1 font-semibold">おすすめ理由：</span>
          {shop.reason}
        </div>
      </div>
    </div>
  );
}

/**
 * 距離をm/km表記に整形する。
 * @param {number} meters
 * @returns {string}
 */
function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}
