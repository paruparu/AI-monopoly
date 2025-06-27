# AI Monopoly Game

AI モノポリーゲームは、OpenAIのGPT-3.5-turboを利用してCPUプレイヤーの交渉を実装したモノポリーゲームです。

## セットアップ

1. リポジトリをクローンします:
   ```bash
   git clone [リポジトリのURL]
   cd AI-monopoly
   ```

2. 依存関係をインストールします:
   ```bash
   npm install
   ```

3. 環境変数を設定します:
   - `.env` ファイルをプロジェクトのルートディレクトリに作成します
   - `.env.template` を参考に、OpenAIのAPIキーを設定してください

4. サーバーを起動します:
   ```bash
   node server.js
   ```

5. ブラウザで `http://localhost:3000` を開いてゲームを開始します。

## 環境変数

以下の環境変数が必要です:

- `OPENAI_API_KEY`: OpenAIのAPIキー

## 必要なもの

- Node.js (v14 以上)
- npm (Node.jsに同梱)
- OpenAI API キー

## ライセンス

このプロジェクトはオープンソースです。詳細はLICENSEファイルを参照してください。
