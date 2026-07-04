import { BanIcon, HeartIcon, SparklesIcon, YenIcon } from "./icons.jsx";

/**
 * AIが自由文から整理した検索条件（GroupPreference）を
 * 「みんなの希望まとめ」カードとして表示する。
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
  const chips = buildChips(conditions);

  return (
    <section className="rounded-2xl border-2 border-warning/45 bg-warning/[0.06] p-4">
      <div className="mb-3 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-warning" />
        <h2 className="font-bold">みんなの希望まとめ</h2>
      </div>

      <div className="flex flex-col items-start gap-2">
        {chips.map((chip) => (
          <span
            key={chip.key}
            className="inline-flex items-center gap-1.5 rounded-full bg-base-100 px-3 py-1.5 text-sm shadow-sm"
          >
            <chip.Icon className={`h-4 w-4 shrink-0 ${chip.iconTone}`} />
            <span className="font-medium">{chip.label}</span>
          </span>
        ))}
      </div>
    </section>
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
 * conditions からサマリー用のチップ配列を組み立てる。
 * 予算・避けたいジャンル・重視ポイント（雰囲気＋希望ジャンル）を並べる。
 * ラベル文字は既定色のまま、アイコンだけ意味に応じて色付けする。
 *
 * @param {ConditionsCard の conditions} conditions
 * @returns {{ key: string, Icon: Function, iconTone: string, label: string }[]}
 */
function buildChips(conditions) {
  const {
    budgetLevel,
    excludedGenres = [],
    preferredGenres = [],
    preferredAtmosphere = [],
  } = conditions;

  const chips = [
    {
      key: "budget",
      Icon: YenIcon,
      iconTone: "text-success",
      label: `予算：${BUDGET_LABEL[budgetLevel] ?? "こだわりなし"}`,
    },
  ];

  for (const genre of excludedGenres) {
    chips.push({
      key: `exclude-${genre}`,
      Icon: BanIcon,
      iconTone: "text-error",
      label: `避けたい：${genre}`,
    });
  }

  // 重視ポイントは「雰囲気」と「希望ジャンル」をまとめて1チップに集約する。
  const emphasis = [...preferredAtmosphere, ...preferredGenres];
  if (emphasis.length > 0) {
    chips.push({
      key: "emphasis",
      Icon: HeartIcon,
      iconTone: "text-success",
      label: `重視：${emphasis.join("・")}`,
    });
  }

  return chips;
}
