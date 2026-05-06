// public/widget-loader.js
// This is what your customers paste into their website — just 2 lines!
// Usage:
//   <script src="https://your-domain.com/widget-loader.js" data-tenant-id="TENANT_ID"></script>

(function () {
  const script = document.currentScript;
  const tenantId = script?.getAttribute("data-tenant-id");
  const primaryColor = script?.getAttribute("data-color") || "#6C63FF";
  const botName = script?.getAttribute("data-bot-name") || "Assistant";
  const welcomeMsg =
    script?.getAttribute("data-welcome") || "Namaste! 👋 How can I help?";
  const apiBase =
    script?.getAttribute("data-api") || "https://your-domain.com";

  if (!tenantId) {
    console.error("[ChatBot] Missing data-tenant-id attribute.");
    return;
  }

  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    #cb-widget-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${primaryColor}; border: none;
      cursor: pointer; z-index: 99999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s;
    }
    #cb-widget-btn:hover { transform: scale(1.08); }
    #cb-widget-window {
      position: fixed; bottom: 92px; right: 24px;
      width: 340px; max-height: 500px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.14);
      display: none; flex-direction: column;
      z-index: 99998; overflow: hidden;
      font-family: 'Segoe UI', sans-serif; font-size: 14px;
    }
    #cb-widget-window.open { display: flex; }
    #cb-header {
      background: ${primaryColor}; padding: 14px 18px;
      color: #fff; display: flex; align-items: center; gap: 10px;
    }
    #cb-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center; font-size: 16px;
    }
    #cb-status { font-size: 12px; opacity: 0.85; }
    #cb-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f7f8fa;
    }
    .cb-msg { display: flex; }
    .cb-msg.user { justify-content: flex-end; }
    .cb-bubble {
      max-width: 80%; padding: 9px 13px; font-size: 14px;
      line-height: 1.5; word-break: break-word;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    }
    .cb-bubble.bot { background: #fff; color: #1a1a1a; border-radius: 18px 18px 18px 4px; }
    .cb-bubble.user { background: ${primaryColor}; color: #fff; border-radius: 18px 18px 4px 18px; }
    #cb-input-row {
      padding: 10px 14px; border-top: 1px solid #eee;
      display: flex; gap: 8px; align-items: center; background: #fff;
    }
    #cb-input {
      flex: 1; border: 1px solid #e0e0e0; border-radius: 24px;
      padding: 8px 14px; font-size: 14px; outline: none; background: #f7f8fa;
    }
    #cb-send {
      width: 36px; height: 36px; border-radius: 50%;
      background: ${primaryColor}; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #cb-send:disabled { background: #ddd; cursor: not-allowed; }
    #cb-brand { text-align: center; font-size: 11px; color: #bbb; padding: 6px; background: #fff; }
    @keyframes cb-bounce {
      0%,60%,100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }
    .cb-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #aaa; display: inline-block; margin: 0 2px;
    }
  `;
  document.head.appendChild(style);

  // Build HTML
  const container = document.createElement("div");
  container.innerHTML = `
    <button id="cb-widget-btn" aria-label="Open chat">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <div id="cb-widget-window" role="dialog" aria-label="Chat window">
      <div id="cb-header">
        <div id="cb-avatar">🤖</div>
        <div>
          <div style="font-weight:600;font-size:15px;">${botName}</div>
          <div id="cb-status">Online</div>
        </div>
      </div>
      <div id="cb-messages"></div>
      <div id="cb-input-row">
        <input id="cb-input" placeholder="Type a message..." autocomplete="off"/>
        <button id="cb-send" disabled aria-label="Send">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div id="cb-brand">Powered by ChatBot SaaS</div>
    </div>
  `;
  document.body.appendChild(container);

  // State
  let isOpen = false;
  let isLoading = false;
  let sessionId = null;
  let history = [];

  const btn = document.getElementById("cb-widget-btn");
  const window_ = document.getElementById("cb-widget-window");
  const messagesEl = document.getElementById("cb-messages");
  const inputEl = document.getElementById("cb-input");
  const sendBtn = document.getElementById("cb-send");
  const statusEl = document.getElementById("cb-status");

  function addMessage(role, content) {
    const div = document.createElement("div");
    div.className = `cb-msg ${role}`;
    const bubble = document.createElement("div");
    bubble.className = `cb-bubble ${role === "user" ? "user" : "bot"}`;
    bubble.textContent = content;
    div.appendChild(bubble);
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    history.push({ role, content });
  }

  function showTyping() {
    const div = document.createElement("div");
    div.id = "cb-typing";
    div.className = "cb-msg";
    div.innerHTML = `<div class="cb-bubble bot" style="display:flex;align-items:center;">
      <span class="cb-dot" style="animation:cb-bounce 1.2s 0s infinite"></span>
      <span class="cb-dot" style="animation:cb-bounce 1.2s 0.2s infinite"></span>
      <span class="cb-dot" style="animation:cb-bounce 1.2s 0.4s infinite"></span>
    </div>`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    document.getElementById("cb-typing")?.remove();
  }

  async function sendMessage() {
    const msg = inputEl.value.trim();
    if (!msg || isLoading) return;
    inputEl.value = "";
    sendBtn.disabled = true;
    addMessage("user", msg);
    isLoading = true;
    statusEl.textContent = "Typing...";
    showTyping();

    try {
      const res = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId, tenantId, history }),
      });
      const data = await res.json();
      removeTyping();
      if (!res.ok) throw new Error(data.error || "Error");
      if (data.sessionId && !sessionId) sessionId = data.sessionId;
      addMessage("assistant", data.reply);
    } catch (err) {
      removeTyping();
      addMessage("assistant", err.message || "Something went wrong.");
    } finally {
      isLoading = false;
      statusEl.textContent = "Online";
    }
  }

  btn.addEventListener("click", () => {
    isOpen = !isOpen;
    window_.classList.toggle("open", isOpen);
    if (isOpen && messagesEl.children.length === 0) {
      addMessage("assistant", welcomeMsg);
    }
    if (isOpen) inputEl.focus();
  });

  inputEl.addEventListener("input", () => {
    sendBtn.disabled = !inputEl.value.trim();
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  sendBtn.addEventListener("click", sendMessage);
})();
