import { useEffect, useMemo, useRef, useState } from "react";
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
 * @property {string} [url]             HotPepperの店舗詳細URL
 * @property {string} [imageUrl]        HotPepperの店舗写真URL
 */

/** サムネイルアイコンの種類マップ。未指定・不明な種類はフォークで代替する。 */
const SHOP_ICONS = {
  bowl: BowlIcon,
  coffee: CoffeeIcon,
  utensils: UtensilsIcon,
};

const SHOPS_PER_PAGE = 10;
const PAGE_SCROLL_OFFSET_PX = 96;

/**
 * 店舗一覧。AIおすすめ順（APIの配列順）と距離順を切り替えられる。
 *
 * @param {{ shops: Shop[], areaLabel?: string, rangeLabel?: string, pageScrollTargetRef?: import("react").RefObject<HTMLElement | null> }} props
 */
export default function ShopList({
  shops,
  areaLabel = "現在地周辺",
  rangeLabel,
  pageScrollTargetRef,
}) {
  const [sortBy, setSortBy] = useState("recommended");
  const [page, setPage] = useState(1);
  const listTopRef = useRef(null);
  const previousPageRef = useRef(null);

  const sortedShops = useMemo(() => {
    if (sortBy === "distance") {
      // 元配列を壊さないよう複製してから距離昇順に並べる。
      return [...shops].sort((a, b) => a.distanceMeters - b.distanceMeters);
    }
    // recommended: APIが返した配列順（おすすめ順）をそのまま使う。
    return shops;
  }, [shops, sortBy]);
  const pageCount = Math.max(1, Math.ceil(sortedShops.length / SHOPS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visibleShops = sortedShops.slice(
    (currentPage - 1) * SHOPS_PER_PAGE,
    currentPage * SHOPS_PER_PAGE,
  );

  function handleSortChange(value) {
    setSortBy(value);
    setPage(1);
  }

  useEffect(() => {
    if (previousPageRef.current === null) {
      previousPageRef.current = currentPage;
      return;
    }
    if (previousPageRef.current !== currentPage) {
      const target = pageScrollTargetRef?.current ?? listTopRef.current;
      if (target) {
        window.scrollTo({
          top: Math.max(
            0,
            target.getBoundingClientRect().top +
              window.scrollY -
              PAGE_SCROLL_OFFSET_PX,
          ),
          left: 0,
          behavior: "auto",
        });
      }
      previousPageRef.current = currentPage;
    }
  }, [currentPage, pageScrollTargetRef]);

  return (
    <div ref={listTopRef} className="space-y-3">
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
          onChange={(e) => handleSortChange(e.target.value)}
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
        <>
          <ul className="space-y-3">
            {visibleShops.map((shop) => (
              <li key={shop.id}>
                <ShopCard shop={shop} />
              </li>
            ))}
          </ul>

          {pageCount > 1 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-base-100 px-3 py-2 shadow-sm">
              <button
                type="button"
                className="btn btn-sm rounded-xl"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                前へ
              </button>
              <span className="text-sm font-semibold text-base-content/70">
                {currentPage} / {pageCount}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-xl"
                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                disabled={currentPage === pageCount}
              >
                次へ
              </button>
            </div>
          )}
        </>
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
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 to-accent/20 text-primary/70">
          {shop.imageUrl ? (
            <img
              src={shop.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <ThumbIcon className="h-9 w-9" />
          )}
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
        {shop.url ? (
          <a
            href={shop.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5"
          >
            店舗詳細を見る
          </a>
        ) : (
          <button
            type="button"
            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5"
          >
            店舗詳細を見る
          </button>
        )}
      </div>
    </article>
  );
}
