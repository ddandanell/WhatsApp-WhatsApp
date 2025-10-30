class WhatsAppAI {
    constructor() {
        this.apiBase = '/api';
        this.currentChat = null;
        this.chats = [];
        this.refreshInterval = null;
        this.init();
    }

    async init() {
        // Check authentication
        const isAuthenticated = await this.checkAuth();
        if (isAuthenticated) {
            this.showDashboard();
            this.loadChats();
            this.startAutoRefresh();
            this.setupEventListeners();
        } else {
            this.showLogin();
            this.setupLoginForm();
        }
    }

    // ============= Authentication =============
    async checkAuth() {
        try {
            const response = await fetch(`${this.apiBase}/auth/status`, {
                credentials: 'include'
            });
            const result = await response.json();
            return result.authenticated || false;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }

    showLogin() {
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
    }

    setupLoginForm() {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.login();
        });
    }

    async login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success) {
                this.showDashboard();
                this.loadChats();
                this.startAutoRefresh();
                this.setupEventListeners();
            } else {
                errorDiv.textContent = result.error || 'Login failed';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.textContent = 'Network error';
            errorDiv.style.display = 'block';
        }
    }

    async logout() {
        try {
            await fetch(`${this.apiBase}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            if (this.refreshInterval) clearInterval(this.refreshInterval);
            this.showLogin();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // ============= Event Listeners =============
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('search-chats');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterChats(e.target.value);
            });
        }
    }

    // ============= Load Chats =============
    async loadChats() {
        try {
            const response = await fetch(`${this.apiBase}/messages/stats`, {
                credentials: 'include'
            });
            const result = await response.json();

            if (result.success) {
                // Get all messages and group by phone number
                const messagesResponse = await fetch(`${this.apiBase}/messages/recent?limit=100`, {
                    credentials: 'include'
                });
                const messagesResult = await messagesResponse.json();

                if (messagesResult.success) {
                    this.chats = this.groupMessagesByChat(messagesResult.data);
                    this.renderChats();
                    this.updateStats();
                }
            }
        } catch (error) {
            console.error('Load chats error:', error);
        }
    }

    groupMessagesByChat(messages) {
        const chatMap = new Map();

        messages.forEach(msg => {
            if (!chatMap.has(msg.phone_number)) {
                chatMap.set(msg.phone_number, {
                    phone: msg.phone_number,
                    name: this.formatPhoneName(msg.phone_number),
                    messages: [],
                    lastMessage: msg.message_text,
                    lastTime: msg.created_at,
                    unread: 0,
                    autopilot: true // Default to true
                });
            }
            chatMap.get(msg.phone_number).messages.push(msg);
        });

        // Convert to array and sort by last message time
        return Array.from(chatMap.values()).sort((a, b) => {
            return new Date(b.lastTime) - new Date(a.lastTime);
        });
    }

    formatPhoneName(phone) {
        // Remove country code and format nicely
        const cleaned = phone.replace(/[^\d]/g, '');
        if (cleaned.length > 10) {
            return '+' + cleaned.slice(0, -10) + ' ' + cleaned.slice(-10);
        }
        return phone;
    }

    renderChats() {
        const chatList = document.getElementById('chat-list');
        
        if (this.chats.length === 0) {
            chatList.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: #8696a0;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">💬</div>
                    <p>No conversations yet</p>
                    <p style="font-size: 0.85rem; margin-top: 5px;">Messages will appear here when someone contacts you</p>
                </div>
            `;
            return;
        }

        chatList.innerHTML = this.chats.map(chat => `
            <div class="chat-item ${this.currentChat && this.currentChat.phone === chat.phone ? 'active' : ''}" 
                 onclick="app.selectChat('${chat.phone}')">
                <div class="chat-avatar">${this.getInitial(chat.name)}</div>
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-preview">${this.truncate(chat.lastMessage, 40)}</div>
                </div>
                <div class="chat-meta">
                    <div class="chat-time">${this.formatTime(chat.lastTime)}</div>
                    <div class="autopilot-badge ${chat.autopilot ? '' : 'off'}">
                        ${chat.autopilot ? '🤖 ON' : 'OFF'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getInitial(name) {
        return name.charAt(name.indexOf(' ') > 0 ? name.indexOf(' ') + 1 : 0).toUpperCase();
    }

    truncate(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 7 * 24 * 60 * 60 * 1000) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    filterChats(query) {
        const filtered = query ? this.chats.filter(chat => 
            chat.name.toLowerCase().includes(query.toLowerCase()) ||
            chat.phone.includes(query)
        ) : this.chats;

        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = filtered.map(chat => `
            <div class="chat-item ${this.currentChat && this.currentChat.phone === chat.phone ? 'active' : ''}" 
                 onclick="app.selectChat('${chat.phone}')">
                <div class="chat-avatar">${this.getInitial(chat.name)}</div>
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-preview">${this.truncate(chat.lastMessage, 40)}</div>
                </div>
                <div class="chat-meta">
                    <div class="chat-time">${this.formatTime(chat.lastTime)}</div>
                    <div class="autopilot-badge ${chat.autopilot ? '' : 'off'}">
                        ${chat.autopilot ? '🤖 ON' : 'OFF'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ============= Chat Selection =============
    async selectChat(phone) {
        const chat = this.chats.find(c => c.phone === phone);
        if (!chat) return;

        this.currentChat = chat;
        this.renderChats(); // Re-render to show active state
        this.renderChatArea(chat);
    }

    renderChatArea(chat) {
        const chatArea = document.getElementById('chat-area');
        
        chatArea.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar">${this.getInitial(chat.name)}</div>
                    <div>
                        <div class="chat-header-name">${chat.name}</div>
                        <div class="chat-header-status">${chat.phone}</div>
                    </div>
                </div>
                <div class="autopilot-toggle">
                    <span class="toggle-label">Autopilot</span>
                    <label class="toggle-switch">
                        <input type="checkbox" ${chat.autopilot ? 'checked' : ''} 
                               onchange="app.toggleAutopilot('${chat.phone}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="messages-container" id="messages-container">
                ${this.renderMessages(chat.messages)}
            </div>
            
            <div class="message-input-container">
                <input type="text" class="message-input" id="message-input" 
                       placeholder="Type a message" 
                       onkeypress="if(event.key==='Enter') app.sendMessage()">
                <button class="send-btn" onclick="app.sendMessage()">
                    ➤
                </button>
            </div>
        `;

        // Scroll to bottom
        setTimeout(() => {
            const container = document.getElementById('messages-container');
            if (container) container.scrollTop = container.scrollHeight;
        }, 100);
    }

    renderMessages(messages) {
        if (!messages || messages.length === 0) {
            return `
                <div style="text-align: center; color: #8696a0; padding: 40px;">
                    No messages yet
                </div>
            `;
        }

        return messages.map(msg => `
            <div class="message ${msg.direction === 'outgoing' ? 'sent' : 'received'}">
                <div class="message-bubble">
                    <div class="message-text">${this.escapeHtml(msg.message_text)}</div>
                    <div class="message-time">${this.formatMessageTime(msg.created_at)}</div>
                </div>
            </div>
        `).join('');
    }

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============= Send Message =============
    async sendMessage() {
        if (!this.currentChat) return;

        const input = document.getElementById('message-input');
        const message = input.value.trim();

        if (!message) return;

        try {
            const response = await fetch(`${this.apiBase}/send-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    phoneNumber: this.currentChat.phone,
                    message: message
                })
            });

            const result = await response.json();

            if (result.success) {
                // Add message to chat
                this.currentChat.messages.push({
                    phone_number: this.currentChat.phone,
                    message_text: message,
                    direction: 'outgoing',
                    created_at: new Date().toISOString()
                });

                // Update last message
                this.currentChat.lastMessage = message;
                this.currentChat.lastTime = new Date().toISOString();

                // Clear input
                input.value = '';

                // Re-render
                this.renderChatArea(this.currentChat);
                this.renderChats();
            }
        } catch (error) {
            console.error('Send message error:', error);
            alert('Failed to send message');
        }
    }

    // ============= Autopilot Toggle =============
    async toggleAutopilot(phone, enabled) {
        const chat = this.chats.find(c => c.phone === phone);
        if (!chat) return;

        chat.autopilot = enabled;

        // Update whitelist status
        try {
            if (enabled) {
                // Add to whitelist
                await fetch(`${this.apiBase}/whitelist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        phone_number: phone,
                        name: chat.name,
                        notes: 'Auto-added via dashboard'
                    })
                });
            } else {
                // Remove from whitelist
                await fetch(`${this.apiBase}/whitelist/${encodeURIComponent(phone)}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
            }

            this.renderChats();
            this.updateStats();

            // Show notification
            console.log(`Autopilot ${enabled ? 'enabled' : 'disabled'} for ${chat.name}`);
        } catch (error) {
            console.error('Toggle autopilot error:', error);
        }
    }

    // ============= Stats =============
    updateStats() {
        document.getElementById('stat-chats').textContent = this.chats.length;
        
        const today = new Date().toDateString();
        const todayMessages = this.chats.reduce((sum, chat) => {
            return sum + chat.messages.filter(m => 
                new Date(m.created_at).toDateString() === today
            ).length;
        }, 0);
        document.getElementById('stat-messages').textContent = todayMessages;
        
        const autopilotCount = this.chats.filter(c => c.autopilot).length;
        document.getElementById('stat-autopilot').textContent = autopilotCount;
    }

    // ============= Settings =============
    openSettings() {
        document.getElementById('settings-modal').classList.add('active');
        this.loadSettings();
    }

    closeSettings() {
        document.getElementById('settings-modal').classList.remove('active');
    }

    async loadSettings() {
        try {
            const response = await fetch(`${this.apiBase}/settings`, {
                credentials: 'include'
            });
            const result = await response.json();

            if (result.success) {
                document.getElementById('config-name').value = result.data.my_name || '';
                document.getElementById('config-personality').value = result.data.my_personality || '';
                document.getElementById('config-style').value = result.data.my_writing_style || '';
                document.getElementById('config-phrases').value = result.data.my_common_phrases || '';
                document.getElementById('config-prompt').value = result.data.system_prompt || '';
            }
        } catch (error) {
            console.error('Load settings error:', error);
        }

        // Setup form submit
        const form = document.getElementById('settings-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.saveSettings();
        };
    }

    async saveSettings() {
        const settings = {
            my_name: document.getElementById('config-name').value,
            my_personality: document.getElementById('config-personality').value,
            my_writing_style: document.getElementById('config-style').value,
            my_common_phrases: document.getElementById('config-phrases').value,
            system_prompt: document.getElementById('config-prompt').value
        };

        try {
            const response = await fetch(`${this.apiBase}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(settings)
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Settings saved successfully!');
                this.closeSettings();
            } else {
                alert('❌ Failed to save settings');
            }
        } catch (error) {
            console.error('Save settings error:', error);
            alert('❌ Network error');
        }
    }

    // ============= Auto Refresh =============
    startAutoRefresh() {
        // Refresh chats every 5 seconds
        this.refreshInterval = setInterval(() => {
            this.loadChats();
            
            // If a chat is selected, refresh it
            if (this.currentChat) {
                this.selectChat(this.currentChat.phone);
            }
        }, 5000);
    }
}

// Initialize app
const app = new WhatsAppAI();

