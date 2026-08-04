import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new Error("FAL_KEY is not set");
  }
  if (!client) {
    client = new OpenAI({
      baseURL: "https://fal.run/openrouter/router/openai/v1",
      apiKey: "not-needed",
      defaultHeaders: { Authorization: `Key ${apiKey}` },
    });
  }
  return client;
}

export const FAL_MODEL = process.env.FAL_MODEL?.trim() || "openai/gpt-5";
// A smaller/faster model for latency-sensitive uses like chat — full gpt-5's
// reasoning is worth the wait for itinerary generation, not for a chat reply.
export const FAL_CHAT_MODEL = process.env.FAL_CHAT_MODEL?.trim() || "openai/gpt-5-mini";

export async function generateJson<T>(prompt: string): Promise<T> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: FAL_MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("fal.ai returned an empty response");
  }
  return JSON.parse(text) as T;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function chatReply(
  systemPrompt: string,
  history: ChatMessage[],
): Promise<string> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: FAL_CHAT_MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...history],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("fal.ai returned an empty response");
  }
  return text;
}
