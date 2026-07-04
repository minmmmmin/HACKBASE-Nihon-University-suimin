import { useState } from "react";
import { requestRecommendation } from "../api/recommend.js";
import ConditionsCard from "../components/ConditionsCard.jsx";
import ShopList from "../components/ShopList.jsx";

// 初期表示に使うサンプル。ユーザーは自由に編集・増減できる。
const DEFAULT_MEMBERS = [
  "金欠なので安めがいい。昨日ラーメンを食べたので麺類以外。",
  "静かに話せる店がいい。駅からあまり歩きたくない。",
];

// 現在地が取得できない場合のフォールバック座標（東京駅付近）。
const DEFAULT_LOCATION = { lat: 35.658, lng: 139.701 };

// 検索範囲プリセット。codeはホットペッパー準拠（1=300m … 5=3000m）。
const RANGE_OPTIONS = [
  { code: 1, label: "300m" },
  { code: 2, label: "500m" },
  { code: 3, label: "1km" },
  { code: 4, label: "2km" },
  { code: 5, label: "3km" },
];

export default function HomePage() {
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [range, setRange] = useState(3);
  const [loading, setLoading] = useState(false);

  /** 現在地取得の状態: { kind: "idle" | "loading" | "success" | "error", message?: string } */
  const [geo, setGeo] = useState({ kind: "idle" });

  /** 画面下部の状態表示。kind: "validation" | "error" | null。 */
  const [status, setStatus] = useState(null);

  /** API成功時の推薦結果。{ conditions, shops } | null。 */
  const [result, setResult] = useState(null);

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
      setResult(null);
      return;
    }

    setLoading(true);
    setStatus(null);
    setResult(null);

    const payload = { location, range, members: filledMembers };

    try {
      const {
        ok,
        status: httpStatus,
        data,
      } = await requestRecommendation(payload);

      if (ok) {
        setResult({
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
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-primary text-primary-content shadow-md">
        <div className="mx-auto w-full max-w-2xl px-2">
          <span className="text-lg font-bold">みんなで決めるお店</span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl space-y-4 p-4">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h1 className="card-title">今日どこで食べる？</h1>
            <p className="text-sm opacity-80">
              みんなの「食べたい気分」を自由に書くと、生成AIとホットペッパーグルメAPIで、
              グループみんなが納得しやすいお店を提案します。
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm">
          <div className="card-body space-y-4">
            {/* 参加者の自由文入力（増減式） */}
            <div className="space-y-3">
              <span className="label-text font-semibold">参加者の希望</span>
              {members.map((text, index) => (
                // 入力欄は並び順で識別するためindexをkeyに用いる。
                // biome-ignore lint/suspicious/noArrayIndexKey: 動的な入力行のため
                <div key={index} className="flex items-start gap-2">
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={2}
                    value={text}
                    onChange={(e) => updateMember(index, e.target.value)}
                    placeholder={`${index + 1}人目の希望（例：安めがいい。麺類以外。）`}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeMember(index)}
                    disabled={members.length <= 1}
                    aria-label={`${index + 1}人目を削除`}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={addMember}
              >
                ＋ 参加者を追加
              </button>
            </div>

            <div className="divider my-0" />

            {/* 現在地取得 */}
            <div className="space-y-2">
              <span className="label-text font-semibold">現在地</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleGetLocation}
                  disabled={geo.kind === "loading"}
                >
                  {geo.kind === "loading" && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  現在地を取得
                </button>
                <span className="text-sm opacity-70">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  {geo.kind === "success" && "（取得済み）"}
                  {geo.kind === "idle" && "（東京駅・既定）"}
                </span>
              </div>
              {geo.kind === "error" && (
                <p className="text-sm text-error">{geo.message}</p>
              )}
            </div>

            {/* 検索範囲選択 */}
            <div className="space-y-2">
              <span className="label-text font-semibold">検索範囲</span>
              <div className="join">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    className={`btn join-item btn-sm ${
                      range === option.code ? "btn-primary" : "btn-outline"
                    }`}
                    onClick={() => setRange(option.code)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {loading ? "提案を作成中..." : "お店を提案してもらう"}
            </button>
          </div>
        </form>

        <StatusArea loading={loading} status={status} />

        {result && (
          <>
            <ConditionsCard conditions={result.conditions} />
            <ShopList shops={result.shops} />
          </>
        )}
      </main>
    </div>
  );
}

/**
 * API通信中・エラー・入力エラーの表示領域。
 *
 * @param {{ loading: boolean, status: any }} props
 */
function StatusArea({ loading, status }) {
  if (loading) {
    return (
      <div className="alert">
        <span className="loading loading-spinner loading-sm" />
        <span>お店を探しています...</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  if (status.kind === "validation") {
    return (
      <div className="alert alert-error">
        <div className="flex flex-col items-start gap-2">
          <span className="badge badge-outline">入力エラー</span>
          <span>{status.message}</span>
          {status.details.length > 0 && (
            <ul className="list-disc pl-5 text-sm">
              {status.details.map((detail) => (
                <li key={detail.path}>
                  <span className="font-mono">{detail.path}</span>:{" "}
                  {detail.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="alert alert-error">
      <span>{status.message}</span>
    </div>
  );
}
