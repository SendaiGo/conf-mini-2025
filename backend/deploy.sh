#!/bin/bash

# Google Cloud プロジェクトIDを設定
PROJECT_ID="your-project-id"
REGION="asia-northeast1"
SERVICE_NAME="gopher-chatbot"

# 環境変数チェック
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable is not set"
    echo "Usage: OPENAI_API_KEY=your_key ./deploy.sh"
    exit 1
fi

echo "Building and deploying to Cloud Run..."

# Cloud Runにデプロイ
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars OPENAI_API_KEY=$OPENAI_API_KEY \
    --project $PROJECT_ID

echo "Deployment complete!"
echo "Your service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format 'value(status.url)'
