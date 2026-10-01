"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
  isEscalated?: boolean;
}

const initialMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "ai",
    text: "Hello Arjun, I am your VitalSync Clinical AI Assistant. I have continuous access to your current telemetry (BP: 122/78 mmHg, HR: 68 bpm), active prescriptions (Lisinopril, Metformin, Atorvastatin), and Dr. Sarah Vance's care directives. How can I assist you with your health protocol today?",
    time: "09:00 AM",
  },
];

export default function AIAssistantPage() {
  const { showToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    "Is my BP of 122/78 normal for me?",
    "Can I take Lisinopril with grapefruit juice?",
    "I feel slight dizziness after today's walk",
    "What is my exact sodium limit today?",
    "When should I take my Metformin?",
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = query.toLowerCase();
      let responseText = "";
      let escalate = false;

      if (lower.includes("bp") || lower.includes("122") || lower.includes("blood pressure")) {
        responseText =
          "Your current reading of 122/78 mmHg is well within your target range! Under Dr. Vance's Stage 1 HTN recovery protocol, your target resting blood pressure is <130/80 mmHg. Your nocturnal Lisinopril 10mg regimen is maintaining excellent arterial pressure stability.";
      } else if (lower.includes("grapefruit")) {
        responseText =
          "⚠️ Caution: You should avoid grapefruit and grapefruit juice while taking Atorvastatin (20mg). Grapefruit compounds inhibit the intestinal CYP3A4 enzyme, which can significantly raise the blood concentration of Atorvastatin and increase the risk of muscle toxicity or liver strain. Orange juice or cranberry juice are safe alternatives.";
      } else if (lower.includes("dizzy") || lower.includes("dizziness") || lower.includes("faint")) {
        responseText =
          "Please sit or lie down immediately and rest. Lightheadedness post-exercise can occur due to vasodilation combined with your Lisinopril ACE-inhibitor medication. Hydrate with 250–500ml of room temperature water. If your dizziness persists beyond 15 minutes or is accompanied by chest tightness, please seek emergency medical attention. I have logged this telemetry event.";
        escalate = true;
      } else if (lower.includes("sodium")) {
        responseText =
          "Under Dr. Sarah Vance's cardiovascular directive, your daily sodium intake is strictly capped at 2,000 mg/day (DASH protocol). Today, you have consumed approximately 680 mg so far, leaving 1,320 mg available. Remember to avoid cured meats and high-saline canned soups.";
      } else if (lower.includes("metformin")) {
        responseText =
          "You are prescribed Metformin 500mg twice daily with meals (morning and evening). Taking it mid-meal significantly minimizes gastrointestinal upset. According to your adherence log, you took your morning 8:30 AM dose. Your next dose is scheduled with dinner.";
      } else {
        responseText =
          `I have cross-referenced your query with your health profile and Dr. Vance's protocol. Your vitals remain stable (BP: 122/78 mmHg, HR: 68 bpm). For specific medication adjustments or new symptoms, I can immediately flag this query for Dr. Sarah Vance's clinical review.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEscalated: escalate,
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 1100);
  };

  const handleEscalate = () => {
    showToast("Conversation summary securely flagged for Dr. Sarah Vance's urgent review.");
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
            <p className="text-xs text-[#74777e]">Context: Arjun Kumar (#VS-1024) • Dr. Vance Protocol</p>
          </div>
        </div>

        <button
          onClick={handleEscalate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold font-headline border border-red-200 transition-colors"
        >
          <span className="material-symbols-outlined text-base">emergency_share</span>
          <span>Flag for Dr. Vance</span>
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
                    : "bg-[#eff4ff] text-[#0b1c30] rounded-bl-xs border border-[#e5eeff]"
                }`}
              >
                {m.sender === "ai" && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#006591]">
                    <span className="material-symbols-outlined text-xs">smart_toy</span>
                    <span>Clinical AI</span>
                  </div>
                )}
                <p>{m.text}</p>

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
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 rounded-full bg-[#eff4ff] hover:bg-[#c9e6ff] text-[#006591] text-xs font-semibold whitespace-nowrap transition-colors"
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
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your medication, symptoms, or protocol..."
              className="flex-1 p-3 rounded-2xl bg-[#eff4ff] border border-[#c4c6ce]/30 text-xs sm:text-sm text-[#0f2b48] placeholder:text-[#74777e] outline-none focus:border-[#006591] font-body"
            />

            <button
              type="submit"
              disabled={!input.trim()}
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
