import AiComment from "./AiComment.jsx";
import ConditionsCard from "./ConditionsCard.jsx";
import ShopList from "./ShopList.jsx";

/** 検索範囲コード → 表示ラベル。 */
const RANGE_LABELS = {
  1: "300m",
  2: "500m",
  3: "1km",
  4: "2km",
  5: "3km",
};

/**
 * ルームの推薦結果（条件・AI総評・店舗一覧）をまとめて表示する。
 * ホーム（1台モード）の結果表示と同じ構成を共有する。
 * areaLabel / range は結果オブジェクトに含まれる（エリアモードでは range=null）。
 *
 * @param {{ result: { conditions: object, shops: object[], summary?: string, areaLabel?: string, range?: number | null } }} props
 */
export default function RoomResultView({ result }) {
  if (!result) {
    return null;
  }
  return (
    <>
      <ConditionsCard conditions={result.conditions} />
      <AiComment comment={result.summary} />
      <ShopList
        shops={Array.isArray(result.shops) ? result.shops : []}
        areaLabel={result.areaLabel}
        rangeLabel={result.range ? RANGE_LABELS[result.range] : undefined}
      />
      <p className="pt-1 text-center text-xs text-base-content/50 lg:text-left">
        ※表示されている距離は直線距離です。実際の徒歩時間とは異なる場合があります。
      </p>
    </>
  );
}
