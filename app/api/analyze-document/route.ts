import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
];

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        {
          error: "AI Document Analyzer is not configured. Missing GEMINI_API_KEY.",
        },
        { status: 500 }
      );
    }

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: "Invalid form data. Please submit a multipart file." },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file was provided in the upload request." },
        { status: 400 }
      );
    }

    // File validation: Size <= 10MB
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit. Please upload a smaller image or compressed PDF." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "Uploaded file is empty (0 bytes). Please upload a valid document." },
        { status: 400 }
      );
    }

    // Supported MIME types
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    let mimeType = file.type || "";
    const lowerName = file.name.toLowerCase();
    if (!mimeType) {
      if (lowerName.endsWith(".pdf")) mimeType = "application/pdf";
      else if (lowerName.endsWith(".png")) mimeType = "image/png";
      else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) mimeType = "image/jpeg";
      else if (lowerName.endsWith(".webp")) mimeType = "image/webp";
    }

    if (!allowedMimes.includes(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a PDF, PNG, or JPG/JPEG file." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
You are an expert clinical pharmacologist and medical document handwriting transcription AI.
Analyze this medical report, doctor's prescription, or clinical lab sheet carefully.

CRITICAL HANDWRITING SAFETY RULES:
1. Handwritten physician scripts are often cursive, rushed, or partially illegible.
2. For EVERY extracted medicine, assess legibility and assign an honest confidence score between 0.00 and 1.00.
3. If handwriting is messy, abbreviated (e.g. "Metfor..."), faded, or you have ANY doubt between similar-sounding drug names (e.g., Celexa vs Celebrex, Lisinopril vs Livalo):
   - Set "confidence" < 0.80 (e.g. 0.65)
   - Set "needs_verification": true
   - Add the specific drug name or item to the "uncertain_items" array with an explanation.
4. If confidence >= 0.80, set "needs_verification": false.
5. NEVER claim you have definitively or authoritatively verified a doctor's handwriting.
6. Extract:
   - document_type: e.g. "prescription", "lab_report", "discharge_summary", "medical_notes"
   - patient_info: { name, age, gender } if legible, or null/empty strings
   - conditions: array of { name: string, confidence: number }
   - medicines: array of {
       name: string,
       dosage: string,
       frequency: string,
       duration: string,
       instructions: string,
       confidence: number (0.00 to 1.00),
       needs_verification: boolean
     }
   - uncertain_items: array of strings naming whatever is ambiguous
   - summary: brief 1-2 sentence transcription summary

Output MUST be strictly valid JSON matching this exact structure:
{
  "document_type": "prescription",
  "patient_info": {
    "name": "...",
    "age": "...",
    "gender": "..."
  },
  "conditions": [
    { "name": "...", "confidence": 0.95 }
  ],
  "medicines": [
    {
      "name": "...",
      "dosage": "...",
      "frequency": "...",
      "duration": "...",
      "instructions": "...",
      "confidence": 0.92,
      "needs_verification": false
    }
  ],
  "uncertain_items": [],
  "summary": "..."
}

Return ONLY raw JSON. No markdown backticks, no explanations.
`;

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    let lastError: any = null;
    let jsonText: string | null = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType,
                  },
                },
              ],
            },
          ],
        });

        if (response.text && response.text.trim()) {
          jsonText = response.text.trim();
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next candidate:`, err.message);
      }
    }

    if (!jsonText) {
      throw lastError || new Error("Failed to extract data from document.");
    }

    // Clean JSON markdown if wrapped in ```json ... ```
    let cleanJson = jsonText;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(cleanJson);
    } catch {
      // Fallback regex extraction if model included outer commentary
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) {
        parsedResult = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid JSON structure returned by the document analyzer.");
      }
    }

    // Post-process medicines: Guarantee required fields and enforce needs_verification logic
    const medicines = Array.isArray(parsedResult.medicines)
      ? parsedResult.medicines.map((m: any, idx: number) => {
          const confidence = typeof m.confidence === "number" ? Math.min(1, Math.max(0, m.confidence)) : 0.85;
          const isUncertain = confidence < 0.80 || Boolean(m.needs_verification);
          return {
            id: `med-extracted-${idx}-${Date.now()}`,
            name: m.name || "Unidentified Medicine",
            dosage: m.dosage || "Unspecified dosage",
            frequency: m.frequency || "As directed",
            duration: m.duration || "As prescribed",
            instructions: m.instructions || "Follow physician advice",
            confidence: Number(confidence.toFixed(2)),
            needs_verification: isUncertain,
            status: isUncertain ? "pending" : "verified",
          };
        })
      : [];

    const uncertainItems = Array.isArray(parsedResult.uncertain_items)
      ? [...parsedResult.uncertain_items]
      : [];

    // Ensure any medicine with needs_verification is registered in uncertainItems
    medicines.forEach((m: any) => {
      if (m.needs_verification && !uncertainItems.some((u: string) => u.toLowerCase().includes(m.name.toLowerCase()))) {
        uncertainItems.push(`${m.name} (${Math.round(m.confidence * 100)}% confidence - handwriting unclear)`);
      }
    });

    return NextResponse.json({
      document_type: parsedResult.document_type || "prescription",
      patient_info: parsedResult.patient_info || null,
      conditions: Array.isArray(parsedResult.conditions) ? parsedResult.conditions : [],
      medicines,
      uncertain_items: uncertainItems,
      summary: parsedResult.summary || "Document parsed successfully.",
      filename: file.name,
      filesize: file.size,
      analyzed_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Document analysis error:", error);
    return NextResponse.json(
      {
        error: "Unable to read this document clearly. Please upload a clearer image or check your connection.",
        details: error?.message || "Unknown analysis error",
      },
      { status: 500 }
    );
  }
}
