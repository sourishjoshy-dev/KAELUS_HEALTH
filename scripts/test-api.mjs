async function testApi() {
  const questions = [
    "Can I do today's exercise?",
    "Why was my diet changed?",
    "Show today's plan.",
    "How is my progress?",
    "What medications do I have today?"
  ];

  for (const q of questions) {
    console.log("-----------------------------------------");
    console.log("Patient Question:", q);
    const start = Date.now();
    const res = await fetch("http://localhost:3000/api/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", text: q }],
      }),
    });
    const elapsed = Date.now() - start;
    const data = await res.json();
    console.log(`Status: ${res.status} (${elapsed}ms)`);
    console.log("Real Gemini Response:\n", data.text);
    console.log("Is Escalated:", data.isEscalated);
  }

  // Test Follow-up with Conversation History
  console.log("-----------------------------------------");
  console.log("Testing Follow-up with Conversation History:");
  const followUpRes = await fetch("http://localhost:3000/api/ai-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "user", text: "What medications do I have today?" },
        { role: "model", text: "You have Metformin 500mg, Lisinopril 10mg, Atorvastatin 20mg, and Omega-3 Cardio EPA." },
        { role: "user", text: "Which of those did I already take?" },
      ],
    }),
  });
  const followUpData = await followUpRes.json();
  console.log("Follow-up response:\n", followUpData.text);

  // Test Empty Message Validation
  console.log("-----------------------------------------");
  console.log("Testing Empty Message:");
  const emptyRes = await fetch("http://localhost:3000/api/ai-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", text: "   " }] }),
  });
  const emptyData = await emptyRes.json();
  console.log("Empty message status (expected 400):", emptyRes.status, emptyData);
}

testApi().catch(console.error);
