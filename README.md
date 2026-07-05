# suimin — みんなで決めるお店

複数人が「今日何を食べたいか」を自由文で入力すると、生成AI（Gemini API）が希望条件を整理し、
ホットペッパーグルメAPIから取得した店舗候補の中から、グループ全員が納得しやすいお店を最大30件提案するWebアプリです。

このリポジトリは **プロトタイプ実装の段階** です。フロントエンド・バックエンドの通信基盤に加えて、
Gemini API による希望条件の整理と HotPepper Gourmet API による店舗候補取得を接続しています。

> 📖 開発を始める前に [**開発ルール（CONTRIBUTING.md）**](./CONTRIBUTING.md) を読んでください。
> Issueの切り方・ブランチ命名規則・PRの流れをまとめています。

## 実装済みの範囲

- フロントエンド（React + Vite + Tailwind CSS v4 + DaisyUI + React Router）の初期構築
- バックエンド（Node.js + Express + Zod + CORS + dotenv）の初期構築
- フロントエンド → バックエンドの `POST /api/recommend` 通信（`fetch`）
- Zod によるリクエストバリデーション
- 共通エラーハンドリング（400 / 404 / 500）
- Biome による Lint・フォーマット・import 整理
- DaisyUI による最低限のトップページ
- Gemini API による自由文の条件整理
- ホットペッパーグルメAPI による店舗候補取得
- AI条件に基づく店舗スコアリングと最大30件の返却
- 1台入力モードと、ルームを作って複数端末から希望を集めるモード

## 未実装の範囲

- データベース
- MCP

`POST /api/recommend` とルームの検索実行では、毎回 Gemini API と HotPepper Gourmet API を呼び出します。
`GEMINI_API_KEY` / `HOTPEPPER_API_KEY` が未設定、または外部API呼び出しに失敗した場合は、
固定データにフォールバックせずエラーを返します。

## 技術スタック

| 区分 | 技術 |
| --- | --- |
| フロントエンド | React 19, JavaScript, Vite 6, Tailwind CSS v4, DaisyUI 5, React Router 7, fetch |
| バックエンド | Node.js, TypeScript (ES Modules), Express 4, Zod, CORS, dotenv |
| 品質管理 | Biome（Lint / Format / organize imports） |
| 外部サービス | Gemini API（Google AI Studio）, HotPepper Gourmet API |
| デプロイ想定 | バックエンド: Render / フロントエンド: Vercel または Render Static Site |

バックエンドは TypeScript、フロントエンドは JavaScript / JSX です。

## 必要な Node.js バージョン

- Node.js **20 以上**（推奨: 22 以上）
- `node --watch` を利用するため、比較的新しい Node.js が必要です。

## npm workspaces について

このリポジトリは **npm workspaces** による monorepo です。

```text
project-root/       ← ルート。Biome と共通スクリプトを管理
├── frontend/       ← workspace: frontend
└── backend/        ← workspace: backend
```

ルートで `npm install` すると、両ワークスペースの依存関係がまとめてインストールされます。
ルートのスクリプトから各ワークスペースのコマンドを呼び出せます。

## セットアップ

```bash
# 1. 依存関係のインストール（ルートで実行）
npm install

# 2. 環境変数ファイルを用意
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## 環境変数

### バックエンド（`backend/.env`）

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
HOTPEPPER_API_KEY=
```

- `FRONTEND_ORIGIN`: CORS の許可元。
- `GEMINI_API_KEY` / `HOTPEPPER_API_KEY`: Gemini API と HotPepper Gourmet API の接続で使用します。どちらも必須です。
- `GEMINI_MODEL`: Gemini のモデル名。未設定時は `gemini-3.5-flash` を使います。
- **API キーはフロントエンドには置きません。**

### フロントエンド（`frontend/.env`）

```env
VITE_API_BASE_URL=http://localhost:3000
```

- 未設定の場合、開発環境では `http://localhost:3000` にフォールバックします。

`.env` は Git 管理対象外です（`.gitignore` 済み）。

## 開発サーバーの起動

```bash
npm run dev
```

- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:3000

（`concurrently` でフロントとバックを同時に起動します。）

## 本番ビルド

```bash
npm run build
```

- ルートの `npm run build` はフロントエンド（`frontend/dist`）とバックエンド（`backend/dist`）をビルドします。

## Biome（Lint / Format）

```bash
npm run check         # Lint + Format + import整理 をまとめて確認・修正
npm run lint          # Lint のみ
npm run format        # ファイルを整形
npm run format:check  # 整形差分がないか確認（書き換えなし）
```

設定はルートの `biome.json` にあります（インデント2スペース / ダブルクォート / セミコロン必須 / recommended ルール）。

## ディレクトリ構成

```text
project-root/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── recommend.js      # fetch による API 通信
│   │   ├── components/           # （今後追加用）
│   │   ├── pages/
│   │   │   └── HomePage.jsx      # トップページ
│   │   ├── App.jsx               # ルーティング定義
│   │   ├── main.jsx              # エントリポイント
│   │   └── index.css             # Tailwind + DaisyUI 読み込み
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── recommend.ts      # POST /api/recommend
│   │   │   ├── rooms.ts          # ルーム作成・参加・結果取得
│   │   │   └── areas.ts          # HotPepper エリアマスタ取得
│   │   ├── schemas/
│   │   │   └── recommend.ts      # Zod スキーマ
│   │   ├── services/
│   │   │   ├── areas.ts          # HotPepper エリアマスタAPI 接続
│   │   │   ├── gemini.ts         # Gemini API 接続
│   │   │   └── hotpepper.ts      # HotPepper API 接続
│   │   ├── app.ts                # Express アプリ設定
│   │   └── index.ts              # サーバー起動
│   ├── .env.example
│   └── package.json
│
├── biome.json
├── .gitignore
├── README.md
└── package.json                  # ルート（npm workspaces）
```

## API 仕様

ベースパス: バックエンドの `/api`

### `GET /health`

ヘルスチェック。

- レスポンス: `200`

```json
{ "status": "ok" }
```

### `POST /api/recommend`

店舗推薦リクエスト。

リクエストボディ:

```json
{
  "location": { "lat": 35.658, "lng": 139.701 },
  "members": [
    { "text": "金欠なので安めがいい。昨日ラーメンを食べたので麺類以外。" },
    { "text": "静かに話せる店がいい。駅からあまり歩きたくない。" }
  ]
}
```

レスポンス:

```json
{
  "conditions": {
    "budgetLevel": "low",
    "excludedGenres": ["ラーメン"],
    "preferredGenres": ["和食"],
    "preferredAtmosphere": ["静か", "駅近"],
    "maxWalkingMinutes": 5,
    "summary": "予算は安めで、静かに話せる駅近のお店が合いそうです。"
  },
  "summary": "予算は安めで、静かに話せる駅近のお店が合いそうです。",
  "shops": [
    {
      "id": "J001234567",
      "name": "和ごはん かえで",
      "genre": "和食",
      "budget": "3000円",
      "access": "駅から徒歩3分（直線約250m）",
      "reason": "和食として静か・駅近の希望に合いやすい候補です。",
      "distanceMeters": 250,
      "matchScore": 92,
      "iconType": "bowl",
      "url": "https://www.hotpepper.jp/..."
    }
  ],
  "areaLabel": "現在地周辺",
  "range": 3
}
```

#### バリデーション仕様（Zod）

- `location` または `areaCode` のどちらかは必須。`location.lat` / `location.lng` は number。
- `lat` は -90〜90、`lng` は -180〜180。
- `members` は1人以上の配列。`members[].text` は1〜500文字。空白のみは無効（trim後に判定）。

不正な入力時は `400`:

```json
{
  "error": "Validation Error",
  "details": [
    { "path": "members.0.text", "message": "1文字以上入力してください" }
  ]
}
```

#### その他のステータス

- 存在しない API: `404` → `{ "error": "Not Found" }`
- 想定外のエラー: `500` → `{ "error": "Internal Server Error" }`

本番環境ではスタックトレース・APIキー・環境変数・ファイルパス等をレスポンスに含めません。

## 今後の実装予定箇所

- **永続化**: 現在のルーム情報はメモリストアです。再起動で消えるため、必要に応じてDBへ置き換えます。

## UI（Tailwind CSS / DaisyUI）

- Tailwind CSS: **v4**
- DaisyUI: **v5**
- 設定場所: `frontend/src/index.css`

```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: cupcake --default;
}
```

- 使用テーマ: **cupcake**（`frontend/index.html` の `<html data-theme="cupcake">`）
- ダークモード切り替えは実装していません。
- 使用 DaisyUI コンポーネント: `navbar` / `card` / `textarea` / `input` / `button` / `alert` / `loading` / `badge`

## デプロイ

### バックエンド（Render / Web Service）

#### 方法A: Root Directory を `backend` にする

```text
Root Directory: backend
Build Command:  npm install && npm run build
Start Command:  npm run start
```

#### 方法B: リポジトリルートから npm workspaces を使う

```text
Root Directory: （ルートのまま）
Build Command:  npm install && npm run build -w backend
Start Command:  npm run start -w backend
```

Render の環境変数に以下を設定してください。

```text
FRONTEND_ORIGIN   ← フロントエンドの本番URL（例: https://your-frontend.vercel.app）
GEMINI_API_KEY
HOTPEPPER_API_KEY
```

`PORT` は Render が自動的に設定する値を利用します（コードは `process.env.PORT` を参照）。

### フロントエンド（Vercel）

```text
Root Directory:   frontend
Build Command:    npm run build
Output Directory: dist
```

環境変数:

```text
VITE_API_BASE_URL   ← Render にデプロイしたバックエンドのURL（例: https://your-backend.onrender.com）
```

### フロントエンド（Render Static Site）

```text
Root Directory:    frontend
Build Command:     npm install && npm run build
Publish Directory: dist
```

環境変数:

```text
VITE_API_BASE_URL   ← Render にデプロイしたバックエンドのURL
```
