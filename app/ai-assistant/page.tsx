"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
  isEscalated?: boolean;
  isError?: boolean;
}

const initialMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "ai",
    text: "Hello Arjun, I am your VitalSync Clinical AI Assistant. I have continuous access to your current telemetry (BP: 122/78 mmHg, HR: 68 bpm), active prescriptions (Lisinopril, Metformin, Atorvastatin), and Dr. Thomas's care directives. How can I assist you with your health protocol today?",
    time: "09:00 AM",
  },
];

export default function AIAssistantPage() {
  const { showToast, currentUser, medications, careTasks, healthScore, adherenceRate } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    "Can I do today's exercise?",
    "Why was my diet changed?",
    "Show today's plan.",
    "How is my progress?",
    "What medications do I have today?",
    "Is my BP of 122/78 normal for me?",
    "Can I take Lisinopril with grapefruit juice?",
    "I feel slight dizziness after today's walk",
    "What is my exact sodium limit today?",
    "When should I take my Metformin?",
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Filter out previous transient error notices so conversation stays clean
    const cleanPrevious = messages.filter((m) => !m.isError);
    const nextMessages = [...cleanPrevious, userMsg];
    setMessages(nextMessages);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          patientContext: {
            userName: currentUser.name,
            userId: currentUser.id,
            vitals: {
              bp: "122/78 mmHg",
              hr: "68 bpm",
              healthScore,
              adherenceRate,
            },
            medications: medications.map((m) => ({
              id: m.id,
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              instructions: m.instructions,
              timeSlot: m.timeSlot,
              taken: m.taken,
              takenAt: m.takenAt,
              prescribedBy: m.prescribedBy,
            })),
            careTasks: careTasks.map((t) => ({
              id: t.id,
              title: t.title,
              time: t.time,
              category: t.category,
              completed: t.completed,
              assignedBy: t.assignedBy,
            })),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "VITALSYNC AI is temporarily unavailable. Please try again.");
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.text || "I have analyzed your medical data and updated protocol.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEscalated: Boolean(data.isEscalated),
      };

      setMessages((prev) => [...prev.filter((m) => !m.isError), aiMsg]);
    } catch (err: unknown) {
      console.error("AI Assistant error:", err);
      const fallbackText = "VITALSYNC AI is temporarily unavailable. Please try again.";
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      showToast(fallbackText);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEscalate = () => {
    showToast("Conversation summary securely flagged for Dr. Thomas's urgent review.");
  };

  return (
    <div className="space-y-4 pb-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#e5eeff] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[#0f2b48] text-[#39b8fd] shadow-sm">
            <span className="material-symbols-outlined text-2xl">neurology</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline font-bold text-lg text-[#0f2b48]">VITALSYNC Clinical AI</h1>
              <span className="text-[10px] font-bold bg-[#c9e6ff] text-[#001e2f] px-2 py-0.5 rounded-full uppercase">
                Active Triage
              </span>
            </div>
            <p className="text-xs text-[#74777e]">Context: Arjun Kumar (#VS-1024) • Dr. Thomas Protocol</p>
          </div>
        </div>

        <button
          onClick={handleEscalate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold font-headline border border-red-200 transition-colors"
        >
          <span className="material-symbols-outlined text-base">emergency_share</span>
          <span>Flag for Dr. Thomas</span>
        </button>
      </div>

      {/* Chat Conversation Viewport */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-[#e5eeff] flex flex-col h-[58vh] sm:h-[62vh]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"} space-y-1`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  m.sender === "user"
                    ? "bg-[#0f2b48] text-white rounded-br-xs"
                    : m.isError
                    ? "bg-red-50 text-red-900 rounded-bl-xs border border-red-200"
                    : "bg-[#eff4ff] text-[#0b1c30] rounded-bl-xs border border-[#e5eeff]"
                }`}
              >
                {m.sender === "ai" && (
                  <div
                    className={`flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider ${
                      m.isError ? "text-red-700" : "text-[#006591]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {m.isError ? "error" : "smart_toy"}
                    </span>
                    <span>{m.isError ? "System Alert" : "Clinical AI"}</span>
                  </div>
                )}
                <div className="space-y-1">
                  {m.text.split("\n").map((line, lIdx) => {
                    const cleanLine = line.replace(/^#{1,4}\s+/, "");
                    const isHeader = /^#{1,4}\s+/.test(line);
                    const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <span
                        key={lIdx}
                        className={`block leading-relaxed ${isHeader ? "font-bold text-[#0f2b48] pt-1" : ""}`}
                      >
                        {parts.map((part, pIdx) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return (
                              <strong key={pIdx} className="font-semibold text-inherit">
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          return part;
                        })}
                      </span>
                    );
                  })}
                </div>

                {m.isEscalated && (
                  <div className="mt-3 pt-2.5 border-t border-red-200/80 flex items-center justify-between text-xs">
                    <span className="text-red-700 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Symptom Telemetry Alert Triggered
                    </span>
                    <button
                      onClick={handleEscalate}
                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px] hover:bg-red-700"
                    >
                      Alert Care Team
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#74777e] px-1 font-mono">{m.time}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-[#eff4ff] rounded-2xl max-w-xs text-xs text-[#74777e]">
              <span className="material-symbols-outlined animate-spin text-sm text-[#006591]">progress_activity</span>
              <span>Evaluating medical guidelines &amp; vitals...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="pt-3 border-t border-[#eff4ff]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isTyping}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 rounded-full bg-[#eff4ff] hover:bg-[#c9e6ff] text-[#006591] text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <button
              type="button"
              onClick={() => showToast("Voice input simulated: Listening to symptom audio...")}
              className="w-10 h-10 rounded-2xl bg-[#eff4ff] hover:bg-[#e5eeff] flex items-center justify-center text-[#006591] shrink-0"
              title="Voice Input"
            >
              <span className="material-symbols-outlined text-lg">mic</span>
            </button>

            <input
              type="text"
              value={input}
              disabled={isTyping}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your medication, symptoms, or protocol..."
              className="flex-1 p-3 rounded-2xl bg-[#eff4ff] border border-[#c4c6ce]/30 text-xs sm:text-sm text-[#0f2b48] placeholder:text-[#74777e] outline-none focus:border-[#006591] font-body disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-2xl bg-[#0f2b48] hover:bg-[#00162d] text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </form>

          <p className="text-[10px] text-center text-[#74777e] mt-2">
            VITALSYNC AI provides clinical protocol support based on your verified medical record. Not an emergency service.
          </p>
        </div>
      </div>
    </div>
  );
}
