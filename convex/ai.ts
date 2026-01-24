import { action } from "./_generated/server";
import { v } from "convex/values";

export const summarizeText = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant helping visually impaired students. Summarize and simplify the following text to make it easier to understand. Focus on key concepts and main ideas. Keep the summary clear and concise while maintaining important information."
          },
          {
            role: "user",
            content: `Please summarize and simplify this text for a student: ${args.text}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  },
});

export const explainText = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: "You are an AI tutor helping visually impaired students understand academic content. Provide a clear, detailed explanation of the text that breaks down complex concepts into simpler terms. Use analogies and examples when helpful."
          },
          {
            role: "user",
            content: `Please explain this text in simple terms for a student: ${args.text}`
          }
        ],
        max_tokens: 800,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  },
});
