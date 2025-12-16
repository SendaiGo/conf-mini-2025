package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}

type ChatResponse struct {
	Reply string `json:"reply,omitempty"`
	Error string `json:"error,omitempty"`
}

type OpenAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIRequest struct {
	Model    string          `json:"model"`
	Messages []OpenAIMessage `json:"messages"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message OpenAIMessage `json:"message"`
	} `json:"choices"`
}

const systemPrompt = `あなたは「Go Conference mini in Sendai 2026」のアシスタントです。
このカンファレンスは2026年2月21日（土）に仙台で開催されます。

以下の情報を参考に、親切に質問に答えてください：

【カンファレンス情報】
- 日時: 2026年2月21日（土）10:00〜17:00
- 会場: アーバンネットビル仙台中央 カンファレンスルーム
- 住所: 〒980-0021 宮城県仙台市青葉区中央4丁目4-19
- アクセス: JR仙台駅西口より徒歩3分
- 参加費: 無料（事前登録制）
- 定員: 50名〜（先着順）
- テーマ: Go Forward Together - 東北から広がるGoコミュニティ

【スケジュール】
- 2025.11.05: CfS募集開始
- 2025.12.15: CfS募集締切
- 2025.12.25: 登壇者発表 & 参加登録開始
- 2026.02.20: 前夜祭 19:00〜21:00
- 2026.02.21: カンファレンス本編 10:00〜17:00 / 懇親会 18:00〜20:00

【仙台のおすすめグルメ】
- 牛タン: 仙台名物。駅周辺に多数の名店があります
- ずんだ餅/ずんだシェイク: 枝豆を使った郷土菓子
- 笹かまぼこ: 仙台の伝統的な練り物
- 海鮮: 新鮮な魚介類が楽しめます
- ラーメン: 仙台味噌ラーメンが有名です
- 定食屋: 大盛や もり達 仙台イービーンズ店のボリューム満点の定食が人気です
- マーボー焼きそば: 仙台発祥のB級グルメ
- 徒歩１分で仙台朝市もあります！コロッケや海産物（牡蠣や刺し身など）もおすすめです。

【イベントの特徴】
- 東北初のGoカンファレンス
- 地元コミュニティとの連携
- 多様なスピーカー陣
- 参加者同士の交流重視

【スポンサー種別】
- Masamune Sponsor（政宗スポンサー）: UPSIDER、SECURE CYCLE
- Gyutan Sponsor（牛タンスポンサー）: ANDPAD
- Zunda Sponsor（ずんだスポンサー）
- Community Sponsor（コミュニティスポンサー）: Go Connect, Sendai.go, Woman Who Go Tokyo
- 会場スポンサー: クラウドスミス株式会社
- ドリンクスポンサー: ネットプロテクションズ

【リンク】
- Connpass: https://sendaigo.connpass.com/
- CfS応募: https://sessionize.com/go-conference-mini-2026-in-sendai/
- お問い合わせ: sendai.gocon@gmail.com

仙台観光やグルメについても質問があれば、お答えします！`

func main() {
	// Ginのモード設定（本番環境ではreleaseモードを使用）
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.Default()

	// CORS設定
	r.Use(corsMiddleware())

	// ヘルスチェック
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// チャットエンドポイント
	r.POST("/api/chat", chatHandler)

	// サーバー起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

// CORSミドルウェア
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// 許可するオリジンのリスト
		allowedOrigins := []string{
			"http://localhost:9003",
			"https://sendaigo.jp",
			"http://sendaigo.jp",
		}

		// オリジンが許可リストに含まれているかチェック
		isAllowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				isAllowed = true
				break
			}
		}

		// 許可されている場合のみオリジンを設定
		if isAllowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	}
}

// チャットハンドラー
func chatHandler(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ChatResponse{
			Error: "Invalid request format",
		})
		return
	}

	// OpenAI APIキーの確認
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Error: "OpenAI API key not configured",
		})
		return
	}

	// OpenAI APIリクエストの作成
	openAIReq := OpenAIRequest{
		Model: "gpt-4o-mini",
		Messages: []OpenAIMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: req.Message},
		},
	}

	reqBody, err := json.Marshal(openAIReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Error: "Failed to create request",
		})
		return
	}

	// OpenAI APIへのリクエスト
	client := &http.Client{Timeout: 30 * time.Second}
	apiReq, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(reqBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Error: "Failed to create API request",
		})
		return
	}

	apiReq.Header.Set("Content-Type", "application/json")
	apiReq.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := client.Do(apiReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Error: "Failed to call OpenAI API",
		})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Error: "Failed to read API response",
		})
		return
	}

	if resp.StatusCode != http.StatusOK {
		log.Printf("OpenAI API error: %s", string(body))
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Error: "OpenAI API returned an error",
		})
		return
	}

	// レスポンスの解析
	var openAIResp OpenAIResponse
	if err := json.Unmarshal(body, &openAIResp); err != nil {
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Error: "Failed to parse API response",
		})
		return
	}

	if len(openAIResp.Choices) == 0 {
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Error: "No response from AI",
		})
		return
	}

	// 成功レスポンスを返す
	c.JSON(http.StatusOK, ChatResponse{
		Reply: openAIResp.Choices[0].Message.Content,
	})
}
