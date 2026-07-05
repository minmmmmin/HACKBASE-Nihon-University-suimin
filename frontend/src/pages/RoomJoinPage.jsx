import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getResult, getRoom, joinRoom } from "../api/rooms.js";
import {
  ChatIcon,
  CheckCircleIcon,
  PencilIcon,
  PersonIcon,
} from "../components/icons.jsx";
import RoomResultView from "../components/RoomResultView.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

/** 自由文の最大文字数（バックエンドと合わせる）。 */
const TEXT_MAX_LENGTH = 200;

/** 結果を待つ間のポーリング間隔（ミリ秒）。 */
const POLL_INTERVAL_MS = 3000;

/**
 * 参加者の入力画面。
 * 招待リンク（/room/:id）で開き、自分の希望だけを入力する。
 * 他の参加者の希望は表示されない。
 */
export default function RoomJoinPage() {
  const { id: roomId } = useParams();

  // "loading" | "form" | "waiting" | "result" | "error"
  const [phase, setPhase] = useState("loading");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // 結果ポーリングのタイマー。
  const pollRef = useRef(null);

  // 初回に部屋の存在を確認する。
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { ok, data } = await getRoom(roomId);
        if (!active) {
          return;
        }
        if (!ok) {
          setPhase("error");
          setError(
            "部屋が見つかりませんでした。合言葉やリンクをご確認ください。",
          );
          return;
        }
        // すでに検索済みなら結果を表示する。
        if (data.hasResult) {
          const res = await getResult(roomId);
          if (active && res.ok) {
            setResult(res.data);
            setPhase("result");
            return;
          }
        }
        setPhase("form");
      } catch {
        if (active) {
          setPhase("error");
          setError("サーバーに接続できませんでした。");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [roomId]);

  // waiting 中は結果をポーリングする。
  useEffect(() => {
    if (phase !== "waiting") {
      return;
    }
    async function poll() {
      try {
        const { ok, status, data } = await getResult(roomId);
        if (ok && status === 200) {
          setResult(data);
          setPhase("result");
        }
      } catch {
        // 一時的な失敗は無視して次回に賭ける。
      }
    }
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [phase, roomId]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setError("希望を1文字以上入力してください。");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { ok, status, data } = await joinRoom(roomId, {
        name: name.trim() || undefined,
        text: trimmed,
      });
      if (ok) {
        setPhase("waiting");
      } else if (status === 409) {
        // すでに幹事が検索を実行済み。結果を見せる。
        setError("この部屋はすでに検索が実行されました。結果を表示します。");
        setPhase("waiting");
      } else if (status === 400) {
        setError(data?.details?.[0]?.message ?? "入力内容を確認してください。");
      } else {
        setError(data?.message ?? "送信に失敗しました。");
      }
    } catch {
      setError("サーバーに接続できませんでした。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-4 lg:max-w-2xl lg:px-8 lg:pt-8">
        {phase === "loading" && (
          <div className="flex flex-col items-center gap-3 py-16 text-base-content/60">
            <span className="loading loading-spinner loading-lg" />
            部屋を確認しています…
          </div>
        )}

        {phase === "error" && (
          <div className="rounded-2xl border border-error/40 bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {phase === "form" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-2 text-lg font-bold">
                <ChatIcon className="h-6 w-6 text-accent" />
                あなたの希望を入力
              </div>
              <p className="text-sm text-base-content/60">
                合言葉 <span className="font-mono font-bold">{roomId}</span>{" "}
                の部屋に参加します。入力内容は他の人には見えません。
              </p>
            </div>

            {error && (
              <div className="rounded-2xl border border-error/40 bg-error/10 p-3 text-sm text-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body gap-4 p-4">
                  <label className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <PersonIcon className="h-4 w-4 text-primary" />
                      ニックネーム（任意）
                    </span>
                    <input
                      type="text"
                      className="input input-bordered w-full rounded-xl"
                      maxLength={20}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="例：たろう"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <PencilIcon className="h-4 w-4 text-primary" />
                      希望
                    </span>
                    <div className="relative">
                      <textarea
                        className="textarea textarea-bordered w-full resize-none rounded-xl pb-6 leading-relaxed"
                        rows={4}
                        maxLength={TEXT_MAX_LENGTH}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="例：安めがいい。昨日ラーメンを食べたので麺類以外。静かに話せる店がうれしい。"
                      />
                      <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-base-content/40">
                        {text.length}/{TEXT_MAX_LENGTH}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-accent w-full gap-2 rounded-xl text-base shadow-md"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5" />
                )}
                {submitting ? "送信しています..." : "希望を送信する"}
              </button>
            </form>
          </div>
        )}

        {phase === "waiting" && (
          <div className="space-y-4">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body items-center gap-3 p-6 text-center">
                <CheckCircleIcon className="h-10 w-10 text-success" />
                <p className="font-bold">希望を送信しました！</p>
                <p className="text-sm text-base-content/60">
                  幹事がお店を探すのを待っています。結果が出たら自動で表示されます。
                </p>
                <span className="loading loading-dots loading-md text-primary" />
              </div>
            </div>
            {error && (
              <p className="text-center text-xs text-base-content/50">
                {error}
              </p>
            )}
          </div>
        )}

        {phase === "result" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-base-content/70">
              <CheckCircleIcon className="h-5 w-5 text-success" />
              みんなの希望からお店が決まりました
            </div>
            <RoomResultView result={result} />
          </div>
        )}
      </main>
    </div>
  );
}
