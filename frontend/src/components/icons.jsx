/**
 * アプリ共通のインラインSVGアイコン集。
 *
 * すべて 24x24 の viewBox で currentColor を使うため、
 * 呼び出し側は `className` でサイズ（h-4 w-4 など）と色（text-primary など）を指定する。
 * 絵文字と違いOS差が出ず、テーマ色に追従できる。
 */

/** 塗りアイコン共通のsvgラッパー。 */
function FilledIcon({ className, children }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 線アイコン共通のsvgラッパー。 */
function StrokeIcon({ className, children }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 2人の人物（ロゴ）。 */
export function PeopleIcon({ className }) {
  return (
    <FilledIcon className={className}>
      <path d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.7 0-8 1.34-8 4v3h9.5v-2.5c0-1.3.63-2.44 1.6-3.28A13.6 13.6 0 0 0 8 13Zm8 0c-.35 0-.74.02-1.15.06C16.16 14.06 17 15.3 17 17v3h7v-3c0-2.66-5.3-4-8-4Z" />
    </FilledIcon>
  );
}

/** 1人の人物。 */
export function PersonIcon({ className }) {
  return (
    <FilledIcon className={className}>
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.34 0-10 1.67-10 5v3h20v-3c0-3.33-6.66-5-10-5Z" />
    </FilledIcon>
  );
}

/** ハンバーガーメニュー。 */
export function MenuIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </StrokeIcon>
  );
}

/** 鉛筆（入力・編集）。 */
export function PencilIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </StrokeIcon>
  );
}

/** 位置ピン。 */
export function LocationPinIcon({ className }) {
  return (
    <FilledIcon className={className}>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </FilledIcon>
  );
}

/** 的（検索範囲）。 */
export function TargetIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** チェック付き円（取得成功）。 */
export function CheckCircleIcon({ className }) {
  return (
    <FilledIcon className={className}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4Z" />
    </FilledIcon>
  );
}

/** 虫眼鏡（検索）。 */
export function SearchIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** きらめき（AI）。 */
export function SparklesIcon({ className }) {
  return (
    <FilledIcon className={className}>
      <path d="M12 2l2.2 6.2L20.5 10.4l-6.3 2.2L12 19l-2.2-6.4L3.5 10.4l6.3-2.2L12 2Z" />
      <path d="M18.5 3l.8 2.3 2.3.8-2.3.8-.8 2.3-.8-2.3L15.4 6l2.3-.8L18.5 3Z" />
    </FilledIcon>
  );
}

/** 円マーク（予算）。 */
export function YenIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M12 12 7 4M12 12l5-8M12 12v9M8 13h8M8 16.5h8" />
    </StrokeIcon>
  );
}

/** ×付き円（避けたい）。 */
export function BanIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9.5 9.5 5 5m0-5-5 5" />
    </StrokeIcon>
  );
}

/** ハート（重視）。 */
export function HeartIcon({ className }) {
  return (
    <FilledIcon className={className}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
    </FilledIcon>
  );
}

/** 歩く人（アクセス・距離）。 */
export function WalkIcon({ className }) {
  return (
    <FilledIcon className={className}>
      <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7Z" />
    </FilledIcon>
  );
}

/** どんぶり（和食・定食のサムネ）。 */
export function BowlIcon({ className }) {
  return (
    <FilledIcon className={className}>
      <path d="M2.5 10.5a1 1 0 0 0-1 1 10.5 10.5 0 0 0 6 9.49V21a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-.01a10.5 10.5 0 0 0 6-9.49 1 1 0 0 0-1-1h-19Z" />
    </FilledIcon>
  );
}

/** コーヒーカップ（カフェのサムネ）。 */
export function CoffeeIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <path d="M6 1v3M10 1v3M14 1v3" />
    </StrokeIcon>
  );
}

/** 履歴（時計＋戻る矢印）。 */
export function HistoryIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l3 2" />
    </StrokeIcon>
  );
}

/** フォーク＆ナイフ（サムネ既定）。 */
export function UtensilsIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2M5 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </StrokeIcon>
  );
}

/** 開いた本（使い方）。 */
export function BookIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M12 6.5C10.5 5 8.5 4.5 6.5 4.5 5 4.5 3.5 4.8 2.5 5.3v13c1-.5 2.5-.8 4-.8 2 0 4 .5 5.5 2 1.5-1.5 3.5-2 5.5-2 1.5 0 3 .3 4 .8v-13c-1-.5-2.5-.8-4-.8-2 0-4 .5-5.5 2Z" />
      <path d="M12 6.5v13" />
    </StrokeIcon>
  );
}

/** ？付き円（よくある質問）。 */
export function QuestionIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" />
      <path d="M12 17h.01" />
    </StrokeIcon>
  );
}

/** ホーム（家）。 */
export function HomeIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h5v-6h4v6h5V10" />
    </StrokeIcon>
  );
}

/** 右向き矢印。 */
export function ArrowRightIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </StrokeIcon>
  );
}

/** 吹き出し（希望・自由文）。 */
export function ChatIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
    </StrokeIcon>
  );
}

/** 電球（ヒント）。 */
export function BulbIcon({ className }) {
  return (
    <StrokeIcon className={className}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v.3h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z" />
    </StrokeIcon>
  );
}
