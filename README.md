# suimin — みんなで決めるお店

複数人が「今日何を食べたいか」を自由文で入力すると、生成AI（Gemini API）が希望条件を整理し、
ホットペッパーグルメAPIから取得した店舗候補の中から、グループ全員が納得しやすいお店を3件提案するWebアプリです。

このリポジトリは **初期環境構築の段階** です。フロントエンド・バックエンドの通信基盤と
バリデーション・エラーハンドリング・Lint/Format 環境を整えています。

> 📖 開発を始める前に [**開発ルール（CONTRIBUTING.md）**](./CONTRIBUTING.md) を読んでください。
> Issueの切り方・ブランチ命名規則・PRの流れをまとめています。

## 実装済みの範囲

- フロントエンド（React + Vite + Tailwind CSS v4 + DaisyUI + React Router）の初期構築
- バックエンド（Node.js + Express + Zod + CORS + dotenv）の初期構築
- フロントエンド → バックエンドの `POST /api/recommend` 通信（`fetch`）
- Zod によるリクエストバリデーション
- 共通エラーハンドリング（400 / 404 / 500 / 501）
- Biome による Lint・フォーマット・import 整理
- DaisyUI による最低限のトップページ
- Gemini API / ホットペッパーAPI 実装用ファイルの雛形

## 未実装の範囲

- Gemini API との本接続
- ホットペッパーグルメAPI との本接続
- 店舗推薦ロジック
- 店舗データ・AI解析結果・推薦結果のモック（意図的に返しません）
- データベース
- MCP

現時点で `POST /api/recommend` は、バリデーション成功後に **HTTP 501（Not Implemented）** を返します。
これは Gemini API とホットペッパーAPI を未接続にしているためで、モックデータを返さない方針です。

## 技術スタック

| 区分 | 技術 |
| --- | --- |
| フロントエンド | React 19, JavaScript, Vite 6, Tailwind CSS v4, DaisyUI 5, React Router 7, fetch |
| バックエンド | Node.js, JavaScript (ES Modules), Express 4, Zod, CORS, dotenv |
| 品質管理 | Biome（Lint / Format / organize imports） |
| 今後の外部サービス | Gemini API（Google AI Studio）, HotPepper Gourmet API |
| デプロイ想定 | バックエンド: Render / フロントエンド: Vercel または Render Static Site |

TypeScript は使用していません（`.js` / `.jsx` のみ）。

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
HOTPEPPER_API_KEY=
```

- `FRONTEND_ORIGIN`: CORS の許可元。
- `GEMINI_API_KEY` / `HOTPEPPER_API_KEY`: 今後の実装で使用（現時点では未使用）。
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

- Vite によるフロントエンドの本番ビルドのみ実行します（出力: `frontend/dist`）。
- バックエンドは JavaScript のためビルド不要です。

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
│   │   ├── middleware/
│   │   │   └── error-handler.js  # 404 / 共通エラーハンドラー
│   │   ├── routes/
│   │   │   ├── health.js         # GET /api/health
│   │   │   └── recommend.js      # POST /api/recommend
│   │   ├── schemas/
│   │   │   └── recommend.js      # Zod スキーマ
│   │   ├── services/
│   │   │   ├── gemini.js         # Gemini API 実装予定（雛形）
│   │   │   └── hotpepper.js      # HotPepper API 実装予定（雛形）
│   │   ├── app.js                # Express アプリ設定
│   │   └── server.js             # サーバー起動
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

### `GET /api/health`

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

**現時点の挙動:** バリデーション成功後は `501 Not Implemented` を返します。

```json
{
  "error": "Not Implemented",
  "message": "店舗推薦機能はまだ実装されていません"
}
```

#### バリデーション仕様（Zod）

- `location` は必須。`location.lat` / `location.lng` は number。
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

- **Gemini API**: `backend/src/services/gemini.js` の `parseGroupPreferences()`
  自由文を検索条件（予算・除外ジャンル・希望ジャンル・雰囲気・徒歩分数など）へ構造化します。
- **HotPepper API**: `backend/src/services/hotpepper.js` の `searchShops()`
  位置情報と条件から店舗候補を取得します。
- 上記2つを `backend/src/routes/recommend.js` の 501 箇所で接続し、推薦結果を返す予定です。

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
Build Command:  npm install
Start Command:  npm run start
```

#### 方法B: リポジトリルートから npm workspaces を使う

```text
Root Directory: （ルートのまま）
Build Command:  npm install
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
