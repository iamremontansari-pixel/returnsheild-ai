import { NextResponse } from "next/server";

type OrderInput = {
  product?: string;
  payment?: string;
  amount?: number;
  delivery?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderInput;

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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "AI is not configured yet. Add OPENAI_API_KEY in your Vercel project environment variables.",
        },
        { status: 503 },
      );
    }

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions:
          "You help online businesses understand possible product return risks. You do not have historical order outcomes or a validated predictive model. Never claim a statistically validated probability. COD may be a consideration, not proof of customer risk. Give a cautious qualitative assessment, explain uncertainty, and suggest practical business improvements. Return only valid JSON with keys riskLevel (Low, Medium, or High), reasons (array of 2 or 3 strings), recommendations (array of 2 or 3 strings), and disclaimer (string).",
        input: `Review this order using only the information provided. Do not assume facts not given.
Product/category: ${product}
Order value: INR ${amount}
Payment: ${payment}
Delivery: ${delivery}`,
        max_output_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: "The AI service could not complete the analysis. Please try again." },
        { status: 502 },
      );
    }

    const aiData = await aiResponse.json();

    const outputText = aiData.output
      ?.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) =>
        item.content ?? [],
      )
      .find((item: { type?: string }) => item.type === "output_text")?.text;

    if (!outputText) {
      return NextResponse.json(
        { error: "The AI returned an empty result. Please try again." },
        { status: 502 },
      );
    }

    let analysis;

    try {
      analysis = JSON.parse(outputText);
    } catch {
      return NextResponse.json(
        { error: "The AI returned an unreadable result. Please try again." },
        { status: 502 },
      );
    }

    if (
      !["Low", "Medium", "High"].includes(analysis.riskLevel) ||
      !Array.isArray(analysis.reasons) ||
      !Array.isArray(analysis.recommendations) ||
      typeof analysis.disclaimer !== "string"
    ) {
      return NextResponse.json(
        { error: "The AI returned an invalid result. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      riskLevel: analysis.riskLevel,
      reasons: analysis.reasons.slice(0, 3).map(String),
      recommendations: analysis.recommendations.slice(0, 3).map(String),
      disclaimer: analysis.disclaimer,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process the request. Please try again." },
      { status: 400 },
    );
  }
}
