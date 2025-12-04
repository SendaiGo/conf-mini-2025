# マルチステージビルド
FROM golang:1.25-alpine AS builder

WORKDIR /app

# 依存関係をコピー
COPY go.mod go.sum* ./
RUN go mod download

# ソースコードをコピー
COPY . .

# バイナリをビルド
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o chatbot-server .

# 実行用の軽量イメージ
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# ビルドしたバイナリをコピー
COPY --from=builder /app/chatbot-server .

# ポート設定
EXPOSE 8080

# 実行
CMD ["./chatbot-server"]
