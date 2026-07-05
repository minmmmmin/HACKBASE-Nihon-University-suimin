import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResult, getRoom, runRecommend } from "../api/rooms.js";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  PeopleIcon,
  PersonIcon,
  SearchIcon,
} from "../components/icons.jsx";
import RoomResultView from "../components/RoomResultView.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

/** 部屋の状態をポーリングする間隔（ミリ秒）。 */
const POLL_INTERVAL_MS = 3000;

/**
 * 幹事の待機・実行画面。
 * 参加リンク／合言葉を共有し、集まった人数を見ながら「お店を探す」を実行する。
 */
export default function RoomHostPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  // hostToken は部屋作成時に sessionStorage へ保存済み。無ければ幹事ではない端末。
  const [hostToken] = useState(() =>
    sessionStorage.getItem(`hostToken:${roomId}`),
  );

  const [room, setRoom] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // 参加者が開く招待URL。
  const joinUrl = `${window.location.origin}/room/${roomId}`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(joinUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 8,
      color: {
        dark: "#1f2933",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (active) {
          setQrCodeUrl(url);
        }
      })
      .catch(() => {
        if (active) {
          setQrCodeUrl("");
        }
      });

    return () => {
      active = false;
    };
  }, [joinUrl]);

  const refresh = useCallback(async () => {
    try {
      const { ok, data } = await getRoom(roomId);
      if (ok) {
        setRoom(data);
        // すでに検索済みなら結果を取得して表示する。
        if (data.hasResult && !result) {
          const res = await getResult(roomId);
          if (res.ok) {
            setResult(res.data);
          }
        }
      } else {
        setLoadError(
          "部屋が見つかりませんでした。期限切れの可能性があります。",
        );
      }
    } catch {
      setLoadError("サーバーに接続できませんでした。");
    }
  }, [roomId, result]);

  // 結果が出るまで定期的に状態を取得する。
  useEffect(() => {
    refresh();
    if (result) {
      return;
    }
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refresh, result]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボード不可でも致命的ではないので握りつぶす。
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "みんなで決めるお店",
          text: `お店選びに参加してね（合言葉: ${roomId}）`,
          url: joinUrl,
        });
      } catch {
        // ユーザーがキャンセルした場合など。何もしない。
      }
    } else {
      handleCopy();
    }
  }

  async function handleSearch() {
    setSearching(true);
    try {
      const { ok, status, data } = await runRecommend(roomId, hostToken);
      if (ok) {
        setResult(data);
      } else if (status === 400) {
        setLoadError(data?.message ?? "参加者がいません。");
      } else if (status === 403) {
        setLoadError("この端末には検索を実行する権限がありません。");
      } else {
        setLoadError(data?.message ?? "検索に失敗しました。");
      }
    } catch {
      setLoadError("サーバーに接続できませんでした。");
    } finally {
      setSearching(false);
    }
  }

  const memberCount = room?.memberCount ?? 0;

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-4 lg:max-w-2xl lg:px-8 lg:pt-8">
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-base-content/70">
              <CheckCircleIcon className="h-5 w-5 text-success" />
              {memberCount}人の希望からお店を選びました
            </div>
            <RoomResultView result={result} />
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn btn-ghost w-full rounded-xl"
            >
              最初からやり直す
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-2 text-lg font-bold">
                <PeopleIcon className="h-6 w-6 text-accent" />
                みんなを招待しよう
              </div>
              <p className="text-sm text-base-content/60">
                下のリンクか合言葉を共有すると、各自の端末で希望を入力できます。
              </p>
            </div>

            {loadError && (
              <div className="rounded-2xl border border-error/40 bg-error/10 p-3 text-sm text-error">
                {loadError}
              </div>
            )}

            {!hostToken && (
              <div className="rounded-2xl border border-warning/40 bg-warning/10 p-3 text-sm">
                この端末は幹事として認識されていません。検索の実行は部屋を作成した端末で行ってください。
              </div>
            )}

            {/* 合言葉コード */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body items-center gap-2 p-5">
                <span className="text-xs font-semibold text-base-content/50">
                  合言葉コード
                </span>
                <span className="font-mono text-4xl font-bold tracking-[0.3em] text-primary">
                  {roomId}
                </span>
                <p className="text-center text-xs text-base-content/50">
                  「みんなの端末で」からこのコードを入力しても参加できます。
                </p>
              </div>
            </div>

            {/* QRコード */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body items-center gap-3 p-5">
                <span className="text-sm font-semibold">招待QRコード</span>
                <div className="grid h-48 w-48 place-items-center rounded-2xl border border-base-300 bg-white p-3">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="参加リンクのQRコード"
                      className="h-full w-full"
                    />
                  ) : (
                    <span className="loading loading-spinner loading-md text-primary" />
                  )}
                </div>
                <p className="text-center text-xs text-base-content/50">
                  参加者はスマホで読み取るだけで希望入力画面を開けます。
                </p>
                {qrCodeUrl && (
                  <a
                    href={qrCodeUrl}
                    download={`suimin-room-${roomId}-qr.png`}
                    className="btn btn-outline btn-sm rounded-xl"
                  >
                    画像を保存
                  </a>
                )}
              </div>
            </div>

            {/* 招待リンク */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body gap-3 p-4">
                <span className="text-sm font-semibold">招待リンク</span>
                <div className="break-all rounded-xl bg-base-200 px-3 py-2 text-xs text-base-content/70">
                  {joinUrl}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="btn btn-outline rounded-xl"
                  >
                    {copied ? "コピーしました" : "リンクをコピー"}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="btn btn-primary rounded-xl"
                  >
                    共有する
                  </button>
                </div>
              </div>
            </div>

            {/* 参加状況 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body gap-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">参加状況</span>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-sm font-bold text-accent">
                    {memberCount}人
                  </span>
                </div>
                {memberCount === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-base-content/50">
                    <span className="loading loading-dots loading-sm" />
                    参加を待っています…
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {room.members.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center gap-2 rounded-xl bg-base-200 px-3 py-2 text-sm"
                      >
                        <PersonIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{m.name}</span>
                        <CheckCircleIcon className="ml-auto h-4 w-4 text-success" />
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-base-content/40">
                  ※各自の希望内容は幹事にも表示されません。
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={searching || memberCount === 0 || !hostToken}
              className="btn btn-accent w-full gap-2 rounded-xl text-base shadow-md"
            >
              {searching ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
              {searching
                ? "お店を探しています..."
                : `${memberCount}人でお店を探す`}
              {!searching && <ArrowRightIcon className="h-5 w-5" />}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
