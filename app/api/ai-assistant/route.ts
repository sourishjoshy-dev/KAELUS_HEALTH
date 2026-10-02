import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, buildSystemInstruction, PatientContextPayload } from "@/lib/gemini";

interface ClientMessage {
  id?: string;
  sender?: "user" | "ai" | "model";
  role?: "user" | "ai" | "model";
  text: string;
  isError?: boolean;
}

// Ordered list of models. Highly-available fast models are placed first to guarantee
// instant response without hitting single-model daily quota limits or demand spikes.
const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
];

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { error: "VITALSYNC AI is temporarily unavailable. Please try again.", details: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { messages, patientContext } = body as {
      messages?: ClientMessage[];
      patientContext?: PatientContextPayload;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.text || !lastMessage.text.trim()) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    // Filter out empty messages, initial greeting, and previous system error alerts
    const historyToProcess = messages.filter(
      (m) =>
        m &&
        m.text &&
        m.text.trim().length > 0 &&
        !m.isError &&
        !m.text.includes("VITALSYNC AI is temporarily unavailable")
    );

    const geminiContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    for (const msg of historyToProcess) {
      const role: "user" | "model" =
        msg.sender === "ai" || msg.sender === "model" || msg.role === "ai" || msg.role === "model"
          ? "model"
          : "user";

      // Gemini conversation contents must start with a user turn
      if (geminiContents.length === 0 && role === "model") {
        continue;
      }

      const prev = geminiContents[geminiContents.length - 1];
      if (prev && prev.role === role) {
        prev.parts[0].text += `\n\n${msg.text.trim()}`;
      } else {
        geminiContents.push({
          role,
          parts: [{ text: msg.text.trim() }],
        });
      }
    }

    // Ensure the conversation ends with the user's latest query
    if (geminiContents.length === 0 || geminiContents[geminiContents.length - 1].role !== "user") {
      geminiContents.push({
        role: "user",
        parts: [{ text: lastMessage.text.trim() }],
      });
    }

    const ai = getGeminiClient();
    const systemInstruction = buildSystemInstruction(patientContext);

    let rawResponseText = "";
    let lastError: unknown = null;

    // Iterate through candidate models in order until one succeeds
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: geminiContents,
          config: {
            systemInstruction,
            temperature: 0.4,
          },
        });

        rawResponseText = response.text || "";
        if (rawResponseText) {
          break;
        }
      } catch (err: unknown) {
        lastError = err;
        console.warn(`Model ${modelName} unavailable, falling back:`, err instanceof Error ? err.message : err);
      }
    }

    if (!rawResponseText) {
      console.error("All Gemini candidate models failed:", lastError);
      return NextResponse.json(
        { error: "VITALSYNC AI is temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    // Check if response flagged clinical escalation
    let isEscalated = false;
    let cleanText = rawResponseText;

    if (cleanText.includes("[ESCALATE]")) {
      isEscalated = true;
      cleanText = cleanText.replace(/\[ESCALATE\]/gi, "").trim();
    } else {
      const lower = lastMessage.text.toLowerCase();
      if (
        lower.includes("dizzy") ||
        lower.includes("faint") ||
        lower.includes("chest pain") ||
        lower.includes("shortness of breath") ||
        lower.includes("emergency")
      ) {
        isEscalated = true;
      }
    }

    return NextResponse.json({
      text: cleanText,
      isEscalated,
    });
  } catch (error: unknown) {
    console.error("AI Assistant Route Error:", error);
    return NextResponse.json(
      { error: "VITALSYNC AI is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
