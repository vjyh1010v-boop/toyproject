// src/components/features/chat/TravelAiChat.jsx
import React, { useState, useRef, useEffect } from "react";
import { chatWithAi } from "../../../api/travelApi"; // 💡 앞서 추가한 api 호출 함수
import { Send, Sparkles, User } from "lucide-react";
import "./TravelAiChat.css";

export default function TravelAiChat() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "안녕하세요! 나만의 Ollama 여행 비서입니다. 🗺️\n궁금한 여행지나 기록에 대해 편하게 물어보세요!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 메시지가 추가되거나 AI가 로딩 중일 때 대화창 맨 아래로 부드럽게 스크롤 이동
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: "user", text: userMessage },
    ]);
    setLoading(true);

    try {
      // 1. 백엔드 호출
      const data = await chatWithAi(userMessage);
      console.log("🤖 백엔드에서 온 AI 응답 원본 데이터:", data);

      // 2. 💡 [수정] 객체 내부에 reply가 있는지 명확히 체크하고 없으면 문자열 변환 처리
      let aiReplyText = "";

      if (data && typeof data === "object") {
        // { reply: "..." } 구조인 경우
        aiReplyText = data.reply ? data.reply : JSON.stringify(data);
      } else {
        // 그냥 순수 String으로 넘어온 경우
        aiReplyText = data;
      }

      // 3. 안전하게 가공된 텍스트만 꽂아주기
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, sender: "ai", text: aiReplyText },
      ]);
    } catch (error) {
      console.error("AI 채팅 중 오류 발생:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "ai",
          text: "❌ 로컬 Ollama 서버와 통신하는 데 실패했습니다. 백엔드 상태를 확인해 주세요.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-panel">
      {/* 상단 헤더 영역 */}
      <div className="chat-header">
        <Sparkles size={16} className="sparkle-icon" />
        <h3>Ollama 여행 AI 비서</h3>
      </div>

      {/* 메시지 리스트 스크롤 영역 */}
      <div className="chat-messages-box">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-row ${msg.sender}`}>
            <div className="chat-avatar">
              {msg.sender === "ai" ? (
                <Sparkles size={14} />
              ) : (
                <User size={14} />
              )}
            </div>
            <div className="chat-bubble">
              <div className="bubble-text">{msg.text}</div>
            </div>
          </div>
        ))}

        {/* Ollama 응답 대기 상태 애니메이션 */}
        {loading && (
          <div className="chat-row ai loading">
            <div className="chat-avatar pulse">
              <Sparkles size={14} />
            </div>
            <div className="chat-bubble">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 하단 질문 입력 영역 */}
      <form onSubmit={handleSend} className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="AI에게 여행 코스를 물어보세요... ✨"
          disabled={loading}
        />
        <button
          type="submit"
          className="chat-submit-btn"
          disabled={loading || !input.trim()}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
