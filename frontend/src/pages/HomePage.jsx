import { useState } from "react";
import { requestRecommendation } from "../api/recommend.js";

const DEFAULT_MEMBER_1 =
  "金欠なので安めがいい。昨日ラーメンを食べたので麺類以外。";
const DEFAULT_MEMBER_2 = "静かに話せる店がいい。駅からあまり歩きたくない。";

// 位置情報はUIから入力しない。将来Geolocation APIで取得する予定のため、
// 現時点では東京駅付近のデフォルト座標を送信する。
const DEFAULT_LOCATION = { lat: 35.658, lng: 139.701 };

export default function HomePage() {
  const [member1, setMember1] = useState(DEFAULT_MEMBER_1);
  const [member2, setMember2] = useState(DEFAULT_MEMBER_2);
  const [loading, setLoading] = useState(false);

  /**
   * 画面下部に表示する状態。
   * kind: "notImplemented" | "validation" | "error" のいずれか。
   */
  const [status, setStatus] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = {
      location: DEFAULT_LOCATION,
      members: [{ text: member1 }, { text: member2 }],
    };

    try {
      const { status: httpStatus, data } = await requestRecommendation(payload);

      if (httpStatus === 501) {
        setStatus({
          kind: "notImplemented",
          message: data?.message ?? "店舗推薦機能はまだ実装されていません",
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
            <label className="form-control w-full">
              <span className="label-text mb-1 font-semibold">1人目の希望</span>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                value={member1}
                onChange={(e) => setMember1(e.target.value)}
                placeholder="例：金欠なので安めがいい。麺類以外。"
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text mb-1 font-semibold">2人目の希望</span>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                value={member2}
                onChange={(e) => setMember2(e.target.value)}
                placeholder="例：静かに話せる店がいい。"
              />
            </label>

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
      </main>
    </div>
  );
}

/**
 * API通信結果・エラーの表示領域。
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

  if (status.kind === "notImplemented") {
    return (
      <div className="alert alert-warning">
        <div className="flex flex-col items-start gap-2">
          <span className="badge badge-outline">未実装</span>
          <span>{status.message}</span>
        </div>
      </div>
    );
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
