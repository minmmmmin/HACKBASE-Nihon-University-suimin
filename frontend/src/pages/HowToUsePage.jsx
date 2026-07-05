import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BulbIcon,
  ChatIcon,
  HeartIcon,
  LocationPinIcon,
  PencilIcon,
  QuestionIcon,
  SearchIcon,
  SparklesIcon,
  TargetIcon,
} from "../components/icons.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

// 使い方の4ステップ。番号・アイコン・見出し・説明をまとめて持つ。
const STEPS = [
  {
    icon: <PencilIcon className="h-6 w-6" />,
    title: "みんなの希望を入力する",
    body: "一緒に行く人それぞれの「食べたいもの」「予算」「雰囲気」を自由な文章で書きます。「安めがいい」「麺類以外」のような、ふだんの言葉づかいで大丈夫です。",
  },
  {
    icon: <LocationPinIcon className="h-6 w-6" />,
    title: "エリアと検索範囲を決める",
    body: "「現在地から探す」を押すと、今いる場所を基準にお店を探します。300m〜2kmの中から、歩いて行ける範囲を選びましょう。",
  },
  {
    icon: <SearchIcon className="h-6 w-6" />,
    title: "「お店を探す」を押す",
    body: "みんなの希望をAIがまとめて、条件にいちばん合うお店を探します。数秒待つだけで、グループ全員が納得しやすい候補が出てきます。",
  },
  {
    icon: <SparklesIcon className="h-6 w-6" />,
    title: "おすすめから選ぶ",
    body: "AIが「なぜこのお店を選んだか」の理由つきで候補を表示します。マッチ度の高い順に並ぶので、上から見て気になったお店を選ぶだけです。",
  },
];

// 入力のコツ。自由文をどう書くと精度が上がるかを具体例で示す。
const TIPS = [
  {
    icon: <HeartIcon className="h-5 w-5 text-secondary" />,
    label: "好みを書く",
    example: "「和食が好き」「カフェっぽい雰囲気がいい」",
  },
  {
    icon: <ChatIcon className="h-5 w-5 text-primary" />,
    label: "避けたいものを書く",
    example: "「辛いものは苦手」「麺類以外がいい」",
  },
  {
    icon: <TargetIcon className="h-5 w-5 text-primary" />,
    label: "条件を添える",
    example: "「予算は安め」「駅から近いと嬉しい」",
  },
];

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <SiteHeader />

      <main className="mx-auto w-full max-w-md px-4 pb-16 pt-6 lg:max-w-3xl lg:px-8 lg:pt-10">
        {/* ── ヒーロー ── */}
        <section className="text-center">
          <h1 className="mt-3 text-2xl font-bold lg:text-3xl">使い方ガイド</h1>
        </section>

        {/* ── ステップ ── */}
        <section className="mt-8 space-y-4">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="card bg-base-100 shadow-sm transition hover:shadow-md"
            >
              <div className="card-body flex-row items-start gap-4 p-4 lg:p-5">
                {/* 番号バッジ＋アイコン */}
                <div className="relative shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                  <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-content shadow-sm">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">{step.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-base-content/70">
                    {step.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ── 入力のコツ ── */}
        <section className="mt-10">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-base-content/70">
            <BulbIcon className="h-4 w-4" />
            <span>入力のコツ</span>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-3 p-4 lg:p-5">
              <p className="text-sm leading-relaxed text-base-content/70">
                かんたんな一言でも大丈夫ですが、次のような内容を添えると、より希望に近いお店が見つかります。
              </p>
              <ul className="space-y-2.5">
                {TIPS.map((tip) => (
                  <li key={tip.label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-base-200">
                      {tip.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{tip.label}</p>
                      <p className="text-sm text-base-content/60">
                        {tip.example}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mt-10 rounded-2xl border border-primary/25 bg-primary/5 p-6 text-center">
          <h2 className="text-lg font-bold">さっそく試してみましょう</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-base-content/70">
            入力は1分ほど。まずは自分と友だちの希望を書いてみてください。
          </p>
          <Link
            to="/"
            className="btn btn-accent mt-4 gap-2 rounded-xl px-6 text-base shadow-md"
          >
            お店を探しに行く
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </section>

        {/* ── 関連リンク ── */}
        <div className="mt-6 text-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:opacity-80"
          >
            <QuestionIcon className="h-4 w-4" />
            よくある質問を見る
          </Link>
        </div>
      </main>
    </div>
  );
}
