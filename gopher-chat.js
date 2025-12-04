// ウロウロするGopherくんのチャットボット
class WanderingGopher {
    constructor() {
        this.gopher = null;
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.speed = 2;
        this.size = 80;
        this.isMoving = false;
        this.direction = 1; // 1: right, -1: left
        this.chatOpen = false;

        this.init();
    }

    init() {
        // Gopherくんの要素を作成
        this.gopher = document.createElement('div');
        this.gopher.className = 'wandering-gopher';
        this.gopher.innerHTML = `
            <img src="/gopher_bot.png" alt="Gopher" draggable="false">
            <div class="gopher-speech-bubble">クリックして話しかけてね！</div>
        `;
        document.body.appendChild(this.gopher);

        // 初期位置をランダムに設定
        this.setRandomPosition();

        // クリックイベント
        this.gopher.addEventListener('click', () => this.openChat());

        // 定期的に新しい目標地点を設定
        setInterval(() => this.setNewTarget(), 3000);

        // アニメーションループ
        this.animate();

        // 3秒後に吹き出しを非表示
        setTimeout(() => {
            const bubble = this.gopher.querySelector('.gopher-speech-bubble');
            if (bubble) bubble.style.display = 'none';
        }, 5000);
    }

    setRandomPosition() {
        const maxX = window.innerWidth - this.size;
        const maxY = window.innerHeight - this.size;

        this.x = Math.random() * maxX;
        this.y = Math.random() * maxY;
        this.targetX = this.x;
        this.targetY = this.y;

        this.updatePosition();
    }

    setNewTarget() {
        if (this.chatOpen) return; // チャット中は動かない

        const maxX = window.innerWidth - this.size;
        const maxY = window.innerHeight - this.size;

        // 画面内のランダムな位置を目標に設定
        this.targetX = Math.random() * maxX;
        this.targetY = Math.random() * maxY;
        this.isMoving = true;
    }

    animate() {
        if (this.isMoving && !this.chatOpen) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > this.speed) {
                // 目標に向かって移動
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;

                // 向きを更新
                if (dx > 0 && this.direction !== 1) {
                    this.direction = 1;
                    this.gopher.style.transform = `scaleX(1)`;
                } else if (dx < 0 && this.direction !== -1) {
                    this.direction = -1;
                    this.gopher.style.transform = `scaleX(-1)`;
                }

                this.updatePosition();
            } else {
                // 目標に到達
                this.x = this.targetX;
                this.y = this.targetY;
                this.isMoving = false;
                this.updatePosition();
            }
        }

        requestAnimationFrame(() => this.animate());
    }

    updatePosition() {
        this.gopher.style.left = `${this.x}px`;
        this.gopher.style.top = `${this.y}px`;
    }

    openChat() {
        this.chatOpen = true;
        this.isMoving = false;

        // チャットモーダルを表示
        const modal = document.getElementById('gopher-chat-modal');
        if (modal) {
            // Gopherくんの位置に基づいてモーダルを配置
            this.positionModalNearGopher(modal);
            modal.classList.add('active');

            // 吹き出しを非表示
            const bubble = this.gopher.querySelector('.gopher-speech-bubble');
            if (bubble) bubble.style.display = 'none';
        }
    }

    positionModalNearGopher(modal) {
        const modalWidth = 400;
        const modalHeight = 500;
        const offset = 100; // Gopherくんとモーダルの間隔
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Gopherくんの中心位置
        const gopherCenterX = this.x + this.size / 2;
        const gopherCenterY = this.y + this.size / 2;

        let modalX, modalY;
        let tailClass = '';

        // 画面の位置に応じて最適な配置を決定
        const isLeft = gopherCenterX < windowWidth / 2;
        const isTop = gopherCenterY < windowHeight / 2;

        if (isLeft) {
            // Gopherが左側にいる場合は右側に表示
            modalX = this.x + this.size + offset;
            modalY = Math.max(20, Math.min(this.y - modalHeight / 2 + this.size / 2, windowHeight - modalHeight - 20));
            tailClass = 'tail-left';
        } else {
            // Gopherが右側にいる場合は左側に表示
            modalX = this.x - modalWidth - offset;
            modalY = Math.max(20, Math.min(this.y - modalHeight / 2 + this.size / 2, windowHeight - modalHeight - 20));
            tailClass = 'tail-right';
        }

        // 画面外に出ないように調整
        modalX = Math.max(20, Math.min(modalX, windowWidth - modalWidth - 20));
        modalY = Math.max(20, Math.min(modalY, windowHeight - modalHeight - 20));

        // 位置を設定
        modal.style.left = `${modalX}px`;
        modal.style.top = `${modalY}px`;
        modal.style.bottom = 'auto';
        modal.style.right = 'auto';

        // 吹き出しの向きを設定
        modal.className = 'gopher-chat-modal';
        modal.classList.add(tailClass);
    }

    closeChat() {
        this.chatOpen = false;
        const modal = document.getElementById('gopher-chat-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// チャットボット機能
class GopherChatBot {
    constructor() {
        this.messages = [];
        this.apiEndpoint = 'http://localhost:8080/api/chat'; // バックエンドAPIのエンドポイント
        this.init();
    }

    init() {
        const sendBtn = document.getElementById('gopher-send-btn');
        const input = document.getElementById('gopher-input');
        const closeBtn = document.getElementById('gopher-close-btn');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.gopherInstance.closeChat();
            });
        }

        // 提案ボタンのイベント
        document.querySelectorAll('.gopher-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.textContent;
                this.sendMessageWithText(message);
            });
        });
    }

    async sendMessage() {
        const input = document.getElementById('gopher-input');
        const message = input.value.trim();

        if (!message) return;

        input.value = '';
        await this.sendMessageWithText(message);
    }

    async sendMessageWithText(message) {
        const messagesContainer = document.getElementById('gopher-messages');
        const welcomeSection = document.getElementById('gopher-welcome');

        // ウェルカムメッセージを非表示
        if (welcomeSection) {
            welcomeSection.style.display = 'none';
        }

        // ユーザーメッセージを追加
        this.addMessage('user', message);

        // 送信ボタンを無効化
        const sendBtn = document.getElementById('gopher-send-btn');
        if (sendBtn) sendBtn.disabled = true;

        // タイピングインジケーターを表示
        this.showTypingIndicator();

        try {
            // バックエンドAPIにリクエスト
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();

            // タイピングインジケーターを非表示
            this.hideTypingIndicator();

            if (data.error) {
                this.addMessage('bot', `エラー: ${data.error}`);
            } else {
                this.addMessage('bot', data.reply);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('bot', 'すみません、エラーが発生しました。バックエンドサーバーが起動しているか確認してください。');
            console.error('Chat error:', error);
        }

        // 送信ボタンを有効化
        if (sendBtn) sendBtn.disabled = false;

        // スクロール
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addMessage(role, content) {
        const messagesContainer = document.getElementById('gopher-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `gopher-message ${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'gopher-message-avatar';
        avatar.textContent = role === 'bot' ? '◔ϖ◔' : '👤';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'gopher-message-content';
        contentDiv.textContent = content;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('gopher-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'gopher-message bot';
        typingDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'gopher-message-avatar';
        avatar.textContent = '◔ϖ◔'; //ʕ◔ϖ◔ʔ

        const contentDiv = document.createElement('div');
        contentDiv.className = 'gopher-message-content';
        contentDiv.innerHTML = '<div class="gopher-typing-indicator"><span></span><span></span><span></span></div>';

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(contentDiv);

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.gopherInstance = new WanderingGopher();
    window.chatBotInstance = new GopherChatBot();
});
