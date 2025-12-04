# Cloud Run デプロイ手順

## 前提条件

1. Google Cloud CLIのインストール
```bash
# macOS
brew install --cask google-cloud-sdk

# 初期化
gcloud init
```

2. 必要なAPIの有効化
```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## デプロイ方法

### 方法1: 自動デプロイスクリプト（推奨）

```bash
cd backend

# デプロイスクリプトに実行権限を付与
chmod +x deploy.sh

# PROJECT_IDを編集
# deploy.sh内のyour-project-idを実際のプロジェクトIDに変更

# デプロイ実行
OPENAI_API_KEY=your_openai_api_key ./deploy.sh
```

### 方法2: 手動デプロイ

```bash
cd backend

# Cloud Runにデプロイ
gcloud run deploy gopher-chatbot \
    --source . \
    --region asia-northeast1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars OPENAI_API_KEY=your_openai_api_key \
    --project your-project-id
```

### 方法3: Dockerイメージを使用

```bash
cd backend

# イメージをビルド
docker build -t gcr.io/your-project-id/gopher-chatbot:latest .

# Container Registryにプッシュ
docker push gcr.io/your-project-id/gopher-chatbot:latest

# Cloud Runにデプロイ
gcloud run deploy gopher-chatbot \
    --image gcr.io/your-project-id/gopher-chatbot:latest \
    --region asia-northeast1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars OPENAI_API_KEY=your_openai_api_key \
    --project your-project-id
```

## デプロイ後の設定

1. **サービスURLを取得**
```bash
gcloud run services describe gopher-chatbot \
    --region asia-northeast1 \
    --format 'value(status.url)'
```

2. **フロントエンドのAPIエンドポイントを更新**

`gopher-chat.js`の以下の行を更新：
```javascript
this.apiEndpoint = 'https://your-cloud-run-url.run.app/api/chat';
```

## 環境変数の管理

### Secret Managerを使用（推奨）

```bash
# シークレットを作成
echo -n "your-openai-api-key" | gcloud secrets create openai-api-key --data-file=-

# Cloud Runサービスにシークレットを設定
gcloud run services update gopher-chatbot \
    --update-secrets OPENAI_API_KEY=openai-api-key:latest \
    --region asia-northeast1
```

## トラブルシューティング

### ログの確認
```bash
gcloud run logs read gopher-chatbot --region asia-northeast1 --limit 50
```

### サービスの詳細確認
```bash
gcloud run services describe gopher-chatbot --region asia-northeast1
```

### CORSエラーが出る場合
- main.goのCORS設定を確認
- フロントエンドのドメインを許可リストに追加

## コスト最適化

Cloud Runは以下の料金体系：
- リクエスト数に応じた課金
- CPU使用時間に応じた課金
- メモリ使用量に応じた課金

無料枠：
- 月間200万リクエストまで無料
- 36万vCPU秒まで無料
- 18万GiB秒まで無料

詳細: https://cloud.google.com/run/pricing
