import { NextResponse } from "next/server";
import { chatReply, type ChatMessage } from "@/lib/fal";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 1000;

const SYSTEM_PROMPT = `You are the VoyageAI assistant, a friendly concierge embedded on the VoyageAI website.

VoyageAI is an AI travel planner: "Your smartest travel companion, from planning to exploring." It turns maps, reviews, weather, and transit into one adaptive itinerary. Its core features: an Intelligent Trip Builder (destination, days, pace, interests in, full day-by-day plan out), AI route optimization, dynamic weather replanning, crowd prediction, restaurant intelligence, explainable AI (every stop comes with a "why"), and a Sustainability Mode. It's currently an early-access preview.

Your job here is general help and product questions — "what is this", "how does it work", "is it free", general travel-planning chat. You do NOT have access to any specific trip a visitor has already built; if they ask about "my itinerary" or a specific saved trip, tell them you can't see it here, and point them to the Trip Builder at /plan, where they can generate and view a real day-by-day plan.

Keep replies short (2-4 sentences typically) and conversational. If someone asks you to actually plan a trip, encourage them to use the "Plan my trip" button / /plan page rather than trying to build a full itinerary in chat.`;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages } = (body ?? {}) as { messages?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages is required." }, { status: 400 });
  }

  const history: ChatMessage[] = [];
  for (const m of messages.slice(-MAX_MESSAGES)) {
    if (
      m &&
      typeof m === "object" &&
      (m as { role?: unknown }).role &&
      ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "assistant") &&
      typeof (m as { content?: unknown }).content === "string"
    ) {
      const content = (m as { content: string }).content.slice(0, MAX_MESSAGE_LENGTH);
      history.push({ role: (m as { role: "user" | "assistant" }).role, content });
    }
  }

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "The last message must be from the user." },
      { status: 400 },
    );
  }

  try {
    const reply = await chatReply(SYSTEM_PROMPT, history);
    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof Error && error.message === "FAL_KEY is not set") {
      return NextResponse.json(
        {
          error: "Chat isn't configured yet — add FAL_KEY to .env.local and restart the dev server.",
        },
        { status: 503 },
      );
    }
    console.error("chat reply failed:", error);
    return NextResponse.json(
      { error: "Couldn't get a reply right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
