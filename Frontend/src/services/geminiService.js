const GEMINI_API_KEY = "AIzaSyCxtikFG8FA_YPumJuUPq03z28AXSX7ydU";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

const extractGeminiText = (data) => {
  try {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return null;

    const text = parts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();

    return text || null;
  } catch (error) {
    console.error("Failed to extract Gemini text:", error);
    return null;
  }
};

export const getAIResponseForRecords = async (records = [], context = "") => {
  try {
    const hasRecords = Array.isArray(records) && records.length > 0;

    let recordsText = "NO RECORDS FOUND FOR THIS USER.";

    if (hasRecords) {
      recordsText = records
        .map((r, i) => {
          return `
--- RECORD ${i + 1} (${r?.analysisDate || "Unknown Date"}) ---
- Vacant Area: ${r?.vacantArea || r?.vacantAreaSqm || "N/A"}
- Required Plants: ${r?.requiredPlants || "N/A"}
- Estimated Cost: Rs ${r?.totalCost || "N/A"}
- Yield Forecast: ${r?.yieldForecast || "N/A"}
- Recommendations: ${r?.agronomyRecommendations || "N/A"}
`;
        })
        .join("\n");
    }

    const prompt = `
You are a professional Cinnamon Cultivation Expert assistant.

USER QUERY:
"${context || "No user query provided"}"

DATABASE RECORDS:
${recordsText}

INSTRUCTIONS:
1. If records are provided, analyze them according to the user's query.
2. If NO records are found, politely inform the user that no analysis data was found and suggest performing a land analysis first.
3. If this is just a greeting, respond warmly and briefly.
4. Keep the tone professional, encouraging, and focused on cinnamon cultivation.
5. Use bullet points for readability.
6. Keep the response practical and easy to understand.
7. Do not mention raw database formatting like "Record 1" unless useful.

Write the response directly to the user.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();

    console.log("--- GEMINI AI RESPONSE START ---");
    console.log(JSON.stringify(data, null, 2));
    console.log("--- GEMINI AI RESPONSE END ---");

    if (!response.ok) {
      console.error("Gemini HTTP Error:", response.status, data);
      return `AI request failed (${response.status}). Please try again later.`;
    }

    const aiText = extractGeminiText(data);

    if (aiText) {
      return aiText;
    }

    console.error("Gemini API returned no usable text:", data);
    return "I am currently unable to process your request with AI. Please try again later.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I encountered an error while trying to reach the AI assistant.";
  }
};