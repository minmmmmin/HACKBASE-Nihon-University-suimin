import { Link } from "react-router-dom";
import {
  BookIcon,
  LocationPinIcon,
  PeopleIcon,
  QuestionIcon,
  SparklesIcon,
  YenIcon,
} from "../components/icons.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

// よくある質問。カテゴリごとにまとめて表示する。
const FAQ_GROUPS = [
  {
    category: "基本のこと",
    icon: <SparklesIcon className="h-4 w-4 text-primary" />,
    items: [
      {
        q: "このサービスは何ができますか？",
        a: "一緒に食事に行くメンバーそれぞれの希望を入力すると、AIが全員の条件をまとめて、いちばん合いそうなお店を提案します。「どこにする？」の話し合いにかかる時間を減らせます。",
      },
      {
        q: "料金はかかりますか？",
        a: "いいえ、無料でご利用いただけます。会員登録も不要で、開いてすぐに使い始められます。",
      },
      {
        q: "アカウント登録は必要ですか？",
        a: "必要ありません。ページを開いて希望を入力するだけで、すぐにお店を探せます。",
      },
    ],
  },
  {
    category: "使い方について",
    icon: <PeopleIcon className="h-4 w-4 text-primary" />,
    items: [
      {
        q: "何人まで希望を登録できますか？",
        a: "人数の上限はありません。「＋参加者を追加」から必要な人数だけ入力欄を増やせます。1人だけでの利用も可能です。",
      },
      {
        q: "どんなことを書けばいいですか？",
        a: "「安めがいい」「和食が好き」「麺類以外」「駅から近いと嬉しい」のように、予算・好み・避けたいもの・雰囲気などを自由な文章で書いてください。かんたんな一言でも大丈夫です。",
      },
      {
        q: "希望が思いつかない人がいても使えますか？",
        a: "はい。空欄のままの人は集計から自動的に除かれるので、希望のある人の内容だけでお店を探せます。",
      },
    ],
  },
  {
    category: "位置情報・お店の情報",
    icon: <LocationPinIcon className="h-4 w-4 text-primary" />,
    items: [
      {
        q: "位置情報は必ず必要ですか？",
        a: "必須ではありません。位置情報の利用を許可しない場合は、東京駅を基準にお店を探します。より近くのお店を探したいときは「現在地から探す」をご利用ください。",
      },
      {
        q: "表示される距離は正確ですか？",
        a: "表示している距離は現在地からの直線距離です。実際の道のりや徒歩時間とは異なる場合がありますので、目安としてご覧ください。",
      },
      {
        q: "お店の情報はどこから取得していますか？",
        a: "店舗情報はグルメ情報サービスのデータをもとに表示しています。営業時間や定休日など最新の情報は、お店の公式ページなどで念のためご確認ください。",
      },
    ],
  },
  {
    category: "料金・データ",
    icon: <YenIcon className="h-4 w-4 text-primary" />,
    items: [
      {
        q: "入力した内容は保存されますか？",
        a: "入力した希望は、お店を探すためだけに使われます。個人を特定する情報の登録は不要です。",
      },
      {
        q: "提案されたお店は予約できますか？",
        a: "このサービス上での予約機能はありません。気になるお店が見つかったら、お店の情報をもとにお電話や予約サイトからご予約ください。",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <SiteHeader />

      <main className="mx-auto w-full max-w-md px-4 pb-16 pt-6 lg:max-w-3xl lg:px-8 lg:pt-10">
        {/* ── ヒーロー ── */}
        <section className="text-center">
          <h1 className="mt-3 text-2xl font-bold lg:text-3xl">よくある質問</h1>
        </section>

        {/* ── カテゴリごとのQ&A ── */}
        <div className="mt-8 space-y-8">
          {FAQ_GROUPS.map((group) => (
            <section key={group.category}>
              <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-base-content/70">
                {group.icon}
                <span>{group.category}</span>
              </div>
              <div className="space-y-2.5">
                {group.items.map((item) => (
                  <div
                    key={item.q}
                    className="collapse collapse-plus rounded-2xl border border-base-300 bg-base-100 shadow-sm"
                  >
                    <input type="checkbox" aria-label={item.q} />
                    <div className="collapse-title pr-10 text-sm font-semibold">
                      {item.q}
                    </div>
                    <div className="collapse-content">
                      <p className="text-sm leading-relaxed text-base-content/70">
                        {item.a}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── 問い合わせ・関連リンク ── */}
        <section className="mt-10 rounded-2xl border border-primary/25 bg-primary/5 p-6 text-center">
          <h2 className="text-lg font-bold">解決しませんでしたか？</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-base-content/70">
            まずは使い方ガイドをのぞいてみてください。実際の流れがひと目でわかります。
          </p>
          <Link
            to="/how-to"
            className="btn btn-primary mt-4 gap-2 rounded-xl px-6 text-base shadow-md"
          >
            <BookIcon className="h-5 w-5" />
            使い方を見る
          </Link>
        </section>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:opacity-80"
          >
            ホームに戻ってお店を探す
          </Link>
        </div>
      </main>
    </div>
  );
}
