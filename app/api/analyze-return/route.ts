
import { NextResponse } from "next/server";

type OrderInput = {
  product?: string;
  payment?: string;
  amount?: number;
  delivery?: string;
};

type Analysis = {
  riskLevel: "Low" | "Medium" | "High";
  reasons: string[];
  recommendations: string[];
  disclaimer: string;
};

export async function POST(request: Request) {
  try {
    let body: OrderInput;

    try {
      body = (await request.json()) as OrderInput;
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 },
      );
    }

    const product =
      typeof body.product === "string" ? body.product.trim() : "";
    const payment = body.payment;
    const amount = Number(body.amount);
    const delivery = body.delivery;

    if (
      !product ||
      product.length > 120 ||
      !Number.isFinite(amount) ||
      amount < 1 ||
      amount > 10000000 ||
      !["COD", "Prepaid"].includes(payment ?? "") ||
      !["Standard", "Express"].includes(delivery ?? "")
    ) {
      return NextResponse.json(
        { error: "Please provide valid order details." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json(
        {
          error:
            "AI is not configured. Check GEMINI_API_KEY in Vercel Environment Variables.",
        },
        { status: 503 },
      );
    }

    const prompt = `
Assess possible product return risk cautiously.

You do not have historical order outcomes or a validated predictive model.
Do not claim a statistically validated probability.
Cash on delivery (COD) alone does not prove customer risk.
Use only the supplied details. Do not assume missing facts.

Return JSON with exactly these keys:
- riskLevel: "Low", "Medium", or "High"
- reasons: an array of 2 or 3 short strings
- recommendations: an array of 2 or 3 practical strings
- disclaimer: a string explaining that this is a preliminary assessment, not a validated prediction

Order details:
Product/category: ${product}
Order value: INR ${amount}
Payment: ${payment}
Delivery: ${delivery}
`;

    const aiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                riskLevel: {
                  type: "STRING",
                  enum: ["Low", "Medium", "High"],
                },
                reasons: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                recommendations: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                disclaimer: { type: "STRING" },
              },
              required: [
                "riskLevel",
                "reasons",
                "recommendations",
                "disclaimer",
              ],
            },
          },
        }),
      },
    );

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      let details = "Unknown Gemini API error";

      try {
        const parsed = JSON.parse(errorBody);
        details =
          parsed.error?.message || details;
      } catch {
        details = errorBody.slice(0, 500) || details;
      }

      console.error("Gemini API request failed:", {
        status: aiResponse.status,
        message: details,
      });

      return NextResponse.json(
        {
          error: "Gemini request failed.",
          details,
        },
        { status: 502 },
      );
    }

    const aiData = await aiResponse.json();

    const outputText =
      aiData.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? "")
        .join("") ?? "";

    if (!outputText) {
      console.error("Gemini returned no text output.");

      return NextResponse.json(
        { error: "Gemini returned no usable text. Please try again." },
        { status: 502 },
      );
    }

    let analysis: Analysis;

    try {
      analysis = JSON.parse(outputText) as Analysis;
    } catch {
      console.error("Gemini output was not valid JSON.");

      return NextResponse.json(
        { error: "Gemini returned an unreadable result." },
        { status: 502 },
      );
    }

    if (
      !["Low", "Medium", "High"].includes(analysis.riskLevel) ||
      !Array.isArray(analysis.reasons) ||
      !analysis.reasons.every((item) => typeof item === "string") ||
      !Array.isArray(analysis.recommendations) ||
      !analysis.recommendations.every(
        (item) => typeof item === "string",
      ) ||
      typeof analysis.disclaimer !== "string" ||
      analysis.reasons.length < 2 ||
      analysis.recommendations.length < 2
    ) {
      console.error("Gemini output did not match the expected schema.");

      return NextResponse.json(
        { error: "Gemini returned an invalid analysis result." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      riskLevel: analysis.riskLevel,
      reasons: analysis.reasons.slice(0, 3),
      recommendations: analysis.recommendations.slice(0, 3),
      disclaimer: analysis.disclaimer,
    });
  } catch (error) {
    console.error("Analyze-return route failed:", error);

    return NextResponse.json(
      { error: "The server could not process the analysis request." },
      { status: 500 },
    );
  }
}
