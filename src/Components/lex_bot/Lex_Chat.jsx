import React, { useState } from "react";
import {
  LexRuntimeV2Client,
  RecognizeTextCommand,
} from "@aws-sdk/client-lex-runtime-v2";
import "./Lex_Chat.css";

const client = new LexRuntimeV2Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_USER2,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY_USER2,
  },
});

const LexChat = () => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi, how can I help you?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sessionId = "user-session";

  const handleSend = async () => {
    const command = new RecognizeTextCommand({
      botId: import.meta.env.VITE_LEX_BOT_ID,
      botAliasId: import.meta.env.VITE_LEX_ALIAS_ID,
      localeId: "en_US",
      sessionId: sessionId,
      text: input,
    });

    try {
      const data = await client.send(command);
      const botMessage = data?.messages?.[0]?.content || "No response";

      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages([
        ...messages,
        { from: "user", text: input, time: now },
        {
          from: "bot",
          text: botMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      setInput("");
    } catch (err) {
      console.error("Lex error:", err);
    }
  };

  return (
    <div>
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          Ask me
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>How can I help you? </span>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.from === "user" ? "user-msg" : "bot-msg"}
              >
                <p>{msg.text}</p>
                <small className="msg-time">{msg.time}</small>
              </div>
            ))}
          </div>
          <div className="chat-footer">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LexChat;