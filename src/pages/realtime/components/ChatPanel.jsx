// src/components/realtime/ChatPanel.jsx
import React, { useEffect, useRef, useState } from "react";

export default function ChatPanel({ messages = [], onSend }) {
    const chatRef = useRef(null);
    const [input, setInput] = useState("");

    // 자동 스크롤
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        onSend?.(input);
        setInput("");
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* 메시지 리스트 */}
            <div
                ref={chatRef}
                className="flex-1 p-3 overflow-y-auto"
                style={{ fontSize: "14px" }}
            >
                {messages.length === 0 && (
                    <div className="text-gray-400 text-sm text-center mt-2">
                        채팅을 입력해보세요!
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-2 mb-1 animate-fadeIn"
                    >
                        {/* 배지 */}
                        {msg.role === "mentor" && (
                            <span className="px-2 py-0.5 bg-black text-white text-xs rounded">
                멘토
              </span>
                        )}

                        {msg.role === "system" && (
                            <span className="px-2 py-0.5 bg-gray-600 text-white text-xs rounded">
                System
              </span>
                        )}

                        {/* 닉네임 */}
                        {msg.role !== "system" && (
                            <span
                                className="font-semibold"
                                style={{ color: msg.color ?? "#000" }}
                            >
                {msg.sender}
              </span>
                        )}

                        {/* 메시지 */}
                        <span
                            className={`${msg.role === "system" ? "text-gray-500" : ""}`}
                        >
              {msg.text}
            </span>
                    </div>
                ))}
            </div>

            {/* 입력창 */}
            <div className="p-2 border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />

                <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    보내기
                </button>
            </div>
        </div>
    );
}
