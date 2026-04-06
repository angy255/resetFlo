import { type Entry } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.0-flash";

function buildPrompt(entries: Entry[]) {
  const rows = entries
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((entry) => {
      const date = entry.date.toISOString().slice(0, 10);
      return [
        `Date: ${date}`,
        `Workout: ${entry.workoutType}`,
        `Duration: ${entry.workoutDuration} min`,
        `Exertion: ${entry.perceivedExertion}/10`,
        `Soreness: ${entry.sorenessLevel}/10`,
        `Sleep: ${entry.sleepDuration} h`,
        `Sleep quality: ${entry.sleepQuality}/10`,
        `Energy: ${entry.energyLevel}/10`,
        `Notes: ${entry.notes ?? "None"}`,
      ].join(" | ");
    })
    .join("\n");

  return `You are a fitness recovery coach. Analyze this training and recovery data and return 3 to 5 specific, data-driven insights with practical suggestions. Do not use emojis.\n\n${rows}`;
}

export async function generateInsight(entries: Entry[]): Promise<string> {
  if (entries.length < 3) {
    throw new Error("Need at least 3 days of entries to generate meaningful insights.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  let model;
  try {
    const client = new GoogleGenerativeAI(apiKey);
    model = client.getGenerativeModel({ model: MODEL_NAME });
  } catch (error) {
    throw new Error(
      `Failed to initialize Gemini model '${MODEL_NAME}'. The model may be unavailable.`,
      { cause: error },
    );
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: buildPrompt(entries) }] }],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });
    const response = result.response;

    if (response.promptFeedback?.blockReason) {
      throw new Error("AI response was blocked by safety filters. Please try again.");
    }

    const text = response.text().trim();
    if (!text) {
      throw new Error("AI generated an empty response.");
    }
    return text;
  } catch (error) {
    if (error instanceof Error && /429|rate|quota/i.test(error.message)) {
      throw new Error("Rate limited by Gemini. Please wait and try again.", {
        cause: error,
      });
    }
    if (error instanceof Error && /404|not[\s-]*found|model/i.test(error.message)) {
      throw new Error(
        `Gemini model '${MODEL_NAME}' was not found. Verify the configured model name.`,
        { cause: error },
      );
    }
    throw error;
  }
}
