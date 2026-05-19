"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { nanoid } from "nanoid";
import { MessageCircle, Send, X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/stores";
import { selectIsOpen, selectMessages } from "@/stores/chatbot/selectors";
import { toggleOpen, addMessage } from "@/stores/chatbot/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollAreaPro } from "@/components/ui/scroll-areapro";

const HIDDEN_ROUTES = ["/dang-nhap", "/auth", "/dang-ky", "/redirect"];

const BOT_RESPONSES = [
  "Tôi hiểu rồi. Bạn có thể cho tôi biết thêm chi tiết không?",
  "Cảm ơn bạn đã chia sẻ. Tôi sẽ giúp bạn giải quyết vấn đề này.",
  "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể diễn đạt lại không?",
  "Vấn đề của bạn có vẻ phức tạp. Tôi sẽ hỗ trợ bạn từng bước một.",
  "Rất vui khi được giúp đỡ bạn! Bạn còn câu hỏi nào khác không?",
];

export default function Chatbot() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsOpen);
  const messages = useAppSelector(selectMessages);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHiddenRoute = HIDDEN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: nanoid(),
      role: "user" as const,
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    dispatch(addMessage(userMessage));
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const randomResponse =
        BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
      const botMessage = {
        id: nanoid(),
        role: "bot" as const,
        content: randomResponse,
        timestamp: Date.now(),
      };
      dispatch(addMessage(botMessage));
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isHiddenRoute) return null;

  return (
    <div className="fixed bottom-6 right-3 z-50">
      {!isOpen ? (
        <Button
          onClick={() => dispatch(toggleOpen())}
          className="h-14 w-14 rounded-full bg-sky-500 hover:bg-sky-600 shadow-lg text-white"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <div className="flex flex-col bg-white rounded-lg shadow-xl border w-80 h-96">
          <div className="h-14 flex items-center justify-between px-4 bg-sky-500 text-white rounded-t-lg">
            <h3 className="font-semibold">Chatbot LearnKing</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleOpen())}
                className="h-8 w-8 p-0 text-white hover:bg-sky-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollAreaPro
                showProgress="vertical"
              className="h-full p-4"
              ref={scrollAreaRef}
            >
              <div className="space-y-4">
                {messages.map((message: (typeof messages)[0]) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-sky-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-800">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollAreaPro>
          </div>

          <div className="h-16 border-t px-4 flex items-center">
            <div className="flex gap-2 w-full">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
