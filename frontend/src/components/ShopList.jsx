import { useMemo, useState } from "react";
import {
  BowlIcon,
  CoffeeIcon,
  LocationPinIcon,
  SparklesIcon,
  UtensilsIcon,
  WalkIcon,
  YenIcon,
} from "./icons.jsx";

/**
 * @typedef {Object} Shop
 * @property {string} id
 * @property {string} name
 * @property {string} genre
 * @property {string} budget
 * @property {string} access            例：「徒歩3分（250m）」
 * @property {string} reason
 * @property {number} distanceMeters
 * @property {number} [matchScore]      AIが算出した相性スコア（%）
 * @property {"bowl" | "coffee" | "utensils"} [iconType]  サムネイルの種類
 */

/** サムネイルアイコンの種類マップ。未指定・不明な種類はフォークで代替する。 */
const SHOP_ICONS = {
  bowl: BowlIcon,
  coffee: CoffeeIcon,
  utensils: UtensilsIcon,
};

/**
 * 店舗一覧。AIおすすめ順（APIの配列順）と距離順を切り替えられる。
 *
 * @param {{ shops: Shop[], areaLabel?: string, rangeLabel?: string }} props
 */
export default function ShopList({
  shops,
  areaLabel = "現在地周辺",
  rangeLabel,
}) {
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
      <div className="flex items-center gap-1.5 text-sm text-base-content/70">
        <LocationPinIcon className="h-4 w-4 shrink-0 text-primary" />
        <span>
          {areaLabel}
          {rangeLabel ? ` / ${rangeLabel}以内` : ""} / {shops.length}
          件見つかりました
        </span>
      </div>

      <div className="flex justify-end">
        <select
          className="select select-sm w-fit rounded-full border-base-300 bg-base-100 font-medium"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="並び替え"
        >
          <option value="recommended">AIおすすめ順</option>
          <option value="distance">距離が近い順</option>
        </select>
      </div>

      {sortedShops.length === 0 ? (
        <div className="rounded-2xl bg-base-100 p-4 text-sm text-base-content/70 shadow-sm">
          条件に合うお店が見つかりませんでした。範囲を広げてみてください。
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
  const ThumbIcon = SHOP_ICONS[shop.iconType] ?? UtensilsIcon;

  return (
    <article className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      <div className="flex gap-3 p-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/20 text-primary/70">
          <ThumbIcon className="h-9 w-9" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold leading-tight">{shop.name}</h3>
            {typeof shop.matchScore === "number" && (
              <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success">
                相性 {shop.matchScore}%
              </span>
            )}
          </div>

          <p className="mt-0.5 text-xs text-base-content/60">{shop.genre}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/80">
            <span className="inline-flex items-center gap-1">
              <YenIcon className="h-3.5 w-3.5 text-success" />
              {shop.budget}
            </span>
            <span className="inline-flex items-center gap-1">
              <WalkIcon className="h-3.5 w-3.5 text-base-content/50" />
              {shop.access}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-3 flex gap-1.5 rounded-xl bg-base-200 px-3 py-2 text-xs leading-relaxed text-base-content/80">
        <SparklesIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        <span>{shop.reason}</span>
      </div>

      <div className="flex justify-end p-3 pt-2.5">
        <button
          type="button"
          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5"
        >
          店舗詳細を見る
        </button>
      </div>
    </article>
  );
}
