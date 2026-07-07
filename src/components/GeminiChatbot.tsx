import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles } from "lucide-react";
import { ChatMessage } from "../types";

export default function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "¡Hola! Bienvenido a la Clínica Premium. Soy su asistente virtual inteligente. ¿En qué puedo ayudarle hoy con respecto a nuestras especialidades, equipo médico o citas?",
      sender: "assistant",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: textToSend,
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI server");
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        text: data.text,
        sender: "assistant",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot communication error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: "Disculpe, he experimentado un inconveniente de conexión. Por favor, asegúrese de que el servidor esté activo y reintente.",
        sender: "assistant",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    "¿Qué doctores atienden en Cardiología?",
    "¿Cómo puedo agendar una cita médica?",
    "¿Tienen servicio de Dermatología?",
    "¿Qué tecnología de diagnóstico ofrecen?"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="btn-chatbot-toggle"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 transition-all active:scale-95 duration-300 group hover:ring-4 hover:ring-emerald-500/20"
        title="Asistente AI Clínica Premium"
      >
        <Bot className="h-6 w-6 group-hover:rotate-6 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          id="chat-window-container"
          className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-sm font-display text-white">Asistente Premium</h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> En línea • Inteligencia Artificial
                </p>
              </div>
            </div>
            <button 
              id="btn-close-chatbot"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  <span className="block mt-1 text-[9px] text-right opacity-60">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions List */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-900">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-2">Preguntas frecuentes:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-300 rounded-full px-3 py-1.5 transition-all text-left truncate max-w-full"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="border-t border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escriba su mensaje..."
              disabled={isLoading}
              className="flex-1 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
            />
            <button
              id="btn-chatbot-send"
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-colors shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
