/**
 * AIが自由文から整理した検索条件（GroupPreference）を表示するカード。
 *
 * @param {{ conditions: {
 *   budgetLevel: "low" | "medium" | "high" | "any",
 *   excludedGenres: string[],
 *   preferredGenres: string[],
 *   preferredAtmosphere: string[],
 *   maxWalkingMinutes: number | null,
 * } }} props
 */
export default function ConditionsCard({ conditions }) {
  const {
    budgetLevel,
    excludedGenres,
    preferredGenres,
    preferredAtmosphere,
    maxWalkingMinutes,
  } = conditions;

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body space-y-3">
        <div className="flex items-center gap-2">
          <span className="badge badge-primary">AIが整理した条件</span>
          <h2 className="card-title text-base">みんなの希望まとめ</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ConditionRow label="予算感">
            <span className="badge badge-outline">
              {BUDGET_LABEL[budgetLevel]}
            </span>
          </ConditionRow>

          <ConditionRow label="徒歩時間">
            <span className="badge badge-outline">
              {maxWalkingMinutes == null
                ? "指定なし"
                : `${maxWalkingMinutes}分以内`}
            </span>
          </ConditionRow>

          <ConditionRow label="希望ジャンル">
            <TagList items={preferredGenres} emptyText="こだわりなし" />
          </ConditionRow>

          <ConditionRow label="避けたいジャンル">
            <TagList
              items={excludedGenres}
              emptyText="なし"
              tone="badge-error badge-outline"
            />
          </ConditionRow>

          <ConditionRow label="雰囲気">
            <TagList items={preferredAtmosphere} emptyText="こだわりなし" />
          </ConditionRow>
        </div>
      </div>
    </div>
  );
}

/** 予算レベルの表示ラベル。 */
const BUDGET_LABEL = {
  low: "安め",
  medium: "普通",
  high: "少し贅沢",
  any: "こだわりなし",
};

/**
 * 条件1項目（ラベル + 値）の行。
 * @param {{ label: string, children: import("react").ReactNode }} props
 */
function ConditionRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold opacity-60">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

/**
 * 文字列配列をバッジで並べる。空の場合はemptyTextを表示。
 * @param {{ items: string[], emptyText: string, tone?: string }} props
 */
function TagList({ items, emptyText, tone = "badge-ghost" }) {
  if (items.length === 0) {
    return <span className="text-sm opacity-60">{emptyText}</span>;
  }
  return items.map((item) => (
    <span key={item} className={`badge ${tone}`}>
      {item}
    </span>
  ));
}
