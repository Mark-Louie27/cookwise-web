import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY || "placeholder" });
}

const SYSTEM_PROMPT = `You are CookWise AI, a friendly and expert culinary assistant. 
You help users with:
- Step-by-step cooking instructions
- Ingredient substitutions
- Cooking techniques and tips
- Meal planning and pairing suggestions
- Dietary adaptations (vegan, gluten-free, etc.)
- Food science explanations

Be concise, warm, and practical. Use simple language. 
When listing steps, use numbered format.
When listing ingredients or tips, use bullet points with •.
Keep responses under 300 words unless a detailed recipe is requested.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 600,
      temperature: 0.7,
      stream: false,
    });

    const content = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return NextResponse.json({ content });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
