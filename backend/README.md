# Go Conference mini 2026 Chatbot Backend

OpenAI APIを使用したチャットボットのバックエンドサーバー

## セットアップ

1. 環境変数の設定

```bash
cp .env.example .env
# .envファイルにOpenAI APIキーを設定してください
```

2. 依存関係のインストール

```bash
go mod tidy
```

3. サーバーの起動

```bash
# 環境変数を読み込んで起動
export $(cat .env | xargs) && go run main.go
```

または

```bash
OPENAI_API_KEY=your_key_here go run main.go
```

## API エンドポイント

### POST /api/chat

チャットメッセージを送信

**リクエスト:**
```json
{
  "message": "仙台のおすすめの食べ物は？"
}
```

**レスポンス:**
```json
{
  "reply": "仙台といえば牛タンが有名です..."
}
```

### GET /health

ヘルスチェック

**レスポンス:**
```json
{
  "status": "ok"
}
```

## ビルド

```bash
go build -o chatbot-server main.go
```

## 本番環境へのデプロイ

環境変数 `OPENAI_API_KEY` を設定してください。
