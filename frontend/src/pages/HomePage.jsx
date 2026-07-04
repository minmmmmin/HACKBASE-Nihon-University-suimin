import { useState } from "react";
import { requestRecommendation } from "../api/recommend.js";
import AiComment from "../components/AiComment.jsx";
import ConditionsCard from "../components/ConditionsCard.jsx";
import {
  CheckCircleIcon,
  HistoryIcon,
  LocationPinIcon,
  MenuIcon,
  PencilIcon,
  PeopleIcon,
  PersonIcon,
  SearchIcon,
  TargetIcon,
} from "../components/icons.jsx";
import ShopList from "../components/ShopList.jsx";

// 初期表示に使うサンプル。ユーザーは自由に編集・増減できる。
const DEFAULT_MEMBERS = [
  "安くて美味しいお店がいい！\n落ち着いて話せる雰囲気だと嬉しい。\n和食か定食系が好きです。",
  "静かな場所がいいです！\n駅から近いと助かる〜\nカフェっぽい雰囲気も気になる",
];

// 自由文の最大文字数。
const MEMBER_MAX_LENGTH = 200;

// 現在地が取得できない場合のフォールバック座標（東京駅付近）。
const DEFAULT_LOCATION = { lat: 35.658, lng: 139.701 };

// 検索範囲プリセット。codeはホットペッパー準拠（1=300m … 4=2000m）。
const RANGE_OPTIONS = [
  { code: 1, label: "300m" },
  { code: 2, label: "500m" },
  { code: 3, label: "1km" },
  { code: 4, label: "2km" },
];

// バックエンド未接続でも結果画面（モック2枚目）を確認できるようにするサンプル。
// API通信が成功した場合はこの内容を実データで置き換える。
const SAMPLE_RESULT = {
  areaLabel: "渋谷周辺",
  summary:
    "みんなの希望をまとめると、予算は安めで静かに落ち着いて話せるお店がぴったりでした。麺類は避けたいとのことなので候補から外しています。中でも「和ごはん かえで」は駅近で和食中心と、条件との相性がいちばん高いおすすめです。",
  conditions: {
    budgetLevel: "low",
    excludedGenres: ["麺類"],
    preferredGenres: [],
    preferredAtmosphere: ["静かさ", "駅近"],
    maxWalkingMinutes: null,
  },
  shops: [
    {
      id: "sample-1",
      name: "和ごはん かえで",
      genre: "和食・定食",
      budget: "安め",
      access: "徒歩3分（250m）",
      reason:
        "落ち着いた雰囲気で会話がしやすく、和食中心でご希望にぴったりです。",
      distanceMeters: 250,
      matchScore: 92,
      iconType: "bowl",
    },
    {
      id: "sample-2",
      name: "café lume（カフェルメ）",
      genre: "カフェ・カフェごはん",
      budget: "安め",
      access: "徒歩4分（350m）",
      reason: "カフェのような落ち着いた空間で、駅近＆静かに過ごせます。",
      distanceMeters: 350,
      matchScore: 86,
      iconType: "coffee",
    },
    {
      id: "sample-3",
      name: "定食や まるや",
      genre: "定食・和食",
      budget: "安め",
      access: "徒歩6分（550m）",
      reason: "コスパの良い定食が充実！和食好きにおすすめです。",
      distanceMeters: 550,
      matchScore: 78,
      iconType: "bowl",
    },
  ],
};

export default function HomePage() {
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [range, setRange] = useState(3);
  const [loading, setLoading] = useState(false);

  /** 現在地取得の状態: { kind: "idle" | "loading" | "success" | "error", message?: string } */
  const [geo, setGeo] = useState({ kind: "idle" });

  /** 画面下部の状態表示。kind: "validation" | "error" | null。 */
  const [status, setStatus] = useState(null);

  // 結果は常にサンプルで初期化しておき、API成功時に実データへ差し替える。
  const [result, setResult] = useState(SAMPLE_RESULT);

  const selectedRangeLabel =
    RANGE_OPTIONS.find((option) => option.code === range)?.label ?? "";

  function updateMember(index, value) {
    setMembers((prev) => prev.map((text, i) => (i === index ? value : text)));
  }

  function addMember() {
    setMembers((prev) => [...prev, ""]);
  }

  function removeMember(index) {
    // 参加者は最低1人を維持する。
    setMembers((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGeo({
        kind: "error",
        message: "この端末では位置情報を取得できません。",
      });
      return;
    }

    setGeo({ kind: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeo({ kind: "success" });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "位置情報の利用が許可されませんでした。東京駅を基準に検索します。"
            : "位置情報を取得できませんでした。東京駅を基準に検索します。";
        setGeo({ kind: "error", message });
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // 空欄を除いた参加者だけを送信対象にする。
    const filledMembers = members
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .map((text) => ({ text }));

    if (filledMembers.length === 0) {
      setStatus({
        kind: "validation",
        message: "少なくとも1人分の希望を入力してください。",
        details: [],
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    const payload = { location, range, members: filledMembers };

    try {
      const {
        ok,
        status: httpStatus,
        data,
      } = await requestRecommendation(payload);

      if (ok) {
        setResult({
          areaLabel: SAMPLE_RESULT.areaLabel,
          summary: data.summary,
          conditions: data.conditions,
          shops: Array.isArray(data.shops) ? data.shops : [],
        });
      } else if (httpStatus === 400) {
        setStatus({
          kind: "validation",
          message: data?.error ?? "入力内容に誤りがあります",
          details: Array.isArray(data?.details) ? data.details : [],
        });
      } else if (httpStatus === 404) {
        setStatus({
          kind: "error",
          message: data?.error ?? "APIが見つかりませんでした（404）",
        });
      } else if (httpStatus >= 500) {
        setStatus({
          kind: "error",
          message: data?.error ?? "サーバーエラーが発生しました（500）",
        });
      } else {
        setStatus({
          kind: "error",
          message: "予期しないレスポンスを受信しました",
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message:
          "サーバーに接続できませんでした。バックエンドが起動しているか確認してください。",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <SiteHeader />

      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-4 lg:max-w-6xl lg:px-8 lg:pt-8">
        {/* モバイルは縦積み、デスクトップは「入力（左）／結果（右）」の2カラム。 */}
        <div className="lg:grid lg:grid-cols-[minmax(340px,380px)_1fr] lg:items-start lg:gap-8">
          {/* ── 入力パネル（左） ── */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <SectionLabel icon={<PencilIcon className="h-4 w-4" />}>
              みんなの希望を入力
            </SectionLabel>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body gap-4 p-4">
                  {members.map((text, index) => (
                    // 入力欄は並び順で識別するためindexをkeyに用いる。
                    // biome-ignore lint/suspicious/noArrayIndexKey: 動的な入力行のため
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <PersonIcon
                          className={`h-4 w-4 ${index % 2 === 0 ? "text-primary" : "text-accent"}`}
                        />
                        <span className="text-sm font-semibold">
                          {index + 1}人目
                        </span>
                        {members.length > 1 && (
                          <button
                            type="button"
                            className="ml-auto text-xs text-base-content/40 transition hover:text-error"
                            onClick={() => removeMember(index)}
                            aria-label={`${index + 1}人目を削除`}
                          >
                            削除
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <textarea
                          className="textarea textarea-bordered w-full resize-none rounded-xl bg-base-100 pb-6 leading-relaxed"
                          rows={3}
                          maxLength={MEMBER_MAX_LENGTH}
                          value={text}
                          onChange={(e) => updateMember(index, e.target.value)}
                          placeholder={`${index + 1}人目の希望（例：安めがいい。麺類以外。）`}
                        />
                        <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-base-content/40">
                          {text.length}/{MEMBER_MAX_LENGTH}
                        </span>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="w-full rounded-xl border-2 border-dashed border-info/60 py-2.5 text-sm font-semibold text-info transition hover:bg-info/5"
                    onClick={addMember}
                  >
                    ＋ 参加者を追加
                  </button>
                </div>
              </div>

              {/* ── エリア・現在地 ── */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body gap-3 p-4">
                  <SectionTitle
                    icon={<LocationPinIcon className="h-4 w-4 text-primary" />}
                  >
                    エリア・現在地
                  </SectionTitle>

                  <button
                    type="button"
                    className="btn btn-primary w-full gap-2 rounded-xl"
                    onClick={handleGetLocation}
                    disabled={geo.kind === "loading"}
                  >
                    {geo.kind === "loading" ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <LocationPinIcon className="h-5 w-5" />
                    )}
                    現在地から探す
                  </button>

                  {geo.kind === "success" && (
                    <div className="flex items-start gap-2 rounded-xl bg-success/10 px-3 py-2.5">
                      <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                      <div>
                        <p className="text-sm font-semibold text-success">
                          現在地を取得しました
                        </p>
                        <p className="text-xs text-base-content/60">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}{" "}
                          付近
                        </p>
                      </div>
                    </div>
                  )}

                  {geo.kind === "error" && (
                    <p className="text-sm text-error">{geo.message}</p>
                  )}
                </div>
              </div>

              {/* ── 検索範囲 ── */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body gap-3 p-4">
                  <SectionTitle
                    icon={<TargetIcon className="h-4 w-4 text-primary" />}
                  >
                    検索範囲
                  </SectionTitle>

                  <div className="grid grid-cols-4 gap-2">
                    {RANGE_OPTIONS.map((option) => {
                      const active = range === option.code;
                      return (
                        <button
                          key={option.code}
                          type="button"
                          className={`rounded-xl py-2 text-sm font-semibold transition ${
                            active
                              ? "bg-primary text-primary-content shadow-sm"
                              : "bg-base-200 text-base-content/70 hover:bg-base-300"
                          }`}
                          onClick={() => setRange(option.code)}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-accent w-full gap-2 rounded-xl text-base shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <SearchIcon className="h-5 w-5" />
                )}
                {loading ? "お店を探しています..." : "お店を探す"}
              </button>
            </form>
          </div>

          {/* ── 結果パネル（右） ── */}
          <div className="mt-4 space-y-4 lg:mt-0">
            {status && <StatusArea status={status} />}

            {/* 結果：みんなの希望まとめ＋AIコメント＋店舗候補 */}
            {result && (
              <>
                <ConditionsCard conditions={result.conditions} />
                <AiComment comment={result.summary} />
                <ShopList
                  shops={result.shops}
                  areaLabel={result.areaLabel}
                  rangeLabel={selectedRangeLabel}
                />
              </>
            )}

            <p className="pt-1 text-center text-xs text-base-content/50 lg:text-left">
              ※表示されている距離は直線距離です。実際の徒歩時間とは異なる場合があります。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/** サイト共通ヘッダー。デスクトップはナビ＋履歴ボタン、モバイルはメニューを表示。 */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-base-300 bg-base-100/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 lg:max-w-6xl lg:px-8">
        <div className="flex items-center gap-2 lg:gap-3">
          <PeopleIcon className="h-6 w-6 text-accent lg:h-7 lg:w-7" />
          <span className="text-lg font-bold lg:text-xl">
            みんなで決めるお店
          </span>
          <nav className="ml-4 hidden items-center gap-5 text-sm text-base-content/70 lg:flex">
            <a href="#使い方" className="transition hover:text-base-content">
              使い方
            </a>
            <a
              href="#よくある質問"
              className="transition hover:text-base-content"
            >
              よくある質問
            </a>
          </nav>
        </div>

        {/* デスクトップ：履歴ボタン／モバイル：メニュー */}
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-lg border border-base-300 px-3 py-1.5 text-sm font-medium transition hover:bg-base-200 lg:inline-flex"
        >
          <HistoryIcon className="h-4 w-4" />
          履歴を見る
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square lg:hidden"
          aria-label="メニュー"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

/** カードの外に置く、うっすらしたセクションラベル。 */
function SectionLabel({ icon, children }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-base-content/70">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

/** カード内の見出し（アイコン＋太字）。 */
function SectionTitle({ icon, children }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="font-semibold">{children}</span>
    </div>
  );
}

/**
 * 入力エラー・通信エラーの表示領域。
 * @param {{ status: { kind: string, message: string, details?: any[] } }} props
 */
function StatusArea({ status }) {
  if (status.kind === "validation") {
    return (
      <div className="rounded-2xl border border-error/40 bg-error/10 p-3 text-sm">
        <p className="font-semibold text-error">{status.message}</p>
        {status.details?.length > 0 && (
          <ul className="mt-1 list-disc pl-5 text-base-content/70">
            {status.details.map((detail) => (
              <li key={detail.path}>
                <span className="font-mono">{detail.path}</span>:{" "}
                {detail.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-error/40 bg-error/10 p-3 text-sm text-error">
      {status.message}
    </div>
  );
}
