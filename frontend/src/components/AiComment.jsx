import { SparklesIcon } from "./icons.jsx";

/**
 * AIが「この提案（店舗一覧）を選んだ理由」をまとめて述べる総評コメント。
 * 各店舗の個別理由とは別に、グループ全体への提案意図を1文で伝える。
 *
 * @param {{ comment?: string }} props
 */
export default function AiComment({ comment }) {
  // summary が無い（未接続の旧レスポンス等）ときは何も表示しない。
  if (!comment) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-primary" />
        <h2 className="font-bold">AIがこのお店を選んだ理由</h2>
      </div>
      <p className="text-sm leading-relaxed text-base-content/80">{comment}</p>
    </section>
  );
}
