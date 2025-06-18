# LMS キャッチアッププロジェクト (Vue + Express + C++)

既存のNext.js + SupabaseベースのLMSを、Vue3 + Express + C++で再実装したプロジェクトです。

## 構成

- **Frontend**: Vue3 + Composition API + TypeScript + Vite
- **Backend**: Express + TypeScript (メモリ内データ管理)
- **C++ Addon**: Node.js addon (slotId分析機能)
- **E2E Test**: Cypress

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# C++アドオンのビルド
pnpm --filter slot-analyzer build
```

## 開発サーバーの起動

```bash
# フロントエンドとバックエンドを同時起動
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## 個別起動

```bash
# フロントエンドのみ
pnpm --filter frontend dev

# バックエンドのみ
pnpm --filter backend dev
```

## E2Eテスト

```bash
# 開発サーバーを起動した状態で実行
pnpm test:e2e
```

## プロジェクト構造

```
├── packages/
│   ├── frontend/     # Vue3アプリケーション
│   ├── backend/      # Express APIサーバー
│   └── addon/        # C++ Node.jsアドオン
├── e2e/              # Cypressテスト
└── package.json      # monorepoルート
```