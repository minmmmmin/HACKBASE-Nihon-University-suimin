import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAreas } from "../api/areas.js";
import { requestRecommendation } from "../api/recommend.js";
import { createRoom } from "../api/rooms.js";
import AiComment from "../components/AiComment.jsx";
import ConditionsCard from "../components/ConditionsCard.jsx";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  LocationPinIcon,
  PencilIcon,
  PeopleIcon,
  PersonIcon,
  SearchIcon,
  TargetIcon,
} from "../components/icons.jsx";
import ShopList from "../components/ShopList.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

// 自由文の最大文字数。
const MEMBER_MAX_LENGTH = 200;

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

const LARGE_AREA_ALL_VALUE = "__large_area_all__";

export default function HomePage() {
  const navigate = useNavigate();

  // 入力方法。"solo" = 1台で全員分入力 / "group" = 部屋を作って各自の端末で入力。
  const [mode, setMode] = useState("solo");

  const [members, setMembers] = useState([""]);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [range, setRange] = useState(3);
  const [loading, setLoading] = useState(false);

  // 位置の指定方法。"current" = 現在地 / "area" = エリアを選ぶ。
  const [locationMode, setLocationMode] = useState("current");
  // エリア一覧（初回に取得）と、選択中の大エリア・中エリア。
  const [areas, setAreas] = useState({ largeAreas: [], middleAreas: [] });
  const [largeAreaCode, setLargeAreaCode] = useState("");
  const [middleAreaCode, setMiddleAreaCode] = useState("");

  // 部屋作成中フラグ（group モードの「部屋を作る」用）。
  const [creating, setCreating] = useState(false);

  /** 現在地取得の状態: { kind: "idle" | "loading" | "success" | "error", message?: string } */
  const [geo, setGeo] = useState({ kind: "idle" });

  /** 画面下部の状態表示。kind: "validation" | "error" | null。 */
  const [status, setStatus] = useState(null);

  // 結果は検索前は非表示（null）。「お店を探す」押下後に表示する。
  const [result, setResult] = useState(null);

  // 表示中の画面。"input"（入力）→ 検索 →"result"（結果）へ遷移する。
  const [view, setView] = useState("input");
  const resultTopRef = useRef(null);

  // エリア一覧を初回に取得する（失敗しても現在地モードは使える）。
  useEffect(() => {
    getAreas().then(({ ok, data }) => {
      if (ok && data) {
        setAreas(data);
      }
    });
  }, []);

  // 選択中の大エリアに属する中エリアだけを絞り込む。
  const middleAreaOptions = areas.middleAreas.filter(
    (m) => m.largeAreaCode === largeAreaCode,
  );
  const selectedLargeArea = areas.largeAreas.find(
    (area) => area.code === largeAreaCode,
  );

  // 送信ペイロードの位置指定部分を組み立てる。
  // エリアモードは { areaCode, areaName }、現在地モードは { location, range }。
  function buildLocationPayload() {
    if (locationMode === "area" && middleAreaCode) {
      if (middleAreaCode === LARGE_AREA_ALL_VALUE) {
        return {
          areaCode: largeAreaCode,
          areaLevel: "large",
          areaName: selectedLargeArea
            ? `${selectedLargeArea.name} 全域`
            : "選択エリア全域",
        };
      }
      const selected = areas.middleAreas.find((m) => m.code === middleAreaCode);
      return {
        areaCode: middleAreaCode,
        areaLevel: "middle",
        areaName: selected?.name,
      };
    }
    return { location, range };
  }

  // エリアモードなのに中エリア未選択なら true（送信をブロックする）。
  function isAreaSelectionMissing() {
    return locationMode === "area" && !middleAreaCode;
  }

  function isAreaValidationStatus() {
    return (
      status?.kind === "validation" &&
      status.message === "エリアを選択してください。"
    );
  }

  function clearAreaValidationStatus() {
    if (isAreaValidationStatus()) {
      setStatus(null);
    }
  }

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

  // 結果画面から入力画面へ戻る。入力内容はstateに残るので保持される。
  function handleBackToInput() {
    setView("input");
    setStatus(null);
  }

  // ロゴ押下でトップへ。入力内容・結果もすべて初期状態に戻す（＝まっさらな状態）。
  function resetToTop() {
    setView("input");
    setStatus(null);
    setResult(null);
    setMode("solo");
    setMembers([""]);
    setRange(3);
    setLocation(DEFAULT_LOCATION);
    setLocationMode("current");
    setLargeAreaCode("");
    setMiddleAreaCode("");
    setGeo({ kind: "idle" });
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

    if (isAreaSelectionMissing()) {
      setStatus({
        kind: "validation",
        message: "エリアを選択してください。",
        details: [],
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    const payload = { ...buildLocationPayload(), members: filledMembers };

    try {
      const {
        ok,
        status: httpStatus,
        data,
      } = await requestRecommendation(payload);

      if (ok) {
        setResult({
          areaLabel: data.areaLabel ?? "現在地周辺",
          range: data.range ?? null,
          summary: data.summary,
          conditions: data.conditions,
          shops: Array.isArray(data.shops) ? data.shops : [],
        });
        setView("result");
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
      setResult(null);
      setStatus({
        kind: "error",
        message:
          "サーバーに接続できませんでした。バックエンドが起動しているか確認してください。",
      });
    } finally {
      setLoading(false);
    }
  }

  // group モード：部屋を作成し、幹事の待機画面へ遷移する。
  async function handleCreateRoom() {
    if (isAreaSelectionMissing()) {
      setStatus({
        kind: "validation",
        message: "エリアを選択してください。",
        details: [],
      });
      return;
    }
    setCreating(true);
    setStatus(null);
    try {
      const { ok, data } = await createRoom(buildLocationPayload());
      if (ok && data?.roomId) {
        // hostToken は幹事本人だけが持つべきなので sessionStorage に保管する。
        sessionStorage.setItem(`hostToken:${data.roomId}`, data.hostToken);
        navigate(`/room/${data.roomId}/host`);
      } else {
        setStatus({
          kind: "error",
          message: "部屋の作成に失敗しました。時間をおいて試してください。",
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message:
          "サーバーに接続できませんでした。バックエンドが起動しているか確認してください。",
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      {/* ロゴ押下でトップ（入力画面）へ戻し、入力内容も初期化する。 */}
      <SiteHeader onLogoClick={resetToTop} />

      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-4 lg:max-w-2xl lg:px-8 lg:pt-8">
        {/* 入力画面 → 検索 → 結果画面、と全サイズで画面を切り替える。 */}
        {view === "input" ? (
          <div className="space-y-4">
            {/* 入力方法の切り替え：1台でまとめて / 部屋を作って各自の端末で。 */}
            <ModeSwitch mode={mode} onChange={setMode} />

            <SectionLabel icon={<PencilIcon className="h-4 w-4" />}>
              {mode === "solo"
                ? "みんなの希望を入力"
                : "エリアを決めて部屋を作る"}
            </SectionLabel>

            {mode === "group" && (
              <p className="rounded-2xl bg-info/10 px-4 py-3 text-sm text-base-content/70">
                エリアと検索範囲を決めて部屋を作ると、合言葉やQRコードで
                みんなを招待できます。各自が
                <span className="font-semibold">自分の端末</span>
                で希望を入力するので、他の人の希望は見えません。
              </p>
            )}

            {status && <StatusArea status={status} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "solo" && (
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
                            onChange={(e) =>
                              updateMember(index, e.target.value)
                            }
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
              )}

              {/* ── エリア・現在地 ── */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body gap-3 p-4">
                  <SectionTitle
                    icon={<LocationPinIcon className="h-4 w-4 text-primary" />}
                  >
                    エリア・現在地
                  </SectionTitle>

                  {/* 現在地 / エリア選択 の切り替え。 */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-base-200 p-1">
                    {[
                      { value: "current", label: "現在地から" },
                      { value: "area", label: "エリアを選ぶ" },
                    ].map((option) => {
                      const active = locationMode === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setLocationMode(option.value);
                            if (option.value === "current") {
                              clearAreaValidationStatus();
                            }
                          }}
                          className={`rounded-lg py-2 text-sm font-semibold transition ${
                            active
                              ? "bg-base-100 text-primary shadow-sm"
                              : "text-base-content/60"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {locationMode === "current" ? (
                    <>
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
                              現在地周辺（
                              {RANGE_OPTIONS.find(
                                (option) => option.code === range,
                              )?.label ?? "1km"}
                              以内）で探します
                            </p>
                          </div>
                        </div>
                      )}

                      {geo.kind === "error" && (
                        <p className="text-sm text-error">{geo.message}</p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <select
                        className="select select-bordered w-full rounded-xl"
                        value={largeAreaCode}
                        onChange={(e) => {
                          setLargeAreaCode(e.target.value);
                          // 大エリアを変えたら中エリアの選択はリセットする。
                          setMiddleAreaCode("");
                          clearAreaValidationStatus();
                        }}
                        aria-label="大エリア"
                      >
                        <option value="">エリア（都道府県など）を選ぶ</option>
                        {areas.largeAreas.map((area) => (
                          <option key={area.code} value={area.code}>
                            {area.name}
                          </option>
                        ))}
                      </select>

                      <select
                        className="select select-bordered w-full rounded-xl"
                        value={middleAreaCode}
                        onChange={(e) => {
                          setMiddleAreaCode(e.target.value);
                          if (e.target.value) {
                            clearAreaValidationStatus();
                          }
                        }}
                        disabled={!largeAreaCode}
                        aria-label="中エリア"
                      >
                        <option value="">
                          {largeAreaCode
                            ? "詳しいエリアを選ぶ"
                            : "先に上のエリアを選んでください"}
                        </option>
                        {selectedLargeArea && (
                          <option value={LARGE_AREA_ALL_VALUE}>
                            {selectedLargeArea.name} 全域
                          </option>
                        )}
                        {middleAreaOptions.map((area) => (
                          <option key={area.code} value={area.code}>
                            {area.name}
                          </option>
                        ))}
                      </select>

                      {isAreaSelectionMissing() && isAreaValidationStatus() && (
                        <p className="text-sm font-semibold text-error">
                          エリアを選択してください。
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── 検索範囲（現在地モードのみ） ── */}
              {locationMode === "current" && (
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body gap-3 p-4">
                    <SectionTitle
                      icon={<TargetIcon className="h-4 w-4 text-primary" />}
                    >
                      検索範囲
                    </SectionTitle>

                    <div className="grid grid-cols-5 gap-2">
                      {RANGE_OPTIONS.map((option) => {
                        const active = range === option.code;
                        return (
                          <button
                            key={option.code}
                            type="button"
                            className={`min-h-10 rounded-xl px-1 py-2 text-sm font-semibold transition ${
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
              )}

              {mode === "solo" ? (
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
              ) : (
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="btn btn-accent w-full gap-2 rounded-xl text-base shadow-md"
                  disabled={creating}
                >
                  {creating ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <ArrowRightIcon className="h-5 w-5" />
                  )}
                  {creating
                    ? "部屋を作成しています..."
                    : "この条件で部屋を作る"}
                </button>
              )}
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 結果画面。上部の「条件を変更する」で入力画面へ戻れる。 */}
            <button
              ref={resultTopRef}
              type="button"
              onClick={handleBackToInput}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-base-content/70 transition hover:text-base-content"
            >
              <span aria-hidden>←</span> 条件を変更する
            </button>

            {status && <StatusArea status={status} />}

            {result && (
              <>
                <ConditionsCard conditions={result.conditions} />
                <AiComment comment={result.summary} />
                <ShopList
                  shops={result.shops}
                  areaLabel={result.areaLabel}
                  pageScrollTargetRef={resultTopRef}
                  rangeLabel={
                    // エリアモード（range=null）では範囲ラベルを出さない。
                    result.range
                      ? (RANGE_OPTIONS.find(
                          (option) => option.code === result.range,
                        )?.label ?? "")
                      : undefined
                  }
                />

                <p className="pt-1 text-center text-xs text-base-content/50 lg:text-left">
                  ※表示されている距離は直線距離です。実際の徒歩時間とは異なる場合があります。
                </p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/** 入力方法（1台 / 部屋）を切り替えるセグメントコントロール。 */
function ModeSwitch({ mode, onChange }) {
  const options = [
    { value: "solo", label: "1台でまとめて", icon: PencilIcon },
    { value: "group", label: "みんなの端末で", icon: PeopleIcon },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-base-100 p-1.5 shadow-sm">
      {options.map((option) => {
        const active = mode === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/60 hover:bg-base-200"
            }`}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </button>
        );
      })}
    </div>
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
