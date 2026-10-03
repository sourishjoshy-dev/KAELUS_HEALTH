import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_FALLBACKS } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { error: "AI Recommendation Engine is not configured. Missing GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid payload. Verified medical profile is required." },
        { status: 400 }
      );
    }

    const { conditions, medicines, patientInfo, preferences } = body as {
      conditions?: Array<string | { name: string }>;
      medicines?: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration?: string;
        instructions?: string;
        verified_by_user?: boolean;
      }>;
      patientInfo?: {
        name?: string;
        age?: string | number;
        gender?: string;
      };
      preferences?: {
        frequency?: string;
        tracking?: Record<string, string>;
        progressSync?: string;
        factors?: string[];
      };
    };

    if ((!medicines || medicines.length === 0) && (!conditions || conditions.length === 0)) {
      return NextResponse.json(
        { error: "At least one verified medicine or medical condition is required to generate recommendations." },
        { status: 400 }
      );
    }

    // Format list of verified medicines & conditions
    const verifiedMedsList = (medicines || [])
      .map(
        (m, idx) =>
          `${idx + 1}. ${m.name} - Dosage: ${m.dosage}, Frequency: ${m.frequency}, Instructions: ${m.instructions || "N/A"}`
      )
      .join("\n");

    const verifiedCondList = (conditions || [])
      .map((c, idx) => (typeof c === "string" ? `${idx + 1}. ${c}` : `${idx + 1}. ${c.name}`))
      .join("\n");

    const prompt = `
You are an expert clinical nutrition and cardiac rehabilitation specialist.
You are generating a personalized diet and exercise recommendation plan for a patient based on their VERIFIED medical profile and their CONFIGURED PLAN UPDATE PREFERENCES.

CRITICAL MEDICAL & SAFETY RULES:
1. DO NOT diagnose new diseases.
2. DO NOT alter, prescribe, stop, or recommend changing any prescription medication dosages.
3. Factor in pharmacological and drug-nutrient interactions for the verified medicines:
   - If ACE inhibitors (e.g. Lisinopril): enforce a sodium limit (<2,000 mg/day) and avoid excessive potassium salt substitutes.
   - If Statins (e.g. Atorvastatin): strictly advise avoiding grapefruit/grapefruit juice (CYP3A4 inhibition).
   - If Metformin: emphasize complex low-glycemic carbohydrates and small frequent meals to prevent GI distress and hypoglycemic dips.
   - If Beta-blockers / antihypertensives: recommend gradual warm-up and cool-down periods; set maximum target exercise heart rate ceiling (e.g. <= 130 BPM).
4. Provide structured meal plans with practical, balanced foods.
5. Provide safe, low-impact exercise recommendations and clearly list exercises to avoid.
6. Align your plan and guidance with the patient's selected update frequency and tracking modalities.

VERIFIED PATIENT PROFILE:
Patient Name: ${patientInfo?.name || "Patient"}
Age: ${patientInfo?.age || "Adult"}
Gender: ${patientInfo?.gender || "Unspecified"}

PATIENT PLAN UPDATE PREFERENCES:
• Plan Review Cadence: ${preferences?.frequency || "Weekly"}
• Active Tracking Modalities: ${preferences?.tracking ? Object.entries(preferences.tracking).map(([k, v]) => `${k} (${v})`).join(", ") : "Standard"}
• Self-Logging Frequency: ${preferences?.progressSync || "Once a day"}
• Key Factors to Consider: ${preferences?.factors?.join(", ") || "Medication, Diet, Exercise, Hydration, Doctor directives"}

VERIFIED MEDICAL CONDITIONS:
${verifiedCondList || "No specific chronic conditions listed."}

VERIFIED MEDICATIONS:
${verifiedMedsList || "No prescription medications logged."}

Return strictly a valid JSON object matching this structure:
{
  "diet": {
    "summary": "High-level summary of dietary strategy (1-2 sentences)",
    "breakfast": ["Scrambled egg whites with spinach", "Steel-cut oatmeal with cinnamon and walnuts"],
    "lunch": ["Grilled chicken or tofu bowl with quinoa and steamed broccoli", "Olive oil dressing"],
    "snacks": ["Raw unsalted almonds", "Sliced cucumbers with low-fat hummus"],
    "dinner": ["Baked wild salmon with roasted asparagus and sweet potato"],
    "foods_to_limit": ["Processed meats high in sodium", "Refined sugary snacks", "Excessive grapefruit"],
    "sodium_limit_mg": 2000,
    "hydration_target_liters": 2.5
  },
  "exercise": {
    "summary": "High-level summary of physical activity strategy (1-2 sentences)",
    "recommended": ["Brisk walking 30 minutes daily", "Low-resistance stationary cycling", "Gentle stretching and mobility"],
    "avoid": ["Heavy overhead powerlifting", "Strenuous high-intensity interval training (HIIT)", "Holding breath during straining (Valsalva maneuver)"],
    "frequency": "5 sessions per week, 30-40 minutes per session",
    "target_hr_ceiling_bpm": 130
  },
  "safety_notes": [
    "Always carry hydration and a rapid-acting glucose source if taking anti-diabetic medications.",
    "Monitor blood pressure before and 30 minutes after new exercise regimens.",
    "If you experience dizziness, shortness of breath, or chest pressure, stop exercising immediately and seek medical care."
  ],
  "disclaimer": "AI-generated information is for assistance and educational purposes only. Always verify medical information with a qualified healthcare professional."
}

Output ONLY valid JSON. No markdown backticks, no explanations.
`;

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    let jsonText: string | null = null;
    let lastError: any = null;
    const modelErrors: Array<{ model: string; message: string }> = [];

    for (const model of GEMINI_MODEL_FALLBACKS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        if (response.text && response.text.trim()) {
          jsonText = response.text.trim();
          break;
        }
        modelErrors.push({ model, message: "Returned empty response text" });
      } catch (err: any) {
        lastError = err;
        const message = err?.message || String(err);
        modelErrors.push({ model, message });
        console.warn(`Model ${model} failed, trying next candidate:`, message);
      }
    }

    if (!jsonText) {
      throw Object.assign(
        lastError || new Error("Failed to generate recommendations."),
        { modelErrors }
      );
    }

    let cleanJson = jsonText;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let result: any;
    try {
      result = JSON.parse(cleanJson);
    } catch {
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid JSON structure in recommendation response.");
      }
    }

    return NextResponse.json({
      diet: result.diet || {
        summary: "Balanced whole-food nutritional regimen tailored to your verified medications.",
        breakfast: ["Oatmeal with chia seeds", "Green tea"],
        lunch: ["Mediterranean vegetable bowl with lean protein"],
        snacks: ["Handful of raw almonds"],
        dinner: ["Steamed vegetables with grilled fish or lentils"],
        foods_to_limit: ["High sodium canned soups", "Refined sugary beverages"],
        sodium_limit_mg: 2000,
        hydration_target_liters: 2.5,
      },
      exercise: result.exercise || {
        summary: "Moderate cardiovascular conditioning with safety heart rate thresholds.",
        recommended: ["Daily 30-minute brisk walk", "Low-impact swimming or cycling"],
        avoid: ["Heavy max-effort powerlifting", "Dehydrating hot room exercise"],
        frequency: "4-5 days per week, 30 minutes daily",
        target_hr_ceiling_bpm: 130,
      },
      safety_notes: Array.isArray(result.safety_notes)
        ? result.safety_notes
        : [
            "Monitor blood pressure standing and resting.",
            "Consult with your attending physician prior to beginning any high-intensity program.",
          ],
      disclaimer:
        result.disclaimer ||
        "AI-generated information is for assistance and educational purposes only. Always verify medical information with a qualified healthcare professional.",
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Recommendation generation error:", error);
    return NextResponse.json(
      {
        error: "Unable to generate recommendations right now. Please try again.",
        details: error?.message || "Unknown error",
        ...(error?.modelErrors ? { modelErrors: error.modelErrors } : {}),
      },
      { status: 500 }
    );
  }
}
